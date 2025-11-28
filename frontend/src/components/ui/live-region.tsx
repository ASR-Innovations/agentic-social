/**
 * LiveRegion Component
 * ARIA live region for dynamic content announcements
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface LiveRegionProps {
  children: React.ReactNode;
  priority?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all';
  className?: string;
}

export function LiveRegion({
  children,
  priority = 'polite',
  atomic = true,
  relevant = 'additions text',
  className,
}: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className={cn('sr-only', className)}
    >
      {children}
    </div>
  );
}

// Alert variant for important messages
export interface AlertRegionProps {
  children: React.ReactNode;
  className?: string;
}

export function AlertRegion({ children, className }: AlertRegionProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={cn('sr-only', className)}
    >
      {children}
    </div>
  );
}
