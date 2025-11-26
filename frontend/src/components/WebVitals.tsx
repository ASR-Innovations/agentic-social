'use client';

import { useEffect } from 'react';
import { useReportWebVitals } from 'next/web-vitals';
import { reportWebVitals } from '@/lib/performance';

/**
 * Web Vitals reporting component
 * Automatically reports Core Web Vitals metrics in development
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    reportWebVitals(metric);
  });

  useEffect(() => {
    // Log initial performance metrics after page load
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      window.addEventListener('load', () => {
        setTimeout(() => {
          import('@/lib/performance').then(({ logPerformanceMetrics }) => {
            logPerformanceMetrics();
          });
        }, 1000);
      });
    }
  }, []);

  return null;
}
