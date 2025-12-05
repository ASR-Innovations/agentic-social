'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Calendar,
  BarChart3,
  Sparkles,
  Bell,
  Globe,
  Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/lib/accessibility';
import { getTimeBasedGreeting, formatDate } from '../utils/formatters';
import { Badge } from '@/components/ui/badge';

export interface QuickAction {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  primary?: boolean;
}

export interface WelcomeHeroProps {
  /** User's first name */
  userName?: string;
  /** Tenant plan tier */
  planTier?: string;
  /** Number of unread notifications */
  notificationCount?: number;
  /** Quick action buttons */
  quickActions?: QuickAction[];
  /** Additional CSS classes */
  className?: string;
}

// Default quick actions
const defaultQuickActions: QuickAction[] = [
  { id: 'create', icon: Plus, label: 'Create Post', href: '/app/content', primary: true },
  { id: 'schedule', icon: Calendar, label: 'Schedule', href: '/app/content?view=calendar' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics', href: '/app/analytics' },
  { id: 'ai', icon: Sparkles, label: 'AI Generate', href: '/app/ai-hub' },
];

// Plan tier display names
const planTierNames: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise',
};

/**
 * WelcomeHero Component
 * 
 * A stunning hero section for the dashboard featuring:
 * - Time-based personalized greeting
 * - Gradient background with glassmorphism
 * - Animated background effects
 * - Quick action buttons
 * - Plan tier badge
 * - Notification indicator
 */
export function WelcomeHero({
  userName = 'User',
  planTier,
  notificationCount = 0,
  quickActions = defaultQuickActions,
  className,
}: WelcomeHeroProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const greeting = getTimeBasedGreeting();
  const currentDate = formatDate(new Date());

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const buttonVariants = {
    hover: prefersReducedMotion ? {} : {
      scale: 1.02,
      transition: { duration: 0.2 },
    },
    tap: prefersReducedMotion ? {} : {
      scale: 0.98,
      transition: { duration: 0.1 },
    },
  };

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-gray-900 p-6 md:p-8',
        className
      )}
      initial={prefersReducedMotion ? {} : 'hidden'}
      animate={prefersReducedMotion ? {} : 'visible'}
      variants={containerVariants}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <motion.div
          className="absolute top-0 right-0 w-80 h-80 bg-emerald-500 rounded-full blur-3xl opacity-30"
          style={{ transform: 'translate(30%, -30%)' }}
          animate={prefersReducedMotion ? {} : {
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600 rounded-full blur-3xl opacity-30"
          style={{ transform: 'translate(-30%, 30%)' }}
          animate={prefersReducedMotion ? {} : {
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.35, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-48 h-48 bg-blue-500 rounded-full blur-3xl opacity-20"
          style={{ transform: 'translate(-50%, -50%)' }}
          animate={prefersReducedMotion ? {} : {
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.25, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left side - Greeting */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-gray-400 text-sm">{greeting}</span>
            <span className="text-xl">👋</span>
            
            {/* Plan tier badge */}
            {planTier && (
              <Badge 
                className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-[10px] h-5 px-2"
              >
                <Crown className="w-3 h-3 mr-1" />
                {planTierNames[planTier] || planTier}
              </Badge>
            )}
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Welcome back, {userName}
          </h1>
          
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <Globe className="w-4 h-4" />
            {currentDate}
          </p>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          {/* Notification bell */}
          {notificationCount > 0 && (
            <motion.button
              className="relative p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 border border-white/10 transition-colors"
              whileHover={buttonVariants.hover}
              whileTap={buttonVariants.tap}
              aria-label={`${notificationCount} notifications`}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            </motion.button>
          )}

          {/* Quick action buttons */}
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <motion.a
                key={action.id}
                href={action.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                  action.primary
                    ? 'bg-white text-gray-900 shadow-lg hover:shadow-xl'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                )}
                whileHover={buttonVariants.hover}
                whileTap={buttonVariants.tap}
              >
                <action.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{action.label}</span>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default WelcomeHero;
