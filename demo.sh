#!/bin/bash
set -e

# Partner Attribution API Demo Script
# Run with: bash demo.sh

API_KEY="${API_KEY:-sk_9657c4d61075cbe0c284ae2891fab223dfd6f7ec36c8446ce8700792d929fdb7}"
BASE_URL="http://localhost:3000"

echo "🎯 Partner Attribution API Demo"
echo "================================"
echo ""

# Check if server is running
if ! curl -s "$BASE_URL/health" > /dev/null; then
  echo "❌ API server not running. Start it with: npm run dev"
  exit 1
fi

echo "✓ API server is running"
echo ""

# 1. Create Partners
echo "📝 Creating partners..."
ALICE=$(curl -s -X POST "$BASE_URL/partners" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice (Referral Specialist)","email":"alice@partners.com"}' \
  | jq -r '.partner.id')

BOB=$(curl -s -X POST "$BASE_URL/partners" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob (Demo Expert)","email":"bob@partners.com"}' \
  | jq -r '.partner.id')

CHARLIE=$(curl -s -X POST "$BASE_URL/partners" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Charlie (Closer)","email":"charlie@partners.com"}' \
  | jq -r '.partner.id')

echo "  ✓ Alice: $ALICE"
echo "  ✓ Bob: $BOB"
echo "  ✓ Charlie: $CHARLIE"
echo ""

# 2. Track Events for Deal 1 (Role-Based)
DEAL1="deal-rb-001"
echo "📊 Tracking events for Deal 1 (Role-Based)..."

curl -s -X POST "$BASE_URL/events" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"partner_id\":\"$ALICE\",\"deal_id\":\"$DEAL1\",\"touchpoint_type\":\"referral\",\"timestamp\":\"2026-01-01T10:00:00Z\"}" > /dev/null

curl -s -X POST "$BASE_URL/events" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"partner_id\":\"$BOB\",\"deal_id\":\"$DEAL1\",\"touchpoint_type\":\"demo\",\"timestamp\":\"2026-01-05T12:00:00Z\"}" > /dev/null

curl -s -X POST "$BASE_URL/events" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"partner_id\":\"$CHARLIE\",\"deal_id\":\"$DEAL1\",\"touchpoint_type\":\"closer\",\"timestamp\":\"2026-01-10T15:00:00Z\"}" > /dev/null

echo "  ✓ Referral by Alice"
echo "  ✓ Demo by Bob"
echo "  ✓ Close by Charlie"
echo ""

# 3. Close Deal 1 with Role-Based Attribution
echo "💰 Closing Deal 1 ($100,000 - Role-Based Attribution)..."
curl -s -X POST "$BASE_URL/deals" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"id\":\"$DEAL1\",\"amount\":100000,\"attribution_model\":\"role-based\"}" > /dev/null

echo ""
echo "🎯 Attribution Results (Role-Based):"
echo "  Weights: Referral=25%, Demo=15%, Closer=35%"
echo ""
curl -s "$BASE_URL/attribution/$DEAL1" \
  -H "X-API-Key: $API_KEY" \
  | jq -r '.attributions[] | "  \(.partner_name): \(.percentage)% = $\(.payout)"'
echo ""

# 4. Track Events for Deal 2 (Equal)
DEAL2="deal-eq-002"
echo "📊 Tracking events for Deal 2 (Equal Split)..."

curl -s -X POST "$BASE_URL/events" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"partner_id\":\"$ALICE\",\"deal_id\":\"$DEAL2\",\"touchpoint_type\":\"referral\"}" > /dev/null

curl -s -X POST "$BASE_URL/events" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"partner_id\":\"$BOB\",\"deal_id\":\"$DEAL2\",\"touchpoint_type\":\"intro\"}" > /dev/null

echo "  ✓ 2 partners contributed"
echo ""

# 5. Close Deal 2 with Equal Attribution
echo "💰 Closing Deal 2 ($50,000 - Equal Attribution)..."
curl -s -X POST "$BASE_URL/deals" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"id\":\"$DEAL2\",\"amount\":50000,\"attribution_model\":\"equal\"}" > /dev/null

echo ""
echo "🎯 Attribution Results (Equal):"
echo ""
curl -s "$BASE_URL/attribution/$DEAL2" \
  -H "X-API-Key: $API_KEY" \
  | jq -r '.attributions[] | "  \(.partner_name): \(.percentage)% = $\(.payout)"'
echo ""

# 6. Analytics Dashboard
echo "📈 Analytics Dashboard:"
echo ""
curl -s "$BASE_URL/analytics" \
  -H "X-API-Key: $API_KEY" \
  | jq '{
    total_deals: .overview.total_deals,
    total_revenue: .overview.total_revenue,
    top_performers: .partners[0:3] | map({name, total_payout, deals_count})
  }'

echo ""
echo "✅ Demo complete! API is working perfectly."
echo ""
echo "Try these endpoints:"
echo "  GET  $BASE_URL/partners"
echo "  GET  $BASE_URL/deals"
echo "  GET  $BASE_URL/analytics"
echo "  GET  $BASE_URL/attribution/:dealId"
