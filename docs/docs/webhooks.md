# Webhooks

Webhooks allow you to receive real-time notifications when events occur in your Attribution API account.

## Overview

Instead of polling the API, webhooks push data to your server when specific events happen. This is useful for:

- Updating commission payouts when deals are attributed
- Syncing data with your CRM
- Triggering automated workflows
- Real-time notifications

## Setting Up Webhooks

### 1. Create an Endpoint

Create an HTTPS endpoint on your server to receive webhook events:

```javascript
// Express.js example
app.post('/webhooks/attribution', (req, res) => {
  const event = req.body;
  
  // Verify signature (recommended)
  if (!verifySignature(req)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Handle the event
  switch (event.type) {
    case 'deal.attributed':
      handleDealAttributed(event.data);
      break;
    case 'partner.created':
      handlePartnerCreated(event.data);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  
  // Return 200 to acknowledge receipt
  res.status(200).send('Received');
});
```

### 2. Register the Webhook

Register your endpoint in the dashboard:

1. Go to **Settings** → **Webhooks**
2. Click **Add Webhook**
3. Enter your endpoint URL
4. Select events you want to receive
5. Click **Create**

Or use the API:

```bash
curl -X POST https://api.attribution.example/webhooks \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://yourdomain.com/webhooks/attribution",
    "events": ["deal.attributed", "partner.created"],
    "secret": "your_webhook_secret"
  }'
```

## Webhook Events

### deal.attributed

Fired when a deal is attributed to partners.

```json
{
  "id": "evt_123",
  "type": "deal.attributed",
  "timestamp": "2024-01-20T15:00:00Z",
  "data": {
    "dealId": "deal_xyz",
    "amount": 10000,
    "closedAt": "2024-01-20T15:00:00Z",
    "model": "linear",
    "attribution": [
      {
        "partnerId": "partner_abc",
        "partnerName": "Acme Corp",
        "credit": 5000,
        "percentage": 50
      },
      {
        "partnerId": "partner_xyz",
        "partnerName": "XYZ Inc",
        "credit": 5000,
        "percentage": 50
      }
    ]
  }
}
```

### partner.created

Fired when a new partner is created.

```json
{
  "id": "evt_124",
  "type": "partner.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "id": "partner_abc",
    "name": "Acme Corp",
    "type": "referral",
    "status": "active"
  }
}
```

### partner.updated

Fired when a partner is updated.

```json
{
  "id": "evt_125",
  "type": "partner.updated",
  "timestamp": "2024-01-16T11:00:00Z",
  "data": {
    "id": "partner_abc",
    "name": "Acme Corporation",
    "status": "inactive",
    "changes": {
      "name": {
        "old": "Acme Corp",
        "new": "Acme Corporation"
      },
      "status": {
        "old": "active",
        "new": "inactive"
      }
    }
  }
}
```

### event.tracked

Fired when a new event is tracked (high volume).

```json
{
  "id": "evt_126",
  "type": "event.tracked",
  "timestamp": "2024-01-15T10:35:00Z",
  "data": {
    "id": "evt_xyz",
    "userId": "user_123",
    "partnerId": "partner_abc",
    "type": "click"
  }
}
```

:::tip
The `event.tracked` webhook can generate high volumes of traffic. Only enable it if you need real-time event notifications.
:::

## Verifying Webhook Signatures

Always verify webhook signatures to ensure requests are from Attribution API.

### How It Works

We sign webhook payloads with your webhook secret and include the signature in the `X-Attribution-Signature` header.

### Verification Example (Node.js)

```javascript
const crypto = require('crypto');

function verifySignature(req, secret) {
  const signature = req.headers['x-attribution-signature'];
  const payload = JSON.stringify(req.body);
  
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const expectedSignature = hmac.digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Usage
app.post('/webhooks/attribution', (req, res) => {
  if (!verifySignature(req, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process the webhook...
  res.status(200).send('OK');
});
```

### Verification Example (Python)

```python
import hmac
import hashlib

def verify_signature(payload, signature, secret):
    expected = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected)

# Usage
@app.route('/webhooks/attribution', methods=['POST'])
def handle_webhook():
    signature = request.headers.get('X-Attribution-Signature')
    payload = request.get_data(as_text=True)
    
    if not verify_signature(payload, signature, os.environ['WEBHOOK_SECRET']):
        return 'Invalid signature', 401
    
    # Process the webhook...
    return 'OK', 200
```

## Best Practices

### 1. Return 200 Quickly

Respond with a 200 status code immediately. Process webhooks asynchronously:

```javascript
app.post('/webhooks/attribution', async (req, res) => {
  // Acknowledge receipt immediately
  res.status(200).send('Received');
  
  // Process asynchronously
  processWebhookAsync(req.body);
});
```

### 2. Handle Retries

We retry failed webhooks with exponential backoff:

- Immediately
- After 1 minute
- After 5 minutes
- After 15 minutes
- After 1 hour

Make your webhook handler idempotent to handle duplicate events.

### 3. Store Webhook IDs

Store the webhook event `id` to prevent processing duplicates:

```javascript
async function processWebhook(event) {
  // Check if already processed
  const exists = await db.webhooks.findOne({ id: event.id });
  if (exists) {
    console.log('Already processed');
    return;
  }
  
  // Process the event
  await handleEvent(event);
  
  // Mark as processed
  await db.webhooks.insert({ id: event.id, processedAt: new Date() });
}
```

### 4. Use HTTPS Only

Webhook endpoints must use HTTPS in production.

### 5. Monitor Failures

Check your dashboard regularly for failed webhook deliveries.

## Testing Webhooks

### Local Testing with ngrok

Use [ngrok](https://ngrok.com/) to test webhooks locally:

```bash
# Start ngrok
ngrok http 3000

# Use the ngrok URL as your webhook endpoint
https://abc123.ngrok.io/webhooks/attribution
```

### Trigger Test Events

Trigger test webhooks from your dashboard:

1. Go to **Settings** → **Webhooks**
2. Select your webhook
3. Click **Send Test Event**
4. Choose event type
5. Click **Send**

### Manual Testing

```bash
curl -X POST https://yourdomain.com/webhooks/attribution \
  -H "Content-Type: application/json" \
  -H "X-Attribution-Signature: test_signature" \
  -d '{
    "id": "evt_test",
    "type": "deal.attributed",
    "timestamp": "2024-01-20T15:00:00Z",
    "data": { ... }
  }'
```

## Managing Webhooks

### List Webhooks

```bash
curl https://api.attribution.example/webhooks \
  -H "X-API-Key: YOUR_API_KEY"
```

### Update Webhook

```bash
curl -X PUT https://api.attribution.example/webhooks/wh_123 \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "events": ["deal.attributed"]
  }'
```

### Delete Webhook

```bash
curl -X DELETE https://api.attribution.example/webhooks/wh_123 \
  -H "X-API-Key: YOUR_API_KEY"
```

## Troubleshooting

### Webhooks Not Arriving

1. Check your endpoint is publicly accessible
2. Verify it returns 200 status code
3. Check webhook logs in your dashboard
4. Ensure your firewall isn't blocking our IPs

### Signature Verification Failing

1. Use the secret from your dashboard
2. Verify you're using the raw request body
3. Check the signature algorithm (HMAC SHA-256)
4. Ensure character encoding is UTF-8

## Webhook IPs

For security, you can whitelist these IPs:

```
34.120.45.67
34.120.45.68
34.120.45.69
```

These IPs are stable but we'll notify you before any changes.
