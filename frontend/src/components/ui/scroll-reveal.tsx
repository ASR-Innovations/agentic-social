/**
 * ScrollReveal Component
 * Reusable component for scroll-triggered animations
 * Automatically respects prefers-reduced-motion
 */

'use client';

import { motion, Variants } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import {
  scrollFadeIn,
  scrollFadeInUp,
  scrollFadeInDown,
  scrollFadeInLeft,
  scrollFadeInRight,
  scrollScaleIn,
} from '@/lib/animations';

export interface ScrollRevealProps {
  children: React.ReactNode;
  /**
   * Animation variant to use
   * @default 'fadeInUp'
   */
  variant?: 'fade' | 'fadeInUp' | 'fadeInDown' | 'fadeInLeft' | 'fadeInRight' | 'scaleIn';
  /**
   * Custom animation variants (overrides variant prop)
   */
  customVariants?: Variants;
  /**
   * Trigger animation once or every time element enters viewport
   * @default true
   */
  once?: boolean;
  /**
   * Amount of element that must be visible before triggering (0-1)
   * @default 0.1
   */
  amount?: number;
  /**
   * Delay before animation starts (in seconds)
   * @default 0
   */
  delay?: number;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * HTML element to render
   * @default 'div'
   */
  as?: keyof JSX.IntrinsicElements;
}

const variantMap = {
  fade: scrollFadeIn,
  fadeInUp: scrollFadeInUp,
  fadeInDown: scrollFadeInDown,
  fadeInLeft: scrollFadeInLeft,
  fadeInRight: scrollFadeInRight,
  scaleIn: scrollScaleIn,
};

/**
 * ScrollReveal component for easy scroll-triggered animations
 *
 * @example
 * ```tsx
 * <ScrollReveal variant="fadeInUp">
 *   <h2>This will fade in and slide up when scrolled into view</h2>
 * </ScrollReveal>
 * ```
 */
export function ScrollReveal({
  children,
  variant = 'fadeInUp',
  customVariants,
  once = true,
  amount = 0.1,
  delay = 0,
  className,
  as = 'div',
}: ScrollRevealProps) {
  const { ref, animationState } = useScrollAnimation({ once, amount });

  const variants = customVariants || variantMap[variant];

  // Add delay to variants if specified
  const variantsWithDelay = delay > 0 ? {
    ...variants,
    visible: {
      ...variants.visible,
      transition: {
        ...(variants.visible as any).transition,
        delay,
      },
    },
  } : variants;

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={animationState}
      variants={variantsWithDelay}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default ScrollReveal;
