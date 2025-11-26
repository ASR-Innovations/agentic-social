/**
 * Performance testing utilities for manual testing
 * Run these in the browser console to test performance metrics
 */

import { getPerformanceMetrics, logPerformanceMetrics, testBreakpoints, prefersReducedMotion } from './performance';

/**
 * Comprehensive performance test suite
 */
export function runPerformanceTests() {
  console.group('🚀 Performance Test Suite');
  
  // Test 1: Core Web Vitals
  console.group('1️⃣ Core Web Vitals');
  logPerformanceMetrics();
  console.groupEnd();
  
  // Test 2: Breakpoint Testing
  console.group('2️⃣ Breakpoint Testing');
  testBreakpoints();
  console.groupEnd();
  
  // Test 3: Motion Preferences
  console.group('3️⃣ Motion Preferences');
  console.log('Prefers Reduced Motion:', prefersReducedMotion());
  console.groupEnd();
  
  // Test 4: Image Loading
  console.group('4️⃣ Image Loading');
  const images = document.querySelectorAll('img');
  console.log(`Total images: ${images.length}`);
  
  let lazyLoaded = 0;
  images.forEach(img => {
    if (img.loading === 'lazy') lazyLoaded++;
  });
  console.log(`Lazy loaded images: ${lazyLoaded}`);
  console.log(`Eager loaded images: ${images.length - lazyLoaded}`);
  console.groupEnd();
  
  // Test 5: Resource Timing
  console.group('5️⃣ Resource Timing');
  const resources = performance.getEntriesByType('resource');
  const scripts = resources.filter(r => r.name.includes('.js'));
  const styles = resources.filter(r => r.name.includes('.css'));
  const imgs = resources.filter(r => r.name.match(/\.(jpg|jpeg|png|gif|webp|svg)/));
  
  console.log(`Scripts loaded: ${scripts.length}`);
  console.log(`Stylesheets loaded: ${styles.length}`);
  console.log(`Images loaded: ${imgs.length}`);
  console.groupEnd();
  
  // Test 6: Layout Shift Detection
  console.group('6️⃣ Layout Shift Detection');
  const layoutShifts = performance.getEntriesByType('layout-shift');
  console.log(`Layout shifts detected: ${layoutShifts.length}`);
  if (layoutShifts.length > 0) {
    console.warn('⚠️ Layout shifts detected - check CLS score');
  } else {
    console.log('✅ No layout shifts detected');
  }
  console.groupEnd();
  
  console.groupEnd();
}

/**
 * Test at specific breakpoint widths
 */
export function testAtBreakpoint(width: number) {
  console.group(`📱 Testing at ${width}px`);
  
  // Store original width
  const originalWidth = window.innerWidth;
  
  console.log('Original width:', originalWidth);
  console.log('Target width:', width);
  console.log('Difference:', Math.abs(originalWidth - width), 'px');
  
  if (Math.abs(originalWidth - width) > 50) {
    console.warn('⚠️ Please resize your browser to', width, 'px for accurate testing');
  } else {
    console.log('✅ Browser width is close to target breakpoint');
  }
  
  // Check layout at this width
  const sections = document.querySelectorAll('section');
  console.log('Sections rendered:', sections.length);
  
  console.groupEnd();
}

/**
 * Monitor performance continuously
 */
export function monitorPerformance(interval: number = 5000) {
  console.log('📊 Starting performance monitoring...');
  console.log('Logging metrics every', interval / 1000, 'seconds');
  
  const monitor = setInterval(() => {
    logPerformanceMetrics();
  }, interval);
  
  // Return function to stop monitoring
  return () => {
    clearInterval(monitor);
    console.log('⏹️ Performance monitoring stopped');
  };
}

/**
 * Test browser compatibility
 */
export function testBrowserCompatibility() {
  console.group('🌐 Browser Compatibility Test');
  
  const features = {
    'IntersectionObserver': 'IntersectionObserver' in window,
    'ResizeObserver': 'ResizeObserver' in window,
    'CSS Grid': CSS.supports('display', 'grid'),
    'CSS Flexbox': CSS.supports('display', 'flex'),
    'CSS Custom Properties': CSS.supports('--test', '0'),
    'Backdrop Filter': CSS.supports('backdrop-filter', 'blur(10px)'),
    'Aspect Ratio': CSS.supports('aspect-ratio', '16/9'),
    'WebP Support': document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0,
    'Smooth Scroll': CSS.supports('scroll-behavior', 'smooth'),
  };
  
  Object.entries(features).forEach(([feature, supported]) => {
    if (supported) {
      console.log(`✅ ${feature}: Supported`);
    } else {
      console.warn(`❌ ${feature}: Not supported`);
    }
  });
  
  console.groupEnd();
}

/**
 * Test smooth scrolling functionality
 */
export function testSmoothScrolling() {
  console.group('📜 Smooth Scrolling Test');
  
  // Check if smooth scroll is supported
  const smoothScrollSupported = CSS.supports('scroll-behavior', 'smooth');
  console.log('Smooth scroll CSS support:', smoothScrollSupported ? '✅' : '❌');
  
  // Check for navigation sections
  const sections = ['features', 'channels', 'resources', 'pricing'];
  console.log('\n📍 Navigation Sections:');
  
  sections.forEach(sectionId => {
    const element = document.getElementById(sectionId);
    if (element) {
      console.log(`✅ #${sectionId}: Found`);
    } else {
      console.warn(`❌ #${sectionId}: Not found`);
    }
  });
  
  // Check for scroll to top button
  console.log('\n⬆️ Scroll to Top Button:');
  const scrollToTopButton = document.querySelector('[aria-label="Scroll to top"]');
  if (scrollToTopButton) {
    console.log('✅ Button found');
    const isVisible = window.getComputedStyle(scrollToTopButton).display !== 'none';
    console.log(`Visibility: ${isVisible ? 'Visible' : 'Hidden (scroll down to see it)'}`);
  } else {
    console.warn('❌ Button not found');
  }
  
  console.groupEnd();
}

/**
 * Generate performance report
 */
export function generatePerformanceReport() {
  const metrics = getPerformanceMetrics();
  
  const report = {
    timestamp: new Date().toISOString(),
    metrics,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    userAgent: navigator.userAgent,
    connection: (navigator as any).connection ? {
      effectiveType: (navigator as any).connection.effectiveType,
      downlink: (navigator as any).connection.downlink,
      rtt: (navigator as any).connection.rtt,
    } : 'Not available',
    prefersReducedMotion: prefersReducedMotion(),
  };
  
  console.log('📋 Performance Report:', report);
  return report;
}

// Make functions available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).performanceTests = {
    run: runPerformanceTests,
    testBreakpoint: testAtBreakpoint,
    monitor: monitorPerformance,
    testBrowser: testBrowserCompatibility,
    testScrolling: testSmoothScrolling,
    generateReport: generatePerformanceReport,
  };
  
  console.log('💡 Performance testing utilities loaded!');
  console.log('Run window.performanceTests.run() to start testing');
  console.log('Run window.performanceTests.testScrolling() to test smooth scrolling');
}
