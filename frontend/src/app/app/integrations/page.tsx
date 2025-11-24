'use client';

import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';

interface Integration {
  id: string;
  name: string;
  type: string;
  provider: string;
  description?: string;
  logoUrl?: string;
  status: string;
  createdAt: string;
}

interface MarketplaceIntegration {
  id: string;
  name: string;
  type: string;
  provider: string;
  description?: string;
  logoUrl?: string;
  scopes: string[];
}

export default function IntegrationsPage() {
  const { get, post, del } = useApi();
  const [activeTab, setActiveTab] = useState<'installed' | 'marketplace'>('installed');
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [marketplace, setMarketplace] = useState<MarketplaceIntegration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIntegrations();
    loadMarketplace();
  }, []);

  const loadIntegrations = async () => {
    try {
      const data = await get('/api/integrations');
      setIntegrations(data);
    } catch (error) {
      console.error('Failed to load integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMarketplace = async () => {
    try {
      const data = await get('/api/integrations/marketplace');
      setMarketplace(data);
    } catch (error) {
      console.error('Failed to load marketplace:', error);
    }
  };

  const handleInstall = async (integration: MarketplaceIntegration) => {
    try {
      await post('/api/integrations', {
        name: integration.name,
        type: integration.type,
        provider: integration.provider,
        description: integration.description,
        scopes: integration.scopes,
      });
      loadIntegrations();
      setActiveTab('installed');
    } catch (error) {
      console.error('Failed to install integration:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this integration?')) return;
    
    try {
      await del(`/api/integrations/${id}`);
      loadIntegrations();
    } catch (error) {
      console.error('Failed to delete integration:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'ERROR':
        return 'bg-red-100 text-red-800';
      case 'PENDING_SETUP':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Integrations</h1>
        <p className="text-gray-600">
          Connect your favorite tools and automate your workflows
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('installed')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'installed'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Installed ({integrations.length})
          </button>
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'marketplace'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Marketplace ({marketplace.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading integrations...</p>
        </div>
      ) : (
        <>
          {activeTab === 'installed' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integrations.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 mb-4">No integrations installed yet</p>
                  <button
                    onClick={() => setActiveTab('marketplace')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Browse Marketplace
                  </button>
                </div>
              ) : (
                integrations.map((integration) => (
                  <div
                    key={integration.id}
                    className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        {integration.logoUrl ? (
                          <img
                            src={integration.logoUrl}
                            alt={integration.name}
                            className="w-12 h-12 rounded-lg mr-3"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg mr-3 flex items-center justify-center">
                            <span className="text-xl font-bold text-gray-500">
                              {integration.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold">{integration.name}</h3>
                          <p className="text-sm text-gray-500">{integration.provider}</p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          integration.status
                        )}`}
                      >
                        {integration.status}
                      </span>
                    </div>
                    {integration.description && (
                      <p className="text-sm text-gray-600 mb-4">{integration.description}</p>
                    )}
                    <div className="flex space-x-2">
                      <button className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                        Configure
                      </button>
                      <button
                        onClick={() => handleDelete(integration.id)}
                        className="px-3 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'marketplace' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketplace.map((integration) => (
                <div
                  key={integration.id}
                  className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start mb-4">
                    {integration.logoUrl ? (
                      <img
                        src={integration.logoUrl}
                        alt={integration.name}
                        className="w-12 h-12 rounded-lg mr-3"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-lg mr-3 flex items-center justify-center">
                        <span className="text-xl font-bold text-gray-500">
                          {integration.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{integration.name}</h3>
                      <p className="text-sm text-gray-500">{integration.provider}</p>
                      <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {integration.type}
                      </span>
                    </div>
                  </div>
                  {integration.description && (
                    <p className="text-sm text-gray-600 mb-4">{integration.description}</p>
                  )}
                  <button
                    onClick={() => handleInstall(integration)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Install
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
