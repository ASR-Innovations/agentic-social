/**
 * Parallax Component
 * Creates parallax scroll effects that respect reduced motion preferences
 */

'use client';

import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { useRef } from 'react';
import { useParallax } from '@/hooks/useScrollAnimation';

export interface ParallaxProps {
  children: React.ReactNode;
  /**
   * Speed of parallax effect (0 = no movement, 1 = normal scroll speed)
   * Negative values move in opposite direction
   * @default 0.5
   */
  speed?: number;
  /**
   * Direction of parallax movement
   * @default 'vertical'
   */
  direction?: 'vertical' | 'horizontal';
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

/**
 * Parallax component for scroll-based parallax effects
 * Automatically respects prefers-reduced-motion
 *
 * @example
 * ```tsx
 * <Parallax speed={0.5}>
 *   <img src="/hero-bg.jpg" alt="Background" />
 * </Parallax>
 * ```
 */
export function Parallax({
  children,
  speed = 0.5,
  direction = 'vertical',
  className,
  as = 'div',
}: ParallaxProps) {
  const ref = useRef(null);
  const { shouldAnimate } = useParallax(speed);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Calculate parallax offset
  const range = 100; // pixels
  const offset = range * speed;

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    shouldAnimate && direction === 'vertical' ? [-offset, offset] : [0, 0]
  );

  const x = useTransform(
    scrollYProgress,
    [0, 1],
    shouldAnimate && direction === 'horizontal' ? [-offset, offset] : [0, 0]
  );

  const MotionComponent = (motion as any)[as];

  return (
    <MotionComponent
      ref={ref}
      style={{
        y: direction === 'vertical' ? y : undefined,
        x: direction === 'horizontal' ? x : undefined,
      }}
      className={className}
    >
      {children}
    </MotionComponent>
  );
}

/**
 * ParallaxLayer component for multi-layer parallax effects
 * Use multiple layers with different speeds for depth
 *
 * @example
 * ```tsx
 * <div className="relative">
 *   <ParallaxLayer speed={0.2} className="absolute inset-0">
 *     <img src="/bg-far.jpg" alt="Far background" />
 *   </ParallaxLayer>
 *   <ParallaxLayer speed={0.5} className="absolute inset-0">
 *     <img src="/bg-mid.jpg" alt="Mid background" />
 *   </ParallaxLayer>
 *   <ParallaxLayer speed={0.8} className="absolute inset-0">
 *     <img src="/bg-near.jpg" alt="Near background" />
 *   </ParallaxLayer>
 *   <div className="relative z-10">Content</div>
 * </div>
 * ```
 */
export interface ParallaxLayerProps extends ParallaxProps {
  /**
   * Z-index for layering
   */
  zIndex?: number;
}

export function ParallaxLayer({
  children,
  speed = 0.5,
  direction = 'vertical',
  className,
  zIndex,
  as = 'div',
}: ParallaxLayerProps) {
  const style = zIndex !== undefined ? { zIndex } : undefined;

  return (
    <Parallax
      speed={speed}
      direction={direction}
      className={className}
      as={as}
    >
      <div style={style}>{children}</div>
    </Parallax>
  );
}

/**
 * ParallaxSection component for full-width parallax sections
 * Includes built-in container styling
 *
 * @example
 * ```tsx
 * <ParallaxSection speed={0.3}>
 *   <h1>Hero Title</h1>
 *   <p>Hero description</p>
 * </ParallaxSection>
 * ```
 */
export interface ParallaxSectionProps extends ParallaxProps {
  /**
   * Background image URL
   */
  backgroundImage?: string;
  /**
   * Background overlay opacity (0-1)
   * @default 0.5
   */
  overlayOpacity?: number;
}

export function ParallaxSection({
  children,
  speed = 0.3,
  backgroundImage,
  overlayOpacity = 0.5,
  className = '',
}: ParallaxSectionProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {backgroundImage && (
        <>
          <Parallax
            speed={speed}
            className="absolute inset-0 -z-10"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${backgroundImage})` }}
            />
          </Parallax>
          <div
            className="absolute inset-0 bg-black -z-10"
            style={{ opacity: overlayOpacity }}
          />
        </>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default Parallax;
