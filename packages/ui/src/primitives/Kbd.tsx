import React from 'react';
import { cn } from '../utils/cn';

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <kbd
        ref={ref}
        className={cn(
          'rounded-lg border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/[0.03] px-2 py-1 text-[11px] font-semibold text-gray-500 dark:text-white/65',
          className
        )}
        {...props}
      >
        {children}
      </kbd>
    );
  }
);

Kbd.displayName = 'Kbd';
