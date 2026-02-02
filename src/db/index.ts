import Database from 'better-sqlite3';
import { schema } from './schema';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/attribution.db');

// Ensure directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath, {
  verbose: process.env.NODE_ENV === 'development' ? console.log : undefined
});

// Enable foreign keys and WAL mode for better performance
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

// Initialize schema
export function initDatabase() {
  db.exec(schema);
  console.log('✓ Database initialized');
}

// Graceful shutdown
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});

export default db;
