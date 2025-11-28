/**
 * SkipLink Component
 * Allows keyboard users to skip to main content
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SkipLinkProps {
  href?: string;
  children?: React.ReactNode;
}

export function SkipLink({ href = '#main-content', children = 'Skip to main content' }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        'sr-only focus:not-sr-only',
        'fixed top-4 left-4 z-[100]',
        'bg-gradient-to-r from-indigo-600 to-purple-600 text-white',
        'px-6 py-3 rounded-xl shadow-lg',
        'font-medium text-sm',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
        'transition-all duration-200'
      )}
    >
      {children}
    </a>
  );
}
