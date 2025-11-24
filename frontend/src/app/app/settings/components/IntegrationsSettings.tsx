'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, Settings, ExternalLink, Zap, Database, Code, Webhook, 
  CheckCircle, XCircle, Search, Trash2
} from 'lucide-react';

const integrations = [
  {
    id: '1',
    name: 'Zapier',
    description: 'Connect with 5000+ apps',
    category: 'Automation',
    icon: Zap,
    connected: true,
    status: 'active'
  },
  {
    id: '2',
    name: 'Salesforce',
    description: 'CRM integration',
    category: 'CRM',
    icon: Database,
    connected: true,
    status: 'active'
  },
  {
    id: '3',
    name: 'HubSpot',
    description: 'Marketing automation',
    category: 'CRM',
    icon: Database,
    connected: false,
    status: 'disconnected'
  },
  {
    id: '4',
    name: 'Canva',
    description: 'Design tool integration',
    category: 'Design',
    icon: Code,
    connected: true,
    status: 'active'
  },
  {
    id: '5',
    name: 'Shopify',
    description: 'E-commerce platform',
    category: 'Commerce',
    icon: Database,
    connected: false,
    status: 'disconnected'
  },
  {
    id: '6',
    name: 'Slack',
    description: 'Team communication',
    category: 'Communication',
    icon: Code,
    connected: true,
    status: 'active'
  },
];

const webhooks = [
  {
    id: '1',
    name: 'Post Published',
    url: 'https://api.example.com/webhooks/post-published',
    events: ['post.published', 'post.failed'],
    active: true
  },
  {
    id: '2',
    name: 'Analytics Update',
    url: 'https://api.example.com/webhooks/analytics',
    events: ['analytics.updated'],
    active: true
  },
];

export default function IntegrationsSettings() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'Automation', 'CRM', 'Design', 'Commerce', 'Communication'];

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Integrations Marketplace */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Integrations Marketplace</CardTitle>
          <CardDescription className="text-gray-400">
            Connect your favorite tools and services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search integrations..."
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-gray-900 capitalize">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredIntegrations.map((integration) => (
              <div key={integration.id} className="p-4 rounded-lg glass border border-white/10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <integration.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{integration.name}</h3>
                      <p className="text-gray-400 text-xs">{integration.description}</p>
                    </div>
                  </div>
                  {integration.connected ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {integration.category}
                  </Badge>
                  <Button
                    variant={integration.connected ? 'secondary' : 'default'}
                    size="sm"
                  >
                    {integration.connected ? (
                      <>
                        <Settings className="w-3 h-3 mr-1" />
                        Configure
                      </>
                    ) : (
                      'Connect'
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Webhooks</CardTitle>
              <CardDescription className="text-gray-400">
                Configure webhook endpoints for real-time events
              </CardDescription>
            </div>
            <Button variant="secondary">
              <Plus className="w-4 h-4 mr-2" />
              Add Webhook
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="p-4 rounded-lg glass border border-white/10">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Webhook className="w-4 h-4 text-gray-400" />
                      <h3 className="text-white font-medium">{webhook.name}</h3>
                      <Badge variant={webhook.active ? 'success' : 'secondary'} className="text-xs">
                        {webhook.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-sm font-mono">{webhook.url}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      {webhook.events.map((event, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">API Keys</CardTitle>
              <CardDescription className="text-gray-400">
                Manage API keys for custom integrations
              </CardDescription>
            </div>
            <Button variant="secondary">
              <Plus className="w-4 h-4 mr-2" />
              Generate Key
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg glass border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Production API Key</p>
                <p className="text-gray-400 text-sm font-mono">sk_live_••••••••••••••••</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
