'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Building,
  Sparkles,
  Link as LinkIcon,
  CreditCard,
  Bell,
  Moon,
  Sun,
  Monitor,
  Save,
  Check,
  Twitter,
  Instagram,
  Linkedin,
  Facebook,
  Youtube,
  CheckCircle,
  XCircle,
  TrendingUp,
  DollarSign,
  Calendar,
  Zap
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  { name: 'Twitter', platform: 'twitter' },
  { name: 'Instagram', platform: 'instagram' },
  { name: 'LinkedIn', platform: 'linkedin' },
  { name: 'Facebook', platform: 'facebook' },
  { name: 'TikTok', platform: 'tiktok' },
  { name: 'YouTube', platform: 'youtube' },
];

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string>('light');
  const { theme, setTheme } = useUIStore();
  const { user, tenant } = useAuthStore();

  useEffect(() => {
    setMounted(true);
    loadConnectedAccounts();
    setSelectedTheme(theme.mode);
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setSelectedTheme(newTheme);
    setTheme({ mode: newTheme as any });
    showSaveSuccess();
  };

  const showSaveSuccess = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

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
    <div className="min-h-screen bg-white p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-4xl font-light text-gray-900 mb-1 tracking-tight">
            Settings
          </h1>
          <p className="text-sm text-gray-500">Manage your account and preferences</p>
        </div>
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-emerald-50 text-emerald-700 px-6 py-3 rounded-lg border border-emerald-200 shadow-sm flex items-center space-x-3"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Settings saved successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabbed Interface */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-white">
          <nav className="flex overflow-x-auto">
            {settingsTabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'account' && (
              <motion.div
                key="account"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-light text-gray-900 mb-1">Account Settings</h2>
                  <p className="text-sm text-gray-500">Manage your personal account information</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-900 mb-2 block">First Name</label>
                    <input
                      defaultValue={user?.firstName || ''}
                      placeholder="Enter your first name"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-900 mb-2 block">Last Name</label>
                    <input
                      defaultValue={user?.lastName || ''}
                      placeholder="Enter your last name"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-900 mb-2 block">Email Address</label>
                  <input
                    type="email"
                    defaultValue={user?.email || ''}
                    placeholder="Enter your email"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900 transition-all"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-900 mb-3 block">Profile Picture</label>
                  <div className="flex items-center space-x-4">
                    <motion.div
                      className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <User className="w-10 h-10 text-white" />
                    </motion.div>
                    <Button
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      variant="outline"
                      onClick={showSaveSuccess}
                    >
                      Change Picture
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button
                      className="bg-gray-900 hover:bg-gray-800 text-white shadow-none"
                      onClick={showSaveSuccess}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeTab === 'workspace' && (
              <motion.div
                key="workspace"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-light text-gray-900 mb-1">Workspace Settings</h2>
                  <p className="text-sm text-gray-500">Configure your workspace preferences</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-900 mb-2 block">Workspace Name</label>
                  <input
                    defaultValue={tenant?.name || ''}
                    placeholder="Enter workspace name"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900 transition-all"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-900 mb-3 block">Theme Selector</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'light', label: 'Light', icon: Sun, preview: 'bg-white' },
                      { id: 'dark', label: 'Dark', icon: Moon, preview: 'bg-gray-900' },
                      { id: 'auto', label: 'Auto', icon: Monitor, preview: 'bg-gray-50' },
                    ].map((themeOption) => (
                      <motion.button
                        key={themeOption.id}
                        onClick={() => handleThemeChange(themeOption.id)}
                        className={`relative flex flex-col items-center space-y-3 p-5 rounded-lg border-2 transition-all ${
                          selectedTheme === themeOption.id
                            ? 'border-gray-900 bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                        whileHover={{ scale: 1.01, y: -1 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        {selectedTheme === themeOption.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2"
                          >
                            <CheckCircle className="w-5 h-5 text-gray-900" />
                          </motion.div>
                        )}
                        <div className={`w-full h-16 rounded-lg ${themeOption.preview} border border-gray-200`} />
                        <themeOption.icon className={`w-6 h-6 ${selectedTheme === themeOption.id ? 'text-gray-900' : 'text-gray-600'}`} />
                        <span className={`text-sm font-medium ${selectedTheme === themeOption.id ? 'text-gray-900' : 'text-gray-700'}`}>
                          {themeOption.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'platforms' && (
              <motion.div
                key="platforms"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-light text-gray-900 mb-1">Connected Platforms</h2>
                  <p className="text-sm text-gray-500">Manage your social media platform connections</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {platformsConfig.map((platform, index) => {
                    const PlatformIcon = platformIcons[platform.name as keyof typeof platformIcons];
                    const connectedAccount = connectedAccounts.find(acc => acc.platform === platform.platform);
                    const isConnected = !!connectedAccount;
                    const isConnecting = connecting === platform.platform;

                    return (
                      <motion.div
                        key={platform.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -2 }}
                        className="relative p-5 rounded-lg bg-white border border-gray-200 shadow-none hover:border-gray-300 transition-all overflow-hidden"
                      >
                        {/* Status Indicator */}
                        <div className="absolute top-3 right-3">
                          {isConnected ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex items-center space-x-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium border border-emerald-200"
                            >
                              <CheckCircle className="w-3 h-3" />
                              <span>Connected</span>
                            </motion.div>
                          ) : (
                            <div className="flex items-center space-x-1 bg-gray-50 text-gray-600 px-2 py-1 rounded-full text-xs font-medium border border-gray-200">
                              <XCircle className="w-3 h-3" />
                              <span>Not Connected</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-start space-x-4 mb-4">
                          <motion.div
                            className="w-14 h-14 bg-gray-900 rounded-lg flex items-center justify-center"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
                            <PlatformIcon className="w-7 h-7 text-white" />
                          </motion.div>
                          <div className="flex-1">
                            <h3 className="text-gray-900 font-medium text-base">{platform.name}</h3>
                            <p className="text-gray-600 text-sm">
                              {isConnected
                                ? `@${connectedAccount.username || 'user'}`
                                : 'Connect your account'
                              }
                            </p>
                          </div>
                        </div>

                        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                          <Button
                            onClick={() => !isConnected && handleConnectPlatform(platform.platform)}
                            disabled={isConnecting}
                            className={`w-full ${isConnected
                              ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                              : 'bg-gray-900 hover:bg-gray-800 text-white shadow-none'
                            }`}
                            variant={isConnected ? 'outline' : 'default'}
                          >
                            {isConnecting ? (
                              <>
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                                />
                                Connecting...
                              </>
                            ) : isConnected ? (
                              <>
                                <Check className="w-4 h-4 mr-2" />
                                Disconnect
                              </>
                            ) : (
                              <>
                                <LinkIcon className="w-4 h-4 mr-2" />
                                Connect
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {activeTab === 'ai' && (
              <motion.div
                key="ai"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-light text-gray-900 mb-1">AI Settings</h2>
                  <p className="text-sm text-gray-500">Customize your AI agents and preferences</p>
                </div>

                {/* AI Budget Section */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-medium">AI Budget Limit</h3>
                      <p className="text-gray-600 text-sm">Set your monthly spending limit</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mb-4">
                    <input
                      type="number"
                      defaultValue="500"
                      placeholder="Monthly budget in USD"
                      className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900 transition-all"
                      onChange={showSaveSuccess}
                    />
                    <span className="text-gray-700 font-medium whitespace-nowrap">USD/month</span>
                  </div>

                  <motion.div
                    className="p-4 rounded-lg bg-white border border-emerald-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-700">Current usage</p>
                      <p className="text-sm font-medium text-emerald-700">$127.50 / $500</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-emerald-500"
                        initial={{ width: 0 }}
                        animate={{ width: '25.5%' }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-2">25.5% of monthly budget used</p>
                  </motion.div>
                </div>

                {/* Content Generation Style */}
                <div>
                  <label className="text-sm font-medium text-gray-900 mb-3 block">Content Generation Style</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'professional', label: 'Professional', icon: Building, desc: 'Formal and polished' },
                      { id: 'casual', label: 'Casual', icon: User, desc: 'Friendly and relaxed' },
                      { id: 'creative', label: 'Creative', icon: Sparkles, desc: 'Bold and innovative' },
                      { id: 'bold', label: 'Bold', icon: Zap, desc: 'Attention-grabbing' },
                    ].map((style) => (
                      <motion.button
                        key={style.id}
                        className="p-4 rounded-lg bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-left"
                        whileHover={{ scale: 1.01, y: -1 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={showSaveSuccess}
                      >
                        <style.icon className="w-5 h-5 text-gray-900 mb-2" />
                        <p className="text-gray-900 font-medium">{style.label}</p>
                        <p className="text-gray-600 text-xs mt-1">{style.desc}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Automation Level */}
                <div>
                  <label className="text-sm font-medium text-gray-900 mb-3 block">Automation Level</label>
                  <div className="space-y-3">
                    {[
                      { id: 'manual', label: 'Manual', desc: 'AI suggests, you approve', icon: User },
                      { id: 'assisted', label: 'Assisted', desc: 'AI creates, you review', icon: Sparkles },
                      { id: 'autonomous', label: 'Autonomous', desc: 'AI handles everything', icon: Zap },
                    ].map((level) => (
                      <motion.label
                        key={level.id}
                        className="flex items-center space-x-4 cursor-pointer p-4 rounded-lg bg-white border border-gray-200 hover:border-gray-300 transition-all"
                        whileHover={{ x: 2 }}
                        onClick={showSaveSuccess}
                      >
                        <input
                          type="radio"
                          name="automation"
                          className="w-4 h-4 text-gray-900 focus:ring-gray-900"
                        />
                        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                          <level.icon className="w-5 h-5 text-gray-900" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium">{level.label}</p>
                          <p className="text-gray-600 text-sm">{level.desc}</p>
                        </div>
                      </motion.label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-light text-gray-900 mb-1">Notification Preferences</h2>
                  <p className="text-sm text-gray-500">Choose how you want to be notified</p>
                </div>

                <div className="space-y-3">
                  {[
                    { id: 'email', label: 'Email Notifications', desc: 'Receive updates via email', icon: Bell },
                    { id: 'push', label: 'Push Notifications', desc: 'Browser and mobile notifications', icon: Sparkles },
                    { id: 'digest', label: 'Daily Digest', desc: 'Summary of daily activities', icon: Calendar },
                    { id: 'alerts', label: 'Performance Alerts', desc: 'Notifications for significant changes', icon: TrendingUp },
                  ].map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      className="flex items-center justify-between p-5 rounded-lg bg-white border border-gray-200 hover:border-gray-300 transition-all"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                          <notification.icon className="w-5 h-5 text-gray-900" />
                        </div>
                        <div>
                          <p className="text-gray-900 font-medium">{notification.label}</p>
                          <p className="text-gray-600 text-sm">{notification.desc}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          defaultChecked
                          onChange={showSaveSuccess}
                        />
                        <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gray-900"></div>
                      </label>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'billing' && (
              <motion.div
                key="billing"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-light text-gray-900 mb-1">Billing & Subscription</h2>
                  <p className="text-sm text-gray-500">Manage your billing information and subscription</p>
                </div>

                {/* Current Plan - Prominent Display */}
                <motion.div
                  className="relative overflow-hidden rounded-lg bg-gray-900 p-8 text-white border border-gray-800"
                  whileHover={{ scale: 1.005 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-gray-400 text-sm font-medium mb-1">Current Plan</p>
                        <h3 className="text-4xl font-light capitalize">{tenant?.planTier || 'Pro'} Plan</h3>
                      </div>
                      <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                        <p className="text-gray-400 text-xs mb-1">Team Members</p>
                        <p className="text-2xl font-light">Unlimited</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                        <p className="text-gray-400 text-xs mb-1">AI Agents</p>
                        <p className="text-2xl font-light">Unlimited</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                        <p className="text-gray-400 text-xs mb-1">Posts/Month</p>
                        <p className="text-2xl font-light">Unlimited</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                        <Button className="bg-white text-gray-900 hover:bg-gray-100 shadow-none font-medium">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Upgrade Plan
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                        <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800">
                          View All Plans
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                {/* Billing Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div
                    className="p-5 rounded-lg bg-white border border-gray-200 shadow-none hover:border-gray-300"
                    whileHover={{ y: -1 }}
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center border border-emerald-200">
                        <CreditCard className="w-5 h-5 text-emerald-700" />
                      </div>
                      <div>
                        <h3 className="text-gray-900 font-medium">Payment Method</h3>
                        <p className="text-gray-600 text-sm">Visa ending in 4242</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                      Update Payment
                    </Button>
                  </motion.div>

                  <motion.div
                    className="p-5 rounded-lg bg-white border border-gray-200 shadow-none hover:border-gray-300"
                    whileHover={{ y: -1 }}
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-200">
                        <Calendar className="w-5 h-5 text-blue-700" />
                      </div>
                      <div>
                        <h3 className="text-gray-900 font-medium">Next Billing Date</h3>
                        <p className="text-gray-600 text-sm">December 27, 2025</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                      View Invoices
                    </Button>
                  </motion.div>
                </div>

                {/* Billing History */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-none overflow-hidden">
                  <div className="p-5 border-b border-gray-200">
                    <h3 className="text-gray-900 font-medium">Recent Invoices</h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {[
                      { date: 'Nov 27, 2025', amount: '$99.00', status: 'Paid' },
                      { date: 'Oct 27, 2025', amount: '$99.00', status: 'Paid' },
                      { date: 'Sep 27, 2025', amount: '$99.00', status: 'Paid' },
                    ].map((invoice, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                            <CreditCard className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-gray-900 font-medium">{invoice.date}</p>
                            <p className="text-gray-600 text-sm">Monthly subscription</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <p className="text-gray-900 font-medium">{invoice.amount}</p>
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {invoice.status}
                          </Badge>
                          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                            Download
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
