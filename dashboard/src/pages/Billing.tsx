import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Check, CreditCard, Download } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';

const PLANS = [
  {
    name: 'Starter',
    price: 49,
    description: 'Perfect for small businesses',
    features: [
      'Up to 10,000 events/month',
      '5 partners',
      'Basic attribution models',
      'Email support',
      '30-day data retention',
    ],
  },
  {
    name: 'Professional',
    price: 199,
    description: 'For growing companies',
    features: [
      'Up to 100,000 events/month',
      'Unlimited partners',
      'All attribution models',
      'Priority support',
      '1-year data retention',
      'Custom webhooks',
      'API rate limit: 1000/min',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 999,
    description: 'For large organizations',
    features: [
      'Unlimited events',
      'Unlimited partners',
      'All attribution models',
      'Dedicated support',
      'Unlimited data retention',
      'Custom integrations',
      'API rate limit: 10000/min',
      'SLA guarantee',
      'Custom contract',
    ],
  },
];

const INVOICES = [
  {
    id: 'INV-2024-001',
    date: '2024-01-01',
    amount: 199,
    status: 'paid',
  },
  {
    id: 'INV-2023-012',
    date: '2023-12-01',
    amount: 199,
    status: 'paid',
  },
  {
    id: 'INV-2023-011',
    date: '2023-11-01',
    amount: 199,
    status: 'paid',
  },
];

export function Billing() {
  const currentPlan = PLANS[1]; // Professional plan

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>You are currently on the {currentPlan.name} plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">{formatCurrency(currentPlan.price)}</p>
              <p className="text-muted-foreground">per month</p>
            </div>
            <Button variant="outline">Change Plan</Button>
          </div>

          <div className="mt-6 space-y-2">
            <h4 className="font-semibold">Plan Features</h4>
            <ul className="space-y-2">
              {currentPlan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Available Plans</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={plan.popular ? 'border-2 border-primary shadow-lg' : ''}
            >
              {plan.popular && (
                <div className="bg-primary text-white text-center py-2 text-sm font-semibold rounded-t-lg">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{formatCurrency(plan.price)}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.name === currentPlan.name ? 'secondary' : 'default'}
                  disabled={plan.name === currentPlan.name}
                >
                  {plan.name === currentPlan.name ? 'Current Plan' : 'Upgrade'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Manage your payment information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-3 rounded">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium">Visa ending in 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/2025</p>
              </div>
            </div>
            <Button variant="outline">Update</Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>View and download your invoices</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {INVOICES.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{invoice.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(invoice.date)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(invoice.amount)}</p>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                      {invoice.status}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Usage This Month</CardTitle>
          <CardDescription>Track your current usage against plan limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Events</span>
              <span className="font-medium">45,231 / 100,000</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: '45%' }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>API Calls</span>
              <span className="font-medium">12,456 / 30,000</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: '41%' }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Partners</span>
              <span className="font-medium">8 / Unlimited</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: '10%' }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
