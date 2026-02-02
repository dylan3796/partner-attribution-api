export const schema = `
-- Partners table
CREATE TABLE IF NOT EXISTS partners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  payout_details TEXT NOT NULL, -- JSON
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Events table (attribution touchpoints)
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  partner_id TEXT NOT NULL,
  deal_id TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  touchpoint_type TEXT NOT NULL,
  metadata TEXT NOT NULL, -- JSON
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (partner_id) REFERENCES partners(id)
);

-- Deals table
CREATE TABLE IF NOT EXISTS deals (
  id TEXT PRIMARY KEY,
  amount REAL NOT NULL,
  closed_date TEXT NOT NULL,
  attribution_model TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Attribution results cache
CREATE TABLE IF NOT EXISTS attribution_results (
  id TEXT PRIMARY KEY,
  deal_id TEXT NOT NULL,
  partner_id TEXT NOT NULL,
  attribution_percentage REAL NOT NULL,
  payout_amount REAL NOT NULL,
  calculated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (deal_id) REFERENCES deals(id),
  FOREIGN KEY (partner_id) REFERENCES partners(id)
);

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  key_hash TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_used_at TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_deal_id ON events(deal_id);
CREATE INDEX IF NOT EXISTS idx_events_partner_id ON events(partner_id);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
CREATE INDEX IF NOT EXISTS idx_attribution_results_deal_id ON attribution_results(deal_id);
CREATE INDEX IF NOT EXISTS idx_deals_closed_date ON deals(closed_date);
`;
