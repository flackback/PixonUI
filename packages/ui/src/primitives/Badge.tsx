import React from 'react';
import { cn } from '../utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'neutral';
  children: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors',
          {
            'bg-white/10 text-white ring-white/20': variant === 'default',
            'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20': variant === 'success',
            'bg-amber-500/10 text-amber-400 ring-amber-500/20': variant === 'warning',
            'bg-rose-500/10 text-rose-400 ring-rose-500/20': variant === 'danger',
            'bg-neutral-500/10 text-neutral-400 ring-neutral-500/20': variant === 'neutral',
          },
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
