import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { AttributionService } from '../src/services/attribution.service';
import { schema } from '../src/db/schema';

describe('AttributionService', () => {
  let db: Database.Database;
  let service: AttributionService;

  beforeAll(() => {
    // Create in-memory database for testing
    db = new Database(':memory:');
    db.exec(schema);
    
    service = new AttributionService(db);

    // Insert test partners
    const insertPartner = db.prepare(`
      INSERT INTO partners (id, name, email, payout_details) VALUES (?, ?, ?, ?)
    `);
    
    insertPartner.run('p1', 'Alice', 'alice@test.com', '{}');
    insertPartner.run('p2', 'Bob', 'bob@test.com', '{}');
    insertPartner.run('p3', 'Charlie', 'charlie@test.com', '{}');
  });

  afterAll(() => {
    db.close();
  });

  describe('Equal Attribution', () => {
    it('should split evenly among 2 partners', () => {
      const dealId = 'deal-equal-2';
      
      db.prepare(`INSERT INTO deals VALUES (?, 10000, ?, 'equal', ?)`).run(
        dealId, new Date().toISOString(), new Date().toISOString()
      );

      db.prepare(`INSERT INTO events VALUES (?, ?, ?, ?, 'referral', '{}', ?)`).run(
        'e1', 'p1', dealId, new Date().toISOString(), new Date().toISOString()
      );
      db.prepare(`INSERT INTO events VALUES (?, ?, ?, ?, 'demo', '{}', ?)`).run(
        'e2', 'p2', dealId, new Date().toISOString(), new Date().toISOString()
      );

      const result = service.calculateAttribution(dealId, 'equal', 10000);

      expect(result.attributions).toHaveLength(2);
      expect(result.attributions[0].percentage).toBe(50);
      expect(result.attributions[1].percentage).toBe(50);
      expect(result.attributions[0].payout).toBe(5000);
      expect(result.attributions[1].payout).toBe(5000);
    });

    it('should split evenly among 3 partners', () => {
      const dealId = 'deal-equal-3';
      
      db.prepare(`INSERT INTO deals VALUES (?, 9000, ?, 'equal', ?)`).run(
        dealId, new Date().toISOString(), new Date().toISOString()
      );

      db.prepare(`INSERT INTO events VALUES (?, ?, ?, ?, 'referral', '{}', ?)`).run(
        'e3', 'p1', dealId, new Date().toISOString(), new Date().toISOString()
      );
      db.prepare(`INSERT INTO events VALUES (?, ?, ?, ?, 'demo', '{}', ?)`).run(
        'e4', 'p2', dealId, new Date().toISOString(), new Date().toISOString()
      );
      db.prepare(`INSERT INTO events VALUES (?, ?, ?, ?, 'closer', '{}', ?)`).run(
        'e5', 'p3', dealId, new Date().toISOString(), new Date().toISOString()
      );

      const result = service.calculateAttribution(dealId, 'equal', 9000);

      expect(result.attributions).toHaveLength(3);
      
      const total = result.attributions.reduce((sum, a) => sum + a.payout, 0);
      expect(total).toBeCloseTo(9000, 1);
    });

    it('should handle 0 partners gracefully', () => {
      const dealId = 'deal-no-events';
      
      db.prepare(`INSERT INTO deals VALUES (?, 5000, ?, 'equal', ?)`).run(
        dealId, new Date().toISOString(), new Date().toISOString()
      );

      const result = service.calculateAttribution(dealId, 'equal', 5000);

      expect(result.attributions).toHaveLength(0);
    });
  });

  describe('First-Touch Attribution', () => {
    it('should give 100% to first partner', () => {
      const dealId = 'deal-first-touch';
      
      db.prepare(`INSERT INTO deals VALUES (?, 8000, ?, 'first-touch', ?)`).run(
        dealId, new Date().toISOString(), new Date().toISOString()
      );

      const now = Date.now();
      db.prepare(`INSERT INTO events VALUES (?, ?, ?, ?, 'referral', '{}', ?)`).run(
        'e6', 'p1', dealId, new Date(now - 10000).toISOString(), new Date().toISOString()
      );
      db.prepare(`INSERT INTO events VALUES (?, ?, ?, ?, 'demo', '{}', ?)`).run(
        'e7', 'p2', dealId, new Date(now - 5000).toISOString(), new Date().toISOString()
      );
      db.prepare(`INSERT INTO events VALUES (?, ?, ?, ?, 'closer', '{}', ?)`).run(
        'e8', 'p3', dealId, new Date(now).toISOString(), new Date().toISOString()
      );

      const result = service.calculateAttribution(dealId, 'first-touch', 8000);

      expect(result.attributions).toHaveLength(1);
      expect(result.attributions[0].partner_id).toBe('p1');
      expect(result.attributions[0].percentage).toBe(100);
      expect(result.attributions[0].payout).toBe(8000);
    });
  });

  describe('Last-Touch Attribution', () => {
    it('should give 100% to last partner', () => {
      const dealId = 'deal-last-touch';
      
      db.prepare(`INSERT INTO deals VALUES (?, 12000, ?, 'last-touch', ?)`).run(
        dealId, new Date().toISOString(), new Date().toISOString()
      );

      const now = Date.now();
      db.prepare(`INSERT INTO events VALUES (?, ?, ?, ?, 'referral', '{}', ?)`).run(
        'e9', 'p1', dealId, new Date(now - 10000).toISOString(), new Date().toISOString()
      );
      db.prepare(`INSERT INTO events VALUES (?, ?, ?, ?, 'demo', '{}', ?)`).run(
        'e10', 'p2', dealId, new Date(now - 5000).toISOString(), new Date().toISOString()
      );
      db.prepare(`INSERT INTO events VALUES (?, ?, ?, ?, 'closer', '{}', ?)`).run(
        'e11', 'p3', dealId, new Date(now).toISOString(), new Date().toISOString()
      );

      const result = service.calculateAttribution(dealId, 'last-touch', 12000);

      expect(result.attributions).toHaveLength(1);
      expect(result.attributions[0].partner_id).toBe('p3');
      expect(result.attributions[0].percentage).toBe(100);
      expect(result.attributions[0].payout).toBe(12000);
    });
  });

  describe('Role-Based Attribution', () => {
    it('should weight by touchpoint role', () => {
      const dealId = 'deal-role-based';
      
      db.prepare(`INSERT INTO deals VALUES (?, 10000, ?, 'role-based', ?)`).run(
        dealId, new Date().toISOString(), new Date().toISOString()
      );

      db.prepare(`INSERT INTO events VALUES (?, ?, ?, ?, 'referral', '{}', ?)`).run(
        'e12', 'p1', dealId, new Date().toISOString(), new Date().toISOString()
      );
      db.prepare(`INSERT INTO events VALUES (?, ?, ?, ?, 'demo', '{}', ?)`).run(
        'e13', 'p2', dealId, new Date().toISOString(), new Date().toISOString()
      );
      db.prepare(`INSERT INTO events VALUES (?, ?, ?, ?, 'closer', '{}', ?)`).run(
        'e14', 'p3', dealId, new Date().toISOString(), new Date().toISOString()
      );

      const result = service.calculateAttribution(dealId, 'role-based', 10000);

      expect(result.attributions).toHaveLength(3);
      
      // Closer (0.35) should get the most
      const closer = result.attributions.find(a => a.partner_id === 'p3');
      expect(closer).toBeDefined();
      expect(closer!.percentage).toBeGreaterThan(30);

      // Referral (0.25) should get more than demo (0.15)
      const referral = result.attributions.find(a => a.partner_id === 'p1');
      const demo = result.attributions.find(a => a.partner_id === 'p2');
      expect(referral!.percentage).toBeGreaterThan(demo!.percentage);

      // Total should be 100%
      const totalPct = result.attributions.reduce((sum, a) => sum + a.percentage, 0);
      expect(totalPct).toBeCloseTo(100, 1);
    });
  });

  describe('Time-Decay Attribution', () => {
    it('should weight recent touchpoints more heavily', () => {
      const dealId = 'deal-time-decay';
      
      db.prepare(`INSERT INTO deals VALUES (?, 10000, ?, 'time-decay', ?)`).run(
        dealId, new Date().toISOString(), new Date().toISOString()
      );

      const now = Date.now();
      // p1: 30 days ago
      db.prepare(`INSERT INTO events VALUES (?, ?, ?, ?, 'referral', '{}', ?)`).run(
        'e15', 'p1', dealId, new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString(), new Date().toISOString()
      );
      // p2: 7 days ago
      db.prepare(`INSERT INTO events VALUES (?, ?, ?, ?, 'demo', '{}', ?)`).run(
        'e16', 'p2', dealId, new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(), new Date().toISOString()
      );
      // p3: yesterday
      db.prepare(`INSERT INTO events VALUES (?, ?, ?, ?, 'closer', '{}', ?)`).run(
        'e17', 'p3', dealId, new Date(now - 24 * 60 * 60 * 1000).toISOString(), new Date().toISOString()
      );

      const result = service.calculateAttribution(dealId, 'time-decay', 10000);

      expect(result.attributions).toHaveLength(3);
      
      const p1 = result.attributions.find(a => a.partner_id === 'p1');
      const p2 = result.attributions.find(a => a.partner_id === 'p2');
      const p3 = result.attributions.find(a => a.partner_id === 'p3');

      // Most recent should get the highest percentage
      expect(p3!.percentage).toBeGreaterThan(p2!.percentage);
      expect(p2!.percentage).toBeGreaterThan(p1!.percentage);

      // Total should be 100%
      const totalPct = result.attributions.reduce((sum, a) => sum + a.percentage, 0);
      expect(totalPct).toBeCloseTo(100, 1);
    });
  });

  describe('Rounding and Edge Cases', () => {
    it('should handle rounding errors correctly', () => {
      const dealId = 'deal-rounding';
      
      db.prepare(`INSERT INTO deals VALUES (?, 10000.01, ?, 'equal', ?)`).run(
        dealId, new Date().toISOString(), new Date().toISOString()
      );

      db.prepare(`INSERT INTO events VALUES (?, ?, ?, ?, 'referral', '{}', ?)`).run(
        'e18', 'p1', dealId, new Date().toISOString(), new Date().toISOString()
      );
      db.prepare(`INSERT INTO events VALUES (?, ?, ?, ?, 'demo', '{}', ?)`).run(
        'e19', 'p2', dealId, new Date().toISOString(), new Date().toISOString()
      );
      db.prepare(`INSERT INTO events VALUES (?, ?, ?, ?, 'closer', '{}', ?)`).run(
        'e20', 'p3', dealId, new Date().toISOString(), new Date().toISOString()
      );

      const result = service.calculateAttribution(dealId, 'equal', 10000.01);

      const totalPayout = result.attributions.reduce((sum, a) => sum + a.payout, 0);
      expect(totalPayout).toBeCloseTo(10000.01, 1);
    });

    it('should handle single partner multiple touchpoints', () => {
      const dealId = 'deal-single-partner';
      
      db.prepare(`INSERT INTO deals VALUES (?, 5000, ?, 'equal', ?)`).run(
        dealId, new Date().toISOString(), new Date().toISOString()
      );

      db.prepare(`INSERT INTO events VALUES (?, ?, ?, ?, 'referral', '{}', ?)`).run(
        'e21', 'p1', dealId, new Date().toISOString(), new Date().toISOString()
      );
      db.prepare(`INSERT INTO events VALUES (?, ?, ?, ?, 'demo', '{}', ?)`).run(
        'e22', 'p1', dealId, new Date().toISOString(), new Date().toISOString()
      );
      db.prepare(`INSERT INTO events VALUES (?, ?, ?, ?, 'closer', '{}', ?)`).run(
        'e23', 'p1', dealId, new Date().toISOString(), new Date().toISOString()
      );

      const result = service.calculateAttribution(dealId, 'equal', 5000);

      expect(result.attributions).toHaveLength(1);
      expect(result.attributions[0].partner_id).toBe('p1');
      expect(result.attributions[0].percentage).toBe(100);
      expect(result.attributions[0].payout).toBe(5000);
      expect(result.attributions[0].touchpoints).toBe(3);
    });
  });
});
