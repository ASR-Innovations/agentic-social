'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User,
  Building,
  Sparkles,
  Link as LinkIcon,
  CreditCard,
  Bell,
  Shield,
  Palette,
  Globe,
  Moon,
  Sun,
  Monitor,
  Save,
  Check,
  Twitter,
  Instagram,
  Linkedin,
  Facebook,
  Youtube
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useUIStore } from '@/store/ui';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api';

const settingsTabs = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'workspace', label: 'Workspace', icon: Building },
  { id: 'ai', label: 'AI Settings', icon: Sparkles },
  { id: 'platforms', label: 'Platforms', icon: LinkIcon },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

const platformIcons = {
  Instagram,
  Twitter,
  LinkedIn: Linkedin,
  Facebook,
  TikTok: Sparkles,
  YouTube: Youtube,
};

const platformsConfig = [
  { name: 'Twitter', platform: 'twitter', color: 'from-blue-400 to-blue-600' },
  { name: 'Instagram', platform: 'instagram', color: 'from-pink-500 to-purple-500' },
  { name: 'LinkedIn', platform: 'linkedin', color: 'from-blue-600 to-blue-800' },
  { name: 'Facebook', platform: 'facebook', color: 'from-blue-500 to-indigo-600' },
  { name: 'TikTok', platform: 'tiktok', color: 'from-gray-800 to-pink-600' },
  { name: 'YouTube', platform: 'youtube', color: 'from-red-500 to-red-700' },
];

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);
  const { theme, setTheme } = useUIStore();
  const { user, tenant } = useAuthStore();

  useEffect(() => {
    setMounted(true);
    loadConnectedAccounts();
  }, []);

  const loadConnectedAccounts = async () => {
    try {
      const response = await apiClient.client.get('/social-accounts');
      setConnectedAccounts(response.data);
    } catch (error) {
      console.error('Failed to load connected accounts:', error);
    }
  };

  const handleConnectPlatform = async (platform: string) => {
    setConnecting(platform);
    try {
      const response = await apiClient.client.get(`/social-accounts/auth-url/${platform}`);
      const { url } = response.data;
      
      // Store the platform for callback
      localStorage.setItem('oauth_platform', platform);
      localStorage.setItem('oauth_redirect', window.location.href);
      
      // Redirect to OAuth URL
      window.location.href = url;
    } catch (error: any) {
      console.error(`Failed to connect ${platform}:`, error);
      alert(`Failed to connect ${platform}. Please try again.`);
      setConnecting(null);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Settings
          </h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg sticky top-24">
            <CardContent className="p-4">
              <nav className="space-y-1">
                {settingsTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          {activeTab === 'account' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-900">Account Settings</CardTitle>
                  <CardDescription className="text-gray-600">
                    Manage your personal account information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-900 mb-2 block">First Name</label>
                      <input
                        defaultValue={user?.firstName || ''}
                        placeholder="Enter your first name"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-900 mb-2 block">Last Name</label>
                      <input
                        defaultValue={user?.lastName || ''}
                        placeholder="Enter your last name"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-900 mb-2 block">Email Address</label>
                    <input
                      type="email"
                      defaultValue={user?.email || ''}
                      placeholder="Enter your email"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-900 mb-3 block">
                      Profile Picture
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <User className="w-10 h-10 text-white" />
                      </div>
                      <Button className="border-gray-300 text-gray-700 hover:bg-gray-100" variant="outline">
                        Change Picture
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'workspace' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-900">Workspace Settings</CardTitle>
                  <CardDescription className="text-gray-600">
                    Configure your workspace preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-900 mb-2 block">Workspace Name</label>
                    <input
                      defaultValue={tenant?.name || ''}
                      placeholder="Enter workspace name"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-900 mb-3 block">
                      Current Plan
                    </label>
                    <div className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200">
                      <div>
                        <p className="text-gray-900 font-bold text-lg capitalize">{tenant?.planTier} Plan</p>
                        <p className="text-gray-600 text-sm">Full access to all features</p>
                      </div>
                      <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg">
                        Upgrade
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-900 mb-3 block">
                      Theme
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'light', label: 'Light', icon: Sun },
                        { id: 'dark', label: 'Dark', icon: Moon },
                        { id: 'auto', label: 'Auto', icon: Monitor },
                      ].map((themeOption) => (
                        <button
                          key={themeOption.id}
                          onClick={() => setTheme({ mode: themeOption.id as any })}
                          className={`flex flex-col items-center space-y-2 p-4 rounded-xl border-2 transition-all ${
                            theme.mode === themeOption.id
                              ? 'border-indigo-600 bg-indigo-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <themeOption.icon className={`w-6 h-6 ${theme.mode === themeOption.id ? 'text-indigo-600' : 'text-gray-600'}`} />
                          <span className={`text-sm font-medium ${theme.mode === themeOption.id ? 'text-indigo-600' : 'text-gray-700'}`}>
                            {themeOption.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'platforms' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-900">Connected Platforms</CardTitle>
                  <CardDescription className="text-gray-600">
                    Manage your social media platform connections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {platformsConfig.map((platform) => {
                      const PlatformIcon = platformIcons[platform.name as keyof typeof platformIcons];
                      const connectedAccount = connectedAccounts.find(acc => acc.platform === platform.platform);
                      const isConnected = !!connectedAccount;
                      const isConnecting = connecting === platform.platform;
                      
                      return (
                        <div key={platform.name} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 hover:border-indigo-300 transition-all">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 bg-gradient-to-r ${platform.color} rounded-xl flex items-center justify-center shadow-lg`}>
                              <PlatformIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="text-gray-900 font-semibold">{platform.name}</p>
                              <p className="text-gray-600 text-sm">
                                {isConnected 
                                  ? `Connected as @${connectedAccount.username || 'user'}`
                                  : 'Not connected'
                                }
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {isConnected && (
                              <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                                <Check className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                            )}
                            <Button
                              onClick={() => !isConnected && handleConnectPlatform(platform.platform)}
                              disabled={isConnecting}
                              className={isConnected 
                                ? 'border-gray-300 text-gray-700 hover:bg-gray-100' 
                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg'
                              }
                              variant={isConnected ? 'outline' : 'default'}
                              size="sm"
                            >
                              {isConnecting ? 'Connecting...' : isConnected ? 'Disconnect' : 'Connect'}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'ai' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-900">AI Configuration</CardTitle>
                  <CardDescription className="text-gray-600">
                    Customize your AI agents and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-900 mb-3 block">
                      AI Budget Limit
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="number"
                        defaultValue="500"
                        placeholder="Monthly budget in USD"
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                      />
                      <span className="text-gray-600 font-medium">USD/month</span>
                    </div>
                    <div className="mt-3 p-3 rounded-lg bg-green-50 border border-green-200">
                      <p className="text-sm text-green-700">
                        Current usage: <span className="font-bold">$127.50</span> (25.5% of budget)
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-900 mb-3 block">
                      Content Generation Style
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'professional', label: 'Professional' },
                        { id: 'casual', label: 'Casual' },
                        { id: 'creative', label: 'Creative' },
                        { id: 'bold', label: 'Bold' },
                      ].map((style) => (
                        <button
                          key={style.id}
                          className="p-4 rounded-xl bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left"
                        >
                          <p className="text-gray-900 font-semibold">{style.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-900 mb-3 block">
                      Automation Level
                    </label>
                    <div className="space-y-3">
                      {[
                        { id: 'manual', label: 'Manual', desc: 'AI suggests, you approve' },
                        { id: 'assisted', label: 'Assisted', desc: 'AI creates, you review' },
                        { id: 'autonomous', label: 'Autonomous', desc: 'AI handles everything' },
                      ].map((level) => (
                        <label key={level.id} className="flex items-center space-x-3 cursor-pointer p-4 rounded-xl bg-white border border-gray-200 hover:border-indigo-300 transition-all">
                          <input
                            type="radio"
                            name="automation"
                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <p className="text-gray-900 font-semibold">{level.label}</p>
                            <p className="text-gray-600 text-sm">{level.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-900">Notification Preferences</CardTitle>
                  <CardDescription className="text-gray-600">
                    Choose how you want to be notified
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { id: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
                    { id: 'push', label: 'Push Notifications', desc: 'Browser and mobile notifications' },
                    { id: 'digest', label: 'Daily Digest', desc: 'Summary of daily activities' },
                    { id: 'alerts', label: 'Performance Alerts', desc: 'Notifications for significant changes' },
                  ].map((notification) => (
                    <div key={notification.id} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200">
                      <div>
                        <p className="text-gray-900 font-semibold">{notification.label}</p>
                        <p className="text-gray-600 text-sm">{notification.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'billing' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-900">Billing & Subscription</CardTitle>
                  <CardDescription className="text-gray-600">
                    Manage your billing information and subscription
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600 mb-4">Billing management coming soon</p>
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg">
                      Contact Sales
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
