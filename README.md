# Partner Attribution API

A production-ready REST API for tracking partner contributions and calculating revenue attribution using multiple models.

## Features

✅ **5 Attribution Models**
- **Equal**: Split evenly among all partners
- **First-Touch**: 100% to first touchpoint
- **Last-Touch**: 100% to last touchpoint
- **Role-Based**: Weighted by touchpoint type (referral, demo, closer, etc.)
- **Time-Decay**: More recent touchpoints weighted higher (7-day half-life)

✅ **Production Ready**
- TypeScript for type safety
- API key authentication
- Rate limiting (100 req/15min default)
- CORS support
- Input validation with Zod
- Comprehensive error handling
- SQLite database with WAL mode
- Attribution result caching

✅ **Complete API**
- Track attribution events
- Record deals
- Calculate attributions
- Manage partners
- Dashboard analytics

## Quick Start

### Installation

\`\`\`bash
cd /Users/dylanram/revenue-project/products/attribution-api
npm install
\`\`\`

### Development

\`\`\`bash
npm run dev
\`\`\`

Server starts on `http://localhost:3000`

On first run, a default API key is generated and saved to `.env.local`.

### Production

\`\`\`bash
npm run build
npm start
\`\`\`

## API Documentation

### Authentication

All endpoints require an API key in the `X-API-Key` header:

\`\`\`bash
curl -H "X-API-Key: sk_your_key_here" http://localhost:3000/partners
\`\`\`

### Endpoints

#### Track Attribution Event
\`\`\`http
POST /events
Content-Type: application/json

{
  "partner_id": "p1",
  "deal_id": "deal-123",
  "touchpoint_type": "referral",
  "timestamp": "2024-01-15T10:00:00Z",
  "metadata": {}
}
\`\`\`

**Touchpoint Types**: `referral`, `demo`, `intro`, `support`, `closer`, `other`

#### Record Deal Closed
\`\`\`http
POST /deals
Content-Type: application/json

{
  "id": "deal-123",
  "amount": 50000,
  "closed_date": "2024-01-20T15:00:00Z",
  "attribution_model": "role-based"
}
\`\`\`

**Models**: `equal`, `first-touch`, `last-touch`, `role-based`, `time-decay`

#### Get Attribution Breakdown
\`\`\`http
GET /attribution/deal-123
\`\`\`

Response:
\`\`\`json
{
  "deal_id": "deal-123",
  "total_amount": 50000,
  "model": "role-based",
  "attributions": [
    {
      "partner_id": "p1",
      "partner_name": "Alice",
      "percentage": 35,
      "payout": 17500,
      "touchpoints": 2,
      "role": "closer, referral"
    }
  ],
  "calculated_at": "2024-01-20T15:05:00Z",
  "cached": false
}
\`\`\`

#### Add Partner
\`\`\`http
POST /partners
Content-Type: application/json

{
  "name": "Alice Partner",
  "email": "alice@example.com",
  "payout_details": {
    "bank_account": "1234567890",
    "tax_id": "12-3456789"
  }
}
\`\`\`

#### List Partners
\`\`\`http
GET /partners?limit=50&offset=0
\`\`\`

#### Get Partner Details
\`\`\`http
GET /partners/:id
\`\`\`

#### Analytics Dashboard
\`\`\`http
GET /analytics?start_date=2024-01-01&end_date=2024-12-31
\`\`\`

Returns:
- Overall stats (total deals, revenue, avg deal size)
- Partner performance rankings
- Attribution model usage
- Touchpoint type distribution
- Recent deals

#### Partner-Specific Analytics
\`\`\`http
GET /analytics/partner/:partnerId
\`\`\`

## Attribution Models Explained

### Equal
Each partner gets an equal share regardless of contribution type or timing.

**Use when**: All partners are equally important

### First-Touch
100% credit to the partner who made the first touchpoint.

**Use when**: Lead generation is most valuable

### Last-Touch
100% credit to the partner who made the last touchpoint.

**Use when**: Closing the deal is most valuable

### Role-Based
Partners weighted by touchpoint type:
- Closer: 35%
- Referral: 25%
- Demo: 15%
- Intro: 15%
- Support: 10%
- Other: 5%

**Use when**: Different roles have different value

### Time-Decay
Recent touchpoints weighted more heavily using exponential decay (7-day half-life).

**Use when**: Recent engagement matters most

## Configuration

Environment variables (create `.env` file):

\`\`\`bash
PORT=3000
NODE_ENV=production
DB_PATH=./data/attribution.db
CORS_ORIGIN=*
RATE_LIMIT_MAX=100
\`\`\`

## Testing

Run unit tests:

\`\`\`bash
npm test
\`\`\`

Watch mode:

\`\`\`bash
npm run test:watch
\`\`\`

Tests cover:
- All 5 attribution models
- Edge cases (0 partners, single partner)
- Rounding error handling
- Multiple touchpoints per partner

## Database Schema

SQLite database with 5 tables:
- `partners` - Partner information
- `events` - Attribution touchpoints
- `deals` - Closed deals
- `attribution_results` - Cached calculations
- `api_keys` - API authentication

## Example Workflow

\`\`\`bash
# 1. Create partners
curl -X POST http://localhost:3000/partners \\
  -H "X-API-Key: $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Alice", "email": "alice@example.com"}'

# 2. Track events
curl -X POST http://localhost:3000/events \\
  -H "X-API-Key: $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "partner_id": "p1",
    "deal_id": "deal-123",
    "touchpoint_type": "referral"
  }'

# 3. Record deal
curl -X POST http://localhost:3000/deals \\
  -H "X-API-Key: $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "id": "deal-123",
    "amount": 50000,
    "attribution_model": "role-based"
  }'

# 4. Get attribution
curl http://localhost:3000/attribution/deal-123 \\
  -H "X-API-Key: $API_KEY"
\`\`\`

## Architecture

\`\`\`
src/
├── app.ts                 # Express app setup
├── index.ts              # Entry point
├── types/                # TypeScript types
├── db/                   # Database setup & schema
├── services/             # Business logic
│   └── attribution.service.ts
├── routes/               # API endpoints
│   ├── events.ts
│   ├── deals.ts
│   ├── attribution.ts
│   ├── partners.ts
│   └── analytics.ts
└── middleware/           # Auth, validation, errors
    ├── auth.ts
    ├── validation.ts
    └── errorHandler.ts
\`\`\`

## Performance

- Attribution results cached in database
- SQLite WAL mode for better concurrency
- Indexes on frequently queried columns
- Rate limiting prevents abuse

## Security

- API key authentication (SHA-256 hashed)
- Helmet.js security headers
- CORS configuration
- Input validation with Zod
- Rate limiting
- SQL injection prevention (prepared statements)

## License

MIT
