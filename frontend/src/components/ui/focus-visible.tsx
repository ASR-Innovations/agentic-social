/**
 * FocusVisible Component
 * Wrapper that adds visible focus indicators
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FocusVisibleProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  focusRingColor?: 'indigo' | 'purple' | 'blue' | 'green' | 'red';
}

const focusRingColors = {
  indigo: 'focus-within:ring-indigo-500',
  purple: 'focus-within:ring-purple-500',
  blue: 'focus-within:ring-blue-500',
  green: 'focus-within:ring-green-500',
  red: 'focus-within:ring-red-500',
};

export function FocusVisible({
  children,
  focusRingColor = 'indigo',
  className,
  ...props
}: FocusVisibleProps) {
  return (
    <div
      className={cn(
        'focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 rounded-lg transition-all',
        focusRingColors[focusRingColor],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
