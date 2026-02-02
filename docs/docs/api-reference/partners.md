# Partners API

Manage your partner relationships.

## The Partner Object

```json
{
  "id": "partner_abc123",
  "name": "Acme Corp",
  "type": "referral",
  "status": "active",
  "createdAt": "2024-01-15T10:30:00Z",
  "metadata": {
    "contactEmail": "partner@acme.com",
    "commissionRate": 0.15
  }
}
```

### Attributes

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `name` | string | Partner name |
| `type` | enum | `referral`, `affiliate`, or `integration` |
| `status` | enum | `active` or `inactive` |
| `createdAt` | timestamp | When partner was created |
| `metadata` | object | Custom key-value data (optional) |

## Create a Partner

Create a new partner.

```http
POST /partners
```

### Request

```bash
curl -X POST https://api.attribution.example/partners \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corp",
    "type": "referral",
    "status": "active",
    "metadata": {
      "contactEmail": "partner@acme.com"
    }
  }'
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Partner name (max 100 chars) |
| `type` | enum | Yes | Partner type |
| `status` | enum | No | Default: `active` |
| `metadata` | object | No | Custom data |

### Response

```json
{
  "id": "partner_abc123",
  "name": "Acme Corp",
  "type": "referral",
  "status": "active",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

## List Partners

Retrieve all partners.

```http
GET /partners
```

### Request

```bash
curl https://api.attribution.example/partners \
  -H "X-API-Key: YOUR_API_KEY"
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | Filter by type |
| `status` | string | Filter by status |
| `limit` | integer | Results per page (default: 50, max: 100) |
| `offset` | integer | Pagination offset |

### Response

```json
{
  "data": [
    {
      "id": "partner_abc123",
      "name": "Acme Corp",
      "type": "referral",
      "status": "active",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 42,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

## Retrieve a Partner

Get a single partner by ID.

```http
GET /partners/:id
```

### Request

```bash
curl https://api.attribution.example/partners/partner_abc123 \
  -H "X-API-Key: YOUR_API_KEY"
```

### Response

```json
{
  "id": "partner_abc123",
  "name": "Acme Corp",
  "type": "referral",
  "status": "active",
  "createdAt": "2024-01-15T10:30:00Z",
  "stats": {
    "totalEvents": 1250,
    "totalDeals": 15,
    "totalRevenue": 150000
  }
}
```

## Update a Partner

Update an existing partner.

```http
PUT /partners/:id
```

### Request

```bash
curl -X PUT https://api.attribution.example/partners/partner_abc123 \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corporation",
    "status": "inactive"
  }'
```

### Parameters

All fields are optional. Only include fields you want to update.

### Response

```json
{
  "id": "partner_abc123",
  "name": "Acme Corporation",
  "type": "referral",
  "status": "inactive",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-20T14:00:00Z"
}
```

## Delete a Partner

Delete a partner.

```http
DELETE /partners/:id
```

:::warning
Deleting a partner doesn't delete historical attribution data, but prevents new events from being tracked.
:::

### Request

```bash
curl -X DELETE https://api.attribution.example/partners/partner_abc123 \
  -H "X-API-Key: YOUR_API_KEY"
```

### Response

```json
{
  "deleted": true,
  "id": "partner_abc123"
}
```

## Partner Statistics

Get detailed statistics for a partner.

```http
GET /partners/:id/stats
```

### Request

```bash
curl https://api.attribution.example/partners/partner_abc123/stats?startDate=2024-01-01&endDate=2024-01-31 \
  -H "X-API-Key: YOUR_API_KEY"
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `startDate` | date | Start date (ISO 8601) |
| `endDate` | date | End date (ISO 8601) |
| `model` | string | Attribution model to use |

### Response

```json
{
  "partnerId": "partner_abc123",
  "period": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  },
  "stats": {
    "events": 450,
    "deals": 8,
    "revenue": 85000,
    "attributedRevenue": 45000,
    "conversionRate": 0.018
  },
  "eventsByType": {
    "click": 300,
    "demo": 100,
    "trial": 50
  }
}
```

## Errors

### 400 Bad Request

```json
{
  "error": {
    "code": "validation_error",
    "message": "Invalid partner type",
    "details": {
      "field": "type",
      "allowedValues": ["referral", "affiliate", "integration"]
    }
  }
}
```

### 404 Not Found

```json
{
  "error": {
    "code": "not_found",
    "message": "Partner not found"
  }
}
```
