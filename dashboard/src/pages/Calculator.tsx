import { useState, useEffect } from 'react';
import { api, Deal, Partner, AttributionResult } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Label } from '../components/ui/Label';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Calculator as CalcIcon } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

const ATTRIBUTION_MODELS = [
  { value: 'first-touch', label: 'First Touch', description: '100% credit to first partner' },
  { value: 'last-touch', label: 'Last Touch', description: '100% credit to last partner' },
  { value: 'linear', label: 'Linear', description: 'Equal credit across all partners' },
  { value: 'time-decay', label: 'Time Decay', description: 'More credit to recent partners' },
  { value: 'position-based', label: 'Position Based', description: '40% first, 40% last, 20% middle' },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function Calculator() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('linear');
  const [results, setResults] = useState<AttributionResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dealsData, partnersData] = await Promise.all([
        api.getDeals(),
        api.getPartners(),
      ]);
      setDeals(dealsData);
      setPartners(partnersData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleCalculate = async () => {
    if (!selectedDeal) {
      alert('Please select a deal');
      return;
    }

    setLoading(true);
    try {
      const attribution = await api.calculateAttribution(
        selectedDeal,
        selectedModel as any
      );
      setResults(attribution);
    } catch (error) {
      console.error('Failed to calculate attribution:', error);
      alert('Failed to calculate attribution');
    } finally {
      setLoading(false);
    }
  };

  const selectedDealData = deals.find((d) => d.id === selectedDeal);
  const modelInfo = ATTRIBUTION_MODELS.find((m) => m.value === selectedModel);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Attribution Calculator</h1>
        <p className="text-muted-foreground mt-1">
          Test different attribution models to see how credit is distributed
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Select a deal and attribution model</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deal">Select Deal</Label>
              <Select
                id="deal"
                value={selectedDeal}
                onChange={(e) => setSelectedDeal(e.target.value)}
              >
                <option value="">Choose a deal...</option>
                {deals.map((deal) => (
                  <option key={deal.id} value={deal.id}>
                    Deal #{deal.id.slice(0, 8)} - {formatCurrency(deal.amount)} -{' '}
                    {new Date(deal.closedAt).toLocaleDateString()}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Attribution Model</Label>
              <Select
                id="model"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                {ATTRIBUTION_MODELS.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </Select>
              {modelInfo && (
                <p className="text-sm text-muted-foreground">{modelInfo.description}</p>
              )}
            </div>

            <Button
              onClick={handleCalculate}
              disabled={!selectedDeal || loading}
              className="w-full"
            >
              <CalcIcon className="h-4 w-4 mr-2" />
              {loading ? 'Calculating...' : 'Calculate Attribution'}
            </Button>
          </CardContent>
        </Card>

        {/* Model Explanation */}
        <Card>
          <CardHeader>
            <CardTitle>Attribution Models</CardTitle>
            <CardDescription>Understanding the different models</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {ATTRIBUTION_MODELS.map((model) => (
              <div
                key={model.value}
                className={`p-3 rounded-lg border ${
                  model.value === selectedModel
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200'
                }`}
              >
                <h4 className="font-semibold text-sm">{model.label}</h4>
                <p className="text-sm text-muted-foreground mt-1">{model.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Selected Deal Info */}
      {selectedDealData && (
        <Card>
          <CardHeader>
            <CardTitle>Deal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Deal Value</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(selectedDealData.amount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Closed Date</p>
                <p className="text-2xl font-bold">
                  {new Date(selectedDealData.closedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Touch Points</p>
                <p className="text-2xl font-bold">{selectedDealData.touchPoints.length}</p>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold mb-3">Customer Journey</h4>
              <div className="space-y-2">
                {selectedDealData.touchPoints.map((touch, idx) => {
                  const partner = partners.find((p) => p.id === touch.partnerId);
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{partner?.name || 'Unknown Partner'}</p>
                        <p className="text-sm text-muted-foreground">
                          {touch.type} •{' '}
                          {new Date(touch.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Attribution Results</CardTitle>
            <CardDescription>
              Credit distribution using {modelInfo?.label} model
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={results}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="partnerName" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [
                    `${formatCurrency(value as number)} (${results.find(
                      (r) => r.credit === value
                    )?.percentage.toFixed(1)}%)`,
                    'Credit',
                  ]}
                />
                <Bar dataKey="credit" fill="#3b82f6">
                  {results.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-6 space-y-3">
              {results.map((result, idx) => (
                <div
                  key={result.partnerId}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="font-medium">{result.partnerName}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(result.credit)}</p>
                    <p className="text-sm text-muted-foreground">
                      {result.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
