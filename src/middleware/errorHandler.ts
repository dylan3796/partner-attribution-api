import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err);

  if (err.message.includes('UNIQUE constraint failed')) {
    return res.status(409).json({ error: 'Resource already exists' });
  }

  if (err.message.includes('FOREIGN KEY constraint failed')) {
    return res.status(400).json({ error: 'Referenced resource does not exist' });
  }

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
}
