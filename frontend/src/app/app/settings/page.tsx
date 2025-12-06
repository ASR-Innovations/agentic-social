'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Zap,
  Settings,
  Shield,
  Key,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  RefreshCw,
  Globe,
  Smartphone,
  Laptop,
  Activity,
  BarChart3,
  PieChart,
  Lock,
  Unlock,
  AlertTriangle,
  Download,
  Upload,
  Camera,
  Mail,
  Phone,
  MapPin,
  Clock,
  Users,
  Crown,
  Star,
  ChevronRight,
  ExternalLink,
  Wifi,
  WifiOff,
  Bot,
  MessageSquare,
  Volume2,
  VolumeX,
  Palette,
  Layout,
  Monitor as MonitorIcon,
  HelpCircle,
  FileText,
  Database,
  Server,
  Code,
  Terminal,
  Webhook,
  MoreHorizontal,
  ArrowUpRight,
  Fingerprint,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  History,
  Gauge,
  Target,
  Layers,
  Cpu,
  Sliders,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUIStore } from '@/store/ui';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api';
import { usePrefersReducedMotion } from '@/lib/accessibility';

// Settings tabs configuration
const settingsTabs = [
  { id: 'account', label: 'Account', icon: User, description: 'Profile & personal info' },
  { id: 'workspace', label: 'Workspace', icon: Building, description: 'Team & preferences' },
  { id: 'ai', label: 'AI Settings', icon: Sparkles, description: 'Agents & automation' },
  { id: 'platforms', label: 'Platforms', icon: LinkIcon, description: 'Social connections' },
  { id: 'security', label: 'Security', icon: Shield, description: 'Password & 2FA' },
  { id: 'billing', label: 'Billing', icon: CreditCard, description: 'Plans & payments' },
  { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alerts & updates' },
  { id: 'api', label: 'API Keys', icon: Key, description: 'Developer access' },
];

const platformIcons: Record<string, any> = {
  Instagram,
  Twitter,
  LinkedIn: Linkedin,
  Facebook,
  TikTok: Sparkles,
  YouTube: Youtube,
};

const platformsConfig = [
  { name: 'Twitter', platform: 'twitter', color: 'from-gray-700 to-gray-900', followers: '12.5K' },
  { name: 'Instagram', platform: 'instagram', color: 'from-pink-500 to-purple-600', followers: '45.2K' },
  { name: 'LinkedIn', platform: 'linkedin', color: 'from-blue-600 to-blue-800', followers: '8.3K' },
  { name: 'Facebook', platform: 'facebook', color: 'from-blue-500 to-blue-700', followers: '23.1K' },
  { name: 'TikTok', platform: 'tiktok', color: 'from-gray-900 to-pink-500', followers: '156K' },
  { name: 'YouTube', platform: 'youtube', color: 'from-red-500 to-red-700', followers: '5.8K' },
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
  const prefersReducedMotion = usePrefersReducedMotion();

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

  const showSaveSuccess = useCallback(() => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
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
      localStorage.setItem('oauth_platform', platform);
      localStorage.setItem('oauth_redirect', window.location.href);
      window.location.href = url;
    } catch (error: any) {
      console.error(`Failed to connect ${platform}:`, error);
      alert(`Failed to connect ${platform}. Please try again.`);
      setConnecting(null);
    }
  };

  if (!mounted) return null;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Animated Background */}
      <SettingsBackground prefersReducedMotion={prefersReducedMotion} />

      {/* Main Content */}
      <motion.div
        className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6"
        initial={prefersReducedMotion ? {} : "hidden"}
        animate={prefersReducedMotion ? {} : "visible"}
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <SettingsHeader />
        </motion.div>

        {/* Success Notification */}
        <AnimatePresence>
          {saveSuccess && <SuccessNotification />}
        </AnimatePresence>

        {/* Main Settings Layout */}
        <motion.div variants={itemVariants} className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <SettingsSidebar
            tabs={settingsTabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            prefersReducedMotion={prefersReducedMotion}
          />

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {activeTab === 'account' && (
                <AccountSection
                  key="account"
                  user={user}
                  onSave={showSaveSuccess}
                  prefersReducedMotion={prefersReducedMotion}
                />
              )}
              {activeTab === 'workspace' && (
                <WorkspaceSection
                  key="workspace"
                  tenant={tenant}
                  selectedTheme={selectedTheme}
                  onThemeChange={handleThemeChange}
                  prefersReducedMotion={prefersReducedMotion}
                />
              )}
              {activeTab === 'ai' && (
                <AISettingsSection
                  key="ai"
                  onSave={showSaveSuccess}
                  prefersReducedMotion={prefersReducedMotion}
                />
              )}
              {activeTab === 'platforms' && (
                <PlatformsSection
                  key="platforms"
                  platforms={platformsConfig}
                  connectedAccounts={connectedAccounts}
                  connecting={connecting}
                  onConnect={handleConnectPlatform}
                  prefersReducedMotion={prefersReducedMotion}
                />
              )}
              {activeTab === 'security' && (
                <SecuritySection
                  key="security"
                  onSave={showSaveSuccess}
                  prefersReducedMotion={prefersReducedMotion}
                />
              )}
              {activeTab === 'billing' && (
                <BillingSection
                  key="billing"
                  tenant={tenant}
                  prefersReducedMotion={prefersReducedMotion}
                />
              )}
              {activeTab === 'notifications' && (
                <NotificationsSection
                  key="notifications"
                  onSave={showSaveSuccess}
                  prefersReducedMotion={prefersReducedMotion}
                />
              )}
              {activeTab === 'api' && (
                <APIKeysSection
                  key="api"
                  onSave={showSaveSuccess}
                  prefersReducedMotion={prefersReducedMotion}
                />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}


// ============================================================================
// BACKGROUND COMPONENT
// ============================================================================

function SettingsBackground({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient Mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 via-transparent to-blue-50/20 dark:from-emerald-950/20 dark:to-blue-950/10" />
      
      {/* Animated Orbs */}
      {!prefersReducedMotion && (
        <>
          <motion.div
            className="absolute top-20 right-[10%] w-72 h-72 bg-emerald-400/10 dark:bg-emerald-500/5 rounded-full blur-3xl"
            animate={{ y: [0, -30, 0], scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/2 left-[5%] w-96 h-96 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl"
            animate={{ y: [0, 40, 0], scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          <motion.div
            className="absolute bottom-20 right-[20%] w-64 h-64 bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl"
            animate={{ y: [0, -20, 0], x: [0, 20, 0], scale: [1, 1.2, 1], opacity: [0.2, 0.35, 0.2] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          />
        </>
      )}
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(16, 185, 129, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}

// ============================================================================
// HEADER COMPONENT
// ============================================================================

function SettingsHeader() {
  return (
    <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl">
      <div className="relative bg-gray-900 p-6 md:p-8">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-emerald-500 via-emerald-400 to-teal-500 rounded-full blur-3xl"
            style={{ transform: 'translate(30%, -40%)' }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 rounded-full blur-3xl"
            style={{ transform: 'translate(-30%, 40%)' }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <div 
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.div 
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Settings className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Settings</h1>
              <p className="text-gray-400 text-sm mt-0.5">Manage your account and preferences</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 border border-white/10 backdrop-blur-sm text-sm font-medium transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Help Center</span>
            </motion.button>
            <motion.button
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-gray-900 shadow-lg shadow-white/20 hover:shadow-xl text-sm font-medium transition-all"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Save className="w-4 h-4" />
              <span>Save All</span>
            </motion.button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="relative mt-6 pt-6 border-t border-white/10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Connected', value: '4', icon: LinkIcon, color: 'emerald' },
              { label: 'AI Credits', value: '847', icon: Sparkles, color: 'purple' },
              { label: 'Security', value: '85%', icon: Shield, color: 'blue' },
              { label: 'Active', value: '12d', icon: Activity, color: 'cyan' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
              >
                <div className={`w-8 h-8 rounded-lg bg-${stat.color}-500/20 flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 text-${stat.color}-400`} />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                  <p className="text-[10px] text-gray-400">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SUCCESS NOTIFICATION
// ============================================================================

function SuccessNotification() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="fixed top-6 right-6 z-50"
    >
      <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, delay: 0.1 }}
        >
          <CheckCircle className="w-5 h-5" />
        </motion.div>
        <span className="font-medium">Settings saved successfully!</span>
      </div>
    </motion.div>
  );
}

// ============================================================================
// SIDEBAR NAVIGATION
// ============================================================================

interface SettingsSidebarProps {
  tabs: typeof settingsTabs;
  activeTab: string;
  onTabChange: (tab: string) => void;
  prefersReducedMotion: boolean;
}

function SettingsSidebar({ tabs, activeTab, onTabChange, prefersReducedMotion }: SettingsSidebarProps) {
  return (
    <div className="lg:w-72 flex-shrink-0">
      <div className="sticky top-6">
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden">
          <CardContent className="p-2">
            <nav className="space-y-1">
              {tabs.map((tab, index) => {
                const isActive = activeTab === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
                    animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={prefersReducedMotion ? {} : { x: isActive ? 0 : 4 }}
                    whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      <tab.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isActive ? 'text-white' : ''}`}>
                        {tab.label}
                      </p>
                      <p className={`text-xs truncate ${isActive ? 'text-white/70' : 'text-gray-400'}`}>
                        {tab.description}
                      </p>
                    </div>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute right-3"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <ChevronRight className="w-4 h-4 text-white/70" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </nav>
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4"
        >
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-0 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Pro Plan</p>
                  <p className="text-gray-400 text-xs">Unlimited access</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">AI Credits</span>
                  <span className="text-emerald-400 font-medium">847 / 1000</span>
                </div>
                <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '84.7%' }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}


// ============================================================================
// ACCOUNT SECTION
// ============================================================================

interface AccountSectionProps {
  user: any;
  onSave: () => void;
  prefersReducedMotion: boolean;
}

function AccountSection({ user, onSave, prefersReducedMotion }: AccountSectionProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Section Header */}
      <SectionHeader
        icon={User}
        title="Account Settings"
        description="Manage your personal information and profile"
        color="blue"
      />

      {/* Profile Card */}
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
            {/* Avatar */}
            <motion.div
              className="relative group"
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
            >
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <User className="w-12 h-12 text-white" />
              </div>
              <motion.button
                className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-emerald-500 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Camera className="w-5 h-5" />
              </motion.button>
              <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Upload className="w-6 h-6 text-white" />
              </div>
            </motion.div>

            {/* User Info */}
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {user?.firstName || 'John'} {user?.lastName || 'Doe'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{user?.email || 'john@example.com'}</p>
              <div className="flex items-center gap-3 mt-3">
                <Badge className="bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
                <Badge className="bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/30">
                  <Crown className="w-3 h-3 mr-1" />
                  Pro Member
                </Badge>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6">
              {[
                { label: 'Posts', value: '234' },
                { label: 'Followers', value: '12.5K' },
                { label: 'Following', value: '892' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            <InputField
              label="First Name"
              icon={User}
              defaultValue={user?.firstName || ''}
              placeholder="Enter your first name"
            />
            <InputField
              label="Last Name"
              icon={User}
              defaultValue={user?.lastName || ''}
              placeholder="Enter your last name"
            />
            <InputField
              label="Email Address"
              icon={Mail}
              type="email"
              defaultValue={user?.email || ''}
              placeholder="Enter your email"
            />
            <InputField
              label="Phone Number"
              icon={Phone}
              type="tel"
              placeholder="+1 (555) 000-0000"
            />
            <div className="md:col-span-2">
              <InputField
                label="Bio"
                icon={FileText}
                placeholder="Tell us about yourself..."
                multiline
              />
            </div>
            <InputField
              label="Location"
              icon={MapPin}
              placeholder="City, Country"
            />
            <InputField
              label="Website"
              icon={Globe}
              type="url"
              placeholder="https://yourwebsite.com"
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6 mt-6 border-t border-gray-100 dark:border-gray-800">
            <motion.button
              onClick={onSave}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg shadow-emerald-500/30 hover:shadow-xl transition-all"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Save className="w-4 h-4" />
              Save Changes
            </motion.button>
          </div>
        </CardContent>
      </Card>

      {/* Account Activity */}
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Account Activity</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Recent account events</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {[
              { action: 'Password changed', time: '2 hours ago', icon: Lock, color: 'emerald' },
              { action: 'New login from Chrome on Mac', time: '1 day ago', icon: Laptop, color: 'blue' },
              { action: 'Profile picture updated', time: '3 days ago', icon: Camera, color: 'purple' },
              { action: 'Email verified', time: '1 week ago', icon: Mail, color: 'cyan' },
            ].map((activity, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`w-10 h-10 rounded-xl bg-${activity.color}-100 dark:bg-${activity.color}-500/20 flex items-center justify-center`}>
                  <activity.icon className={`w-5 h-5 text-${activity.color}-600 dark:text-${activity.color}-400`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// WORKSPACE SECTION
// ============================================================================

interface WorkspaceSectionProps {
  tenant: any;
  selectedTheme: string;
  onThemeChange: (theme: string) => void;
  prefersReducedMotion: boolean;
}

function WorkspaceSection({ tenant, selectedTheme, onThemeChange, prefersReducedMotion }: WorkspaceSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <SectionHeader
        icon={Building}
        title="Workspace Settings"
        description="Configure your workspace preferences and team settings"
        color="purple"
      />

      {/* Workspace Info */}
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
            <motion.div
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <Building className="w-10 h-10 text-white" />
            </motion.div>
            <div className="flex-1">
              <InputField
                label="Workspace Name"
                icon={Building}
                defaultValue={tenant?.name || 'My Workspace'}
                placeholder="Enter workspace name"
              />
            </div>
          </div>

          {/* Team Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-gray-100 dark:border-gray-800">
            {[
              { label: 'Team Members', value: '12', icon: Users, color: 'blue' },
              { label: 'Active Projects', value: '8', icon: Layers, color: 'emerald' },
              { label: 'Total Posts', value: '1.2K', icon: FileText, color: 'purple' },
              { label: 'Storage Used', value: '4.2GB', icon: Database, color: 'orange' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -2, scale: 1.02 }}
              >
                <div className={`w-10 h-10 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-500/20 flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Theme Selector */}
          <div className="pt-6">
            <label className="text-sm font-medium text-gray-900 dark:text-white mb-4 block">
              Theme Preference
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'light', label: 'Light', icon: Sun, preview: 'bg-white', border: 'border-gray-200' },
                { id: 'dark', label: 'Dark', icon: Moon, preview: 'bg-gray-900', border: 'border-gray-700' },
                { id: 'auto', label: 'System', icon: MonitorIcon, preview: 'bg-gradient-to-r from-white to-gray-900', border: 'border-gray-300' },
              ].map((themeOption) => (
                <motion.button
                  key={themeOption.id}
                  onClick={() => onThemeChange(themeOption.id)}
                  className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                    selectedTheme === themeOption.id
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                      : `${themeOption.border} bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600`
                  }`}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {selectedTheme === themeOption.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </motion.div>
                  )}
                  <div className={`w-full h-20 rounded-xl ${themeOption.preview} border ${themeOption.border} shadow-inner`} />
                  <themeOption.icon className={`w-6 h-6 ${selectedTheme === themeOption.id ? 'text-emerald-600' : 'text-gray-500'}`} />
                  <span className={`text-sm font-medium ${selectedTheme === themeOption.id ? 'text-emerald-600' : 'text-gray-700 dark:text-gray-300'}`}>
                    {themeOption.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


// ============================================================================
// AI SETTINGS SECTION
// ============================================================================

interface AISettingsSectionProps {
  onSave: () => void;
  prefersReducedMotion: boolean;
}

function AISettingsSection({ onSave, prefersReducedMotion }: AISettingsSectionProps) {
  const [budgetLimit, setBudgetLimit] = useState(500);
  const currentUsage = 127.50;
  const usagePercentage = (currentUsage / budgetLimit) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <SectionHeader
        icon={Sparkles}
        title="AI Settings"
        description="Configure AI agents, automation, and content generation"
        color="purple"
      />

      {/* AI Usage Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Card */}
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Budget</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Monthly spending limit</p>
              </div>
            </div>

            {/* Circular Progress */}
            <div className="flex items-center justify-center py-6">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-gray-100 dark:text-gray-800"
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="url(#gradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={553}
                    initial={{ strokeDashoffset: 553 }}
                    animate={{ strokeDashoffset: 553 - (553 * usagePercentage) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">${currentUsage}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">of ${budgetLimit}</span>
                  <span className="text-xs text-emerald-500 font-medium mt-1">{usagePercentage.toFixed(1)}% used</span>
                </div>
              </div>
            </div>

            {/* Budget Input */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="50"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
              <div className="w-24">
                <input
                  type="number"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm text-center"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Stats Card */}
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Agents</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Performance overview</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Active Agents', value: '5', icon: Bot, color: 'emerald', trend: '+2' },
                { label: 'Total Requests', value: '2.4K', icon: MessageSquare, color: 'blue', trend: '+18%' },
                { label: 'Success Rate', value: '98.5%', icon: Target, color: 'purple', trend: '+0.5%' },
                { label: 'Avg Response', value: '1.2s', icon: Clock, color: 'orange', trend: '-0.3s' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
                    <span className="text-xs text-emerald-500 font-medium">{stat.trend}</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Generation Style */}
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Content Generation Style</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { id: 'professional', label: 'Professional', icon: Building, desc: 'Formal and polished', color: 'blue' },
              { id: 'casual', label: 'Casual', icon: User, desc: 'Friendly and relaxed', color: 'emerald' },
              { id: 'creative', label: 'Creative', icon: Sparkles, desc: 'Bold and innovative', color: 'purple' },
              { id: 'bold', label: 'Bold', icon: Zap, desc: 'Attention-grabbing', color: 'orange' },
            ].map((style, index) => (
              <motion.button
                key={style.id}
                className="p-5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all text-left group"
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={onSave}
              >
                <div className={`w-12 h-12 rounded-xl bg-${style.color}-100 dark:bg-${style.color}-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <style.icon className={`w-6 h-6 text-${style.color}-600 dark:text-${style.color}-400`} />
                </div>
                <p className="text-gray-900 dark:text-white font-medium">{style.label}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{style.desc}</p>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Automation Level */}
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Automation Level</h3>
          <div className="space-y-3">
            {[
              { id: 'manual', label: 'Manual', desc: 'AI suggests, you approve everything', icon: User, level: 1 },
              { id: 'assisted', label: 'Assisted', desc: 'AI creates drafts, you review before posting', icon: Sparkles, level: 2 },
              { id: 'autonomous', label: 'Autonomous', desc: 'AI handles content creation and scheduling', icon: Zap, level: 3 },
            ].map((level, index) => (
              <motion.label
                key={level.id}
                className="flex items-center gap-4 p-5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600 cursor-pointer transition-all"
                whileHover={{ x: 4 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={onSave}
              >
                <input type="radio" name="automation" className="sr-only" />
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <level.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white font-medium">{level.label}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{level.desc}</p>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3].map((dot) => (
                    <div
                      key={dot}
                      className={`w-2 h-2 rounded-full ${dot <= level.level ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                    />
                  ))}
                </div>
              </motion.label>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// PLATFORMS SECTION
// ============================================================================

interface PlatformsSectionProps {
  platforms: typeof platformsConfig;
  connectedAccounts: any[];
  connecting: string | null;
  onConnect: (platform: string) => void;
  prefersReducedMotion: boolean;
}

function PlatformsSection({ platforms, connectedAccounts, connecting, onConnect, prefersReducedMotion }: PlatformsSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <SectionHeader
        icon={LinkIcon}
        title="Connected Platforms"
        description="Manage your social media platform connections"
        color="cyan"
      />

      {/* Platform Health */}
      <Card className="bg-gradient-to-r from-emerald-500 to-teal-500 border-0 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Wifi className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">All Systems Operational</h3>
                <p className="text-white/70 text-sm">4 of 6 platforms connected</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
              <span className="text-white/90 text-sm font-medium">Live</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {platforms.map((platform, index) => {
          const PlatformIcon = platformIcons[platform.name];
          const connectedAccount = connectedAccounts.find(acc => acc.platform === platform.platform);
          const isConnected = !!connectedAccount;
          const isConnecting = connecting === platform.platform;

          return (
            <motion.div
              key={platform.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="group"
            >
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden h-full">
                <CardContent className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <motion.div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${platform.color} flex items-center justify-center shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <PlatformIcon className="w-7 h-7 text-white" />
                    </motion.div>
                    <Badge className={isConnected 
                      ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                    }>
                      {isConnected ? (
                        <><CheckCircle className="w-3 h-3 mr-1" />Connected</>
                      ) : (
                        <><XCircle className="w-3 h-3 mr-1" />Not Connected</>
                      )}
                    </Badge>
                  </div>

                  {/* Info */}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{platform.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {isConnected ? `@${connectedAccount.username || 'user'}` : 'Connect your account'}
                  </p>

                  {/* Stats */}
                  {isConnected && (
                    <div className="grid grid-cols-3 gap-2 mb-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <div className="text-center">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{platform.followers}</p>
                        <p className="text-[10px] text-gray-500">Followers</p>
                      </div>
                      <div className="text-center border-x border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">234</p>
                        <p className="text-[10px] text-gray-500">Posts</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">4.2%</p>
                        <p className="text-[10px] text-gray-500">Engagement</p>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <motion.button
                    onClick={() => !isConnected && onConnect(platform.platform)}
                    disabled={isConnecting}
                    className={`w-full py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                      isConnected
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        : `bg-gradient-to-r ${platform.color} text-white shadow-lg hover:shadow-xl`
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isConnecting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </motion.div>
                        Connecting...
                      </>
                    ) : isConnected ? (
                      <>
                        <Settings className="w-4 h-4" />
                        Manage
                      </>
                    ) : (
                      <>
                        <LinkIcon className="w-4 h-4" />
                        Connect
                      </>
                    )}
                  </motion.button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}


// ============================================================================
// SECURITY SECTION
// ============================================================================

interface SecuritySectionProps {
  onSave: () => void;
  prefersReducedMotion: boolean;
}

function SecuritySection({ onSave, prefersReducedMotion }: SecuritySectionProps) {
  const [showPassword, setShowPassword] = useState(false);
  const securityScore = 85;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <SectionHeader
        icon={Shield}
        title="Security Settings"
        description="Protect your account with advanced security features"
        color="emerald"
      />

      {/* Security Score */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-0 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Score Circle */}
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="rgba(255,255,255,0.1)" strokeWidth="10" fill="none" />
                <motion.circle
                  cx="80" cy="80" r="70"
                  stroke="url(#securityGradient)"
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={440}
                  initial={{ strokeDashoffset: 440 }}
                  animate={{ strokeDashoffset: 440 - (440 * securityScore) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="securityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-white">{securityScore}</span>
                <span className="text-sm text-gray-400">Security Score</span>
              </div>
            </div>

            {/* Recommendations */}
            <div className="flex-1 space-y-3">
              <h3 className="text-xl font-semibold text-white mb-4">Security Status</h3>
              {[
                { label: 'Password Strength', status: 'strong', icon: Lock },
                { label: 'Two-Factor Auth', status: 'enabled', icon: Fingerprint },
                { label: 'Recovery Email', status: 'verified', icon: Mail },
                { label: 'Login Alerts', status: 'active', icon: Bell },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="flex-1 text-white text-sm">{item.label}</span>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                    {item.status}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
              <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Update your password regularly</p>
            </div>
          </div>

          <div className="space-y-4">
            <InputField
              label="Current Password"
              icon={Lock}
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter current password"
              rightElement={
                <button onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
            <InputField
              label="New Password"
              icon={Lock}
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter new password"
            />
            <InputField
              label="Confirm New Password"
              icon={Lock}
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
            />
          </div>

          <div className="flex justify-end pt-6 mt-6 border-t border-gray-100 dark:border-gray-800">
            <motion.button
              onClick={onSave}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium shadow-lg shadow-blue-500/30"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Lock className="w-4 h-4" />
              Update Password
            </motion.button>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                <Laptop className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Active Sessions</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Manage your logged-in devices</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {[
              { device: 'MacBook Pro', browser: 'Chrome', location: 'San Francisco, US', time: 'Active now', current: true, icon: Laptop },
              { device: 'iPhone 15', browser: 'Safari', location: 'San Francisco, US', time: '2 hours ago', current: false, icon: Smartphone },
              { device: 'Windows PC', browser: 'Firefox', location: 'New York, US', time: '1 day ago', current: false, icon: MonitorIcon },
            ].map((session, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`w-12 h-12 rounded-xl ${session.current ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-gray-100 dark:bg-gray-800'} flex items-center justify-center`}>
                  <session.icon className={`w-6 h-6 ${session.current ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{session.device}</p>
                    {session.current && (
                      <Badge className="bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 text-[10px]">
                        Current
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {session.browser} • {session.location} • {session.time}
                  </p>
                </div>
                {!session.current && (
                  <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50">
                    <LogOut className="w-4 h-4" />
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// BILLING SECTION
// ============================================================================

interface BillingSectionProps {
  tenant: any;
  prefersReducedMotion: boolean;
}

function BillingSection({ tenant, prefersReducedMotion }: BillingSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <SectionHeader
        icon={CreditCard}
        title="Billing & Subscription"
        description="Manage your plan, payment methods, and invoices"
        color="orange"
      />

      {/* Current Plan Hero */}
      <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-0 overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </div>
        <CardContent className="p-8 relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Crown className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Current Plan</p>
                  <h3 className="text-2xl font-bold text-white capitalize">{tenant?.planTier || 'Professional'}</h3>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Team Members', value: 'Unlimited' },
                  { label: 'AI Agents', value: 'Unlimited' },
                  { label: 'Posts/Month', value: 'Unlimited' },
                ].map((feature) => (
                  <div key={feature.label} className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-gray-400 text-xs mb-1">{feature.label}</p>
                    <p className="text-xl font-semibold text-white">{feature.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <motion.button
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-gray-900 font-medium shadow-lg hover:shadow-xl transition-all"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <TrendingUp className="w-4 h-4" />
                Upgrade Plan
              </motion.button>
              <motion.button
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white border border-white/20 font-medium hover:bg-white/20 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                View All Plans
              </motion.button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment & Billing Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Method */}
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Method</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Visa ending in 4242</p>
              </div>
            </div>
            
            {/* Card Visual */}
            <div className="relative h-44 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 p-6 mb-4 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-12 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded" />
                  <Wifi className="w-6 h-6 text-white/50 rotate-90" />
                </div>
                <p className="text-white/70 text-lg tracking-widest mb-4">•••• •••• •••• 4242</p>
                <div className="flex justify-between">
                  <div>
                    <p className="text-white/50 text-xs">Card Holder</p>
                    <p className="text-white text-sm">John Doe</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-xs">Expires</p>
                    <p className="text-white text-sm">12/26</p>
                  </div>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              Update Payment Method
            </Button>
          </CardContent>
        </Card>

        {/* Next Billing */}
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Next Billing</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">December 27, 2025</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <span className="text-gray-600 dark:text-gray-400">Professional Plan</span>
                <span className="font-semibold text-gray-900 dark:text-white">$99.00</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <span className="text-gray-600 dark:text-gray-400">AI Credits Add-on</span>
                <span className="font-semibold text-gray-900 dark:text-white">$29.00</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30">
                <span className="font-medium text-emerald-700 dark:text-emerald-400">Total</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">$128.00</span>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              <FileText className="w-4 h-4 mr-2" />
              View Invoices
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Invoice History */}
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
              <History className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Invoice History</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Download past invoices</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {[
              { date: 'Nov 27, 2025', amount: '$128.00', status: 'Paid' },
              { date: 'Oct 27, 2025', amount: '$99.00', status: 'Paid' },
              { date: 'Sep 27, 2025', amount: '$99.00', status: 'Paid' },
            ].map((invoice, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{invoice.date}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Monthly subscription</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-semibold text-gray-900 dark:text-white">{invoice.amount}</p>
                  <Badge className="bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {invoice.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


// ============================================================================
// NOTIFICATIONS SECTION
// ============================================================================

interface NotificationsSectionProps {
  onSave: () => void;
  prefersReducedMotion: boolean;
}

function NotificationsSection({ onSave, prefersReducedMotion }: NotificationsSectionProps) {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    digest: false,
    alerts: true,
    marketing: false,
    updates: true,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    onSave();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <SectionHeader
        icon={Bell}
        title="Notification Preferences"
        description="Choose how and when you want to be notified"
        color="yellow"
      />

      {/* Notification Categories */}
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Communication Channels</h3>
          <div className="space-y-4">
            {[
              { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email', icon: Mail, color: 'blue' },
              { key: 'push', label: 'Push Notifications', desc: 'Browser and mobile notifications', icon: Bell, color: 'purple' },
              { key: 'digest', label: 'Daily Digest', desc: 'Summary of daily activities', icon: Calendar, color: 'emerald' },
            ].map((item, index) => (
              <motion.div
                key={item.key}
                className="flex items-center justify-between p-5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 4 }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-${item.color}-100 dark:bg-${item.color}-500/20 flex items-center justify-center`}>
                    <item.icon className={`w-6 h-6 text-${item.color}-600 dark:text-${item.color}-400`} />
                  </div>
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">{item.label}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{item.desc}</p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={notifications[item.key as keyof typeof notifications]}
                  onChange={() => toggleNotification(item.key as keyof typeof notifications)}
                />
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alert Types */}
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Alert Types</h3>
          <div className="space-y-4">
            {[
              { key: 'alerts', label: 'Performance Alerts', desc: 'Notifications for significant changes', icon: TrendingUp, color: 'orange' },
              { key: 'marketing', label: 'Marketing Updates', desc: 'News about features and promotions', icon: Sparkles, color: 'pink' },
              { key: 'updates', label: 'Product Updates', desc: 'New features and improvements', icon: Zap, color: 'cyan' },
            ].map((item, index) => (
              <motion.div
                key={item.key}
                className="flex items-center justify-between p-5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                whileHover={{ x: 4 }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-${item.color}-100 dark:bg-${item.color}-500/20 flex items-center justify-center`}>
                    <item.icon className={`w-6 h-6 text-${item.color}-600 dark:text-${item.color}-400`} />
                  </div>
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">{item.label}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{item.desc}</p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={notifications[item.key as keyof typeof notifications]}
                  onChange={() => toggleNotification(item.key as keyof typeof notifications)}
                />
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Recent Notifications</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Your latest alerts</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-emerald-600">
              Mark all read
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {[
              { title: 'Post published successfully', desc: 'Your scheduled post went live on Twitter', time: '2 min ago', read: false, icon: CheckCircle, color: 'emerald' },
              { title: 'New follower milestone', desc: 'You reached 10K followers on Instagram!', time: '1 hour ago', read: false, icon: Star, color: 'yellow' },
              { title: 'AI content generated', desc: '5 new posts ready for review', time: '3 hours ago', read: true, icon: Sparkles, color: 'purple' },
              { title: 'Weekly report ready', desc: 'Your analytics report is available', time: '1 day ago', read: true, icon: BarChart3, color: 'blue' },
            ].map((notification, index) => (
              <motion.div
                key={index}
                className={`flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-500/5' : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`w-10 h-10 rounded-xl bg-${notification.color}-100 dark:bg-${notification.color}-500/20 flex items-center justify-center flex-shrink-0`}>
                  <notification.icon className={`w-5 h-5 text-${notification.color}-600 dark:text-${notification.color}-400`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</p>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{notification.desc}</p>
                  <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// API KEYS SECTION
// ============================================================================

interface APIKeysSectionProps {
  onSave: () => void;
  prefersReducedMotion: boolean;
}

function APIKeysSection({ onSave, prefersReducedMotion }: APIKeysSectionProps) {
  const [showKey, setShowKey] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <SectionHeader
        icon={Key}
        title="API Keys & Integrations"
        description="Manage your API access and developer integrations"
        color="orange"
      />

      {/* API Usage Overview */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-0 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Terminal className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">API Usage</h3>
                <p className="text-gray-400 text-sm">Current billing period</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {[
                { label: 'Requests', value: '45.2K', limit: '100K' },
                { label: 'Bandwidth', value: '2.1GB', limit: '10GB' },
                { label: 'Webhooks', value: '12', limit: '50' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-gray-400">of {stat.limit}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Keys List */}
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
                <Key className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">API Keys</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Manage your access tokens</p>
              </div>
            </div>
            <motion.button
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium shadow-lg shadow-orange-500/30"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSave}
            >
              <Key className="w-4 h-4" />
              Generate New Key
            </motion.button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {[
              { id: '1', name: 'Production API Key', key: 'sk_live_xxxxxxxxxxxxxxxxxxxxx', created: 'Nov 15, 2025', lastUsed: '2 hours ago', status: 'active' },
              { id: '2', name: 'Development Key', key: 'sk_test_xxxxxxxxxxxxxxxxxxxxx', created: 'Oct 20, 2025', lastUsed: '1 day ago', status: 'active' },
              { id: '3', name: 'Webhook Secret', key: 'whsec_xxxxxxxxxxxxxxxxxxxxx', created: 'Sep 5, 2025', lastUsed: '3 days ago', status: 'active' },
            ].map((apiKey, index) => (
              <motion.div
                key={apiKey.id}
                className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-white">{apiKey.name}</p>
                      <Badge className="bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 text-[10px]">
                        {apiKey.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Created {apiKey.created} • Last used {apiKey.lastUsed}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {copied === apiKey.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </motion.button>
                    <motion.button
                      onClick={() => setShowKey(showKey === apiKey.id ? null : apiKey.id)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showKey === apiKey.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </motion.button>
                    <motion.button
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 font-mono text-sm">
                  <Code className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400 truncate">
                    {showKey === apiKey.id ? apiKey.key : '••••••••••••••••••••••••••••••'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                <Webhook className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Webhooks</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Configure event notifications</p>
              </div>
            </div>
            <motion.button
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-sm font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Webhook className="w-4 h-4" />
              Add Webhook
            </motion.button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[
              { url: 'https://api.example.com/webhooks/posts', events: ['post.created', 'post.published'], status: 'active' },
              { url: 'https://api.example.com/webhooks/analytics', events: ['analytics.updated'], status: 'active' },
            ].map((webhook, index) => (
              <motion.div
                key={index}
                className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{webhook.url}</span>
                  </div>
                  <Badge className="bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 text-[10px]">
                    {webhook.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {webhook.events.map((event) => (
                    <span key={event} className="px-2 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400">
                      {event}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


// ============================================================================
// SHARED COMPONENTS
// ============================================================================

interface SectionHeaderProps {
  icon: any;
  title: string;
  description: string;
  color: string;
}

function SectionHeader({ icon: Icon, title, description, color }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-2">
      <motion.div
        className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-${color}-400 to-${color}-600 flex items-center justify-center shadow-lg shadow-${color}-500/30`}
        whileHover={{ scale: 1.05, rotate: 5 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <Icon className="w-6 h-6 text-white" />
      </motion.div>
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </div>
  );
}

interface InputFieldProps {
  label: string;
  icon: any;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  multiline?: boolean;
  rightElement?: React.ReactNode;
}

function InputField({ label, icon: Icon, type = 'text', defaultValue = '', placeholder, multiline, rightElement }: InputFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon className="w-5 h-5" />
        </div>
        {multiline ? (
          <textarea
            defaultValue={defaultValue}
            placeholder={placeholder}
            rows={3}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-none"
          />
        ) : (
          <input
            type={type}
            defaultValue={defaultValue}
            placeholder={placeholder}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
          />
        )}
        {rightElement && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
}

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: () => void;
}

function ToggleSwitch({ enabled, onChange }: ToggleSwitchProps) {
  return (
    <motion.button
      onClick={onChange}
      className={`relative w-14 h-8 rounded-full transition-colors ${
        enabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
      }`}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md"
        animate={{ left: enabled ? '1.75rem' : '0.25rem' }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </motion.button>
  );
}
