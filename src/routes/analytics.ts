import { Router } from 'express';
import db from '../db';

const router = Router();

/**
 * GET /analytics - Dashboard data
 */
router.get('/', (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    // Overall stats
    const overallStats = db.prepare(`
      SELECT 
        COUNT(*) as total_deals,
        COALESCE(SUM(amount), 0) as total_revenue,
        COALESCE(AVG(amount), 0) as avg_deal_size
      FROM deals
      ${start_date ? 'WHERE closed_date >= ?' : ''}
      ${end_date ? (start_date ? 'AND' : 'WHERE') + ' closed_date <= ?' : ''}
    `).get(...[start_date, end_date].filter(Boolean)) as any;

    // Partner performance
    const partnerPerformance = db.prepare(`
      SELECT 
        p.id,
        p.name,
        COUNT(DISTINCT ar.deal_id) as deals_count,
        COALESCE(SUM(ar.payout_amount), 0) as total_payout,
        COALESCE(AVG(ar.attribution_percentage), 0) as avg_attribution_pct
      FROM partners p
      LEFT JOIN attribution_results ar ON p.id = ar.partner_id
      ${start_date || end_date ? 'LEFT JOIN deals d ON ar.deal_id = d.id' : ''}
      ${start_date ? 'WHERE d.closed_date >= ?' : ''}
      ${end_date ? (start_date ? 'AND' : 'WHERE') + ' d.closed_date <= ?' : ''}
      GROUP BY p.id, p.name
      ORDER BY total_payout DESC
      LIMIT 20
    `).all(...[start_date, end_date].filter(Boolean));

    // Attribution model usage
    const modelUsage = db.prepare(`
      SELECT 
        attribution_model,
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as total_amount
      FROM deals
      ${start_date ? 'WHERE closed_date >= ?' : ''}
      ${end_date ? (start_date ? 'AND' : 'WHERE') + ' closed_date <= ?' : ''}
      GROUP BY attribution_model
      ORDER BY count DESC
    `).all(...[start_date, end_date].filter(Boolean));

    // Touchpoint type distribution
    const touchpointStats = db.prepare(`
      SELECT 
        touchpoint_type,
        COUNT(*) as count
      FROM events
      ${start_date ? 'WHERE timestamp >= ?' : ''}
      ${end_date ? (start_date ? 'AND' : 'WHERE') + ' timestamp <= ?' : ''}
      GROUP BY touchpoint_type
      ORDER BY count DESC
    `).all(...[start_date, end_date].filter(Boolean));

    // Recent deals
    const recentDeals = db.prepare(`
      SELECT 
        d.*,
        COUNT(e.id) as touchpoints_count
      FROM deals d
      LEFT JOIN events e ON d.id = e.deal_id
      GROUP BY d.id
      ORDER BY d.closed_date DESC
      LIMIT 10
    `).all();

    res.json({
      overview: overallStats,
      partners: partnerPerformance,
      models: modelUsage,
      touchpoints: touchpointStats,
      recent_deals: recentDeals,
      filters: {
        start_date: start_date || null,
        end_date: end_date || null
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /analytics/partner/:partnerId - Partner-specific analytics
 */
router.get('/partner/:partnerId', (req, res, next) => {
  try {
    const { partnerId } = req.params;

    const partner = db.prepare(`
      SELECT * FROM partners WHERE id = ?
    `).get(partnerId);

    if (!partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    // Partner's deals and attributions
    const dealStats = db.prepare(`
      SELECT 
        d.id,
        d.amount,
        d.closed_date,
        d.attribution_model,
        ar.attribution_percentage,
        ar.payout_amount
      FROM attribution_results ar
      JOIN deals d ON ar.deal_id = d.id
      WHERE ar.partner_id = ?
      ORDER BY d.closed_date DESC
    `).all(partnerId);

    // Touchpoint breakdown
    const touchpointBreakdown = db.prepare(`
      SELECT 
        touchpoint_type,
        COUNT(*) as count
      FROM events
      WHERE partner_id = ?
      GROUP BY touchpoint_type
      ORDER BY count DESC
    `).all(partnerId);

    // Monthly performance
    const monthlyPerformance = db.prepare(`
      SELECT 
        strftime('%Y-%m', d.closed_date) as month,
        COUNT(*) as deals_count,
        COALESCE(SUM(ar.payout_amount), 0) as total_payout
      FROM attribution_results ar
      JOIN deals d ON ar.deal_id = d.id
      WHERE ar.partner_id = ?
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `).all(partnerId);

    res.json({
      partner: {
        ...(partner as any),
        payout_details: JSON.parse((partner as any).payout_details)
      },
      deals: dealStats,
      touchpoints: touchpointBreakdown,
      monthly: monthlyPerformance
    });
  } catch (error) {
    next(error);
  }
});

export default router;
