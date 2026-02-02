# Welcome to Attribution API

The **Attribution API** helps you track and attribute revenue to your partners accurately using multiple attribution models.

## What is Partner Attribution?

Partner attribution is the process of determining which partners deserve credit for a deal or conversion. When a customer interacts with multiple partners before making a purchase, attribution models help you fairly distribute credit.

## Key Features

- 🎯 **Multiple Attribution Models**: First-touch, last-touch, linear, time-decay, and position-based
- 📊 **Real-time Analytics**: Track partner performance with detailed dashboards
- 🔗 **Easy Integration**: RESTful API with SDKs for popular languages
- 🔐 **Secure Authentication**: API key-based authentication
- 📈 **Scalable**: Handle millions of events per month
- 🪝 **Webhooks**: Get notified when deals are attributed

## Quick Start

Get started in 3 simple steps:

1. **[Create an account](/docs/getting-started)** and generate your API key
2. **[Track events](/docs/api-reference/events)** as users interact with partners
3. **[Attribute deals](/docs/api-reference/attribution)** using your preferred model

## Use Cases

### Referral Programs
Track which referral partners are driving the most value to your business.

### Affiliate Marketing
Fairly compensate affiliates based on their contribution to the customer journey.

### Integration Partners
Measure the impact of your integration partners on revenue.

### Marketing Attribution
Understand which marketing touchpoints contribute most to conversions.

## Architecture Overview

```
User Journey → Events → Attribution Calculation → Revenue Distribution
```

1. **Track Events**: Record user interactions with partners
2. **Store Journey**: Build a timeline of all touchpoints
3. **Calculate Attribution**: When a deal closes, apply attribution model
4. **Distribute Credit**: Allocate revenue credit to partners

## Next Steps

- [Getting Started Guide](/docs/getting-started) - Set up your first integration
- [API Reference](/docs/api-reference/overview) - Explore all endpoints
- [Authentication](/docs/authentication) - Learn about API keys
- [Attribution Models](/docs/attribution-models) - Understand the different models
