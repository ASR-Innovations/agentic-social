/**
 * ScrollStagger Component
 * Reusable component for staggered scroll-triggered animations
 * Perfect for lists, grids, and collections of items
 */

'use client';

import { motion, Variants } from 'framer-motion';
import { useScrollStagger } from '@/hooks/useScrollAnimation';
import { scrollStaggerContainer, scrollStaggerItem } from '@/lib/animations';

export interface ScrollStaggerProps {
  children: React.ReactNode;
  /**
   * Delay between each child animation (in seconds)
   * @default 0.1
   */
  staggerDelay?: number;
  /**
   * Initial delay before first child animates (in seconds)
   * @default 0.1
   */
  delayChildren?: number;
  /**
   * Custom container variants (overrides default)
   */
  containerVariants?: Variants;
  /**
   * Custom item variants (overrides default)
   */
  itemVariants?: Variants;
  /**
   * Trigger animation once or every time element enters viewport
   * @default true
   */
  once?: boolean;
  /**
   * Amount of element that must be visible before triggering (0-1)
   * @default 0.2
   */
  amount?: number;
  /**
   * Additional CSS classes for container
   */
  className?: string;
  /**
   * HTML element to render for container
   * @default 'div'
   */
  as?: keyof JSX.IntrinsicElements;
}

/**
 * ScrollStagger component for staggered scroll-triggered animations
 *
 * @example
 * ```tsx
 * <ScrollStagger>
 *   <ScrollStagger.Item>Item 1</ScrollStagger.Item>
 *   <ScrollStagger.Item>Item 2</ScrollStagger.Item>
 *   <ScrollStagger.Item>Item 3</ScrollStagger.Item>
 * </ScrollStagger>
 * ```
 */
export function ScrollStagger({
  children,
  staggerDelay = 0.1,
  delayChildren = 0.1,
  containerVariants,
  itemVariants,
  once = true,
  amount = 0.2,
  className,
  as = 'div',
}: ScrollStaggerProps) {
  const { ref, animationState } = useScrollStagger({ once, amount });

  // Create custom container variants with stagger timing
  const finalContainerVariants = containerVariants || {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={animationState}
      variants={finalContainerVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * ScrollStagger.Item component
 * Use this for individual items within a ScrollStagger container
 */
export interface ScrollStaggerItemProps {
  children: React.ReactNode;
  /**
   * Custom item variants (overrides default)
   */
  variants?: Variants;
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

ScrollStagger.Item = function ScrollStaggerItem({
  children,
  variants,
  className,
  as = 'div',
}: ScrollStaggerItemProps) {
  const finalVariants = variants || scrollStaggerItem;

  return (
    <motion.div variants={finalVariants} className={className}>
      {children}
    </motion.div>
  );
};

export default ScrollStagger;
