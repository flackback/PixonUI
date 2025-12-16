import React from 'react';
import { cn } from '../../utils/cn';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const PrimaryButton = React.forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200',
          'bg-white text-black hover:bg-white/90 active:scale-95',
          'focus:outline-none focus:ring-2 focus:ring-white/20',
          'disabled:opacity-50 disabled:pointer-events-none',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

PrimaryButton.displayName = 'PrimaryButton';