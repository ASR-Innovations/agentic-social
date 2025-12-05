'use client';

import { useRouter } from 'next/navigation';
import { 
  Eye, 
  Heart, 
  Globe, 
  Bot, 
  Sparkles, 
  TrendingUp, 
  Zap, 
  Activity,
  Plus,
  Calendar,
  BarChart3,
  Bell,
  Crown,
  Instagram,
  Linkedin,
  Facebook,
  Youtube,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/accessibility';
import { useAuthStore } from '@/store/auth';
import { Badge } from '@/components/ui/badge';
import { getTimeBasedGreeting, formatDate } from './utils/formatters';

// Dashboard components
import {
  WelcomeHero,
  StatsGrid,
  ConnectedPlatforms,
  AIAgentsStatus,
  RecentPosts,
  AIInsights,
  QuickStats,
  type MetricData,
} from './components';

// Hooks
import { useDashboardData } from './hooks/useDashboardData';

/**
 * Dashboard Page
 * 
 * The main command center for the Agentic Social Media Platform featuring:
 * - Stunning animated hero with glassmorphism effects
 * - Key performance metrics with animated counters
 * - Connected social platforms overview
 * - AI agents status and statistics
 * - Recent posts with status indicators
 * - AI usage insights with budget tracking
 * - Quick stats summary
 * - Futuristic visual effects and animations
 * 
 * Design inspired by Buffer, Hootsuite, Sprout Social, Later, and Planable
 * with a futuristic, minimalistic glassmorphism aesthetic.
 */
export default function DashboardPage() {
  const router = useRouter();
  const prefersReducedMotion = usePrefersReducedMotion();
  const { user, tenant } = useAuthStore();

  // Fetch all dashboard data
  const {
    analytics,
    socialAccounts,
    agents,
    posts,
    aiUsage,
    loading,
    agentStatistics,
    platformMetrics,
    refresh,
    refreshSection,
  } = useDashboardData();

  // Build metrics for StatsGrid
  const metrics: MetricData[] = [
    {
      id: 'reach',
      label: 'Total Reach',
      value: analytics?.totalImpressions || 0,
      change: 12.3,
      trend: 'up',
      icon: Eye,
      description: 'Impressions across platforms',
      format: 'abbreviated',
    },
    {
      id: 'engagement',
      label: 'Engagement Rate',
      value: analytics?.averageEngagementRate || 0,
      change: 2.4,
      trend: 'up',
      icon: Heart,
      description: 'Avg engagement',
      format: 'percentage',
    },
    {
      id: 'platforms',
      label: 'Connected Platforms',
      value: socialAccounts.length,
      change: socialAccounts.length > 0 ? 0 : undefined,
      trend: 'neutral',
      icon: Globe,
      description: 'Social accounts',
      format: 'number',
    },
    {
      id: 'agents',
      label: 'Active Agents',
      value: agentStatistics.activeAgents,
      change: agentStatistics.totalAgents > 0 ? 0 : undefined,
      trend: 'neutral',
      icon: Bot,
      description: `${agentStatistics.totalAgents} total`,
      format: 'number',
    },
  ];

  // Navigation handlers
  const handleNavigate = (path: string) => {
    router.push(path);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Animated Background Effects */}
      <DashboardBackground prefersReducedMotion={prefersReducedMotion} />
      
      {/* Main Content */}
      <motion.div
        className="relative z-10 max-w-7xl mx-auto p-4 sm:p-5 md:p-6 lg:p-8 space-y-6 md:space-y-8"
        initial={prefersReducedMotion ? {} : "hidden"}
        animate={prefersReducedMotion ? {} : "visible"}
        variants={containerVariants}
      >
        {/* Enhanced Welcome Hero */}
        <motion.div variants={itemVariants}>
          <EnhancedWelcomeHero
            userName={user?.firstName || 'User'}
            planTier={tenant?.planTier}
            notificationCount={0}
            prefersReducedMotion={prefersReducedMotion}
          />
        </motion.div>

        {/* Stats Grid with Enhanced Styling */}
        <motion.div variants={itemVariants}>
          <StatsGrid
            metrics={metrics}
            loading={loading}
            animated={!prefersReducedMotion}
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - 2/3 width */}
          <motion.div 
            className="lg:col-span-2 space-y-4 sm:space-y-6"
            variants={itemVariants}
          >
            {/* Connected Platforms */}
            <ConnectedPlatforms
              accounts={socialAccounts.map(account => ({
                ...account,
                status: account.status || 'active',
              }))}
              loading={loading}
              onManageClick={() => handleNavigate('/app/settings')}
              onAccountClick={(id) => handleNavigate(`/app/settings?account=${id}`)}
              onRefresh={() => refreshSection('accounts')}
            />

            {/* Recent Posts */}
            <RecentPosts
              posts={posts}
              loading={loading}
              onPostClick={(id) => handleNavigate(`/app/content?post=${id}`)}
              onViewAll={() => handleNavigate('/app/content')}
              onCreatePost={() => handleNavigate('/app/content?action=create')}
            />
          </motion.div>

          {/* Right Column - 1/3 width */}
          <motion.div 
            className="space-y-4 sm:space-y-6"
            variants={itemVariants}
          >
            {/* AI Insights */}
            <AIInsights
              usage={aiUsage}
              loading={loading}
              onClick={() => handleNavigate('/app/ai-hub')}
            />

            {/* AI Agents Status */}
            <AIAgentsStatus
              agents={agents}
              statistics={agentStatistics}
              loading={loading}
              onAgentClick={(id) => handleNavigate(`/app/ai-hub?agent=${id}`)}
              onCreateAgent={() => handleNavigate('/app/ai-hub?action=create')}
              onViewAll={() => handleNavigate('/app/ai-hub')}
            />

            {/* Quick Stats */}
            <QuickStats
              totalPosts={analytics?.totalPosts || posts.length}
              totalEngagement={analytics?.totalEngagement || 0}
              aiRequests={aiUsage?.totalRequests || 0}
              loading={loading}
            />
          </motion.div>
        </div>

        {/* Platform Performance Section */}
        {platformMetrics.length > 0 && (
          <motion.div variants={itemVariants}>
            <PlatformPerformanceSection
              platforms={platformMetrics}
              loading={loading}
              onPlatformClick={(platform) => handleNavigate(`/app/analytics?platform=${platform}`)}
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}


/**
 * Dashboard Background Component
 * 
 * Animated background with floating orbs and grid pattern
 */
function DashboardBackground({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient Mesh Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 via-transparent to-blue-50/20 dark:from-emerald-950/20 dark:to-blue-950/10" />
      
      {/* Animated Floating Orbs */}
      {!prefersReducedMotion && (
        <>
          <motion.div
            className="absolute top-20 right-[10%] w-72 h-72 bg-emerald-400/10 dark:bg-emerald-500/5 rounded-full blur-3xl"
            animate={{
              y: [0, -30, 0],
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-1/2 left-[5%] w-96 h-96 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl"
            animate={{
              y: [0, 40, 0],
              scale: [1, 1.15, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
          <motion.div
            className="absolute bottom-20 right-[20%] w-64 h-64 bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl"
            animate={{
              y: [0, -20, 0],
              x: [0, 20, 0],
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.35, 0.2],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4,
            }}
          />
        </>
      )}
      
      {/* Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(16, 185, 129, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* Radial Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-white/50 dark:to-gray-950/50" />
    </div>
  );
}

/**
 * Enhanced Welcome Hero Component
 * 
 * Stunning hero section with advanced animations and effects
 */

interface EnhancedWelcomeHeroProps {
  userName: string;
  planTier?: string;
  notificationCount: number;
  prefersReducedMotion: boolean;
}

const planTierNames: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise',
};

const quickActions = [
  { id: 'create', icon: Plus, label: 'Create Post', href: '/app/content', primary: true },
  { id: 'schedule', icon: Calendar, label: 'Schedule', href: '/app/content?view=calendar' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics', href: '/app/analytics' },
  { id: 'ai', icon: Sparkles, label: 'AI Generate', href: '/app/ai-hub' },
];

function EnhancedWelcomeHero({
  userName,
  planTier,
  notificationCount,
  prefersReducedMotion,
}: EnhancedWelcomeHeroProps) {
  const greeting = getTimeBasedGreeting();
  const currentDate = formatDate(new Date());

  return (
    <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl">
      {/* Main Hero Container */}
      <div className="relative bg-gray-900 p-6 md:p-8 lg:p-10">
        {/* Animated Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Primary Gradient Orb */}
          {!prefersReducedMotion ? (
            <>
              <motion.div
                className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-emerald-500 via-emerald-400 to-teal-500 rounded-full blur-3xl"
                style={{ transform: 'translate(30%, -40%)' }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.25, 0.35, 0.25],
                  rotate: [0, 10, 0],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 rounded-full blur-3xl"
                style={{ transform: 'translate(-30%, 40%)' }}
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.2, 0.3, 0.2],
                  rotate: [0, -10, 0],
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
              />
              <motion.div
                className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full blur-3xl"
                style={{ transform: 'translate(-50%, -50%)' }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.15, 0.25, 0.15],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2,
                }}
              />
            </>
          ) : (
            <>
              <div
                className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-emerald-500 via-emerald-400 to-teal-500 rounded-full blur-3xl opacity-25"
                style={{ transform: 'translate(30%, -40%)' }}
              />
              <div
                className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 rounded-full blur-3xl opacity-20"
                style={{ transform: 'translate(-30%, 40%)' }}
              />
            </>
          )}
          
          {/* Animated Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />
          
          {/* Floating Particles */}
          {!prefersReducedMotion && (
            <div className="absolute inset-0">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white/30 rounded-full"
                  style={{
                    left: `${15 + i * 15}%`,
                    top: `${20 + (i % 3) * 25}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    opacity: [0.3, 0.7, 0.3],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: 4 + i,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.5,
                  }}
                />
              ))}
            </div>
          )}
          
          {/* Shine Effect */}
          {!prefersReducedMotion && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                repeatDelay: 3,
              }}
            />
          )}
        </div>

        {/* Content */}
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left side - Greeting */}
          <div className="flex-1">
            <motion.div 
              className="flex flex-wrap items-center gap-3 mb-3"
              initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-gray-400 text-sm font-medium">{greeting}</span>
              <motion.span 
                className="text-2xl"
                animate={prefersReducedMotion ? {} : { 
                  rotate: [0, 14, -8, 14, -4, 10, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
              >
                👋
              </motion.span>
              
              {/* Plan tier badge */}
              {planTier && (
                <Badge 
                  className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-[10px] h-5 px-2 font-semibold backdrop-blur-sm"
                >
                  <Crown className="w-3 h-3 mr-1" />
                  {planTierNames[planTier] || planTier}
                </Badge>
              )}
            </motion.div>
            
            <motion.h1 
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 tracking-tight"
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                {userName}
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-gray-400 text-sm flex items-center gap-2"
              initial={prefersReducedMotion ? {} : { opacity: 0 }}
              animate={prefersReducedMotion ? {} : { opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Globe className="w-4 h-4" />
              {currentDate}
              <span className="mx-2 text-gray-600">•</span>
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">All systems operational</span>
              </span>
            </motion.p>
          </div>

          {/* Right side - Actions */}
          <motion.div 
            className="flex items-center gap-3"
            initial={prefersReducedMotion ? {} : { opacity: 0, x: 20 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            {/* Notification bell */}
            {notificationCount > 0 && (
              <motion.button
                className="relative p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 border border-white/10 transition-all backdrop-blur-sm"
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                aria-label={`${notificationCount} notifications`}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              </motion.button>
            )}

            {/* Quick action buttons */}
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <motion.a
                  key={action.id}
                  href={action.href}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${action.primary
                      ? 'bg-white text-gray-900 shadow-lg shadow-white/20 hover:shadow-xl hover:shadow-white/30'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/10 backdrop-blur-sm'
                    }
                  `}
                  whileHover={prefersReducedMotion ? {} : { scale: 1.02, y: -2 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <action.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{action.label}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Stats Bar */}
        <motion.div 
          className="relative mt-6 pt-6 border-t border-white/10"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Posts Today', value: '12', icon: Zap, color: 'emerald' },
              { label: 'Engagement', value: '+24%', icon: TrendingUp, color: 'cyan' },
              { label: 'AI Credits', value: '847', icon: Sparkles, color: 'purple' },
              { label: 'Active Agents', value: '5', icon: Bot, color: 'blue' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm"
                whileHover={prefersReducedMotion ? {} : { scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
                initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
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
        </motion.div>
      </div>
    </div>
  );
}


/**
 * Platform Performance Section
 * 
 * Displays per-platform analytics breakdown with enhanced styling
 */
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { XIcon } from '@/components/icons/XIcon';
import { formatNumber, formatPlatformName } from './utils/formatters';
import type { PlatformMetrics } from './utils/calculations';

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  twitter: XIcon,
  instagram: Instagram,
  linkedin: Linkedin,
  facebook: Facebook,
  youtube: Youtube,
};

const platformColors: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  twitter: { 
    bg: 'bg-gray-100 dark:bg-gray-800', 
    text: 'text-gray-900 dark:text-white',
    border: 'border-gray-200 dark:border-gray-700',
    glow: 'hover:shadow-gray-500/10'
  },
  instagram: { 
    bg: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20', 
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
    glow: 'hover:shadow-purple-500/10'
  },
  linkedin: { 
    bg: 'bg-blue-50 dark:bg-blue-900/20', 
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    glow: 'hover:shadow-blue-500/10'
  },
  facebook: { 
    bg: 'bg-blue-50 dark:bg-blue-900/20', 
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    glow: 'hover:shadow-blue-500/10'
  },
  youtube: { 
    bg: 'bg-red-50 dark:bg-red-900/20', 
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
    glow: 'hover:shadow-red-500/10'
  },
};

function PlatformPerformanceSection({
  platforms,
  loading,
  onPlatformClick,
}: {
  platforms: PlatformMetrics[];
  loading: boolean;
  onPlatformClick: (platform: string) => void;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.4 }}
    >
      <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        {/* Header with gradient accent */}
        <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-blue-500/5" />
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Platform Performance
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Engagement breakdown by platform
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {platforms.map((platform, index) => {
              const PlatformIcon = platformIcons[platform.platform.toLowerCase()] || Globe;
              const colors = platformColors[platform.platform.toLowerCase()] || platformColors.twitter;
              
              return (
                <motion.div
                  key={platform.platform}
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 10, scale: 0.95 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  whileHover={prefersReducedMotion ? {} : { 
                    y: -4, 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                  className={`
                    relative p-4 rounded-xl border cursor-pointer
                    bg-gray-50 dark:bg-gray-800/50 
                    border-gray-100 dark:border-gray-700/50 
                    hover:border-gray-200 dark:hover:border-gray-600 
                    hover:shadow-lg ${colors.glow}
                    transition-all duration-300 group overflow-hidden
                  `}
                  onClick={() => onPlatformClick(platform.platform)}
                >
                  {/* Subtle gradient overlay on hover */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${colors.bg}`} />
                  
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                        <PlatformIcon className={`w-5 h-5 ${colors.text}`} />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatPlatformName(platform.platform)}
                        </span>
                        {platform.isTopPerformer && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 1 + index * 0.1, type: "spring" }}
                          >
                            <Badge className="ml-2 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 text-[9px] h-5 px-1.5">
                              <Sparkles className="w-3 h-3 mr-0.5" />
                              Top
                            </Badge>
                          </motion.div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Impressions</span>
                        <span className="font-semibold text-gray-900 dark:text-white tabular-nums">
                          {formatNumber(platform.impressions)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Engagement</span>
                        <span className="font-semibold text-gray-900 dark:text-white tabular-nums">
                          {formatNumber(platform.engagement)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Posts</span>
                        <span className="font-semibold text-gray-900 dark:text-white tabular-nums">
                          {platform.postCount}
                        </span>
                      </div>
                      
                      {/* Mini progress bar for engagement rate */}
                      <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-700/50">
                        <div className="flex justify-between items-center text-[10px] mb-1">
                          <span className="text-gray-400">Engagement Rate</span>
                          <span className={`font-bold ${platform.isTopPerformer ? 'text-emerald-500' : 'text-gray-600 dark:text-gray-300'}`}>
                            {((platform.engagement / Math.max(platform.impressions, 1)) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${platform.isTopPerformer ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gray-400 dark:bg-gray-500'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((platform.engagement / Math.max(platform.impressions, 1)) * 100 * 10, 100)}%` }}
                            transition={{ duration: 1, delay: 1 + index * 0.1, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
