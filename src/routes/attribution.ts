import { Router } from 'express';
import db from '../db';
import attributionService from '../services/attribution.service';

const router = Router();

/**
 * GET /attribution/:dealId - Get attribution for a deal
 */
router.get('/:dealId', (req, res, next) => {
  try {
    const { dealId } = req.params;
    const { recalculate } = req.query;

    // Check if deal exists
    const deal = db.prepare(`
      SELECT * FROM deals WHERE id = ?
    `).get(dealId) as any;

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    // Check if we have cached results
    if (!recalculate) {
      const cached = db.prepare(`
        SELECT ar.*, p.name as partner_name
        FROM attribution_results ar
        JOIN partners p ON ar.partner_id = p.id
        WHERE ar.deal_id = ?
        ORDER BY ar.payout_amount DESC
      `).all(dealId) as any[];

      if (cached.length > 0) {
        return res.json({
          deal_id: dealId,
          total_amount: deal.amount,
          model: deal.attribution_model,
          attributions: cached.map(c => ({
            partner_id: c.partner_id,
            partner_name: c.partner_name,
            percentage: c.attribution_percentage,
            payout: c.payout_amount
          })),
          calculated_at: cached[0].calculated_at,
          cached: true
        });
      }
    }

    // Calculate fresh attribution
    const breakdown = attributionService.calculateAttribution(
      dealId,
      deal.attribution_model,
      deal.amount
    );

    // Save to cache
    attributionService.saveAttributionResults(breakdown);

    res.json({
      ...breakdown,
      cached: false
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /attribution/:dealId/recalculate - Force recalculation
 */
router.post('/:dealId/recalculate', (req, res, next) => {
  try {
    const { dealId } = req.params;

    const deal = db.prepare(`
      SELECT * FROM deals WHERE id = ?
    `).get(dealId) as any;

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    const breakdown = attributionService.calculateAttribution(
      dealId,
      deal.attribution_model,
      deal.amount
    );

    attributionService.saveAttributionResults(breakdown);

    res.json(breakdown);
  } catch (error) {
    next(error);
  }
});

export default router;
