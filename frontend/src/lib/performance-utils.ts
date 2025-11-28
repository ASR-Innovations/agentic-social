/**
 * Performance optimization utilities
 * Includes memoization helpers, debounce, throttle, and performance monitoring
 */

import { useCallback, useEffect, useRef, useMemo } from 'react';

/**
 * Debounce function - delays execution until after wait time has elapsed
 * @param func Function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function - ensures function is called at most once per wait period
 * @param func Function to throttle
 * @param wait Wait time in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  let lastResult: ReturnType<T>;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      inThrottle = true;
      lastResult = func(...args);
      setTimeout(() => (inThrottle = false), wait);
    }
    return lastResult;
  };
}

/**
 * Hook for debounced values
 * @param value Value to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for throttled callbacks
 * @param callback Callback to throttle
 * @param delay Delay in milliseconds
 * @returns Throttled callback
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const throttledCallback = useRef<T>();
  
  useEffect(() => {
    throttledCallback.current = throttle(callback, delay) as T;
  }, [callback, delay]);
  
  return useCallback((...args: Parameters<T>) => {
    return throttledCallback.current?.(...args);
  }, []) as T;
}

/**
 * Hook for memoized expensive computations
 * @param factory Factory function
 * @param deps Dependencies array
 * @returns Memoized value
 */
export function useMemoizedValue<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return useMemo(factory, deps);
}

/**
 * Hook for intersection observer (lazy loading, infinite scroll)
 * @param options Intersection observer options
 * @returns Ref and isIntersecting state
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options]);

  return [ref, isIntersecting];
}

/**
 * Performance monitoring utility
 * Measures and logs component render times
 */
export function measurePerformance(
  componentName: string,
  callback: () => void
): void {
  if (typeof window === 'undefined' || !window.performance) return;

  const startTime = performance.now();
  callback();
  const endTime = performance.now();
  const duration = endTime - startTime;

  if (duration > 16.67) {
    // Longer than one frame at 60fps
    console.warn(
      `[Performance] ${componentName} took ${duration.toFixed(2)}ms to render`
    );
  }
}

/**
 * Hook for measuring component render performance
 * @param componentName Name of the component
 */
export function usePerformanceMonitor(componentName: string): void {
  const renderCount = useRef(0);
  const totalTime = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      totalTime.current += duration;

      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[Performance] ${componentName} - Render #${renderCount.current}: ${duration.toFixed(2)}ms (Avg: ${(totalTime.current / renderCount.current).toFixed(2)}ms)`
        );
      }
    };
  });
}

/**
 * Preload a component for faster navigation
 * @param importFn Dynamic import function
 */
export function preloadComponent(importFn: () => Promise<any>): void {
  importFn();
}

/**
 * Hook for preloading routes on hover
 * @param importFn Dynamic import function
 * @returns onMouseEnter handler
 */
export function usePreloadOnHover(
  importFn: () => Promise<any>
): { onMouseEnter: () => void } {
  const hasPreloaded = useRef(false);

  const handleMouseEnter = useCallback(() => {
    if (!hasPreloaded.current) {
      hasPreloaded.current = true;
      preloadComponent(importFn);
    }
  }, [importFn]);

  return { onMouseEnter: handleMouseEnter };
}

// Missing import
import { useState } from 'react';
