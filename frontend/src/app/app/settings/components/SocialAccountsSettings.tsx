'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, Plus, RefreshCw, Trash2, CheckCircle, XCircle, AlertCircle,
  Instagram, Twitter, Linkedin, Facebook
} from 'lucide-react';

const connectedPlatforms = [
  { 
    id: '1',
    name: 'Instagram', 
    icon: Instagram,
    connected: true, 
    accounts: [
      { id: 'ig1', username: '@mybrand', status: 'active', followers: '12.5K' },
      { id: 'ig2', username: '@mybrand_shop', status: 'active', followers: '8.2K' }
    ]
  },
  { 
    id: '2',
    name: 'Twitter', 
    icon: Twitter,
    connected: true, 
    accounts: [
      { id: 'tw1', username: '@mybrand', status: 'warning', followers: '25.3K' }
    ]
  },
  { 
    id: '3',
    name: 'LinkedIn', 
    icon: Linkedin,
    connected: true, 
    accounts: [
      { id: 'li1', username: 'My Brand Inc.', status: 'active', followers: '5.8K' }
    ]
  },
  { 
    id: '4',
    name: 'Facebook', 
    icon: Facebook,
    connected: false, 
    accounts: []
  },
  { 
    id: '5',
    name: 'TikTok', 
    icon: Globe,
    connected: false, 
    accounts: []
  },
  { 
    id: '6',
    name: 'YouTube', 
    icon: Globe,
    connected: true, 
    accounts: [
      { id: 'yt1', username: 'My Brand Channel', status: 'warning', followers: '15.2K' }
    ]
  },
];

export default function SocialAccountsSettings() {
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const handleConnect = (platformId: string) => {
    console.log('Connecting platform:', platformId);
  };

  const handleDisconnect = (accountId: string) => {
    console.log('Disconnecting account:', accountId);
  };

  const handleRefresh = (accountId: string) => {
    console.log('Refreshing account:', accountId);
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Connected Social Accounts</CardTitle>
          <CardDescription className="text-gray-400">
            Manage your social media platform connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {connectedPlatforms.map((platform) => (
              <div key={platform.id} className="rounded-lg glass border border-white/10 overflow-hidden">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <platform.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{platform.name}</p>
                      <p className="text-gray-400 text-sm">
                        {platform.connected 
                          ? `${platform.accounts.length} account${platform.accounts.length > 1 ? 's' : ''} connected`
                          : 'Not connected'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {platform.connected ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedPlatform(
                            expandedPlatform === platform.id ? null : platform.id
                          )}
                        >
                          {expandedPlatform === platform.id ? 'Hide' : 'Manage'}
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => handleConnect(platform.id)}>
                          <Plus className="w-4 h-4 mr-1" />
                          Add Account
                        </Button>
                      </>
                    ) : (
                      <Button variant="default" size="sm" onClick={() => handleConnect(platform.id)}>
                        Connect
                      </Button>
                    )}
                  </div>
                </div>

                {/* Expanded Account List */}
                {expandedPlatform === platform.id && platform.accounts.length > 0 && (
                  <div className="border-t border-white/10 bg-white/5 p-4 space-y-3">
                    {platform.accounts.map((account) => (
                      <div key={account.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(account.status)}
                          <div>
                            <p className="text-white font-medium text-sm">{account.username}</p>
                            <p className="text-gray-400 text-xs">{account.followers} followers</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              account.status === 'active' ? 'success' :
                              account.status === 'warning' ? 'warning' :
                              'secondary'
                            }
                            className="text-xs"
                          >
                            {account.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRefresh(account.id)}
                          >
                            <RefreshCw className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDisconnect(account.id)}
                          >
                            <Trash2 className="w-3 h-3 text-red-400" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Connection Help */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-sm mb-4">
            Having trouble connecting your social accounts? Check our documentation or contact support.
          </p>
          <div className="flex space-x-3">
            <Button variant="secondary" size="sm">View Documentation</Button>
            <Button variant="secondary" size="sm">Contact Support</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
