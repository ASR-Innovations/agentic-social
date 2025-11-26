/**
 * Performance monitoring utilities for tracking Core Web Vitals
 * Helps measure FCP, LCP, CLS, and TTI metrics
 */

export interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  cls?: number; // Cumulative Layout Shift
  fid?: number; // First Input Delay
  ttfb?: number; // Time to First Byte
}

/**
 * Report Web Vitals to console (can be extended to send to analytics)
 */
export function reportWebVitals(metric: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
    });
  }

  // Here you could send to analytics service
  // Example: sendToAnalytics(metric);
}

/**
 * Get performance metrics from the browser
 */
export function getPerformanceMetrics(): PerformanceMetrics {
  if (typeof window === 'undefined') return {};

  const metrics: PerformanceMetrics = {};

  // Get navigation timing
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (navigation) {
    metrics.ttfb = navigation.responseStart - navigation.requestStart;
  }

  // Get paint timing
  const paintEntries = performance.getEntriesByType('paint');
  const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
  if (fcp) {
    metrics.fcp = fcp.startTime;
  }

  return metrics;
}

/**
 * Log performance metrics to console
 */
export function logPerformanceMetrics() {
  if (typeof window === 'undefined') return;

  const metrics = getPerformanceMetrics();
  console.group('📊 Performance Metrics');
  
  if (metrics.ttfb) {
    console.log(`⚡ TTFB: ${metrics.ttfb.toFixed(2)}ms`);
  }
  
  if (metrics.fcp) {
    console.log(`🎨 FCP: ${metrics.fcp.toFixed(2)}ms`);
  }
  
  console.groupEnd();
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get animation duration based on user preference
 */
export function getAnimationDuration(defaultDuration: number): number {
  return prefersReducedMotion() ? 0 : defaultDuration;
}

/**
 * Measure component render time
 */
export function measureRenderTime(componentName: string, callback: () => void) {
  if (typeof window === 'undefined') return callback();

  const startTime = performance.now();
  callback();
  const endTime = performance.now();
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Render Time] ${componentName}: ${(endTime - startTime).toFixed(2)}ms`);
  }
}

/**
 * Check if viewport is at a specific breakpoint
 */
export function isBreakpoint(breakpoint: 'mobile' | 'tablet' | 'desktop'): boolean {
  if (typeof window === 'undefined') return false;

  const width = window.innerWidth;
  
  switch (breakpoint) {
    case 'mobile':
      return width < 768;
    case 'tablet':
      return width >= 768 && width < 1200;
    case 'desktop':
      return width >= 1200;
    default:
      return false;
  }
}

/**
 * Smooth scroll to element by ID
 * Respects user's motion preferences
 */
export function smoothScrollTo(elementId: string, offset: number = 80): void {
  if (typeof window === 'undefined') return;

  const targetElement = document.getElementById(elementId);
  
  if (targetElement) {
    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
    const shouldAnimate = !prefersReducedMotion();
    
    window.scrollTo({
      top: targetPosition,
      behavior: shouldAnimate ? 'smooth' : 'auto',
    });
  }
}

/**
 * Smooth scroll to top of page
 * Respects user's motion preferences
 */
export function smoothScrollToTop(): void {
  if (typeof window === 'undefined') return;

  const shouldAnimate = !prefersReducedMotion();
  
  window.scrollTo({
    top: 0,
    behavior: shouldAnimate ? 'smooth' : 'auto',
  });
}

/**
 * Test performance at exact breakpoint widths
 */
export function testBreakpoints() {
  if (typeof window === 'undefined') return;

  const breakpoints = [768, 1200];
  const currentWidth = window.innerWidth;
  
  console.group('📱 Breakpoint Test');
  console.log(`Current width: ${currentWidth}px`);
  
  breakpoints.forEach(bp => {
    const diff = Math.abs(currentWidth - bp);
    if (diff < 50) {
      console.warn(`⚠️ Close to breakpoint ${bp}px (diff: ${diff}px) - test layout carefully`);
    }
  });
  
  console.groupEnd();
}
