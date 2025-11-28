/**
 * MetricCard Component
 * Displays key metrics with gradient icons and trend indicators
 */

import * as React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Card } from './card';
import { Badge } from './badge';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/lib/accessibility';

export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  gradient: string;
  description?: string;
  className?: string;
  delay?: number;
}

export function MetricCard({
  title,
  value,
  change,
  trend = 'neutral',
  icon,
  gradient,
  description,
  className,
  delay = 0,
}: MetricCardProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const trendConfig = {
    up: {
      icon: ArrowUpRight,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200',
    },
    down: {
      icon: ArrowDownRight,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-200',
    },
    neutral: {
      icon: Minus,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-200',
    },
  };

  const TrendIcon = trendConfig[trend].icon;

  const animationProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, delay, ease: 'easeOut' },
      };

  return (
    <motion.div {...animationProps}>
      <Card
        variant="glass"
        hover
        className={cn('overflow-hidden', className)}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm text-gray-600 font-medium mb-1">
                {title}
              </p>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {value}
              </p>
              {change && (
                <Badge
                  variant={trend === 'up' ? 'success' : trend === 'down' ? 'error' : 'default'}
                  size="sm"
                  icon={<TrendIcon className="w-3 h-3" />}
                >
                  {change}
                </Badge>
              )}
            </div>
            <div
              className={cn(
                'w-14 h-14 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r',
                gradient
              )}
            >
              <div className="text-white">{icon}</div>
            </div>
          </div>
          {description && (
            <p className="text-xs text-gray-500 mt-2">{description}</p>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
