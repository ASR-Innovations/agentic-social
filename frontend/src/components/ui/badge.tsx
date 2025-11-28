import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/lib/accessibility';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-bg-secondary text-text-secondary border-border-default',
        primary: 'bg-primary/10 text-primary border-primary/20',
        success: 'bg-success/10 text-success border-success/20',
        warning: 'bg-warning/10 text-warning border-warning/20',
        error: 'bg-danger/10 text-danger border-danger/20',
        info: 'bg-info/10 text-info border-info/20',
        purple: 'bg-secondary/10 text-secondary border-secondary/20',
        pink: 'bg-secondary/10 text-secondary border-secondary/20',
        outline: 'bg-transparent border-border-default text-text-primary',
        glass: 'bg-surface-glass backdrop-blur-sm border-border-default text-text-primary',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-xs px-2.5 py-0.5',
        lg: 'text-sm px-3 py-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
}

function Badge({ 
  className, 
  variant, 
  size, 
  icon, 
  removable, 
  onRemove, 
  children,
  ...props 
}: BadgeProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  
  const animationProps = prefersReducedMotion
    ? {}
    : {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { duration: 0.2, ease: 'easeOut' },
      };

  return (
    <motion.div 
      className={cn(badgeVariants({ variant, size }), className)} 
      {...animationProps}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
      {removable && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="flex-shrink-0 ml-0.5 hover:bg-[var(--color-hover-overlay)] rounded-full p-0.5 transition-colors"
          aria-label="Remove"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </motion.div>
  );
}

export { Badge, badgeVariants };