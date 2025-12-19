import React from 'react';
import { cn } from '../../utils/cn';

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'p' | 'span' | 'div' | 'label';
  variant?: 'default' | 'muted' | 'subtle';
  size?: 'xs' | 'sm' | 'base' | 'lg';
  children: React.ReactNode;
}

export const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ as: Component = 'p', variant = 'default', size = 'base', className, children, ...props }, ref) => {
    return (
      <Component
        ref={ref as any}
        className={cn(
          'leading-relaxed',
          {
            'text-gray-900 dark:text-white': variant === 'default',
            'text-gray-500 dark:text-white/80': variant === 'muted',
            'text-gray-400 dark:text-white/50': variant === 'subtle',
            'text-xs': size === 'xs',
            'text-sm': size === 'sm',
            'text-base': size === 'base',
            'text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Text.displayName = 'Text';
