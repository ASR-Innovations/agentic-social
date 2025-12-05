'use client';

import * as React from 'react';
import { motion, useSpring, useTransform, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/lib/accessibility';

export interface AnimatedCounterProps {
  /** The target value to count to */
  value: number;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Text to display before the number */
  prefix?: string;
  /** Text to display after the number */
  suffix?: string;
  /** Number of decimal places to show */
  decimals?: number;
  /** Whether to format with thousand separators */
  formatNumber?: boolean;
  /** Custom formatter function */
  formatter?: (value: number) => string;
  /** Additional CSS classes */
  className?: string;
  /** Whether to start animation when in view */
  animateOnView?: boolean;
  /** Delay before animation starts (ms) */
  delay?: number;
}

/**
 * AnimatedCounter Component
 * 
 * A number counter with smooth counting animation featuring:
 * - Configurable animation duration
 * - Prefix and suffix support
 * - Decimal formatting
 * - Thousand separator formatting
 * - Animate on scroll into view
 * - Respects reduced motion preferences
 */
export function AnimatedCounter({
  value,
  duration = 2000,
  prefix = '',
  suffix = '',
  decimals = 0,
  formatNumber = true,
  formatter,
  className,
  animateOnView = true,
  delay = 0,
}: AnimatedCounterProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [hasAnimated, setHasAnimated] = React.useState(false);

  // Determine if we should animate
  const shouldAnimate = animateOnView ? isInView : true;

  // Spring animation for smooth counting
  const springValue = useSpring(0, {
    duration: prefersReducedMotion ? 0 : duration,
    bounce: 0,
  });

  // Transform spring value to display value
  const displayValue = useTransform(springValue, (latest) => {
    if (formatter) {
      return formatter(latest);
    }

    const rounded = decimals > 0 
      ? latest.toFixed(decimals) 
      : Math.round(latest);

    if (formatNumber) {
      return Number(rounded).toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    }

    return String(rounded);
  });

  // Start animation when conditions are met
  React.useEffect(() => {
    if (shouldAnimate && !hasAnimated) {
      const timer = setTimeout(() => {
        springValue.set(value);
        setHasAnimated(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [shouldAnimate, hasAnimated, value, springValue, delay]);

  // Update value if it changes after initial animation
  React.useEffect(() => {
    if (hasAnimated) {
      springValue.set(value);
    }
  }, [value, hasAnimated, springValue]);

  // If reduced motion, show final value immediately
  if (prefersReducedMotion) {
    const formattedValue = formatter
      ? formatter(value)
      : formatNumber
      ? value.toLocaleString('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : decimals > 0
      ? value.toFixed(decimals)
      : String(Math.round(value));

    return (
      <span ref={ref} className={cn('tabular-nums', className)}>
        {prefix}
        {formattedValue}
        {suffix}
      </span>
    );
  }

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {prefix}
      <motion.span>{displayValue}</motion.span>
      {suffix}
    </span>
  );
}

/**
 * Abbreviated number formatter
 * Converts large numbers to abbreviated format (1K, 1M, 1B)
 */
export function abbreviateNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (value >= 1_000) {
    return (value / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return String(Math.round(value));
}

/**
 * Percentage formatter
 */
export function formatPercentage(value: number, decimals = 1): string {
  return value.toFixed(decimals) + '%';
}

/**
 * Currency formatter
 */
export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Pre-configured counter variants
export function AnimatedMetricCounter({
  value,
  className,
  ...props
}: Omit<AnimatedCounterProps, 'formatter'>) {
  return (
    <AnimatedCounter
      value={value}
      formatter={abbreviateNumber}
      className={cn('text-3xl font-bold', className)}
      {...props}
    />
  );
}

export function AnimatedPercentageCounter({
  value,
  className,
  ...props
}: Omit<AnimatedCounterProps, 'formatter' | 'suffix'>) {
  return (
    <AnimatedCounter
      value={value}
      decimals={1}
      suffix="%"
      className={cn('text-3xl font-bold', className)}
      {...props}
    />
  );
}

export function AnimatedCurrencyCounter({
  value,
  className,
  ...props
}: Omit<AnimatedCounterProps, 'formatter' | 'prefix'>) {
  return (
    <AnimatedCounter
      value={value}
      prefix="$"
      decimals={2}
      className={cn('text-3xl font-bold', className)}
      {...props}
    />
  );
}
