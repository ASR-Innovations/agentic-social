/**
 * Responsive Design Utilities
 * Helpers for ensuring consistent responsive behavior across the application
 */

export const BREAKPOINTS = {
  mobile: { min: 320, max: 767 },
  tablet: { min: 768, max: 1023 },
  desktop: { min: 1024, max: Infinity },
} as const;

export const TOUCH_TARGET_SIZE = {
  min: 44, // Minimum touch target size in pixels (WCAG 2.1 Level AAA)
  recommended: 48, // Recommended touch target size
} as const;

/**
 * Check if current viewport matches a breakpoint
 */
export function isBreakpoint(breakpoint: keyof typeof BREAKPOINTS): boolean {
  if (typeof window === 'undefined') return false;
  
  const width = window.innerWidth;
  const { min, max } = BREAKPOINTS[breakpoint];
  return width >= min && width <= max;
}

/**
 * Get current breakpoint
 */
export function getCurrentBreakpoint(): keyof typeof BREAKPOINTS {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  
  if (width >= BREAKPOINTS.desktop.min) return 'desktop';
  if (width >= BREAKPOINTS.tablet.min) return 'tablet';
  return 'mobile';
}

/**
 * Hook to detect mobile viewport
 */
export function useIsMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < BREAKPOINTS.tablet.min;
}

/**
 * Hook to detect tablet viewport
 */
export function useIsTablet(): boolean {
  if (typeof window === 'undefined') return false;
  const width = window.innerWidth;
  return width >= BREAKPOINTS.tablet.min && width < BREAKPOINTS.desktop.min;
}

/**
 * Hook to detect desktop viewport
 */
export function useIsDesktop(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= BREAKPOINTS.desktop.min;
}

/**
 * Responsive spacing utilities
 * Returns appropriate spacing based on viewport
 */
export const responsiveSpacing = {
  page: {
    mobile: 'p-4',
    tablet: 'p-6',
    desktop: 'p-8',
    all: 'p-4 md:p-6 lg:p-8',
  },
  section: {
    mobile: 'space-y-4',
    tablet: 'space-y-6',
    desktop: 'space-y-8',
    all: 'space-y-4 md:space-y-6 lg:space-y-8',
  },
  gap: {
    mobile: 'gap-3',
    tablet: 'gap-4',
    desktop: 'gap-6',
    all: 'gap-3 md:gap-4 lg:gap-6',
  },
} as const;

/**
 * Responsive typography utilities
 */
export const responsiveTypography = {
  h1: 'text-2xl md:text-3xl lg:text-4xl',
  h2: 'text-xl md:text-2xl lg:text-3xl',
  h3: 'text-lg md:text-xl lg:text-2xl',
  body: 'text-sm md:text-base',
  small: 'text-xs md:text-sm',
} as const;

/**
 * Responsive grid utilities
 */
export const responsiveGrid = {
  stats: 'grid-cols-2 lg:grid-cols-4',
  cards: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  twoColumn: 'grid-cols-1 lg:grid-cols-2',
  threeColumn: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  sidebar: 'grid-cols-1 lg:grid-cols-3',
} as const;

/**
 * Touch target validation
 * Ensures interactive elements meet minimum size requirements
 */
export function validateTouchTarget(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return rect.width >= TOUCH_TARGET_SIZE.min && rect.height >= TOUCH_TARGET_SIZE.min;
}

/**
 * Apply touch-friendly sizing to buttons and interactive elements
 */
export const touchFriendlyClasses = {
  button: {
    mobile: 'min-h-[44px] min-w-[44px] px-4 py-2.5',
    tablet: 'min-h-[40px] px-4 py-2',
    desktop: 'min-h-[36px] px-4 py-2',
    all: 'min-h-[44px] md:min-h-[40px] lg:min-h-[36px] px-4 py-2.5 md:py-2',
  },
  iconButton: {
    mobile: 'w-11 h-11',
    tablet: 'w-10 h-10',
    desktop: 'w-9 h-9',
    all: 'w-11 h-11 md:w-10 md:h-10 lg:w-9 lg:h-9',
  },
  input: {
    mobile: 'min-h-[44px] px-4 py-3',
    tablet: 'min-h-[40px] px-4 py-2.5',
    desktop: 'min-h-[36px] px-4 py-2',
    all: 'min-h-[44px] md:min-h-[40px] lg:min-h-[36px] px-4 py-3 md:py-2.5 lg:py-2',
  },
} as const;

/**
 * Responsive container utilities
 */
export const responsiveContainer = {
  maxWidth: 'max-w-7xl',
  padding: 'px-4 md:px-6 lg:px-8',
  full: 'max-w-7xl mx-auto px-4 md:px-6 lg:px-8',
} as const;

/**
 * Sidebar responsive behavior
 */
export const sidebarResponsive = {
  width: {
    mobile: 'w-full',
    desktop: 'w-[280px]',
  },
  position: {
    mobile: 'fixed inset-0',
    desktop: 'fixed inset-y-0 left-0',
  },
  overlay: {
    mobile: 'fixed inset-0 bg-black/50 z-40',
    desktop: 'hidden',
  },
} as const;

/**
 * Responsive modal utilities
 */
export const responsiveModal = {
  container: 'w-full max-w-2xl mx-4 md:mx-auto',
  padding: 'p-4 md:p-6 lg:p-8',
  maxHeight: 'max-h-[90vh] md:max-h-[85vh]',
} as const;

/**
 * Responsive table utilities
 */
export const responsiveTable = {
  wrapper: 'overflow-x-auto -mx-4 md:mx-0',
  container: 'min-w-full inline-block align-middle',
  cell: 'px-3 py-2 md:px-4 md:py-3',
} as const;
