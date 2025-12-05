'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/lib/accessibility';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Pause,
  Circle,
} from 'lucide-react';

export type StatusType = 
  | 'active' 
  | 'inactive' 
  | 'warning' 
  | 'error' 
  | 'pending'
  | 'published'
  | 'scheduled'
  | 'draft'
  | 'failed'
  | 'cancelled';

export interface StatusBadgeProps {
  /** Status type determining color and icon */
  status: StatusType;
  /** Optional custom label (defaults to status name) */
  label?: string;
  /** Whether to show pulsing animation for active states */
  pulsing?: boolean;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Whether to show the icon */
  showIcon?: boolean;
  /** Whether to show only the dot indicator */
  dotOnly?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// Status configuration mapping
const statusConfig: Record<StatusType, {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  dotColor: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  active: {
    label: 'Active',
    bgColor: 'bg-emerald-50 dark:bg-emerald-500/20',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    borderColor: 'border-emerald-200 dark:border-emerald-500/30',
    dotColor: 'bg-emerald-500',
    icon: CheckCircle,
  },
  inactive: {
    label: 'Inactive',
    bgColor: 'bg-gray-100 dark:bg-gray-700/50',
    textColor: 'text-gray-600 dark:text-gray-400',
    borderColor: 'border-gray-200 dark:border-gray-600/50',
    dotColor: 'bg-gray-400',
    icon: Pause,
  },
  warning: {
    label: 'Needs Attention',
    bgColor: 'bg-amber-50 dark:bg-amber-500/20',
    textColor: 'text-amber-700 dark:text-amber-300',
    borderColor: 'border-amber-200 dark:border-amber-500/30',
    dotColor: 'bg-amber-500',
    icon: AlertTriangle,
  },
  error: {
    label: 'Error',
    bgColor: 'bg-red-50 dark:bg-red-500/20',
    textColor: 'text-red-700 dark:text-red-300',
    borderColor: 'border-red-200 dark:border-red-500/30',
    dotColor: 'bg-red-500',
    icon: XCircle,
  },
  pending: {
    label: 'Pending',
    bgColor: 'bg-blue-50 dark:bg-blue-500/20',
    textColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-200 dark:border-blue-500/30',
    dotColor: 'bg-blue-500',
    icon: Clock,
  },
  published: {
    label: 'Published',
    bgColor: 'bg-emerald-50 dark:bg-emerald-500/20',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    borderColor: 'border-emerald-200 dark:border-emerald-500/30',
    dotColor: 'bg-emerald-500',
    icon: CheckCircle,
  },
  scheduled: {
    label: 'Scheduled',
    bgColor: 'bg-blue-50 dark:bg-blue-500/20',
    textColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-200 dark:border-blue-500/30',
    dotColor: 'bg-blue-500',
    icon: Clock,
  },
  draft: {
    label: 'Draft',
    bgColor: 'bg-gray-100 dark:bg-gray-700/50',
    textColor: 'text-gray-600 dark:text-gray-400',
    borderColor: 'border-gray-200 dark:border-gray-600/50',
    dotColor: 'bg-gray-400',
    icon: Circle,
  },
  failed: {
    label: 'Failed',
    bgColor: 'bg-red-50 dark:bg-red-500/20',
    textColor: 'text-red-700 dark:text-red-300',
    borderColor: 'border-red-200 dark:border-red-500/30',
    dotColor: 'bg-red-500',
    icon: XCircle,
  },
  cancelled: {
    label: 'Cancelled',
    bgColor: 'bg-gray-100 dark:bg-gray-700/50',
    textColor: 'text-gray-500 dark:text-gray-500',
    borderColor: 'border-gray-200 dark:border-gray-600/50',
    dotColor: 'bg-gray-400',
    icon: XCircle,
  },
};

/**
 * StatusBadge Component
 * 
 * A versatile status indicator badge featuring:
 * - Multiple status types with appropriate colors
 * - Optional pulsing animation for active states
 * - Icon support
 * - Dot-only mode for compact displays
 * - Size variants
 * - Accessibility support
 */
export function StatusBadge({
  status,
  label,
  pulsing = false,
  size = 'sm',
  showIcon = true,
  dotOnly = false,
  className,
}: StatusBadgeProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const config = statusConfig[status];
  const displayLabel = label || config.label;
  const Icon = config.icon;

  // Determine if pulsing should be active
  const shouldPulse = pulsing && !prefersReducedMotion && 
    ['active', 'published'].includes(status);

  // Size styles
  const sizeStyles = {
    sm: {
      badge: 'text-[10px] px-2 py-0.5 gap-1',
      dot: 'w-1.5 h-1.5',
      icon: 'w-3 h-3',
    },
    md: {
      badge: 'text-xs px-2.5 py-1 gap-1.5',
      dot: 'w-2 h-2',
      icon: 'w-3.5 h-3.5',
    },
  };

  // Dot-only mode
  if (dotOnly) {
    return (
      <span
        className={cn('relative inline-flex', className)}
        role="status"
        aria-label={displayLabel}
      >
        <span
          className={cn(
            'rounded-full',
            config.dotColor,
            sizeStyles[size].dot
          )}
        />
        {shouldPulse && (
          <motion.span
            className={cn(
              'absolute inset-0 rounded-full',
              config.dotColor,
              'opacity-75'
            )}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.75, 0, 0.75],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        config.bgColor,
        config.textColor,
        config.borderColor,
        sizeStyles[size].badge,
        className
      )}
      role="status"
    >
      {/* Pulsing dot indicator */}
      <span className="relative inline-flex">
        <span
          className={cn(
            'rounded-full',
            config.dotColor,
            sizeStyles[size].dot
          )}
        />
        {shouldPulse && (
          <motion.span
            className={cn(
              'absolute inset-0 rounded-full',
              config.dotColor,
              'opacity-75'
            )}
            animate={{
              scale: [1, 2, 1],
              opacity: [0.75, 0, 0.75],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </span>

      {/* Icon (optional) */}
      {showIcon && (
        <Icon className={cn(sizeStyles[size].icon, 'flex-shrink-0')} />
      )}

      {/* Label */}
      <span>{displayLabel}</span>
    </span>
  );
}

/**
 * StatusDot Component
 * 
 * A simple dot indicator for status
 */
export function StatusDot({
  status,
  pulsing = false,
  size = 'sm',
  className,
}: Pick<StatusBadgeProps, 'status' | 'pulsing' | 'size' | 'className'>) {
  return (
    <StatusBadge
      status={status}
      pulsing={pulsing}
      size={size}
      dotOnly
      className={className}
    />
  );
}

/**
 * Get status badge props from post status string
 */
export function getPostStatusBadgeProps(status: string): {
  status: StatusType;
  label: string;
} {
  const statusMap: Record<string, { status: StatusType; label: string }> = {
    published: { status: 'published', label: 'Published' },
    scheduled: { status: 'scheduled', label: 'Scheduled' },
    draft: { status: 'draft', label: 'Draft' },
    failed: { status: 'failed', label: 'Failed' },
    cancelled: { status: 'cancelled', label: 'Cancelled' },
    pending: { status: 'pending', label: 'Pending' },
  };

  return statusMap[status.toLowerCase()] || { status: 'draft', label: status };
}

/**
 * Get status badge props from account status
 */
export function getAccountStatusBadgeProps(status: string): {
  status: StatusType;
  label: string;
} {
  const statusMap: Record<string, { status: StatusType; label: string }> = {
    active: { status: 'active', label: 'Active' },
    warning: { status: 'warning', label: 'Needs Attention' },
    error: { status: 'error', label: 'Error' },
    disconnected: { status: 'inactive', label: 'Disconnected' },
  };

  return statusMap[status.toLowerCase()] || { status: 'inactive', label: status };
}

/**
 * Get status badge props from agent active state
 */
export function getAgentStatusBadgeProps(active: boolean): {
  status: StatusType;
  label: string;
  pulsing: boolean;
} {
  return active
    ? { status: 'active', label: 'Active', pulsing: true }
    : { status: 'inactive', label: 'Inactive', pulsing: false };
}
