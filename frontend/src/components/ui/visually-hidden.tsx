/**
 * VisuallyHidden Component
 * Hides content visually but keeps it accessible to screen readers
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export function VisuallyHidden({ children, className, ...props }: VisuallyHiddenProps) {
  return (
    <span className={cn('sr-only', className)} {...props}>
      {children}
    </span>
  );
}

// Also export as ScreenReaderOnly for clarity
export const ScreenReaderOnly = VisuallyHidden;
