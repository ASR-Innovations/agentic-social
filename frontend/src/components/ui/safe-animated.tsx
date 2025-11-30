'use client';

import React, { ReactNode } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { ErrorBoundary } from './error-boundary';
import { usePrefersReducedMotion } from '@/lib/accessibility';

interface SafeAnimatedComponentProps extends MotionProps {
  children: ReactNode;
  as?: keyof typeof motion;
  fallbackClassName?: string;
  className?: string;
}

/**
 * Safe wrapper for Framer Motion animations that handles errors gracefully
 * and respects user's reduced motion preferences.
 */
export function SafeAnimatedComponent({
  children,
  as = 'div',
  fallbackClassName,
  ...motionProps
}: SafeAnimatedComponentProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const MotionComponent = (motion as any)[as];

  // If user prefers reduced motion, render without animation
  if (prefersReducedMotion) {
    const Component = as;
    return <Component className={fallbackClassName}>{children}</Component>;
  }

  // Wrap animation in error boundary
  return (
    <ErrorBoundary
      fallback={
        <div className={fallbackClassName}>
          {children}
        </div>
      }
    >
      <MotionComponent {...motionProps}>
        {children}
      </MotionComponent>
    </ErrorBoundary>
  );
}

/**
 * Pre-configured safe animated div with common animation patterns
 */
export function SafeFadeIn({
  children,
  delay = 0,
  duration = 0.5,
  className,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <SafeAnimatedComponent
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      fallbackClassName={className}
      className={className}
    >
      {children}
    </SafeAnimatedComponent>
  );
}

/**
 * Pre-configured safe animated div with scale animation
 */
export function SafeScaleIn({
  children,
  delay = 0,
  duration = 0.3,
  className,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <SafeAnimatedComponent
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      fallbackClassName={className}
      className={className}
    >
      {children}
    </SafeAnimatedComponent>
  );
}

/**
 * Pre-configured safe animated div with slide animation
 */
export function SafeSlideIn({
  children,
  direction = 'left',
  delay = 0,
  duration = 0.5,
  className,
}: {
  children: ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const getInitialPosition = () => {
    switch (direction) {
      case 'left':
        return { x: -20, y: 0 };
      case 'right':
        return { x: 20, y: 0 };
      case 'up':
        return { x: 0, y: -20 };
      case 'down':
        return { x: 0, y: 20 };
    }
  };

  return (
    <SafeAnimatedComponent
      initial={{ opacity: 0, ...getInitialPosition() }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      fallbackClassName={className}
      className={className}
    >
      {children}
    </SafeAnimatedComponent>
  );
}
