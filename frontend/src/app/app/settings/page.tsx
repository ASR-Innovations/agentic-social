'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Building, Sparkles, Link as LinkIcon, CreditCard, Bell, Shield, Palette,
  Globe, Moon, Sun, Monitor, Save, Check, Settings, Workflow, Plug, Lock, Key,
  Smartphone, Mail, AlertCircle, CheckCircle, XCircle, Plus, Trash2, Edit,
  ExternalLink, Copy, RefreshCw, Download, Upload, Eye, EyeOff, Zap, Database,
  Code, Webhook
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useUIStore } from '@/store/ui';
import { useAuthStore } from '@/store/auth';

// Import settings panels
import GeneralSettings from './components/GeneralSettings';
import AccountSettings from './components/AccountSettings';
import WorkspaceSettings from './components/WorkspaceSettings';
import SocialAccountsSettings from './components/SocialAccountsSettings';
import BrandingSettings from './components/BrandingSettings';
import WorkflowSettings from './components/WorkflowSettings';
import IntegrationsSettings from './components/IntegrationsSettings';
import BillingSettings from './components/BillingSettings';
import SecuritySettings from './components/SecuritySettings';
import NotificationsSettings from './components/NotificationsSettings';

const settingsTabs = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'account', label: 'Account', icon: User },
  { id: 'workspace', label: 'Workspace', icon: Building },
  { id: 'platforms', label: 'Social Accounts', icon: LinkIcon },
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'workflow', label: 'Workflows', icon: Workflow },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const { theme } = useUIStore();
  const { user, tenant } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />;
      case 'account':
        return <AccountSettings />;
      case 'workspace':
        return <WorkspaceSettings />;
      case 'platforms':
        return <SocialAccountsSettings />;
      case 'branding':
        return <BrandingSettings />;
      case 'workflow':
        return <WorkflowSettings />;
      case 'integrations':
        return <IntegrationsSettings />;
      case 'billing':
        return <BillingSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'notifications':
        return <NotificationsSettings />;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account, workspace, and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card className="glass-card sticky top-6">
            <CardContent className="p-4">
              <nav className="space-y-2">
                {settingsTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-white/20 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
