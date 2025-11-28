import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/lib/accessibility';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default: 'bg-gray-900 hover:bg-gray-800 text-white shadow-none transition-all duration-200 focus-visible:ring-gray-900',
        primary: 'text-white shadow-none transition-all duration-200 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] focus-visible:ring-[var(--color-primary)]',
        destructive: 'bg-red-600 hover:bg-red-700 text-white shadow-none transition-all duration-200 focus-visible:ring-red-600',
        outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-none transition-all duration-200 focus-visible:ring-gray-900',
        secondary: 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 shadow-none transition-all duration-200 focus-visible:ring-gray-900',
        ghost: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 shadow-none transition-all duration-200 focus-visible:ring-gray-900',
        link: 'underline-offset-4 hover:underline transition-colors duration-200 text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] focus-visible:ring-[var(--color-primary)]',
        success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-none transition-all duration-200 focus-visible:ring-emerald-600',
        warning: 'bg-orange-500 hover:bg-orange-600 text-white shadow-none transition-all duration-200 focus-visible:ring-orange-500',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, icon, children, disabled, ...props }, ref) => {
    const prefersReducedMotion = usePrefersReducedMotion();
    const Comp = asChild ? Slot : motion.button;
    
    // Animation props
    const animationProps = prefersReducedMotion
      ? {}
      : {
          whileHover: { scale: 1.02 },
          whileTap: { scale: 0.98 },
          transition: { duration: 0.2, ease: 'easeInOut' },
        };
    
    // If asChild is true and loading is true, we can't use Slot because it expects a single child
    if (asChild && loading) {
      console.warn('Button: asChild and loading cannot be used together. Using regular button instead.');
      return (
        <motion.button
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          disabled={disabled || loading}
          {...animationProps}
          {...props}
        >
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {children}
        </motion.button>
      );
    }
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...(!asChild && animationProps)}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {icon && !loading && <span className="mr-2">{icon}</span>}
        {children}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };