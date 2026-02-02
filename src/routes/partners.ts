import { Router } from 'express';
import { nanoid } from 'nanoid';
import db from '../db';
import { validate, schemas } from '../middleware/validation';

const router = Router();

/**
 * POST /partners - Add partner
 */
router.post('/', validate(schemas.createPartner), (req, res, next) => {
  try {
    const { name, email, payout_details } = req.body;

    const id = nanoid();

    db.prepare(`
      INSERT INTO partners (id, name, email, payout_details)
      VALUES (?, ?, ?, ?)
    `).run(id, name, email, JSON.stringify(payout_details || {}));

    const partner = db.prepare(`
      SELECT * FROM partners WHERE id = ?
    `).get(id);

    res.status(201).json({
      partner: {
        ...(partner as any),
        payout_details: JSON.parse((partner as any).payout_details)
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /partners - List partners
 */
router.get('/', (req, res, next) => {
  try {
    const { limit = '100', offset = '0' } = req.query;

    const partners = db.prepare(`
      SELECT * FROM partners
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(parseInt(limit as string), parseInt(offset as string));

    res.json({
      partners: partners.map((p: any) => ({
        ...p,
        payout_details: JSON.parse(p.payout_details)
      })),
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /partners/:id - Get partner details
 */
router.get('/:id', (req, res, next) => {
  try {
    const partner = db.prepare(`
      SELECT * FROM partners WHERE id = ?
    `).get(req.params.id) as any;

    if (!partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    // Get partner's attribution stats
    const stats = db.prepare(`
      SELECT 
        COUNT(DISTINCT deal_id) as total_deals,
        COALESCE(SUM(payout_amount), 0) as total_payout,
        COUNT(*) as total_attributions
      FROM attribution_results
      WHERE partner_id = ?
    `).get(req.params.id) as any;

    res.json({
      partner: {
        ...partner,
        payout_details: JSON.parse(partner.payout_details)
      },
      stats
    });
  } catch (error) {
    next(error);
  }
});

export default router;
