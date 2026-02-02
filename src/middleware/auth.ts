import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import db from '../db';

export interface AuthRequest extends Request {
  apiKeyId?: string;
}

/**
 * API Key authentication middleware
 */
export function authenticateApiKey(req: AuthRequest, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    return res.status(401).json({ error: 'Missing API key' });
  }

  const keyHash = hashApiKey(apiKey);
  
  const result = db.prepare(`
    SELECT id FROM api_keys WHERE key_hash = ?
  `).get(keyHash) as { id: string } | undefined;

  if (!result) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  // Update last used timestamp
  db.prepare(`
    UPDATE api_keys SET last_used_at = datetime('now') WHERE id = ?
  `).run(result.id);

  req.apiKeyId = result.id;
  next();
}

/**
 * Hash API key for storage
 */
export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * Generate new API key
 */
export function generateApiKey(): string {
  return 'sk_' + crypto.randomBytes(32).toString('hex');
}

/**
 * Create API key in database
 */
export function createApiKey(name: string): { id: string; key: string } {
  const key = generateApiKey();
  const keyHash = hashApiKey(key);
  const id = crypto.randomBytes(16).toString('hex');

  db.prepare(`
    INSERT INTO api_keys (id, key_hash, name) VALUES (?, ?, ?)
  `).run(id, keyHash, name);

  return { id, key };
}
