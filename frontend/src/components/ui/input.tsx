import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useId } from '@/lib/accessibility';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  success?: boolean;
  label?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    error, 
    success, 
    label, 
    helperText,
    icon,
    iconPosition = 'left',
    id: providedId,
    ...props 
  }, ref) => {
    const generatedId = useId('input');
    const inputId = providedId || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    // Base styles using CSS variables
    const baseStyles = 'w-full px-4 py-2.5 rounded-xl border bg-surface text-text-primary placeholder:text-text-muted transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent disabled:bg-disabled-bg disabled:text-disabled-text disabled:cursor-not-allowed';
    
    // State-specific styles using CSS variables
    const stateStyles = error
      ? 'border-danger focus:ring-danger focus:ring-opacity-50'
      : success
      ? 'border-success focus:ring-success focus:ring-opacity-50'
      : 'border-border-default focus:ring-focus-ring focus:ring-opacity-50 hover:border-border-hover';

    const iconPaddingStyles = icon
      ? iconPosition === 'left'
        ? 'pl-10'
        : 'pr-10'
      : '';

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div 
              className={cn(
                'absolute top-1/2 -translate-y-1/2 text-text-muted',
                iconPosition === 'left' ? 'left-3' : 'right-3'
              )}
            >
              {icon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            className={cn(
              baseStyles,
              stateStyles,
              iconPaddingStyles,
              className
            )}
            ref={ref}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            {...props}
          />
        </div>
        {error && (
          <motion.p
            id={errorId}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-danger flex items-center gap-1"
            role="alert"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </motion.p>
        )}
        {success && !error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-success flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Looks good!
          </motion.p>
        )}
        {helperText && !error && !success && (
          <p id={helperId} className="text-sm text-text-secondary">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };