'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Bot,
  ArrowUpRight,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/lib/accessibility';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnimatedCounter, formatCurrency } from '@/components/ui/animated-counter';
import { calculateBudgetPercentage, isBudgetWarning } from '../utils/calculations';

export interface AIUsageData {
  totalRequests: number;
  tokensUsed: number;
  totalCost: number;
  budgetLimit: number;
  budgetUsedPercentage?: number;
  requestsByType?: Record<string, number>;
}

export interface AIInsightsProps {
  usage: AIUsageData | null;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * AIInsights Component
 * 
 * A dark-themed card displaying AI usage statistics featuring:
 * - Total requests and cost
 * - Budget progress bar
 * - Warning indicator when budget > 80%
 * - Animated counters
 * - Glow effects
 */
export function AIInsights({
  usage,
  loading = false,
  onClick,
  className,
}: AIInsightsProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  // Calculate budget percentage
  const budgetPercentage = usage
    ? usage.budgetUsedPercentage ?? calculateBudgetPercentage(usage.totalCost, usage.budgetLimit)
    : 0;
  
  const showWarning = isBudgetWarning(budgetPercentage);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.5, duration: 0.4 },
    },
  };

  // Loading state
  if (loading) {
    return (
      <div className={cn(
        'rounded-2xl bg-gray-900 p-5 animate-pulse',
        className
      )}>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gray-800" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-800 rounded w-24" />
            <div className="h-3 bg-gray-800 rounded w-full" />
          </div>
        </div>
        <div className="h-10 bg-gray-800 rounded-xl" />
      </div>
    );
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : 'hidden'}
      animate={prefersReducedMotion ? {} : 'visible'}
      variants={containerVariants}
      className={className}
    >
      <div
        className={cn(
          'relative rounded-2xl bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white overflow-hidden',
          'border border-gray-700/50',
          'shadow-xl shadow-emerald-500/5',
          onClick && 'cursor-pointer group'
        )}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        {/* Enhanced Glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full blur-3xl opacity-20 transform translate-x-1/3 -translate-y-1/3"
            animate={prefersReducedMotion ? {} : {
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div 
            className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full blur-3xl opacity-15 transform -translate-x-1/3 translate-y-1/3"
            animate={prefersReducedMotion ? {} : {
              scale: [1, 1.15, 1],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
          {/* Animated grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '30px 30px',
            }}
          />
        </div>

        <div className="relative p-5">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-bold">AI Insight</h4>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-[10px] h-5 px-2 font-bold">
                  {usage ? 'Active' : 'New'}
                </Badge>
                {showWarning && (
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-400/30 text-[10px] h-5 px-2 font-bold">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Budget Alert
                  </Badge>
                )}
              </div>
              
              {usage ? (
                <p className="text-xs text-gray-300 leading-relaxed">
                  You've used{' '}
                  <span className="font-bold text-emerald-400">
                    <AnimatedCounter
                      value={usage.totalCost}
                      prefix="$"
                      decimals={2}
                      duration={1500}
                    />
                  </span>{' '}
                  of AI credits this month with{' '}
                  <span className="font-bold text-emerald-400">
                    <AnimatedCounter
                      value={usage.totalRequests}
                      duration={1500}
                    />
                  </span>{' '}
                  requests.
                </p>
              ) : (
                <p className="text-xs text-gray-300 leading-relaxed">
                  Your AI agents are ready to help. Start creating content with AI-powered assistance.
                </p>
              )}
            </div>
          </div>

          {/* Budget Progress Bar */}
          {usage && usage.budgetLimit > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-[10px] mb-1.5">
                <span className="text-gray-400">Budget Usage</span>
                <span className={cn(
                  'font-medium',
                  showWarning ? 'text-amber-400' : 'text-gray-300'
                )}>
                  {budgetPercentage}% of ${usage.budgetLimit}
                </span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className={cn(
                    'h-full rounded-full',
                    showWarning
                      ? 'bg-gradient-to-r from-amber-500 to-red-500'
                      : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                  transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}

          {/* Quick Stats */}
          {usage && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/5 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] text-gray-400">Requests</span>
                </div>
                <p className="text-lg font-bold text-white">
                  <AnimatedCounter value={usage.totalRequests} duration={1500} />
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] text-gray-400">Tokens</span>
                </div>
                <p className="text-lg font-bold text-white">
                  <AnimatedCounter
                    value={usage.tokensUsed}
                    formatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(Math.round(v))}
                    duration={1500}
                  />
                </p>
              </div>
            </div>
          )}

          {/* CTA Button */}
          <Button
            className={cn(
              'w-full h-10 text-xs font-bold rounded-xl group/btn',
              'bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 text-white',
              'border border-white/20 hover:border-emerald-400/50',
              'shadow-lg shadow-black/10 hover:shadow-emerald-500/10',
              'transition-all duration-300'
            )}
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            <Bot className="w-4 h-4 mr-2 group-hover/btn:text-emerald-400 transition-colors" />
            Manage AI Agents
            <ArrowUpRight className="w-3.5 h-3.5 ml-2 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default AIInsights;
