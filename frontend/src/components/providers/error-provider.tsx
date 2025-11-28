'use client';

import { useEffect, ReactNode } from 'react';
import { setupGlobalErrorHandlers } from '@/lib/error-logger';

interface ErrorProviderProps {
  children: ReactNode;
}

/**
 * Provider component that sets up global error handlers
 */
export function ErrorProvider({ children }: ErrorProviderProps) {
  useEffect(() => {
    // Setup global error handlers on mount
    setupGlobalErrorHandlers();
  }, []);

  return <>{children}</>;
}
