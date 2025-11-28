'use client';

import React, { ReactNode } from 'react';
import { ErrorBoundary } from './error-boundary';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './button';

interface PageSectionBoundaryProps {
  children: ReactNode;
  sectionName?: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Error boundary specifically designed for major page sections.
 * Provides a minimal, inline fallback UI that doesn't disrupt the entire page.
 */
export function PageSectionBoundary({
  children,
  sectionName = 'this section',
  onError,
}: PageSectionBoundaryProps) {
  const fallback = (
    <div className="w-full p-6 bg-gray-50 border border-gray-200 rounded-xl">
      <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          Unable to load {sectionName}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          We encountered an error while loading this content. Please try refreshing the page.
        </p>
        <Button
          onClick={() => window.location.reload()}
          size="sm"
          variant="outline"
          className="border-gray-300"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh page
        </Button>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallback} onError={onError}>
      {children}
    </ErrorBoundary>
  );
}

/**
 * Minimal error boundary for small UI components
 */
export function ComponentBoundary({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const defaultFallback = (
    <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg">
      <p className="text-xs text-gray-500 text-center">Content unavailable</p>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallback || defaultFallback}>
      {children}
    </ErrorBoundary>
  );
}

/**
 * Error boundary for card components
 */
export function CardBoundary({
  children,
  title = 'Content',
}: {
  children: ReactNode;
  title?: string;
}) {
  const fallback = (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-gray-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{title} unavailable</p>
          <p className="text-xs text-gray-500">Unable to load this content</p>
        </div>
      </div>
    </div>
  );

  return <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>;
}
