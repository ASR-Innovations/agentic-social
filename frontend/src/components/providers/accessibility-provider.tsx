/**
 * AccessibilityProvider
 * Provides accessibility context and features throughout the app
 */

'use client';

import * as React from 'react';
import { 
  usePrefersReducedMotion, 
  usePrefersDarkMode, 
  usePrefersHighContrast 
} from '@/lib/accessibility';

interface AccessibilityContextValue {
  prefersReducedMotion: boolean;
  prefersDarkMode: boolean;
  prefersHighContrast: boolean;
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
}

const AccessibilityContext = React.createContext<AccessibilityContextValue | undefined>(undefined);

export function useAccessibility() {
  const context = React.useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}

export interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const prefersDarkMode = usePrefersDarkMode();
  const prefersHighContrast = usePrefersHighContrast();

  const announceToScreenReader = React.useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      if (typeof document === 'undefined') return;

      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', priority);
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = message;

      document.body.appendChild(announcement);

      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    },
    []
  );

  const value = React.useMemo(
    () => ({
      prefersReducedMotion,
      prefersDarkMode,
      prefersHighContrast,
      announceToScreenReader,
    }),
    [prefersReducedMotion, prefersDarkMode, prefersHighContrast, announceToScreenReader]
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}
