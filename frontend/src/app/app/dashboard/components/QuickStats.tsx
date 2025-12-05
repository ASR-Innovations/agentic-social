'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  FileText,
  Heart,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/lib/accessibility';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatNumber } from '../utils/formatters';

export interface QuickStatsProps {
  totalPosts: number;
  totalEngagement: number;
  aiRequests: number;
  loading?: boolean;
  className?: string;
}

/**
 * QuickStats Component
 * 
 * A compact stats summary card
 */
export function QuickStats({
  totalPosts,
  totalEngagement,
  aiRequests,
  loading = false,
  className,
}: QuickStatsProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const stats = [
    {
      icon: FileText,
      label: 'Total Posts',
      value: totalPosts,
    },
    {
      icon: Heart,
      label: 'Total Engagement',
      value: totalEngagement,
    },
    {
      icon: Sparkles,
      label: 'AI Requests',
      value: aiRequests,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.7, duration: 0.4 },
    },
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : 'hidden'}
      animate={prefersReducedMotion ? {} : 'visible'}
      variants={containerVariants}
      className={className}
    >
      <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
        <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800 relative">
          {/* Subtle gradient accent */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-transparent" />
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Quick Stats
            </h3>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                className="relative flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800/30 border border-gray-100/50 dark:border-gray-700/30 overflow-hidden group hover:border-emerald-200/50 dark:hover:border-emerald-500/20 hover:shadow-sm transition-all duration-300"
                initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={prefersReducedMotion ? {} : { x: 4 }}
              >
                {/* Hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-teal-500/5 transition-all duration-300" />
                
                <div className="relative flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white dark:bg-gray-700 border border-gray-200/50 dark:border-gray-600/50 flex items-center justify-center group-hover:border-emerald-200/50 dark:group-hover:border-emerald-500/30 transition-colors duration-300">
                    <Icon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300" />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    {stat.label}
                  </span>
                </div>
                <span className="relative text-sm font-bold text-gray-900 dark:text-white tabular-nums">
                  {loading ? '...' : formatNumber(stat.value)}
                </span>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default QuickStats;
