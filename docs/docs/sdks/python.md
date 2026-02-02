# Python SDK

The official Python SDK for the Attribution API supports Python 3.7+.

## Installation

```bash
pip install attribution-api
```

## Quick Start

```python
from attribution_api import AttributionAPI

# Initialize with your API key
api = AttributionAPI('sk_live_your_api_key')

# Track an event
event = api.events.track(
    user_id='user_123',
    partner_id='partner_abc',
    type='click',
    metadata={
        'campaign': 'summer-2024',
    },
)

print(f'Event tracked: {event.id}')
```

## Configuration

### Initialization Options

```python
from attribution_api import AttributionAPI

api = AttributionAPI(
    api_key='your_api_key',
    base_url='https://api.attribution.example',  # optional
    timeout=10,  # request timeout in seconds
    retries=3,  # number of retries
)
```

### Using Environment Variables

```python
import os
from attribution_api import AttributionAPI

# Reads from ATTRIBUTION_API_KEY env variable
api = AttributionAPI(os.environ['ATTRIBUTION_API_KEY'])
```

## Partners

### Create a Partner

```python
partner = api.partners.create(
    name='Acme Corp',
    type='referral',
    status='active',
    metadata={
        'contact_email': 'partner@acme.com',
    },
)

print(f'Created partner: {partner.id}')
```

### List Partners

```python
partners = api.partners.list(
    type='referral',
    limit=50,
)

for partner in partners.data:
    print(partner.name)
```

### Get a Partner

```python
partner = api.partners.get('partner_abc')
print(partner.name)
```

### Update a Partner

```python
partner = api.partners.update(
    'partner_abc',
    name='Acme Corporation',
    status='inactive',
)
```

### Delete a Partner

```python
api.partners.delete('partner_abc')
```

### Get Partner Statistics

```python
stats = api.partners.stats(
    'partner_abc',
    start_date='2024-01-01',
    end_date='2024-01-31',
)

print(f'Revenue: ${stats.revenue}')
print(f'Deals: {stats.deals}')
```

## Events

### Track an Event

```python
event = api.events.track(
    user_id='user_123',
    partner_id='partner_abc',
    type='click',
    metadata={
        'campaign': 'summer-2024',
        'source': 'email',
    },
)
```

### Track with Idempotency

```python
event = api.events.track(
    user_id='user_123',
    partner_id='partner_abc',
    type='click',
    idempotency_key='unique_key_123',
)
```

### List Events

```python
events = api.events.list(
    user_id='user_123',
    start_date='2024-01-01',
    end_date='2024-01-31',
    limit=100,
)

for event in events.data:
    print(f'{event.type} - {event.partner_id}')
```

### Get User Journey

```python
journey = api.events.journey('user_123')

print(f'Total events: {journey.total_events}')
for event in journey.events:
    print(f'{event.type} - {event.partner_name}')
```

### Bulk Track Events

```python
result = api.events.bulk([
    {
        'user_id': 'user_123',
        'partner_id': 'partner_abc',
        'type': 'click',
    },
    {
        'user_id': 'user_456',
        'partner_id': 'partner_xyz',
        'type': 'view',
    },
])

print(f'Processed: {result.processed}')
```

## Deals

### Create a Deal

```python
from datetime import datetime

deal = api.deals.create(
    amount=10000,
    closed_at=datetime.now().isoformat(),
    touch_points=[
        {
            'partner_id': 'partner_abc',
            'type': 'click',
            'timestamp': '2024-01-10T09:00:00Z',
        },
        {
            'partner_id': 'partner_xyz',
            'type': 'demo',
            'timestamp': '2024-01-15T14:00:00Z',
        },
    ],
)

print(f'Deal created: {deal.id}')
```

### List Deals

```python
deals = api.deals.list(
    start_date='2024-01-01',
    limit=50,
)

for deal in deals.data:
    print(f'Deal {deal.id}: ${deal.amount}')
```

### Get a Deal

```python
deal = api.deals.get('deal_123')
print(f'Amount: ${deal.amount}')
```

## Attribution

### Calculate Attribution

```python
attribution = api.attribution.calculate(
    deal_id='deal_123',
    model='linear',
)

for result in attribution:
    print(f'{result.partner_name}: ${result.credit} ({result.percentage}%)')
```

### Get Deal Attribution

```python
attribution = api.attribution.get('deal_123')
```

### Compare Models

```python
models = ['first-touch', 'last-touch', 'linear']

for model in models:
    print(f'\n{model}:')
    attribution = api.attribution.calculate(
        deal_id='deal_123',
        model=model,
    )
    for result in attribution:
        print(f'  {result.partner_name}: ${result.credit}')
```

## Analytics

### Get Analytics

```python
analytics = api.analytics.get(
    start_date='2024-01-01',
    end_date='2024-01-31',
)

print(f'Total events: {analytics.total_events}')
print(f'Total revenue: ${analytics.total_revenue}')
print(f'Total deals: {analytics.total_deals}')
```

## Error Handling

### Using Try/Except

```python
from attribution_api.exceptions import (
    APIError,
    NotFoundError,
    ValidationError,
    RateLimitError,
)

try:
    partner = api.partners.get('invalid_id')
except NotFoundError:
    print('Partner not found')
except ValidationError as e:
    print(f'Invalid data: {e.details}')
except RateLimitError as e:
    print(f'Rate limit exceeded, retry after: {e.retry_after}')
except APIError as e:
    print(f'API error: {e.message}')
```

### Error Details

```python
try:
    api.events.track(
        user_id='',  # Invalid empty string
        partner_id='partner_abc',
        type='click',
    )
except ValidationError as e:
    print(f'Error code: {e.code}')
    print(f'Message: {e.message}')
    print(f'Details: {e.details}')
    # Output:
    # Error code: validation_error
    # Message: user_id is required
    # Details: {'field': 'user_id', 'issue': 'Cannot be empty'}
```

## Type Hints

The SDK includes full type hints for better IDE support:

```python
from attribution_api import AttributionAPI
from attribution_api.models import Partner, Event, Deal

api: AttributionAPI = AttributionAPI(os.environ['ATTRIBUTION_API_KEY'])

# Type-safe partner creation
partner: Partner = api.partners.create(
    name='Acme Corp',
    type='referral',
    status='active',
)

# Type-safe event tracking
event: Event = api.events.track(
    user_id='user_123',
    partner_id=partner.id,
    type='click',
)
```

## Async Support

The SDK supports async/await for better performance:

```python
from attribution_api import AsyncAttributionAPI
import asyncio

async def main():
    api = AsyncAttributionAPI('your_api_key')
    
    # Track event asynchronously
    event = await api.events.track(
        user_id='user_123',
        partner_id='partner_abc',
        type='click',
    )
    
    # Concurrent requests
    partners, events = await asyncio.gather(
        api.partners.list(),
        api.events.list(user_id='user_123'),
    )
    
    await api.close()  # Clean up session

asyncio.run(main())
```

## Webhooks

### Verify Webhook Signature

```python
from attribution_api import verify_webhook_signature
from flask import Flask, request

app = Flask(__name__)

@app.route('/webhooks/attribution', methods=['POST'])
def handle_webhook():
    signature = request.headers.get('X-Attribution-Signature')
    payload = request.get_data(as_text=True)
    secret = os.environ['WEBHOOK_SECRET']
    
    if not verify_webhook_signature(payload, signature, secret):
        return 'Invalid signature', 401
    
    event = request.json
    
    # Process webhook
    if event['type'] == 'deal.attributed':
        handle_deal_attributed(event['data'])
    
    return 'OK', 200

def handle_deal_attributed(data):
    print(f'Deal {data["dealId"]} attributed')
    for attr in data['attribution']:
        print(f'  {attr["partnerName"]}: ${attr["credit"]}')
```

## Django Integration

```python
# settings.py
ATTRIBUTION_API_KEY = env('ATTRIBUTION_API_KEY')

# services.py
from attribution_api import AttributionAPI
from django.conf import settings

api = AttributionAPI(settings.ATTRIBUTION_API_KEY)

def track_partner_event(user_id, partner_id, event_type):
    """Track a partner attribution event"""
    return api.events.track(
        user_id=user_id,
        partner_id=partner_id,
        type=event_type,
    )

def record_sale(user_id, amount):
    """Record a sale and calculate attribution"""
    # Get user journey
    journey = api.events.journey(user_id)
    
    # Create deal
    deal = api.deals.create(
        amount=amount,
        closed_at=datetime.now().isoformat(),
        touch_points=[
            {
                'partner_id': event.partner_id,
                'type': event.type,
                'timestamp': event.timestamp,
            }
            for event in journey.events
        ],
    )
    
    # Calculate attribution
    attribution = api.attribution.calculate(
        deal_id=deal.id,
        model='position-based',
    )
    
    return deal, attribution

# views.py
from django.http import JsonResponse
from .services import track_partner_event, record_sale

def partner_click(request, partner_id):
    """Track partner click"""
    event = track_partner_event(
        user_id=request.user.id,
        partner_id=partner_id,
        event_type='click',
    )
    return JsonResponse({'tracked': True, 'event_id': event.id})

def purchase(request):
    """Handle purchase and attribution"""
    deal, attribution = record_sale(
        user_id=request.user.id,
        amount=request.POST['amount'],
    )
    
    return JsonResponse({
        'deal_id': deal.id,
        'attribution': [
            {
                'partner': a.partner_name,
                'credit': a.credit,
            }
            for a in attribution
        ],
    })
```

## Flask Integration

```python
from flask import Flask, request, jsonify
from attribution_api import AttributionAPI
import os

app = Flask(__name__)
api = AttributionAPI(os.environ['ATTRIBUTION_API_KEY'])

@app.route('/track/<partner_id>')
def track_click(partner_id):
    """Track partner click"""
    user_id = request.args.get('user_id')
    
    event = api.events.track(
        user_id=user_id,
        partner_id=partner_id,
        type='click',
        metadata={
            'ip': request.remote_addr,
            'user_agent': request.user_agent.string,
        },
    )
    
    return jsonify({'tracked': True, 'event_id': event.id})

@app.route('/purchase', methods=['POST'])
def purchase():
    """Handle purchase"""
    data = request.json
    user_id = data['user_id']
    amount = data['amount']
    
    # Get user journey
    journey = api.events.journey(user_id)
    
    # Create deal
    deal = api.deals.create(
        amount=amount,
        closed_at=datetime.now().isoformat(),
        touch_points=[
            {
                'partner_id': e.partner_id,
                'type': e.type,
                'timestamp': e.timestamp,
            }
            for e in journey.events
        ],
    )
    
    # Calculate attribution
    attribution = api.attribution.calculate(
        deal_id=deal.id,
        model='linear',
    )
    
    return jsonify({
        'deal_id': deal.id,
        'attribution': [
            {
                'partner': a.partner_name,
                'credit': float(a.credit),
                'percentage': float(a.percentage),
            }
            for a in attribution
        ],
    })
```

## Advanced Usage

### Custom HTTP Session

```python
import requests
from attribution_api import AttributionAPI

# Use custom requests session
session = requests.Session()
session.proxies = {'https': 'http://proxy.example.com:8080'}

api = AttributionAPI('your_api_key', session=session)
```

### Logging

```python
import logging
from attribution_api import AttributionAPI

# Enable debug logging
logging.basicConfig(level=logging.DEBUG)

api = AttributionAPI('your_api_key')
# All API calls will now be logged
```

### Connection Pooling

```python
from attribution_api import AttributionAPI
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

api = AttributionAPI('your_api_key')

# Configure connection pooling
adapter = HTTPAdapter(
    pool_connections=10,
    pool_maxsize=20,
    max_retries=Retry(
        total=5,
        backoff_factor=0.1,
        status_forcelist=[500, 502, 503, 504],
    ),
)

api.session.mount('https://', adapter)
```

## Examples

### Full Integration Example

```python
from attribution_api import AttributionAPI
from datetime import datetime
import os

class PartnerAttribution:
    def __init__(self):
        self.api = AttributionAPI(os.environ['ATTRIBUTION_API_KEY'])
    
    def track_partner_click(self, user_id, partner_id, metadata=None):
        """Track when user clicks partner link"""
        return self.api.events.track(
            user_id=user_id,
            partner_id=partner_id,
            type='click',
            metadata=metadata or {},
        )
    
    def record_deal(self, user_id, amount):
        """Record deal and calculate attribution"""
        # Get user's full journey
        journey = self.api.events.journey(user_id)
        
        # Create deal with all touchpoints
        deal = self.api.deals.create(
            amount=amount,
            closed_at=datetime.now().isoformat(),
            touch_points=[
                {
                    'partner_id': event.partner_id,
                    'type': event.type,
                    'timestamp': event.timestamp,
                }
                for event in journey.events
            ],
        )
        
        # Calculate attribution using position-based model
        attribution = self.api.attribution.calculate(
            deal_id=deal.id,
            model='position-based',
        )
        
        # Process commissions
        self.process_commissions(attribution)
        
        return deal, attribution
    
    def process_commissions(self, attribution):
        """Process partner commissions"""
        for result in attribution:
            print(f'Pay {result.partner_name}: ${result.credit}')
            # Integrate with payment system...
    
    def get_partner_performance(self, partner_id, days=30):
        """Get partner performance metrics"""
        from datetime import timedelta
        
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        stats = self.api.partners.stats(
            partner_id,
            start_date=start_date.isoformat(),
            end_date=end_date.isoformat(),
        )
        
        return {
            'events': stats.events,
            'deals': stats.deals,
            'revenue': stats.revenue,
            'attributed_revenue': stats.attributed_revenue,
            'conversion_rate': stats.conversion_rate,
        }

# Usage
tracking = PartnerAttribution()

# Track click
tracking.track_partner_click(
    user_id='user_123',
    partner_id='partner_abc',
    metadata={'campaign': 'summer-2024'},
)

# Record deal
deal, attribution = tracking.record_deal('user_123', 10000)
print(f'Deal {deal.id} created')
for a in attribution:
    print(f'  {a.partner_name}: ${a.credit}')

# Get performance
perf = tracking.get_partner_performance('partner_abc')
print(f'Performance: {perf}')
```

## Support

- 📦 [PyPI Package](https://pypi.org/project/attribution-api/)
- 📄 [GitHub Repository](https://github.com/attribution-api/python-sdk)
- 🐛 [Report Issues](https://github.com/attribution-api/python-sdk/issues)
