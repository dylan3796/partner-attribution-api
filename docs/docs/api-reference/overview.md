# API Reference

The Attribution API is a RESTful API that returns JSON responses. All requests must be authenticated with an API key.

## Base URL

```
https://api.attribution.example
```

## Authentication

Include your API key in the `X-API-Key` header:

```bash
curl https://api.attribution.example/partners \
  -H "X-API-Key: YOUR_API_KEY"
```

[Learn more about authentication →](/docs/authentication)

## Response Format

All responses are JSON with this structure:

### Success Response

```json
{
  "data": { ... },
  "meta": {
    "requestId": "req_123",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "validation_error",
    "message": "Invalid partnerId",
    "details": {
      "field": "partnerId",
      "issue": "Must be a valid partner ID"
    }
  },
  "meta": {
    "requestId": "req_123",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid API key |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Something went wrong on our end |

## Rate Limiting

Rate limits vary by plan. Check these response headers:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640000000
```

## Pagination

List endpoints support pagination:

```bash
curl "https://api.attribution.example/events?limit=50&offset=100" \
  -H "X-API-Key: YOUR_API_KEY"
```

Response includes pagination metadata:

```json
{
  "data": [...],
  "pagination": {
    "total": 1000,
    "limit": 50,
    "offset": 100,
    "hasMore": true
  }
}
```

## Filtering & Sorting

Most list endpoints support filtering:

```bash
# Filter by partner
curl "https://api.attribution.example/events?partnerId=partner_123" \
  -H "X-API-Key: YOUR_API_KEY"

# Filter by date range
curl "https://api.attribution.example/events?startDate=2024-01-01&endDate=2024-01-31" \
  -H "X-API-Key: YOUR_API_KEY"

# Sort results
curl "https://api.attribution.example/events?sort=-timestamp" \
  -H "X-API-Key: YOUR_API_KEY"
```

## Timestamps

All timestamps are in ISO 8601 format (UTC):

```
2024-01-15T10:30:00Z
```

## Idempotency

POST requests support idempotency keys to safely retry requests:

```bash
curl -X POST https://api.attribution.example/events \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Idempotency-Key: unique_key_123" \
  -H "Content-Type: application/json" \
  -d '{ ... }'
```

## Versioning

The API version is included in the URL:

```
https://api.attribution.example/v1/partners
```

Current version: **v1**

## Endpoints

### Core Resources

- [Partners](/docs/api-reference/partners) - Manage your partners
- [Events](/docs/api-reference/events) - Track user interactions
- [Deals](/docs/api-reference/deals) - Record closed deals
- [Attribution](/docs/api-reference/attribution) - Calculate attribution

### Utilities

- [Analytics](/docs/api-reference/analytics) - Get analytics data
- [Webhooks](/docs/api-reference/webhooks) - Manage webhooks

## SDKs

We provide official SDKs for popular languages:

- [JavaScript/Node.js](/docs/sdks/javascript)
- [Python](/docs/sdks/python)
- More coming soon!

## Need Help?

- 📧 Email: api@attribution.example
- 💬 Discord: [Join our community](https://discord.gg/attribution)
- 🐛 Bug Reports: [GitHub Issues](https://github.com/attribution-api/issues)
