'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Save, Building, Crown, Users, Trash2, Moon, Sun, Monitor } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';

export default function WorkspaceSettings() {
  const { tenant } = useAuthStore();
  const { theme, setTheme } = useUIStore();
  const [workspaceName, setWorkspaceName] = useState(tenant?.name || '');
  const [workspaceUrl, setWorkspaceUrl] = useState('');

  return (
    <div className="space-y-6">
      {/* Workspace Details */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Workspace Details</CardTitle>
          <CardDescription className="text-gray-400">
            Manage your workspace information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Input
            label="Workspace Name"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            placeholder="Enter workspace name"
          />
          
          <div>
            <Input
              label="Workspace URL"
              value={workspaceUrl}
              onChange={(e) => setWorkspaceUrl(e.target.value)}
              placeholder="your-workspace"
            />
            <p className="text-xs text-gray-500 mt-2">https://app.socialmedia.com/your-workspace</p>
          </div>

          <div className="flex justify-end">
            <Button className="gradient-primary">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Plan */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Current Plan</CardTitle>
          <CardDescription className="text-gray-400">
            Manage your subscription and billing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg glass border border-white/10">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-medium capitalize">{tenant?.planTier} Plan</p>
                <p className="text-gray-400 text-sm">Full access to all features</p>
              </div>
            </div>
            <Button variant="secondary">Upgrade Plan</Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg glass border border-white/10">
              <p className="text-gray-400 text-sm">Team Members</p>
              <p className="text-2xl font-bold text-white mt-1">5 / 10</p>
            </div>
            <div className="p-4 rounded-lg glass border border-white/10">
              <p className="text-gray-400 text-sm">Social Accounts</p>
              <p className="text-2xl font-bold text-white mt-1">8 / 20</p>
            </div>
            <div className="p-4 rounded-lg glass border border-white/10">
              <p className="text-gray-400 text-sm">Posts/Month</p>
              <p className="text-2xl font-bold text-white mt-1">247 / 500</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Appearance</CardTitle>
          <CardDescription className="text-gray-400">
            Customize how the app looks for you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <label className="text-sm font-medium text-white mb-3 block">Theme</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'light', label: 'Light', icon: Sun },
              { id: 'dark', label: 'Dark', icon: Moon },
              { id: 'auto', label: 'Auto', icon: Monitor },
            ].map((themeOption) => (
              <button
                key={themeOption.id}
                onClick={() => setTheme({ mode: themeOption.id as any })}
                className={`flex flex-col items-center space-y-2 p-4 rounded-lg border transition-all ${
                  theme.mode === themeOption.id
                    ? 'border-primary bg-primary/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <themeOption.icon className="w-6 h-6 text-white" />
                <span className="text-sm text-white">{themeOption.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="glass-card border-red-500/20">
        <CardHeader>
          <CardTitle className="text-red-400">Danger Zone</CardTitle>
          <CardDescription className="text-gray-400">
            Irreversible actions for your workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg glass border border-red-500/20">
            <div>
              <p className="text-white font-medium">Delete Workspace</p>
              <p className="text-gray-400 text-sm">Permanently delete this workspace and all data</p>
            </div>
            <Button variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
