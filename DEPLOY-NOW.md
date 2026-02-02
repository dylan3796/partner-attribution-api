# 🚀 Deploy Partner Attribution API - NOW

**Status:** ✅ PRODUCTION READY  
**Deploy Time:** 15-20 minutes

---

## Quick Deploy Options

### Option 1: Railway (Recommended)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/your-template)

**Steps:**
1. Click "Deploy on Railway" above (or go to https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `dylan3796/partner-attribution-api`
4. Click "Add Plugin" → "PostgreSQL" (auto-provisions database)
5. Click on your service → "Variables" → Add environment variables:

```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=${{Postgres.DATABASE_URL}}  # Auto-filled by Railway
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
API_KEYS_HASH_SECRET=YOUR_RANDOM_32_CHAR_STRING
CORS_ORIGIN=*
```

6. Click "Deploy"
7. Wait 3-5 minutes
8. Copy your Railway URL: `https://your-app.railway.app`

**Cost:** Free tier available, then ~$5-10/month

---

### Option 2: Render

1. Go to: https://render.com
2. New → Web Service
3. Connect repo: `dylan3796/partner-attribution-api`
4. Configure:
   - **Name:** `attribution-api`
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free (or Starter for better performance)
5. Click "Create Web Service"
6. Add PostgreSQL database:
   - New → PostgreSQL
   - Copy "Internal Database URL"
7. Add environment variables (same as Railway above)
8. Deploy

**Cost:** Free tier available, then $7-25/month

---

### Option 3: Fly.io

```bash
# Install flyctl
brew install flyctl  # Mac
# or: curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Deploy
cd /Users/dylanram/revenue-project/products/attribution-api
flyctl launch --name attribution-api --region sjc
flyctl postgres create --name attribution-db
flyctl postgres attach attribution-db
flyctl secrets set STRIPE_SECRET_KEY=sk_test_YOUR_KEY
flyctl secrets set API_KEYS_HASH_SECRET=YOUR_32_CHAR_STRING
flyctl deploy
```

**Cost:** Free tier available, then ~$5-15/month

---

## 🔑 Environment Variables Needed

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection | Auto-set by Railway/Render |
| `STRIPE_SECRET_KEY` | From Stripe dashboard | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | From Stripe webhooks | `whsec_...` (set later) |
| `API_KEYS_HASH_SECRET` | Random string | Generate: `openssl rand -hex 32` |
| `CORS_ORIGIN` | Allowed origins | `*` or your domain |

---

## 🎫 Stripe Setup (15 minutes)

### 1. Create Subscription Products

Go to: https://dashboard.stripe.com/test/products

Create 3 products:

**Starter - $49/month**
- Name: `Attribution API - Starter`
- Recurring: `$49 USD/month`
- Copy Price ID: `price_xxxxx`

**Professional - $149/month**
- Name: `Attribution API - Professional`
- Recurring: `$149 USD/month`
- Copy Price ID: `price_xxxxx`

**Enterprise - $499/month**
- Name: `Attribution API - Enterprise`
- Recurring: `$499 USD/month`
- Copy Price ID: `price_xxxxx`

### 2. Get API Keys

Go to: https://dashboard.stripe.com/test/apikeys

- Copy "Secret key" (starts with `sk_test_`)
- Add to your deployment environment variables

### 3. Set up Webhooks

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. URL: `https://YOUR_RAILWAY_URL/webhooks/stripe`
4. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. Copy "Signing secret" (starts with `whsec_`)
7. Add to environment variables: `STRIPE_WEBHOOK_SECRET=whsec_...`

---

## 🧪 Test Your Deployment

### Health Check
```bash
curl https://YOUR_URL/health
# Should return: {"status":"ok","database":"connected"}
```

### Create a Partner
```bash
curl -X POST https://YOUR_URL/partners \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Partner",
    "email": "test@example.com"
  }'
```

### Track an Event
```bash
curl -X POST https://YOUR_URL/events \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "deal_id": "deal_001",
    "partner_id": 1,
    "event_type": "referral",
    "timestamp": "2026-02-01T10:00:00Z"
  }'
```

---

## 🔐 Generate API Keys

Since this is the first deployment, you need to generate an API key.

**Option 1: Use Railway/Render Console**

Access your database and run:
```sql
INSERT INTO api_keys (key_hash, name, created_at)
VALUES (
  lower(hex(randomblob(32))),
  'Initial Admin Key',
  datetime('now')
);

SELECT 'sk_' || key_hash as api_key FROM api_keys ORDER BY created_at DESC LIMIT 1;
```

**Option 2: Create a Setup Endpoint**

Add this temporary endpoint to generate the first key (then remove it):

```typescript
// In src/index.ts, add:
app.get('/setup/generate-key', async (req, res) => {
  const apiKey = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(apiKey).digest('hex');
  
  db.prepare('INSERT INTO api_keys (key_hash, name) VALUES (?, ?)').run(
    hash,
    'Admin Key'
  );
  
  res.json({ apiKey: `sk_${apiKey}` });
});
```

Visit: `https://YOUR_URL/setup/generate-key`

**Copy the API key and remove this endpoint after!**

---

## 📊 Monitor Your API

### Railway
- View logs: Dashboard → Your service → Logs
- Metrics: Dashboard → Metrics tab
- Database: Dashboard → PostgreSQL service

### Render
- Logs: Dashboard → Your service → Logs
- Metrics: Dashboard → Metrics
- Shell access: Dashboard → Shell

---

## 🎯 Launch Checklist

Before going live:

- [ ] API deployed and accessible
- [ ] PostgreSQL database connected
- [ ] Stripe subscription products created
- [ ] Stripe API keys configured
- [ ] Stripe webhook endpoint added
- [ ] First API key generated
- [ ] Health check returns OK
- [ ] Test partner creation works
- [ ] Test event tracking works
- [ ] Test attribution calculation works

---

## 💰 Pricing Tiers

| Plan | Price | Rate Limit | Deals/Month |
|------|-------|------------|-------------|
| Starter | $49/mo | 100/min | 1,000 |
| Professional | $149/mo | 1,000/min | 10,000 |
| Enterprise | $499/mo | 10,000/min | Unlimited |

---

## 📚 Next Steps

After deployment:

1. **Create landing page** for customers to subscribe
2. **Set up customer dashboard** (code in `/dashboard` folder)
3. **Write documentation** (skeleton in `/docs` folder)
4. **Create Stripe Checkout** for self-service signup
5. **Add monitoring** (Sentry, LogRocket, etc.)

---

## 🆘 Troubleshooting

### "Database connection failed"
- Check `DATABASE_URL` is set correctly
- Verify PostgreSQL service is running
- Check network connectivity

### "401 Unauthorized"
- Verify `X-API-Key` header is set
- Check API key format: `sk_xxxxxx`
- Ensure key exists in database

### "Stripe webhook failed"
- Check `STRIPE_WEBHOOK_SECRET` is set
- Verify webhook URL is correct
- Test webhook in Stripe dashboard

### "Build failed"
- Check Node.js version (v18+ required)
- Verify all dependencies installed
- Check build logs for TypeScript errors

---

## 📖 Documentation

- **README.md** - Full API documentation
- **COMPLETED.md** - Project completion summary
- **demo.sh** - Interactive demo script
- **/docs** - Docusaurus documentation site

---

**🚀 Ready to deploy? Choose an option above and get live in 20 minutes!**
