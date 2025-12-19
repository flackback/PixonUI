import React from 'react';
import { cn } from '../../utils/cn';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const PrimaryButton = React.forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ children, className, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={props.type ?? 'button'}
        className={cn(
          'group relative inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3',
          'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600',
          'text-white font-semibold tracking-tight',
          'shadow-[0_12px_40px_rgba(99,102,241,.45)]',
          'transition-all duration-300',
          'hover:scale-[1.03] hover:shadow-[0_18px_60px_rgba(99,102,241,.6)]',
          'active:scale-[0.98]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'focus:outline-none focus:ring-2 focus:ring-purple-400/40',
          className
        )}
        {...props}
      >
        <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-white/18 via-white/5 to-white/18 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-100" />
        <span className="relative inline-flex items-center gap-2">
          {leftIcon}
          {children}
          {rightIcon}
        </span>
      </button>
    );
  }
);

PrimaryButton.displayName = 'PrimaryButton';