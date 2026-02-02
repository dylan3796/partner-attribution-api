import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { api } from '../lib/api';
import { Key, Copy, Plus, Trash2, Eye, EyeOff } from 'lucide-react';

interface ApiKey {
  id: string;
  key: string;
  name: string;
  createdAt: string;
  lastUsed?: string;
}

export function ApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([
    {
      id: '1',
      key: api.getApiKey() || 'sk_live_xxxxxxxxxxxxxxxx',
      name: 'Production Key',
      createdAt: new Date().toISOString(),
    },
  ]);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleGenerateKey = async () => {
    try {
      const { apiKey } = await api.generateApiKey();
      const newKey: ApiKey = {
        id: Date.now().toString(),
        key: apiKey,
        name: `API Key ${keys.length + 1}`,
        createdAt: new Date().toISOString(),
      };
      setKeys([...keys, newKey]);
      alert('New API key generated successfully!');
    } catch (error) {
      console.error('Failed to generate key:', error);
      alert('Failed to generate API key');
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      await api.revokeApiKey(id);
      setKeys(keys.filter((k) => k.id !== id));
    } catch (error) {
      console.error('Failed to revoke key:', error);
      alert('Failed to revoke API key');
    }
  };

  const toggleShowKey = (id: string) => {
    setShowKey({ ...showKey, [id]: !showKey[id] });
  };

  const maskKey = (key: string) => {
    return key.slice(0, 12) + '••••••••••••••••' + key.slice(-4);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Keys</h1>
          <p className="text-muted-foreground mt-1">
            Manage your API keys for authentication
          </p>
        </div>
        <Button onClick={handleGenerateKey}>
          <Plus className="h-4 w-4 mr-2" />
          Generate New Key
        </Button>
      </div>

      {/* Getting Started Guide */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-blue-900">Quick Start</CardTitle>
          <CardDescription className="text-blue-700">
            Get started with your API key in minutes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-semibold text-blue-900 mb-2">1. Copy your API key</p>
            <p className="text-blue-700">
              Click the copy icon next to your API key below to copy it to your clipboard.
            </p>
          </div>
          <div>
            <p className="font-semibold text-blue-900 mb-2">
              2. Make your first API call
            </p>
            <div className="bg-gray-900 text-gray-100 p-3 rounded-md font-mono text-xs overflow-x-auto">
              curl -X POST https://api.attribution.example/events \<br />
              &nbsp;&nbsp;-H "X-API-Key: YOUR_API_KEY" \<br />
              &nbsp;&nbsp;-H "Content-Type: application/json" \<br />
              &nbsp;&nbsp;-d '&#123;"userId": "user123", "type": "click", "partnerId": "partner1"&#125;'
            </div>
          </div>
          <div>
            <p className="font-semibold text-blue-900 mb-2">3. Check out the docs</p>
            <p className="text-blue-700">
              Visit our{' '}
              <a href="/docs" className="underline font-medium">
                documentation
              </a>{' '}
              for detailed guides and examples.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* API Keys List */}
      <div className="space-y-4">
        {keys.map((keyItem) => (
          <Card key={keyItem.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Key className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{keyItem.name}</h3>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-md font-mono text-sm flex items-center justify-between gap-2 mt-2">
                    <code className="flex-1">
                      {showKey[keyItem.id] ? keyItem.key : maskKey(keyItem.key)}
                    </code>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleShowKey(keyItem.id)}
                        title={showKey[keyItem.id] ? 'Hide key' : 'Show key'}
                      >
                        {showKey[keyItem.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyKey(keyItem.key)}
                        title="Copy to clipboard"
                      >
                        <Copy
                          className={`h-4 w-4 ${
                            copiedKey === keyItem.key ? 'text-green-600' : ''
                          }`}
                        />
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                    <span>Created: {new Date(keyItem.createdAt).toLocaleDateString()}</span>
                    {keyItem.lastUsed && (
                      <span>
                        Last used: {new Date(keyItem.lastUsed).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteKey(keyItem.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Security Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Security Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
              1
            </div>
            <div>
              <p className="font-medium">Keep your keys secure</p>
              <p className="text-muted-foreground">
                Never share your API keys or commit them to version control.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
              2
            </div>
            <div>
              <p className="font-medium">Use environment variables</p>
              <p className="text-muted-foreground">
                Store API keys in environment variables, not in your code.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
              3
            </div>
            <div>
              <p className="font-medium">Rotate keys regularly</p>
              <p className="text-muted-foreground">
                Generate new keys periodically and revoke old ones.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
              4
            </div>
            <div>
              <p className="font-medium">Revoke compromised keys immediately</p>
              <p className="text-muted-foreground">
                If you suspect a key has been exposed, revoke it and generate a new one.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
