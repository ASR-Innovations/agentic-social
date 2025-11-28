/**
 * Accessibility Utilities
 * Helper functions and hooks for accessibility features
 */

import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * Hook to detect if user prefers reduced motion
 * Respects system-level accessibility settings
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if window is available (SSR safety)
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook to detect if user prefers dark mode
 */
export function usePrefersDarkMode(): boolean {
  const [prefersDarkMode, setPrefersDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setPrefersDarkMode(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersDarkMode(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersDarkMode;
}

/**
 * Hook to detect if user prefers high contrast
 */
export function usePrefersHighContrast(): boolean {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setPrefersHighContrast(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersHighContrast(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersHighContrast;
}

/**
 * Hook for focus trap - keeps focus within a container
 * Useful for modals and dialogs
 */
export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Hook to manage focus restoration
 * Saves focus before an action and restores it after
 */
export function useFocusRestore() {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, []);

  return { saveFocus, restoreFocus };
}

/**
 * Hook for keyboard navigation
 * Handles arrow keys, home, end, etc.
 */
export function useKeyboardNavigation(
  items: any[],
  onSelect: (index: number) => void,
  options: {
    loop?: boolean;
    orientation?: 'horizontal' | 'vertical';
  } = {}
) {
  const { loop = true, orientation = 'vertical' } = options;
  const [activeIndex, setActiveIndex] = useState(0);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isVertical = orientation === 'vertical';
      const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';
      const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';

      switch (e.key) {
        case nextKey:
          e.preventDefault();
          setActiveIndex((prev) => {
            const next = prev + 1;
            if (next >= items.length) {
              return loop ? 0 : prev;
            }
            return next;
          });
          break;

        case prevKey:
          e.preventDefault();
          setActiveIndex((prev) => {
            const next = prev - 1;
            if (next < 0) {
              return loop ? items.length - 1 : prev;
            }
            return next;
          });
          break;

        case 'Home':
          e.preventDefault();
          setActiveIndex(0);
          break;

        case 'End':
          e.preventDefault();
          setActiveIndex(items.length - 1);
          break;

        case 'Enter':
        case ' ':
          e.preventDefault();
          onSelect(activeIndex);
          break;
      }
    },
    [items.length, activeIndex, onSelect, loop, orientation]
  );

  return { activeIndex, setActiveIndex, handleKeyDown };
}

/**
 * Generate unique ID for accessibility attributes
 */
export function useId(prefix: string = 'id'): string {
  const [id] = useState(() => `${prefix}-${Math.random().toString(36).substr(2, 9)}`);
  return id;
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
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
}

/**
 * Check if element is visible to screen readers
 */
export function isVisibleToScreenReader(element: HTMLElement): boolean {
  if (!element) return false;

  const style = window.getComputedStyle(element);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    !element.hasAttribute('aria-hidden')
  );
}

/**
 * Get accessible label for an element
 */
export function getAccessibleLabel(element: HTMLElement): string {
  // Check aria-label
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel;

  // Check aria-labelledby
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const labelElement = document.getElementById(labelledBy);
    if (labelElement) return labelElement.textContent || '';
  }

  // Check associated label
  if (element instanceof HTMLInputElement) {
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (label) return label.textContent || '';
  }

  // Fallback to text content
  return element.textContent || '';
}

/**
 * Calculate color contrast ratio
 * Returns ratio between 1 and 21
 */
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    // Calculate relative luminance
    const [rs, gs, bs] = [r, g, b].map((c) => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if color contrast meets WCAG standards
 */
export function meetsContrastRequirement(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal'
): boolean {
  const ratio = getContrastRatio(foreground, background);

  if (level === 'AAA') {
    return size === 'large' ? ratio >= 4.5 : ratio >= 7;
  }

  // AA level
  return size === 'large' ? ratio >= 3 : ratio >= 4.5;
}

/**
 * ARIA attribute helpers
 */
export const aria = {
  /**
   * Create ARIA attributes for a button
   */
  button: (label: string, pressed?: boolean, expanded?: boolean) => ({
    'aria-label': label,
    ...(pressed !== undefined && { 'aria-pressed': pressed }),
    ...(expanded !== undefined && { 'aria-expanded': expanded }),
  }),

  /**
   * Create ARIA attributes for a link
   */
  link: (label: string, current?: boolean) => ({
    'aria-label': label,
    ...(current && { 'aria-current': 'page' }),
  }),

  /**
   * Create ARIA attributes for a dialog/modal
   */
  dialog: (labelId: string, describedById?: string) => ({
    role: 'dialog',
    'aria-modal': true,
    'aria-labelledby': labelId,
    ...(describedById && { 'aria-describedby': describedById }),
  }),

  /**
   * Create ARIA attributes for a tab
   */
  tab: (id: string, panelId: string, selected: boolean) => ({
    role: 'tab',
    id,
    'aria-controls': panelId,
    'aria-selected': selected,
    tabIndex: selected ? 0 : -1,
  }),

  /**
   * Create ARIA attributes for a tab panel
   */
  tabPanel: (id: string, tabId: string, hidden: boolean) => ({
    role: 'tabpanel',
    id,
    'aria-labelledby': tabId,
    hidden,
    tabIndex: 0,
  }),

  /**
   * Create ARIA attributes for a menu
   */
  menu: (labelId?: string) => ({
    role: 'menu',
    ...(labelId && { 'aria-labelledby': labelId }),
  }),

  /**
   * Create ARIA attributes for a menu item
   */
  menuItem: (label: string) => ({
    role: 'menuitem',
    'aria-label': label,
  }),

  /**
   * Create ARIA attributes for a combobox
   */
  combobox: (expanded: boolean, controlsId: string) => ({
    role: 'combobox',
    'aria-expanded': expanded,
    'aria-controls': controlsId,
    'aria-haspopup': 'listbox',
  }),

  /**
   * Create ARIA attributes for live regions
   */
  liveRegion: (priority: 'polite' | 'assertive' = 'polite', atomic: boolean = true) => ({
    'aria-live': priority,
    'aria-atomic': atomic,
  }),
};

/**
 * Screen reader only CSS class
 * Use this for visually hidden but screen reader accessible content
 */
export const srOnlyClass = 'sr-only';

/**
 * Export all accessibility utilities
 */
export const a11y = {
  usePrefersReducedMotion,
  usePrefersDarkMode,
  usePrefersHighContrast,
  useFocusTrap,
  useFocusRestore,
  useKeyboardNavigation,
  useId,
  announceToScreenReader,
  isVisibleToScreenReader,
  getAccessibleLabel,
  getContrastRatio,
  meetsContrastRequirement,
  aria,
  srOnlyClass,
} as const;

export default a11y;
