'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';
import { prefersReducedMotion } from '@/lib/performance';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  className?: string;
}

export function ScrollReveal({
  children,
  delay = 0,
  duration = 600,
  direction = 'up',
  className = '',
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user prefers reduced motion
    setShouldAnimate(!prefersReducedMotion());
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Optionally unobserve after revealing
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of element is visible
        rootMargin: '0px 0px -50px 0px', // Start animation slightly before element enters viewport
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, []);

  // If user prefers reduced motion, show immediately
  if (!shouldAnimate) {
    return <div className={className}>{children}</div>;
  }

  // Determine transform based on direction
  const getTransform = () => {
    if (isVisible) return 'translate(0, 0)';
    
    switch (direction) {
      case 'up':
        return 'translate(0, 40px)';
      case 'down':
        return 'translate(0, -40px)';
      case 'left':
        return 'translate(40px, 0)';
      case 'right':
        return 'translate(-40px, 0)';
      case 'fade':
        return 'translate(0, 0)';
      default:
        return 'translate(0, 40px)';
    }
  };

  return (
    <div
      ref={elementRef}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

interface ScrollRevealContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function ScrollRevealContainer({
  children,
  staggerDelay = 100,
  className = '',
}: ScrollRevealContainerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShouldAnimate(!prefersReducedMotion());
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  if (!shouldAnimate) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={containerRef} className={className}>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <div
              key={index}
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translate(0, 0)' : 'translate(0, 40px)',
                transition: `opacity 600ms ease-out ${index * staggerDelay}ms, transform 600ms ease-out ${index * staggerDelay}ms`,
              }}
            >
              {child}
            </div>
          ))
        : children}
    </div>
  );
}
