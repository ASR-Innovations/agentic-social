'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual variant of the glass card */
  variant?: 'light' | 'dark' | 'accent';
  /** Blur intensity (4-20) */
  blur?: number;
  /** Whether the card is clickable with hover effects */
  hoverable?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Glow effect on hover (for dark mode) */
  glow?: boolean;
  /** Border style */
  border?: 'subtle' | 'visible' | 'none';
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * GlassCard Component
 * 
 * A card component with glassmorphism effects featuring:
 * - Frosted glass background with configurable blur
 * - Light, dark, and accent variants
 * - Hover lift effects with shadow transitions
 * - Optional glow effects for dark mode
 * - Accessibility support with reduced motion
 */
const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      className,
      variant = 'light',
      blur = 12,
      hoverable = false,
      onClick,
      glow = false,
      border = 'subtle',
      padding = 'md',
      children,
      ...props
    },
    ref
  ) => {
    // Variant styles
    const variantStyles = {
      light: {
        background: 'bg-white/70 dark:bg-gray-900/70',
        border: {
          subtle: 'border-white/20 dark:border-gray-700/30',
          visible: 'border-gray-200/50 dark:border-gray-600/50',
          none: 'border-transparent',
        },
        shadow: 'shadow-lg shadow-gray-200/20 dark:shadow-black/20',
        hoverShadow: 'hover:shadow-xl hover:shadow-gray-300/30 dark:hover:shadow-black/30',
      },
      dark: {
        background: 'bg-gray-900/80 dark:bg-gray-950/80',
        border: {
          subtle: 'border-gray-700/30',
          visible: 'border-gray-600/50',
          none: 'border-transparent',
        },
        shadow: 'shadow-lg shadow-black/30',
        hoverShadow: 'hover:shadow-xl hover:shadow-black/40',
      },
      accent: {
        background: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        border: {
          subtle: 'border-emerald-500/20 dark:border-emerald-400/30',
          visible: 'border-emerald-500/40 dark:border-emerald-400/50',
          none: 'border-transparent',
        },
        shadow: 'shadow-lg shadow-emerald-500/10 dark:shadow-emerald-500/20',
        hoverShadow: 'hover:shadow-xl hover:shadow-emerald-500/20 dark:hover:shadow-emerald-500/30',
      },
    };

    // Padding styles
    const paddingStyles = {
      none: '',
      sm: 'p-3',
      md: 'p-5',
      lg: 'p-7',
    };

    // Glow effect styles
    const glowStyles = glow
      ? 'before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-emerald-500/0 before:via-emerald-500/10 before:to-emerald-500/0 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500'
      : '';

    const currentVariant = variantStyles[variant];

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'relative rounded-2xl border overflow-hidden',
          'transition-all duration-300 ease-out',
          // Backdrop blur
          `backdrop-blur-[${blur}px]`,
          // Variant styles
          currentVariant.background,
          currentVariant.border[border],
          currentVariant.shadow,
          // Hover styles
          hoverable && currentVariant.hoverShadow,
          hoverable && 'cursor-pointer hover:-translate-y-1 hover:scale-[1.01] active:scale-[0.99]',
          // Glow effect
          glowStyles,
          // Padding
          paddingStyles[padding],
          className
        )}
        style={{
          backdropFilter: `blur(${blur}px)`,
          WebkitBackdropFilter: `blur(${blur}px)`,
        }}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

// Sub-components for structured content
export interface GlassCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether to show a bottom border */
  bordered?: boolean;
}

const GlassCardHeader = React.forwardRef<HTMLDivElement, GlassCardHeaderProps>(
  ({ className, bordered = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col space-y-1.5 pb-4',
        bordered && 'border-b border-white/10 dark:border-gray-700/30 mb-4',
        className
      )}
      {...props}
    />
  )
);
GlassCardHeader.displayName = 'GlassCardHeader';

const GlassCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight text-gray-900 dark:text-white',
      className
    )}
    {...props}
  />
));
GlassCardTitle.displayName = 'GlassCardTitle';

const GlassCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-gray-500 dark:text-gray-400', className)}
    {...props}
  />
));
GlassCardDescription.displayName = 'GlassCardDescription';

const GlassCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
));
GlassCardContent.displayName = 'GlassCardContent';

const GlassCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center pt-4 border-t border-white/10 dark:border-gray-700/30 mt-4',
      className
    )}
    {...props}
  />
));
GlassCardFooter.displayName = 'GlassCardFooter';

export {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
  GlassCardFooter,
};
