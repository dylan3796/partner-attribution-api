# Getting Started

This guide will help you integrate the Attribution API into your application in minutes.

## Prerequisites

- An Attribution API account ([sign up here](https://dashboard.attribution.example))
- An API key from your dashboard
- Basic knowledge of REST APIs

## Step 1: Get Your API Key

1. Log in to your [dashboard](https://dashboard.attribution.example)
2. Navigate to **API Keys** in the sidebar
3. Click **Generate New Key**
4. Copy your API key (starts with `sk_live_`)

:::caution Keep Your Key Secret
Never commit your API key to version control or share it publicly. Store it as an environment variable.
:::

## Step 2: Track Your First Event

Events represent user interactions with partners. Common event types include:

- `click` - User clicked a partner link
- `view` - User viewed partner content
- `signup` - User signed up via partner
- `demo` - User booked a demo through partner
- `trial` - User started a trial from partner

### Using cURL

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

### Using JavaScript

```javascript
const response = await fetch('https://api.attribution.example/events', {
  method: 'POST',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userId: 'user_123',
    partnerId: 'partner_abc',
    type: 'click',
    metadata: {
      campaign: 'summer-2024',
      source: 'email',
    },
  }),
});

const event = await response.json();
console.log('Event tracked:', event);
```

### Using Python

```python
import requests

response = requests.post(
    'https://api.attribution.example/events',
    headers={
        'X-API-Key': 'YOUR_API_KEY',
        'Content-Type': 'application/json',
    },
    json={
        'userId': 'user_123',
        'partnerId': 'partner_abc',
        'type': 'click',
        'metadata': {
            'campaign': 'summer-2024',
            'source': 'email',
        },
    },
)

event = response.json()
print('Event tracked:', event)
```

## Step 3: Create Partners

Before tracking events, you need to create partner records:

```bash
curl -X POST https://api.attribution.example/partners \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corp",
    "type": "referral",
    "status": "active"
  }'
```

Response:

```json
{
  "id": "partner_abc",
  "name": "Acme Corp",
  "type": "referral",
  "status": "active",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

## Step 4: Record a Deal

When a deal closes, create a deal record with the customer journey:

```bash
curl -X POST https://api.attribution.example/deals \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10000,
    "closedAt": "2024-01-20T15:00:00Z",
    "touchPoints": [
      {
        "partnerId": "partner_abc",
        "type": "click",
        "timestamp": "2024-01-10T09:00:00Z"
      },
      {
        "partnerId": "partner_xyz",
        "type": "demo",
        "timestamp": "2024-01-15T14:00:00Z"
      },
      {
        "partnerId": "partner_abc",
        "type": "trial",
        "timestamp": "2024-01-18T11:00:00Z"
      }
    ]
  }'
```

## Step 5: Calculate Attribution

Calculate how credit should be distributed using different models:

```bash
curl -X POST https://api.attribution.example/attribution/calculate \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "dealId": "deal_123",
    "model": "linear"
  }'
```

Response:

```json
[
  {
    "partnerId": "partner_abc",
    "partnerName": "Acme Corp",
    "credit": 6666.67,
    "percentage": 66.67
  },
  {
    "partnerId": "partner_xyz",
    "partnerName": "XYZ Inc",
    "credit": 3333.33,
    "percentage": 33.33
  }
]
```

## Testing Your Integration

Use the **Attribution Calculator** in your dashboard to test different attribution models and see how credit is distributed across partners.

## Next Steps

- [Learn about Attribution Models](/docs/attribution-models)
- [Explore the full API Reference](/docs/api-reference/overview)
- [Set up Webhooks](/docs/webhooks)
- [Use our SDKs](/docs/sdks/javascript)

## Need Help?

- 📧 Email: support@attribution.example
- 💬 Discord: [Join our community](https://discord.gg/attribution)
- 📚 Documentation: You're reading it!
