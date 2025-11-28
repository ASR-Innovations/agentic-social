/**
 * useScrollAnimation Hook
 * Combines Framer Motion's useInView with reduced motion detection
 * for accessible scroll-triggered animations
 */

import { useInView } from 'framer-motion';
import { useRef, useMemo } from 'react';
import { usePrefersReducedMotion } from '@/lib/accessibility';

export interface ScrollAnimationOptions {
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
   * Margin around viewport for early/late triggering
   * @default "0px"
   */
  margin?: string;

  /**
   * Disable animation entirely
   * @default false
   */
  disabled?: boolean;
}

export interface ScrollAnimationReturn {
  /**
   * Ref to attach to the element you want to animate
   */
  ref: React.RefObject<any>;

  /**
   * Whether the element is currently in view
   */
  inView: boolean;

  /**
   * Whether animations should be shown (respects reduced motion)
   */
  shouldAnimate: boolean;

  /**
   * Animation state to use with Framer Motion variants
   * Returns 'visible' when in view, 'hidden' otherwise
   */
  animationState: 'visible' | 'hidden';
}

/**
 * Hook for scroll-triggered animations that respects accessibility preferences
 *
 * @example
 * ```tsx
 * const { ref, animationState } = useScrollAnimation();
 *
 * return (
 *   <motion.div
 *     ref={ref}
 *     initial="hidden"
 *     animate={animationState}
 *     variants={scrollFadeInUp}
 *   >
 *     Content
 *   </motion.div>
 * );
 * ```
 */
export function useScrollAnimation(
  options: ScrollAnimationOptions = {}
): ScrollAnimationReturn {
  const {
    once = true,
    amount = 0.1,
    margin = '0px',
    disabled = false,
  } = options;

  const ref = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Use Framer Motion's useInView hook
  const inView = useInView(ref, {
    once,
    amount,
    margin,
  });

  // Determine if we should animate
  const shouldAnimate = useMemo(() => {
    return !disabled && !prefersReducedMotion;
  }, [disabled, prefersReducedMotion]);

  // Determine animation state
  const animationState = useMemo(() => {
    // If animations are disabled or user prefers reduced motion,
    // always show as visible (no animation)
    if (!shouldAnimate) {
      return 'visible';
    }

    // Otherwise, use the inView state
    return inView ? 'visible' : 'hidden';
  }, [inView, shouldAnimate]);

  return {
    ref,
    inView,
    shouldAnimate,
    animationState,
  };
}

/**
 * Hook for staggered scroll animations (for lists/grids)
 *
 * @example
 * ```tsx
 * const { ref, animationState } = useScrollStagger();
 *
 * return (
 *   <motion.div
 *     ref={ref}
 *     initial="hidden"
 *     animate={animationState}
 *     variants={scrollStaggerContainer}
 *   >
 *     {items.map(item => (
 *       <motion.div key={item.id} variants={scrollStaggerItem}>
 *         {item.content}
 *       </motion.div>
 *     ))}
 *   </motion.div>
 * );
 * ```
 */
export function useScrollStagger(
  options: ScrollAnimationOptions = {}
): ScrollAnimationReturn {
  return useScrollAnimation({
    once: true,
    amount: 0.2,
    ...options,
  });
}

/**
 * Hook for parallax scroll effects
 * Returns a value that changes based on scroll position
 *
 * @example
 * ```tsx
 * const { ref, scrollY } = useParallax();
 *
 * return (
 *   <motion.div
 *     ref={ref}
 *     style={{ y: scrollY }}
 *   >
 *     Parallax content
 *   </motion.div>
 * );
 * ```
 */
export function useParallax(speed: number = 0.5) {
  const ref = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  // If user prefers reduced motion, return 0 (no parallax)
  const effectiveSpeed = prefersReducedMotion ? 0 : speed;

  return {
    ref,
    speed: effectiveSpeed,
    shouldAnimate: !prefersReducedMotion,
  };
}

/**
 * Hook for progressive reveal of sections
 * Reveals content as user scrolls down the page
 *
 * @example
 * ```tsx
 * const sections = [
 *   { id: 1, content: 'Section 1' },
 *   { id: 2, content: 'Section 2' },
 * ];
 *
 * return (
 *   <>
 *     {sections.map(section => {
 *       const { ref, animationState } = useProgressiveReveal();
 *       return (
 *         <motion.section
 *           key={section.id}
 *           ref={ref}
 *           initial="hidden"
 *           animate={animationState}
 *           variants={scrollFadeInUp}
 *         >
 *           {section.content}
 *         </motion.section>
 *       );
 *     })}
 *   </>
 * );
 * ```
 */
export function useProgressiveReveal(
  options: ScrollAnimationOptions = {}
): ScrollAnimationReturn {
  return useScrollAnimation({
    once: true,
    amount: 0.15,
    margin: '-50px',
    ...options,
  });
}

export default useScrollAnimation;
