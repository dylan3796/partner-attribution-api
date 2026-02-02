import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const schemas = {
  createEvent: z.object({
    partner_id: z.string().min(1),
    deal_id: z.string().min(1),
    timestamp: z.string().datetime().optional(),
    touchpoint_type: z.enum(['referral', 'demo', 'intro', 'support', 'closer', 'other']),
    metadata: z.record(z.any()).optional()
  }),

  createDeal: z.object({
    id: z.string().min(1).optional(),
    amount: z.number().positive(),
    closed_date: z.string().datetime().optional(),
    attribution_model: z.enum(['equal', 'role-based', 'first-touch', 'last-touch', 'time-decay'])
  }),

  createPartner: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    payout_details: z.record(z.any()).optional()
  })
};

export function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }
      next(error);
    }
  };
}
