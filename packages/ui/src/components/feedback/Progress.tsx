import React from 'react';
import { cn } from '../../utils/cn';

export type ProgressVariant = 'default' | 'success' | 'warning' | 'danger' | 'gradient';
export type ProgressSize = 'sm' | 'md' | 'lg';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  isIndeterminate?: boolean;
  hasStripe?: boolean;
  indicatorClassName?: string;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    className, 
    value = 0, 
    max = 100, 
    variant = 'default',
    size = 'md',
    isIndeterminate = false,
    hasStripe = false,
    indicatorClassName, 
    ...props 
  }, ref) => {
    const percentage = isIndeterminate ? 0 : Math.min(Math.max((value || 0) / max, 0), 1) * 100;

    const variants = {
      default: 'bg-gray-900 dark:bg-white dark:shadow-[0_0_10px_rgba(255,255,255,0.5)]',
      success: 'bg-emerald-500 shadow-sm dark:shadow-[0_0_10px_rgba(16,185,129,0.5)]',
      warning: 'bg-amber-500 shadow-sm dark:shadow-[0_0_10px_rgba(245,158,11,0.5)]',
      danger: 'bg-rose-500 shadow-sm dark:shadow-[0_0_10px_rgba(244,63,94,0.5)]',
      gradient: 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 shadow-sm dark:shadow-[0_0_15px_rgba(99,102,241,0.5)]'
    };

    const sizes = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-4'
    };

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={isIndeterminate ? undefined : value}
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-gray-200 dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 backdrop-blur-sm",
          sizes[size],
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full w-full flex-1 transition-all duration-500 ease-in-out relative overflow-hidden",
            variants[variant],
            isIndeterminate && "absolute inset-0 w-full origin-left animate-indeterminate-progress",
            indicatorClassName
          )}
          style={{ 
            transform: isIndeterminate ? undefined : `translateX(-${100 - percentage}%)` 
          }}
        >
          {hasStripe && !isIndeterminate && (
            <div className="absolute inset-0 w-full h-full animate-progress-stripe" 
                 style={{
                   backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)',
                   backgroundSize: '1rem 1rem'
                 }} 
            />
          )}
        </div>
      </div>
    );
  }
);

Progress.displayName = "Progress";
