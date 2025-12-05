'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/lib/accessibility';

export type SkeletonVariant = 
  | 'card' 
  | 'text' 
  | 'avatar' 
  | 'chart' 
  | 'metric'
  | 'button'
  | 'badge'
  | 'image';

export interface SkeletonLoaderProps {
  /** Type of skeleton to display */
  variant?: SkeletonVariant;
  /** Number of skeleton items to render */
  count?: number;
  /** Additional CSS classes */
  className?: string;
  /** Custom width */
  width?: string | number;
  /** Custom height */
  height?: string | number;
  /** Whether to show shimmer animation */
  animate?: boolean;
}

/**
 * SkeletonLoader Component
 * 
 * Loading placeholder with shimmer animation featuring:
 * - Multiple variants for different content types
 * - Configurable count for lists
 * - Shimmer animation with reduced motion support
 * - Custom sizing options
 */
export function SkeletonLoader({
  variant = 'text',
  count = 1,
  className,
  width,
  height,
  animate = true,
}: SkeletonLoaderProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const shouldAnimate = animate && !prefersReducedMotion;

  const baseClasses = cn(
    'bg-gray-200 dark:bg-gray-700 rounded',
    shouldAnimate && 'animate-pulse'
  );

  const renderSkeleton = (index: number) => {
    const key = `skeleton-${variant}-${index}`;

    switch (variant) {
      case 'card':
        return (
          <div
            key={key}
            className={cn(
              'rounded-xl border border-gray-100 dark:border-gray-800 p-5',
              className
            )}
            style={{ width, height }}
          >
            <div className="flex items-start gap-4">
              <div className={cn(baseClasses, 'w-10 h-10 rounded-xl')} />
              <div className="flex-1 space-y-2">
                <div className={cn(baseClasses, 'h-4 w-3/4')} />
                <div className={cn(baseClasses, 'h-3 w-1/2')} />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className={cn(baseClasses, 'h-3 w-full')} />
              <div className={cn(baseClasses, 'h-3 w-5/6')} />
            </div>
          </div>
        );

      case 'text':
        return (
          <div
            key={key}
            className={cn(baseClasses, 'h-4', className)}
            style={{ 
              width: width || `${Math.random() * 40 + 60}%`,
              height 
            }}
          />
        );

      case 'avatar':
        return (
          <div
            key={key}
            className={cn(baseClasses, 'rounded-full', className)}
            style={{ 
              width: width || 40, 
              height: height || 40 
            }}
          />
        );

      case 'chart':
        return (
          <div
            key={key}
            className={cn(
              'rounded-xl border border-gray-100 dark:border-gray-800 p-5',
              className
            )}
            style={{ width, height: height || 200 }}
          >
            <div className="flex items-end justify-between h-full gap-2">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className={cn(baseClasses, 'flex-1 rounded-t')}
                  style={{ height: `${Math.random() * 60 + 20}%` }}
                />
              ))}
            </div>
          </div>
        );

      case 'metric':
        return (
          <div
            key={key}
            className={cn(
              'rounded-xl border border-gray-100 dark:border-gray-800 p-5',
              className
            )}
            style={{ width, height }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={cn(baseClasses, 'w-10 h-10 rounded-xl')} />
              <div className={cn(baseClasses, 'w-16 h-5 rounded-full')} />
            </div>
            <div className={cn(baseClasses, 'h-8 w-24 mb-2')} />
            <div className={cn(baseClasses, 'h-3 w-20')} />
          </div>
        );

      case 'button':
        return (
          <div
            key={key}
            className={cn(baseClasses, 'rounded-lg', className)}
            style={{ 
              width: width || 100, 
              height: height || 36 
            }}
          />
        );

      case 'badge':
        return (
          <div
            key={key}
            className={cn(baseClasses, 'rounded-full', className)}
            style={{ 
              width: width || 60, 
              height: height || 20 
            }}
          />
        );

      case 'image':
        return (
          <div
            key={key}
            className={cn(baseClasses, 'rounded-xl', className)}
            style={{ 
              width: width || '100%', 
              height: height || 200 
            }}
          />
        );

      default:
        return (
          <div
            key={key}
            className={cn(baseClasses, className)}
            style={{ width, height }}
          />
        );
    }
  };

  if (count === 1) {
    return renderSkeleton(0);
  }

  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, index) => renderSkeleton(index))}
    </div>
  );
}

/**
 * Skeleton wrapper for conditional loading
 */
export interface SkeletonWrapperProps {
  loading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
}

export function SkeletonWrapper({
  loading,
  skeleton,
  children,
}: SkeletonWrapperProps) {
  if (loading) {
    return <>{skeleton}</>;
  }
  return <>{children}</>;
}

// Pre-configured skeleton components
export function MetricCardSkeleton({ className }: { className?: string }) {
  return <SkeletonLoader variant="metric" className={className} />;
}

export function CardSkeleton({ className }: { className?: string }) {
  return <SkeletonLoader variant="card" className={className} />;
}

export function ChartSkeleton({ 
  className, 
  height = 200 
}: { 
  className?: string; 
  height?: number;
}) {
  return <SkeletonLoader variant="chart" className={className} height={height} />;
}

export function TextSkeleton({ 
  lines = 3, 
  className 
}: { 
  lines?: number; 
  className?: string;
}) {
  return <SkeletonLoader variant="text" count={lines} className={className} />;
}

export function AvatarSkeleton({ 
  size = 40, 
  className 
}: { 
  size?: number; 
  className?: string;
}) {
  return (
    <SkeletonLoader 
      variant="avatar" 
      width={size} 
      height={size} 
      className={className} 
    />
  );
}

/**
 * Dashboard-specific skeleton layouts
 */
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {[...Array(4)].map((_, i) => (
        <MetricCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DashboardPlatformsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
        >
          <SkeletonLoader variant="avatar" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <SkeletonLoader variant="text" width="60%" />
            <SkeletonLoader variant="text" width="40%" height={12} />
          </div>
          <SkeletonLoader variant="badge" />
        </div>
      ))}
    </div>
  );
}

export function DashboardPostsSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-3 p-3 rounded-xl"
        >
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <SkeletonLoader variant="badge" width={70} />
              <SkeletonLoader variant="text" width={80} height={12} />
            </div>
            <SkeletonLoader variant="text" width="80%" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardAgentsSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-xl"
        >
          <SkeletonLoader variant="avatar" width={40} height={40} />
          <div className="flex-1 space-y-1">
            <SkeletonLoader variant="text" width="50%" height={14} />
            <SkeletonLoader variant="text" width="30%" height={10} />
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
      ))}
    </div>
  );
}
