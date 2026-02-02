import dotenv from 'dotenv';
import app from './app';
import { initDatabase } from './db';
import { createApiKey } from './middleware/auth';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
initDatabase();

// Create default API key if none exist
import db from './db';
const existingKeys = db.prepare('SELECT COUNT(*) as count FROM api_keys').get() as { count: number };

if (existingKeys.count === 0) {
  const { key } = createApiKey('default');
  console.log('\n🔑 No API keys found. Created default API key:');
  console.log(`   ${key}`);
  console.log('\n   Save this key securely! It will not be shown again.\n');
  
  // Save to .env.local for convenience
  const envLocalPath = path.join(__dirname, '../.env.local');
  fs.writeFileSync(envLocalPath, `API_KEY=${key}\n`, { flag: 'a' });
  console.log(`   Also saved to .env.local\n`);
}

// Start server
app.listen(PORT, () => {
  console.log(`\n✓ Attribution API running on port ${PORT}`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`\n  Endpoints:`);
  console.log(`    POST   /events              - Track attribution event`);
  console.log(`    POST   /deals               - Record deal closed`);
  console.log(`    GET    /attribution/:dealId - Get attribution breakdown`);
  console.log(`    GET    /partners            - List partners`);
  console.log(`    POST   /partners            - Add partner`);
  console.log(`    GET    /analytics           - Dashboard data`);
  console.log(`\n  Attribution models: equal, role-based, first-touch, last-touch, time-decay`);
  console.log(`\n  Auth: Include X-API-Key header in all requests\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});
