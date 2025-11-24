'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, Smartphone, Key, Lock, AlertCircle, CheckCircle, 
  Globe, Clock, LogOut, Eye
} from 'lucide-react';

const activeSessions = [
  {
    id: '1',
    device: 'Chrome on MacOS',
    location: 'New York, US',
    ip: '192.168.1.1',
    lastActive: '2 minutes ago',
    current: true
  },
  {
    id: '2',
    device: 'Safari on iPhone',
    location: 'New York, US',
    ip: '192.168.1.2',
    lastActive: '1 hour ago',
    current: false
  },
  {
    id: '3',
    device: 'Chrome on Windows',
    location: 'Los Angeles, US',
    ip: '192.168.1.3',
    lastActive: '2 days ago',
    current: false
  },
];

export default function SecuritySettings() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [ssoEnabled, setSsoEnabled] = useState(false);

  return (
    <div className="space-y-6">
      {/* Two-Factor Authentication */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Two-Factor Authentication</CardTitle>
          <CardDescription className="text-gray-400">
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg glass border border-white/10">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                twoFactorEnabled ? 'bg-green-500/20' : 'bg-gray-500/20'
              }`}>
                <Smartphone className={`w-6 h-6 ${
                  twoFactorEnabled ? 'text-green-400' : 'text-gray-400'
                }`} />
              </div>
              <div>
                <p className="text-white font-medium">Authenticator App</p>
                <p className="text-gray-400 text-sm">
                  {twoFactorEnabled ? 'Enabled' : 'Use an app to generate verification codes'}
                </p>
              </div>
            </div>
            <Button
              variant={twoFactorEnabled ? 'secondary' : 'default'}
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
            >
              {twoFactorEnabled ? 'Disable' : 'Enable'}
            </Button>
          </div>

          {twoFactorEnabled && (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <p className="text-white font-medium">2FA is enabled</p>
                  <p className="text-gray-400 text-sm">Your account is protected with two-factor authentication</p>
                  <Button variant="ghost" size="sm" className="mt-2 text-green-400">
                    View Recovery Codes
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SSO Configuration */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Single Sign-On (SSO)</CardTitle>
          <CardDescription className="text-gray-400">
            Configure SSO for your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg glass border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Key className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-white font-medium">SAML 2.0</p>
                  <p className="text-gray-400 text-sm">Enterprise SSO integration</p>
                </div>
              </div>
              <Badge variant="secondary">Enterprise</Badge>
            </div>
            <Button variant="secondary" disabled>Configure SSO</Button>
          </div>

          <div className="p-4 rounded-lg glass border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-white font-medium">OAuth 2.0</p>
                  <p className="text-gray-400 text-sm">Google Workspace, Azure AD</p>
                </div>
              </div>
              <Badge variant="secondary">Enterprise</Badge>
            </div>
            <Button variant="secondary" disabled>Configure OAuth</Button>
          </div>
        </CardContent>
      </Card>

      {/* IP Whitelisting */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">IP Whitelisting</CardTitle>
          <CardDescription className="text-gray-400">
            Restrict access to specific IP addresses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg glass border border-white/10">
            <div>
              <p className="text-white font-medium">IP Restrictions</p>
              <p className="text-gray-400 text-sm">Only allow access from whitelisted IPs</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="space-y-2">
            <div>
              <Input
                label="Add IP Address"
                placeholder="192.168.1.1"
              />
              <p className="text-xs text-gray-500 mt-2">Enter IP address or CIDR range</p>
            </div>
            <Button variant="secondary" size="sm">Add IP</Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Active Sessions</CardTitle>
          <CardDescription className="text-gray-400">
            Manage your active login sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 rounded-lg glass border border-white/10">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-white font-medium">{session.device}</p>
                      {session.current && (
                        <Badge variant="success" className="text-xs">Current</Badge>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">{session.location} • {session.ip}</p>
                    <p className="text-gray-500 text-xs">Last active: {session.lastActive}</p>
                  </div>
                </div>
                {!session.current && (
                  <Button variant="ghost" size="sm">
                    <LogOut className="w-4 h-4 text-red-400" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button variant="destructive" className="w-full mt-4">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out All Other Sessions
          </Button>
        </CardContent>
      </Card>

      {/* Security Audit Log */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Security Audit Log</CardTitle>
          <CardDescription className="text-gray-400">
            Recent security-related activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { action: 'Password changed', time: '2 hours ago', status: 'success' },
              { action: 'Login from new device', time: '1 day ago', status: 'warning' },
              { action: 'API key generated', time: '3 days ago', status: 'success' },
            ].map((log, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg glass border border-white/10">
                <div className="flex items-center space-x-3">
                  {log.status === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                  )}
                  <div>
                    <p className="text-white text-sm">{log.action}</p>
                    <p className="text-gray-400 text-xs">{log.time}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
