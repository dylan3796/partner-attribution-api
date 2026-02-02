# Authentication

The Attribution API uses API keys for authentication. All API requests must include your API key in the `X-API-Key` header.

## Getting Your API Key

1. Log in to your [dashboard](https://dashboard.attribution.example)
2. Navigate to **API Keys**
3. Click **Generate New Key**
4. Copy and securely store your key

## API Key Format

API keys follow this format:

```
sk_live_[your_key_here]  # Production
sk_test_[your_key_here]  # Testing (coming soon)
```

## Making Authenticated Requests

Include your API key in the `X-API-Key` header with every request:

### cURL

```bash
curl https://api.attribution.example/partners \
  -H "X-API-Key: sk_live_your_api_key_here"
```

### JavaScript

```javascript
const headers = {
  'X-API-Key': process.env.ATTRIBUTION_API_KEY,
  'Content-Type': 'application/json',
};

const response = await fetch('https://api.attribution.example/partners', {
  headers,
});
```

### Python

```python
import os
import requests

headers = {
    'X-API-Key': os.environ['ATTRIBUTION_API_KEY'],
    'Content-Type': 'application/json',
}

response = requests.get(
    'https://api.attribution.example/partners',
    headers=headers,
)
```

## Security Best Practices

### 1. Use Environment Variables

Never hardcode API keys in your application:

```javascript
// ❌ Don't do this
const API_KEY = 'sk_live_abc123...';

// ✅ Do this
const API_KEY = process.env.ATTRIBUTION_API_KEY;
```

### 2. Keep Keys Secret

- Never commit API keys to version control
- Don't share keys in public forums or chat
- Don't include keys in client-side code
- Use separate keys for different environments

### 3. Rotate Keys Regularly

Generate new API keys periodically and revoke old ones:

1. Generate a new key in your dashboard
2. Update your application to use the new key
3. Test to ensure everything works
4. Revoke the old key

### 4. Use HTTPS Only

Always make API requests over HTTPS. HTTP requests will be rejected.

### 5. Monitor API Key Usage

Check your dashboard regularly for:
- Unusual API call patterns
- Requests from unexpected IP addresses
- Failed authentication attempts

## Error Responses

### 401 Unauthorized

Missing or invalid API key:

```json
{
  "error": {
    "code": "unauthorized",
    "message": "Invalid API key"
  }
}
```

**Solutions:**
- Verify your API key is correct
- Check that the `X-API-Key` header is included
- Ensure the key hasn't been revoked

### 403 Forbidden

Valid API key but insufficient permissions:

```json
{
  "error": {
    "code": "forbidden",
    "message": "Insufficient permissions for this operation"
  }
}
```

**Solutions:**
- Verify your plan includes access to this endpoint
- Check if you've reached your plan limits
- Upgrade your plan if needed

## Rate Limiting

Rate limits vary by plan:

| Plan | Rate Limit | Burst |
|------|------------|-------|
| Starter | 100/min | 20 |
| Professional | 1,000/min | 200 |
| Enterprise | 10,000/min | 2,000 |

When you exceed the rate limit, you'll receive a `429 Too Many Requests` response:

```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded. Try again in 60 seconds."
  }
}
```

Response headers include rate limit information:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640000000
```

## IP Whitelisting (Enterprise)

Enterprise plans can restrict API access to specific IP addresses:

1. Navigate to **Settings** → **Security**
2. Click **Add IP Address**
3. Enter the IP address or CIDR range
4. Save changes

## Revoking API Keys

To revoke an API key:

1. Go to **API Keys** in your dashboard
2. Find the key you want to revoke
3. Click the **Delete** button
4. Confirm the action

:::warning
Revoking a key immediately invalidates it. Make sure you're not using it in production before revoking.
:::

## Testing Authentication

Test your API key with a simple request:

```bash
curl https://api.attribution.example/auth/verify \
  -H "X-API-Key: YOUR_API_KEY"
```

Success response:

```json
{
  "valid": true,
  "accountId": "acc_123",
  "plan": "professional"
}
```
