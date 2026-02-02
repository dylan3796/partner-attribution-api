import { Router } from 'express';
import { nanoid } from 'nanoid';
import db from '../db';
import { validate, schemas } from '../middleware/validation';

const router = Router();

/**
 * POST /events - Track attribution event
 */
router.post('/', validate(schemas.createEvent), (req, res, next) => {
  try {
    const { partner_id, deal_id, timestamp, touchpoint_type, metadata } = req.body;

    const id = nanoid();
    const eventTimestamp = timestamp || new Date().toISOString();

    db.prepare(`
      INSERT INTO events (id, partner_id, deal_id, timestamp, touchpoint_type, metadata)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      id,
      partner_id,
      deal_id,
      eventTimestamp,
      touchpoint_type,
      JSON.stringify(metadata || {})
    );

    const event = db.prepare(`
      SELECT * FROM events WHERE id = ?
    `).get(id);

    res.status(201).json({
      event: {
        ...event,
        metadata: JSON.parse((event as any).metadata)
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /events - List events (with filters)
 */
router.get('/', (req, res, next) => {
  try {
    const { deal_id, partner_id, limit = '100', offset = '0' } = req.query;

    let query = 'SELECT * FROM events WHERE 1=1';
    const params: any[] = [];

    if (deal_id) {
      query += ' AND deal_id = ?';
      params.push(deal_id);
    }

    if (partner_id) {
      query += ' AND partner_id = ?';
      params.push(partner_id);
    }

    query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit as string), parseInt(offset as string));

    const events = db.prepare(query).all(...params);

    res.json({
      events: events.map((e: any) => ({
        ...e,
        metadata: JSON.parse(e.metadata)
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

export default router;
