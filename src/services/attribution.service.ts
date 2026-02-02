import { AttributionModel, AttributionBreakdown, Event, RoleWeights } from '../types';
import dbModule from '../db';
import type Database from 'better-sqlite3';

const DEFAULT_ROLE_WEIGHTS: RoleWeights = {
  referral: 0.25,
  demo: 0.15,
  intro: 0.15,
  support: 0.10,
  closer: 0.35,
  other: 0.05
};

export class AttributionService {
  private db: Database.Database;

  constructor(db?: Database.Database) {
    this.db = db || dbModule;
  }
  
  /**
   * Calculate attribution for a deal using specified model
   */
  calculateAttribution(dealId: string, model: AttributionModel, dealAmount: number): AttributionBreakdown {
    // Get all events for this deal
    const events = this.db.prepare(`
      SELECT e.*, p.name as partner_name 
      FROM events e
      JOIN partners p ON e.partner_id = p.id
      WHERE e.deal_id = ?
      ORDER BY e.timestamp ASC
    `).all(dealId) as Array<Event & { partner_name: string }>;

    if (events.length === 0) {
      return {
        deal_id: dealId,
        total_amount: dealAmount,
        model,
        attributions: [],
        calculated_at: new Date().toISOString()
      };
    }

    let attributions: AttributionBreakdown['attributions'];

    switch (model) {
      case 'equal':
        attributions = this.equalAttribution(events, dealAmount);
        break;
      case 'first-touch':
        attributions = this.firstTouchAttribution(events, dealAmount);
        break;
      case 'last-touch':
        attributions = this.lastTouchAttribution(events, dealAmount);
        break;
      case 'role-based':
        attributions = this.roleBasedAttribution(events, dealAmount);
        break;
      case 'time-decay':
        attributions = this.timeDecayAttribution(events, dealAmount);
        break;
      default:
        throw new Error(`Unknown attribution model: ${model}`);
    }

    // Normalize to ensure total equals 100% (handle rounding errors)
    attributions = this.normalizeAttributions(attributions, dealAmount);

    return {
      deal_id: dealId,
      total_amount: dealAmount,
      model,
      attributions,
      calculated_at: new Date().toISOString()
    };
  }

  /**
   * Equal: Split evenly among all unique partners
   */
  private equalAttribution(events: Array<Event & { partner_name: string }>, amount: number) {
    const partnerMap = new Map<string, { name: string; touchpoints: number }>();
    
    events.forEach(event => {
      const existing = partnerMap.get(event.partner_id) || { name: event.partner_name, touchpoints: 0 };
      existing.touchpoints++;
      partnerMap.set(event.partner_id, existing);
    });

    const uniquePartners = partnerMap.size;
    const percentage = 100 / uniquePartners;
    const payout = amount / uniquePartners;

    return Array.from(partnerMap.entries()).map(([partner_id, data]) => ({
      partner_id,
      partner_name: data.name,
      percentage,
      payout,
      touchpoints: data.touchpoints
    }));
  }

  /**
   * First-touch: 100% to earliest touchpoint
   */
  private firstTouchAttribution(events: Array<Event & { partner_name: string }>, amount: number) {
    const first = events[0];
    const touchpoints = events.filter(e => e.partner_id === first.partner_id).length;

    return [{
      partner_id: first.partner_id,
      partner_name: first.partner_name,
      percentage: 100,
      payout: amount,
      touchpoints
    }];
  }

  /**
   * Last-touch: 100% to latest touchpoint
   */
  private lastTouchAttribution(events: Array<Event & { partner_name: string }>, amount: number) {
    const last = events[events.length - 1];
    const touchpoints = events.filter(e => e.partner_id === last.partner_id).length;

    return [{
      partner_id: last.partner_id,
      partner_name: last.partner_name,
      percentage: 100,
      payout: amount,
      touchpoints
    }];
  }

  /**
   * Role-based: Weight by touchpoint type
   */
  private roleBasedAttribution(events: Array<Event & { partner_name: string }>, amount: number) {
    const partnerScores = new Map<string, { name: string; score: number; touchpoints: number; roles: Set<string> }>();

    events.forEach(event => {
      const weight = DEFAULT_ROLE_WEIGHTS[event.touchpoint_type as keyof RoleWeights] || DEFAULT_ROLE_WEIGHTS.other;
      const existing = partnerScores.get(event.partner_id) || { 
        name: event.partner_name, 
        score: 0, 
        touchpoints: 0,
        roles: new Set<string>()
      };
      existing.score += weight;
      existing.touchpoints++;
      existing.roles.add(event.touchpoint_type);
      partnerScores.set(event.partner_id, existing);
    });

    const totalScore = Array.from(partnerScores.values()).reduce((sum, p) => sum + p.score, 0);

    return Array.from(partnerScores.entries()).map(([partner_id, data]) => ({
      partner_id,
      partner_name: data.name,
      percentage: (data.score / totalScore) * 100,
      payout: (data.score / totalScore) * amount,
      touchpoints: data.touchpoints,
      role: Array.from(data.roles).join(', ')
    }));
  }

  /**
   * Time-decay: More recent touchpoints get higher weight
   * Uses exponential decay with half-life of 7 days
   */
  private timeDecayAttribution(events: Array<Event & { partner_name: string }>, amount: number) {
    const now = new Date(events[events.length - 1].timestamp).getTime();
    const HALF_LIFE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
    const DECAY_CONSTANT = Math.log(2) / HALF_LIFE_MS;

    const partnerScores = new Map<string, { name: string; score: number; touchpoints: number }>();

    events.forEach(event => {
      const eventTime = new Date(event.timestamp).getTime();
      const ageMs = now - eventTime;
      const weight = Math.exp(-DECAY_CONSTANT * ageMs);

      const existing = partnerScores.get(event.partner_id) || { 
        name: event.partner_name, 
        score: 0, 
        touchpoints: 0 
      };
      existing.score += weight;
      existing.touchpoints++;
      partnerScores.set(event.partner_id, existing);
    });

    const totalScore = Array.from(partnerScores.values()).reduce((sum, p) => sum + p.score, 0);

    return Array.from(partnerScores.entries()).map(([partner_id, data]) => ({
      partner_id,
      partner_name: data.name,
      percentage: (data.score / totalScore) * 100,
      payout: (data.score / totalScore) * amount,
      touchpoints: data.touchpoints
    }));
  }

  /**
   * Normalize attributions to handle rounding errors
   */
  private normalizeAttributions(attributions: AttributionBreakdown['attributions'], totalAmount: number) {
    const totalPayout = attributions.reduce((sum, a) => sum + a.payout, 0);
    const diff = totalAmount - totalPayout;

    if (Math.abs(diff) > 0.01 && attributions.length > 0) {
      // Add difference to largest attribution
      const largest = attributions.reduce((max, a) => a.payout > max.payout ? a : max);
      largest.payout += diff;
      largest.percentage = (largest.payout / totalAmount) * 100;
    }

    // Round to 2 decimal places
    return attributions.map(a => ({
      ...a,
      percentage: Math.round(a.percentage * 100) / 100,
      payout: Math.round(a.payout * 100) / 100
    }));
  }

  /**
   * Save attribution results to cache
   */
  saveAttributionResults(breakdown: AttributionBreakdown) {
    const insert = this.db.prepare(`
      INSERT INTO attribution_results (id, deal_id, partner_id, attribution_percentage, payout_amount, calculated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const transaction = this.db.transaction((results: AttributionBreakdown['attributions']) => {
      // Clear old results for this deal
      this.db.prepare('DELETE FROM attribution_results WHERE deal_id = ?').run(breakdown.deal_id);

      // Insert new results
      results.forEach(attr => {
        insert.run(
          `${breakdown.deal_id}-${attr.partner_id}-${Date.now()}`,
          breakdown.deal_id,
          attr.partner_id,
          attr.percentage,
          attr.payout,
          breakdown.calculated_at
        );
      });
    });

    transaction(breakdown.attributions);
  }
}

export default new AttributionService();
