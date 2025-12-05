'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/lib/accessibility';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedCounter, abbreviateNumber } from '@/components/ui/animated-counter';
import { MetricCardSkeleton } from '@/components/ui/skeleton-loader';
import { formatPercentageChange } from '../utils/formatters';

export interface MetricData {
  id: string;
  label: string;
  value: number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  format?: 'number' | 'percentage' | 'currency' | 'abbreviated';
  onClick?: () => void;
}

export interface MetricCardProps {
  metric: MetricData;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  loading?: boolean;
  delay?: number;
  className?: string;
}

/**
 * MetricCard Component
 * 
 * Individual metric display card with:
 * - Animated counter
 * - Trend indicator
 * - Hover effects
 * - Multiple size variants
 */
export function MetricCard({
  metric,
  size = 'md',
  animated = true,
  loading = false,
  delay = 0,
  className,
}: MetricCardProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const Icon = metric.icon;

  // Size styles
  const sizeStyles = {
    sm: {
      padding: 'p-3 sm:p-4',
      iconSize: 'w-8 h-8',
      iconInner: 'w-4 h-4',
      valueSize: 'text-xl',
      labelSize: 'text-[10px]',
    },
    md: {
      padding: 'p-4 sm:p-5',
      iconSize: 'w-10 h-10',
      iconInner: 'w-5 h-5',
      valueSize: 'text-2xl',
      labelSize: 'text-xs',
    },
    lg: {
      padding: 'p-5 sm:p-6',
      iconSize: 'w-12 h-12',
      iconInner: 'w-6 h-6',
      valueSize: 'text-3xl',
      labelSize: 'text-sm',
    },
  };

  const styles = sizeStyles[size];

  // Trend icon and color
  const getTrendDisplay = () => {
    if (metric.change === undefined) return null;

    const trend = metric.trend || (metric.change >= 0.5 ? 'up' : metric.change <= -0.5 ? 'down' : 'neutral');
    
    const trendConfig = {
      up: {
        icon: TrendingUp,
        color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/20',
      },
      down: {
        icon: TrendingDown,
        color: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/20',
      },
      neutral: {
        icon: Minus,
        color: 'text-gray-500 bg-gray-100 dark:text-gray-400 dark:bg-gray-700/50',
      },
    };

    const config = trendConfig[trend];
    const TrendIcon = config.icon;

    return (
      <span className={cn(
        'text-[10px] font-medium px-2 py-1 rounded-lg flex items-center gap-1',
        config.color
      )}>
        <TrendIcon className="w-3 h-3" />
        {formatPercentageChange(metric.change)}
      </span>
    );
  };

  // Format value based on type
  const formatValue = (value: number): string => {
    switch (metric.format) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return `$${value.toFixed(2)}`;
      case 'abbreviated':
        return abbreviateNumber(value);
      default:
        return abbreviateNumber(value);
    }
  };

  if (loading) {
    return <MetricCardSkeleton className={className} />;
  }

  const cardContent = (
    <Card
      className={cn(
        'relative overflow-hidden',
        'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800',
        'shadow-sm hover:shadow-lg hover:shadow-emerald-500/5 hover:border-emerald-200/50 dark:hover:border-emerald-500/30',
        'transition-all duration-300 h-full group',
        metric.onClick && 'cursor-pointer',
        className
      )}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-transparent to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-teal-500/5 transition-all duration-500" />
      
      {/* Glow effect */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-400/0 group-hover:bg-emerald-400/10 rounded-full blur-3xl transition-all duration-500" />
      
      <CardContent className={cn(styles.padding, 'relative')}>
        <div className="flex items-start justify-between mb-3">
          <div className={cn(
            'rounded-xl flex items-center justify-center',
            'bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50',
            'text-gray-600 dark:text-gray-400',
            'group-hover:from-emerald-100 group-hover:to-emerald-50 group-hover:text-emerald-600',
            'dark:group-hover:from-emerald-500/20 dark:group-hover:to-emerald-500/10 dark:group-hover:text-emerald-400',
            'transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:shadow-emerald-500/10',
            styles.iconSize
          )}>
            <Icon className={cn(styles.iconInner, 'transition-transform duration-300 group-hover:scale-110')} />
          </div>
          {getTrendDisplay()}
        </div>

        <div className={cn('font-bold text-gray-900 dark:text-white tabular-nums tracking-tight', styles.valueSize)}>
          {animated ? (
            <AnimatedCounter
              value={metric.value}
              formatter={formatValue}
              delay={delay}
            />
          ) : (
            formatValue(metric.value)
          )}
        </div>

        <p className={cn('text-gray-500 dark:text-gray-400 mt-1 font-medium', styles.labelSize)}>
          {metric.label}
        </p>

        {metric.description && (
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
            {metric.description}
          </p>
        )}
        
        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/0 to-transparent group-hover:via-emerald-500/50 transition-all duration-500" />
      </CardContent>
    </Card>
  );

  // Wrap with motion if animated
  if (!prefersReducedMotion) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay / 1000, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        whileHover={{ y: -4 }}
        onClick={metric.onClick}
      >
        {cardContent}
      </motion.div>
    );
  }

  return (
    <div onClick={metric.onClick}>
      {cardContent}
    </div>
  );
}

export interface StatsGridProps {
  metrics: MetricData[];
  loading?: boolean;
  columns?: 2 | 3 | 4;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

/**
 * StatsGrid Component
 * 
 * Grid layout for displaying multiple metrics with:
 * - Responsive column layout
 * - Staggered animations
 * - Loading states
 */
export function StatsGrid({
  metrics,
  loading = false,
  columns = 4,
  size = 'md',
  animated = true,
  className,
}: StatsGridProps) {
  const columnStyles = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  };

  if (loading) {
    return (
      <div className={cn('grid gap-3 sm:gap-4', columnStyles[columns], className)}>
        {[...Array(columns)].map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid gap-3 sm:gap-4', columnStyles[columns], className)}>
      {metrics.map((metric, index) => (
        <MetricCard
          key={metric.id}
          metric={metric}
          size={size}
          animated={animated}
          delay={animated ? 100 + index * 50 : 0}
        />
      ))}
    </div>
  );
}

export default StatsGrid;
