'use client';

import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';

interface ApiKey {
  id: string;
  name: string;
  key: string; // Masked key
  status: string;
  scopes: string[];
  rateLimitPerHour: number;
  rateLimitPerDay: number;
  expiresAt?: string;
  lastUsedAt?: string;
  usageCount: number;
  createdAt: string;
}

export default function ApiKeysPage() {
  const { get, post, del } = useApi();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newApiKey, setNewApiKey] = useState({
    name: '',
    scopes: [] as string[],
    rateLimitPerHour: 1000,
    rateLimitPerDay: 10000,
    expiresAt: '',
  });
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const availableScopes = [
    'posts:read',
    'posts:write',
    'posts:delete',
    'analytics:read',
    'media:read',
    'media:write',
    'conversations:read',
    'conversations:write',
    'campaigns:read',
    'campaigns:write',
  ];

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const data = await get('/api/integrations/api-keys');
      setApiKeys(data);
    } catch (error) {
      console.error('Failed to load API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await post('/api/integrations/api-keys', {
        ...newApiKey,
        expiresAt: newApiKey.expiresAt || undefined,
      });
      setCreatedKey(response.key);
      setNewApiKey({
        name: '',
        scopes: [],
        rateLimitPerHour: 1000,
        rateLimitPerDay: 10000,
        expiresAt: '',
      });
      loadApiKeys();
    } catch (error) {
      console.error('Failed to create API key:', error);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) return;
    
    try {
      await del(`/api/integrations/api-keys/${id}`);
      loadApiKeys();
    } catch (error) {
      console.error('Failed to revoke API key:', error);
    }
  };

  const toggleScope = (scope: string) => {
    setNewApiKey((prev) => ({
      ...prev,
      scopes: prev.scopes.includes(scope)
        ? prev.scopes.filter((s) => s !== scope)
        : [...prev.scopes, scope],
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'REVOKED':
        return 'bg-red-100 text-red-800';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">API Keys</h1>
          <p className="text-gray-600">
            Manage API keys for programmatic access to your workspace
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create API Key
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading API keys...</p>
        </div>
      ) : apiKeys.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-4">No API keys created yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Your First API Key
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {apiKeys.map((apiKey) => (
            <div key={apiKey.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold mr-3">{apiKey.name}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        apiKey.status
                      )}`}
                    >
                      {apiKey.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                      {apiKey.key}
                    </code>
                    <button
                      onClick={() => copyToClipboard(apiKey.key)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {apiKey.scopes.map((scope) => (
                      <span
                        key={scope}
                        className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs"
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleRevoke(apiKey.id)}
                  disabled={apiKey.status !== 'ACTIVE'}
                  className="px-3 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Revoke
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Usage:</span> {apiKey.usageCount} requests
                </div>
                <div>
                  <span className="font-medium">Hourly limit:</span> {apiKey.rateLimitPerHour}
                </div>
                <div>
                  <span className="font-medium">Daily limit:</span> {apiKey.rateLimitPerDay}
                </div>
                {apiKey.lastUsedAt && (
                  <div>
                    <span className="font-medium">Last used:</span>{' '}
                    {new Date(apiKey.lastUsedAt).toLocaleString()}
                  </div>
                )}
              </div>
              {apiKey.expiresAt && (
                <div className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">Expires:</span>{' '}
                  {new Date(apiKey.expiresAt).toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && !createdKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Create API Key</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={newApiKey.name}
                  onChange={(e) => setNewApiKey({ ...newApiKey, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Production API Key"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Scopes</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableScopes.map((scope) => (
                    <label key={scope} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newApiKey.scopes.includes(scope)}
                        onChange={() => toggleScope(scope)}
                        className="rounded"
                      />
                      <span className="text-sm">{scope}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Hourly Rate Limit</label>
                  <input
                    type="number"
                    value={newApiKey.rateLimitPerHour}
                    onChange={(e) =>
                      setNewApiKey({ ...newApiKey, rateLimitPerHour: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Daily Rate Limit</label>
                  <input
                    type="number"
                    value={newApiKey.rateLimitPerDay}
                    onChange={(e) =>
                      setNewApiKey({ ...newApiKey, rateLimitPerDay: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Expiration Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={newApiKey.expiresAt}
                  onChange={(e) => setNewApiKey({ ...newApiKey, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newApiKey.name || newApiKey.scopes.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Created Key Modal */}
      {createdKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-4">API Key Created</h2>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800 mb-2">
                <strong>Important:</strong> This is the only time you'll see this key. Please copy it now and store it securely.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Your API Key</label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 px-3 py-2 bg-gray-100 rounded font-mono text-sm break-all">
                  {createdKey}
                </code>
                <button
                  onClick={() => copyToClipboard(createdKey)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setCreatedKey(null);
                  setShowCreateModal(false);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
