# Attribution Models

Attribution models determine how credit for a deal is distributed among partners in the customer journey. Choose the model that best fits your business needs.

## Overview

When a customer interacts with multiple partners before converting, attribution models help you fairly allocate credit. Each model has different strengths and use cases.

## Available Models

### First-Touch Attribution

**100% credit to the first partner**

The first-touch model gives all credit to the first partner that introduced the customer to your product.

```json
{
  "model": "first-touch"
}
```

**Example:**
- Partner A (Click) → Partner B (Demo) → Partner C (Trial) → $10,000 deal
- **Result:** Partner A gets $10,000 (100%)

**Best For:**
- Measuring top-of-funnel effectiveness
- Rewarding partners who generate awareness
- Brand-new markets or products

**Pros:**
- Simple to understand
- Rewards partners who bring new customers

**Cons:**
- Ignores partners who helped close the deal
- May undervalue nurturing activities

---

### Last-Touch Attribution

**100% credit to the last partner**

The last-touch model gives all credit to the last partner the customer interacted with before converting.

```json
{
  "model": "last-touch"
}
```

**Example:**
- Partner A (Click) → Partner B (Demo) → Partner C (Trial) → $10,000 deal
- **Result:** Partner C gets $10,000 (100%)

**Best For:**
- Sales-driven organizations
- Rewarding partners who close deals
- Short sales cycles

**Pros:**
- Rewards partners who directly influence purchases
- Easy to implement

**Cons:**
- Ignores earlier touchpoints
- May undervalue awareness partners

---

### Linear Attribution

**Equal credit to all partners**

The linear model distributes credit equally among all partners in the customer journey.

```json
{
  "model": "linear"
}
```

**Example:**
- Partner A (Click) → Partner B (Demo) → Partner C (Trial) → $10,000 deal
- **Result:** 
  - Partner A: $3,333.33 (33.3%)
  - Partner B: $3,333.33 (33.3%)
  - Partner C: $3,333.33 (33.3%)

**Best For:**
- Long sales cycles
- Complex customer journeys
- When all touchpoints are valuable

**Pros:**
- Fair to all partners
- Simple to understand
- Works well for most scenarios

**Cons:**
- Doesn't account for touchpoint importance
- May overvalue minor interactions

---

### Time-Decay Attribution

**More credit to recent touchpoints**

The time-decay model gives exponentially more credit to touchpoints closer to conversion.

```json
{
  "model": "time-decay"
}
```

The credit for each touchpoint decreases by half for each 7 days before conversion.

**Example:**
- Jan 1: Partner A (Click)
- Jan 10: Partner B (Demo)
- Jan 15: Partner C (Trial)
- Jan 16: $10,000 deal closed

**Result:**
- Partner C: $5,000 (50%) - 1 day before close
- Partner B: $3,333 (33%) - 6 days before close
- Partner A: $1,667 (17%) - 15 days before close

**Best For:**
- Long sales cycles
- When timing matters
- Products with momentum-based buying

**Pros:**
- Reflects recency effect
- Rewards timely engagement

**Cons:**
- Complex to explain
- May undervalue awareness partners

---

### Position-Based (U-Shaped) Attribution

**40% first, 40% last, 20% middle**

The position-based model gives 40% credit to the first touchpoint, 40% to the last, and distributes the remaining 20% among middle touchpoints.

```json
{
  "model": "position-based"
}
```

**Example:**
- Partner A (Click) → Partner B (Demo) → Partner C (Demo) → Partner D (Trial) → $10,000 deal
- **Result:**
  - Partner A: $4,000 (40%) - first touch
  - Partner D: $4,000 (40%) - last touch
  - Partner B: $1,000 (10%) - middle
  - Partner C: $1,000 (10%) - middle

**Best For:**
- Balanced credit distribution
- Valuing both awareness and conversion
- Most B2B scenarios

**Pros:**
- Balances first and last touch
- Recognizes all touchpoints
- Flexible and fair

**Cons:**
- Arbitrary 40/20/40 split
- Middle touches get less credit

---

## Choosing the Right Model

Use this decision tree:

```
Do you primarily care about who brought the customer in?
└─ Yes → First-Touch

Do you primarily care about who closed the deal?
└─ Yes → Last-Touch

Is your sales cycle long and complex?
└─ Yes → Linear or Position-Based

Does timing of touchpoints matter a lot?
└─ Yes → Time-Decay

Want a balanced approach?
└─ Yes → Position-Based (recommended)
```

## Comparing Models

Let's compare all models with the same customer journey:

**Journey:**
1. Day 1: Partner A - Click
2. Day 10: Partner B - Demo
3. Day 20: Partner C - Trial
4. Day 21: Deal closes - $10,000

**Attribution Results:**

| Model | Partner A | Partner B | Partner C |
|-------|-----------|-----------|-----------|
| First-Touch | $10,000 (100%) | $0 (0%) | $0 (0%) |
| Last-Touch | $0 (0%) | $0 (0%) | $10,000 (100%) |
| Linear | $3,333 (33%) | $3,333 (33%) | $3,333 (33%) |
| Time-Decay | $1,429 (14%) | $2,857 (29%) | $5,714 (57%) |
| Position-Based | $4,000 (40%) | $2,000 (20%) | $4,000 (40%) |

## Testing Models

Use the **Attribution Calculator** in your dashboard to test different models:

1. Select a deal
2. Choose an attribution model
3. See how credit is distributed
4. Compare multiple models side-by-side

## Custom Attribution (Enterprise)

Enterprise customers can create custom attribution models:

```json
{
  "model": "custom",
  "rules": {
    "click": 0.1,
    "demo": 0.3,
    "trial": 0.6
  }
}
```

Contact our sales team to learn more about custom attribution.

## API Usage

Calculate attribution programmatically:

```bash
curl -X POST https://api.attribution.example/attribution/calculate \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "dealId": "deal_123",
    "model": "position-based"
  }'
```

## Best Practices

1. **Start with Position-Based**: It's the most balanced for most businesses
2. **Test Multiple Models**: Use the calculator to compare results
3. **Be Consistent**: Don't change models frequently
4. **Communicate Clearly**: Make sure partners understand the model
5. **Review Regularly**: Adjust your model as your business evolves

## Further Reading

- [Getting Started Guide](/docs/getting-started)
- [API Reference: Attribution](/docs/api-reference/attribution)
- [Case Studies](/docs/case-studies)
