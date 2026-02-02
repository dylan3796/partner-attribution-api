# Events API

Track user interactions with partners.

## The Event Object

```json
{
  "id": "evt_xyz789",
  "userId": "user_123",
  "partnerId": "partner_abc",
  "type": "click",
  "timestamp": "2024-01-15T10:30:00Z",
  "metadata": {
    "campaign": "summer-2024",
    "source": "email",
    "userAgent": "Mozilla/5.0..."
  }
}
```

### Attributes

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `userId` | string | Your user's ID |
| `partnerId` | string | Partner who generated this event |
| `type` | enum | Event type (see below) |
| `timestamp` | timestamp | When the event occurred |
| `metadata` | object | Custom key-value data |

### Event Types

| Type | Description |
|------|-------------|
| `click` | User clicked partner link |
| `view` | User viewed partner content |
| `signup` | User signed up via partner |
| `demo` | User booked demo through partner |
| `trial` | User started trial from partner |
| `custom` | Custom event type |

## Track an Event

Record a user interaction with a partner.

```http
POST /events
```

### Request

```bash
curl -X POST https://api.attribution.example/events \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "partnerId": "partner_abc",
    "type": "click",
    "metadata": {
      "campaign": "summer-2024",
      "source": "email"
    }
  }'
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | string | Yes | Your user's unique ID |
| `partnerId` | string | Yes | Partner ID |
| `type` | enum | Yes | Event type |
| `timestamp` | timestamp | No | Defaults to current time |
| `metadata` | object | No | Custom data (max 10 keys) |

### Response

```json
{
  "id": "evt_xyz789",
  "userId": "user_123",
  "partnerId": "partner_abc",
  "type": "click",
  "timestamp": "2024-01-15T10:30:00Z",
  "metadata": {
    "campaign": "summer-2024",
    "source": "email"
  }
}
```

## List Events

Retrieve events with optional filtering.

```http
GET /events
```

### Request

```bash
curl "https://api.attribution.example/events?userId=user_123&limit=50" \
  -H "X-API-Key: YOUR_API_KEY"
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `userId` | string | Filter by user ID |
| `partnerId` | string | Filter by partner ID |
| `type` | string | Filter by event type |
| `startDate` | date | Start of date range |
| `endDate` | date | End of date range |
| `limit` | integer | Results per page (default: 50, max: 100) |
| `offset` | integer | Pagination offset |
| `sort` | string | Sort field (prefix with `-` for desc) |

### Response

```json
{
  "data": [
    {
      "id": "evt_xyz789",
      "userId": "user_123",
      "partnerId": "partner_abc",
      "type": "click",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 1250,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

## Get User Journey

Retrieve all events for a specific user.

```http
GET /events/journey/:userId
```

### Request

```bash
curl https://api.attribution.example/events/journey/user_123 \
  -H "X-API-Key: YOUR_API_KEY"
```

### Response

```json
{
  "userId": "user_123",
  "events": [
    {
      "id": "evt_1",
      "partnerId": "partner_abc",
      "partnerName": "Acme Corp",
      "type": "click",
      "timestamp": "2024-01-10T09:00:00Z"
    },
    {
      "id": "evt_2",
      "partnerId": "partner_xyz",
      "partnerName": "XYZ Inc",
      "type": "demo",
      "timestamp": "2024-01-15T14:00:00Z"
    },
    {
      "id": "evt_3",
      "partnerId": "partner_abc",
      "partnerName": "Acme Corp",
      "type": "trial",
      "timestamp": "2024-01-18T11:00:00Z"
    }
  ],
  "totalEvents": 3,
  "firstTouch": {
    "partnerId": "partner_abc",
    "timestamp": "2024-01-10T09:00:00Z"
  },
  "lastTouch": {
    "partnerId": "partner_abc",
    "timestamp": "2024-01-18T11:00:00Z"
  }
}
```

## Bulk Track Events

Track multiple events in a single request.

```http
POST /events/bulk
```

### Request

```bash
curl -X POST https://api.attribution.example/events/bulk \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "events": [
      {
        "userId": "user_123",
        "partnerId": "partner_abc",
        "type": "click",
        "timestamp": "2024-01-15T10:00:00Z"
      },
      {
        "userId": "user_456",
        "partnerId": "partner_xyz",
        "type": "view",
        "timestamp": "2024-01-15T10:05:00Z"
      }
    ]
  }'
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `events` | array | Yes | Array of event objects (max 1000) |

### Response

```json
{
  "processed": 2,
  "failed": 0,
  "events": [
    {
      "id": "evt_xyz789",
      "userId": "user_123",
      "status": "success"
    },
    {
      "id": "evt_xyz790",
      "userId": "user_456",
      "status": "success"
    }
  ]
}
```

## Best Practices

### 1. Use Idempotency Keys

Prevent duplicate events with idempotency keys:

```bash
curl -X POST https://api.attribution.example/events \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Idempotency-Key: unique_key_123" \
  -H "Content-Type: application/json" \
  -d '{ ... }'
```

### 2. Include Metadata

Add context to events for better analysis:

```json
{
  "metadata": {
    "campaign": "summer-2024",
    "source": "email",
    "medium": "newsletter",
    "content": "cta-button",
    "userAgent": "Mozilla/5.0..."
  }
}
```

### 3. Track Consistently

Always track the same types of events for all partners to ensure fair comparison.

### 4. Use Bulk API for High Volume

If tracking many events, use the bulk endpoint to reduce API calls.

## Errors

### 400 Bad Request

```json
{
  "error": {
    "code": "validation_error",
    "message": "Invalid event type",
    "details": {
      "field": "type",
      "allowedValues": ["click", "view", "signup", "demo", "trial", "custom"]
    }
  }
}
```

### 404 Partner Not Found

```json
{
  "error": {
    "code": "not_found",
    "message": "Partner not found",
    "details": {
      "partnerId": "partner_invalid"
    }
  }
}
```
