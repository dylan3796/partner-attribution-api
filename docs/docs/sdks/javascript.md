# JavaScript/Node.js SDK

The official JavaScript SDK for the Attribution API works in Node.js and modern browsers.

## Installation

```bash
npm install @attribution-api/sdk
# or
yarn add @attribution-api/sdk
```

## Quick Start

```javascript
import { AttributionAPI } from '@attribution-api/sdk';

// Initialize with your API key
const api = new AttributionAPI('sk_live_your_api_key');

// Track an event
const event = await api.events.track({
  userId: 'user_123',
  partnerId: 'partner_abc',
  type: 'click',
  metadata: {
    campaign: 'summer-2024',
  },
});

console.log('Event tracked:', event.id);
```

## Configuration

### Initialization Options

```javascript
const api = new AttributionAPI('your_api_key', {
  baseUrl: 'https://api.attribution.example', // optional
  timeout: 10000, // request timeout in ms (default: 10000)
  retries: 3, // number of retries (default: 3)
});
```

### Using Environment Variables

```javascript
// Reads from ATTRIBUTION_API_KEY env variable
const api = new AttributionAPI(process.env.ATTRIBUTION_API_KEY);
```

## Partners

### Create a Partner

```javascript
const partner = await api.partners.create({
  name: 'Acme Corp',
  type: 'referral',
  status: 'active',
  metadata: {
    contactEmail: 'partner@acme.com',
  },
});
```

### List Partners

```javascript
const partners = await api.partners.list({
  type: 'referral',
  limit: 50,
});

partners.data.forEach(partner => {
  console.log(partner.name);
});
```

### Get a Partner

```javascript
const partner = await api.partners.get('partner_abc');
console.log(partner.name);
```

### Update a Partner

```javascript
const partner = await api.partners.update('partner_abc', {
  name: 'Acme Corporation',
  status: 'inactive',
});
```

### Delete a Partner

```javascript
await api.partners.delete('partner_abc');
```

### Get Partner Statistics

```javascript
const stats = await api.partners.stats('partner_abc', {
  startDate: '2024-01-01',
  endDate: '2024-01-31',
});

console.log(`Revenue: $${stats.revenue}`);
```

## Events

### Track an Event

```javascript
const event = await api.events.track({
  userId: 'user_123',
  partnerId: 'partner_abc',
  type: 'click',
  metadata: {
    campaign: 'summer-2024',
    source: 'email',
  },
});
```

### Track with Idempotency

```javascript
const event = await api.events.track(
  {
    userId: 'user_123',
    partnerId: 'partner_abc',
    type: 'click',
  },
  {
    idempotencyKey: 'unique_key_123',
  }
);
```

### List Events

```javascript
const events = await api.events.list({
  userId: 'user_123',
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  limit: 100,
});
```

### Get User Journey

```javascript
const journey = await api.events.journey('user_123');

console.log(`Total events: ${journey.totalEvents}`);
journey.events.forEach(event => {
  console.log(`${event.type} - ${event.partnerName}`);
});
```

### Bulk Track Events

```javascript
const result = await api.events.bulk([
  {
    userId: 'user_123',
    partnerId: 'partner_abc',
    type: 'click',
  },
  {
    userId: 'user_456',
    partnerId: 'partner_xyz',
    type: 'view',
  },
]);

console.log(`Processed: ${result.processed}`);
```

## Deals

### Create a Deal

```javascript
const deal = await api.deals.create({
  amount: 10000,
  closedAt: new Date().toISOString(),
  touchPoints: [
    {
      partnerId: 'partner_abc',
      type: 'click',
      timestamp: '2024-01-10T09:00:00Z',
    },
    {
      partnerId: 'partner_xyz',
      type: 'demo',
      timestamp: '2024-01-15T14:00:00Z',
    },
  ],
});
```

### List Deals

```javascript
const deals = await api.deals.list({
  startDate: '2024-01-01',
  limit: 50,
});
```

### Get a Deal

```javascript
const deal = await api.deals.get('deal_123');
console.log(`Amount: $${deal.amount}`);
```

## Attribution

### Calculate Attribution

```javascript
const attribution = await api.attribution.calculate({
  dealId: 'deal_123',
  model: 'linear',
});

attribution.forEach(result => {
  console.log(`${result.partnerName}: $${result.credit} (${result.percentage}%)`);
});
```

### Get Deal Attribution

```javascript
const attribution = await api.attribution.get('deal_123');
```

### Compare Models

```javascript
const models = ['first-touch', 'last-touch', 'linear'];
const comparisons = await Promise.all(
  models.map(model =>
    api.attribution.calculate({
      dealId: 'deal_123',
      model,
    })
  )
);

models.forEach((model, i) => {
  console.log(`\n${model}:`);
  comparisons[i].forEach(result => {
    console.log(`  ${result.partnerName}: $${result.credit}`);
  });
});
```

## Analytics

### Get Analytics

```javascript
const analytics = await api.analytics.get({
  startDate: '2024-01-01',
  endDate: '2024-01-31',
});

console.log(`Total events: ${analytics.totalEvents}`);
console.log(`Total revenue: $${analytics.totalRevenue}`);
```

## Error Handling

### Using Try/Catch

```javascript
try {
  const partner = await api.partners.get('invalid_id');
} catch (error) {
  if (error.code === 'not_found') {
    console.log('Partner not found');
  } else if (error.code === 'validation_error') {
    console.log('Invalid data:', error.details);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Error Types

```javascript
import { APIError, ValidationError, RateLimitError } from '@attribution-api/sdk';

try {
  await api.events.track({ ... });
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Validation failed:', error.details);
  } else if (error instanceof RateLimitError) {
    console.log('Rate limit exceeded, retry after:', error.retryAfter);
  } else if (error instanceof APIError) {
    console.log('API error:', error.message);
  }
}
```

## TypeScript Support

The SDK is written in TypeScript with full type definitions:

```typescript
import { AttributionAPI, Partner, Event, Deal } from '@attribution-api/sdk';

const api = new AttributionAPI(process.env.ATTRIBUTION_API_KEY!);

// Type-safe partner creation
const partner: Partner = await api.partners.create({
  name: 'Acme Corp',
  type: 'referral', // TypeScript enforces valid types
  status: 'active',
});

// Type-safe event tracking
const event: Event = await api.events.track({
  userId: 'user_123',
  partnerId: partner.id,
  type: 'click', // Auto-completion for event types
});
```

## Webhooks

### Verify Webhook Signature

```javascript
import { verifyWebhookSignature } from '@attribution-api/sdk';

app.post('/webhooks/attribution', (req, res) => {
  const signature = req.headers['x-attribution-signature'];
  const payload = JSON.stringify(req.body);
  const secret = process.env.WEBHOOK_SECRET;
  
  if (!verifyWebhookSignature(payload, signature, secret)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process webhook
  res.status(200).send('OK');
});
```

## Browser Usage

The SDK works in browsers for client-side tracking:

```html
<script type="module">
  import { AttributionAPI } from 'https://cdn.jsdelivr.net/npm/@attribution-api/sdk';
  
  const api = new AttributionAPI('sk_live_your_api_key');
  
  // Track click events
  document.querySelectorAll('[data-partner]').forEach(el => {
    el.addEventListener('click', async () => {
      await api.events.track({
        userId: getCurrentUserId(),
        partnerId: el.dataset.partner,
        type: 'click',
      });
    });
  });
</script>
```

:::warning Client-Side Usage
Only use the SDK in the browser with public tracking endpoints. Never expose your full API key in client-side code. Use a restricted public key instead.
:::

## Advanced Usage

### Custom Retry Logic

```javascript
const api = new AttributionAPI('your_api_key', {
  retries: 5,
  retryDelay: (attempt) => Math.pow(2, attempt) * 1000, // Exponential backoff
  shouldRetry: (error) => error.code === 'rate_limit_exceeded',
});
```

### Request Interceptors

```javascript
api.interceptors.request.use((config) => {
  // Add custom headers
  config.headers['X-Custom-Header'] = 'value';
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Custom error handling
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);
```

## Examples

### Full Integration Example

```javascript
import { AttributionAPI } from '@attribution-api/sdk';

const api = new AttributionAPI(process.env.ATTRIBUTION_API_KEY);

class PartnerAttribution {
  async trackPartnerClick(userId, partnerId, metadata = {}) {
    return await api.events.track({
      userId,
      partnerId,
      type: 'click',
      metadata,
    });
  }
  
  async recordDeal(userId, amount) {
    // Get user's journey
    const journey = await api.events.journey(userId);
    
    // Create deal with all touchpoints
    const deal = await api.deals.create({
      amount,
      closedAt: new Date().toISOString(),
      touchPoints: journey.events.map(event => ({
        partnerId: event.partnerId,
        type: event.type,
        timestamp: event.timestamp,
      })),
    });
    
    // Calculate attribution
    const attribution = await api.attribution.calculate({
      dealId: deal.id,
      model: 'position-based',
    });
    
    // Process commissions
    await this.processCommissions(attribution);
    
    return { deal, attribution };
  }
  
  async processCommissions(attribution) {
    for (const result of attribution) {
      console.log(`Pay ${result.partnerName}: $${result.credit}`);
      // Integrate with payment system...
    }
  }
}

// Usage
const tracking = new PartnerAttribution();
await tracking.trackPartnerClick('user_123', 'partner_abc');
const result = await tracking.recordDeal('user_123', 10000);
```

## Support

- 📦 [npm Package](https://www.npmjs.com/package/@attribution-api/sdk)
- 📄 [GitHub Repository](https://github.com/attribution-api/js-sdk)
- 🐛 [Report Issues](https://github.com/attribution-api/js-sdk/issues)
