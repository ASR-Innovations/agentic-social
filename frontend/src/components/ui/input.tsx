import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  variant?: 'default' | 'clean';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, variant = 'default', ...props }, ref) => {
    const inputStyles = variant === 'clean'
      ? 'w-full h-11 px-4 py-3 bg-white border border-gray-300 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all duration-150'
      : 'w-full h-11 px-4 py-3 bg-white border border-gray-200 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-brand-green transition-all duration-150';

    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            inputStyles,
            error && 'border-red-500 focus:ring-red-500/50 focus:border-red-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-500 mt-1">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };