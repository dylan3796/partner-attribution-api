import { Router } from 'express';
import { nanoid } from 'nanoid';
import db from '../db';
import { validate, schemas } from '../middleware/validation';

const router = Router();

/**
 * POST /deals - Record deal closed
 */
router.post('/', validate(schemas.createDeal), (req, res, next) => {
  try {
    const { id, amount, closed_date, attribution_model } = req.body;

    const dealId = id || nanoid();
    const closedDate = closed_date || new Date().toISOString();

    db.prepare(`
      INSERT INTO deals (id, amount, closed_date, attribution_model)
      VALUES (?, ?, ?, ?)
    `).run(dealId, amount, closedDate, attribution_model);

    const deal = db.prepare(`
      SELECT * FROM deals WHERE id = ?
    `).get(dealId);

    res.status(201).json({ deal });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /deals - List deals
 */
router.get('/', (req, res, next) => {
  try {
    const { limit = '100', offset = '0' } = req.query;

    const deals = db.prepare(`
      SELECT * FROM deals
      ORDER BY closed_date DESC
      LIMIT ? OFFSET ?
    `).all(parseInt(limit as string), parseInt(offset as string));

    res.json({
      deals,
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
 * GET /deals/:id - Get deal details
 */
router.get('/:id', (req, res, next) => {
  try {
    const deal = db.prepare(`
      SELECT * FROM deals WHERE id = ?
    `).get(req.params.id);

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    const events = db.prepare(`
      SELECT e.*, p.name as partner_name
      FROM events e
      JOIN partners p ON e.partner_id = p.id
      WHERE e.deal_id = ?
      ORDER BY e.timestamp ASC
    `).all(req.params.id);

    res.json({
      deal,
      events: events.map((e: any) => ({
        ...e,
        metadata: JSON.parse(e.metadata)
      }))
    });
  } catch (error) {
    next(error);
  }
});

export default router;
