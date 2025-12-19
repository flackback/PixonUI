import React from 'react';
import { cn } from '../../utils/cn';

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'p' | 'span' | 'div' | 'label' | 'code';
  variant?: 'default' | 'muted' | 'subtle' | 'lead' | 'error' | 'success' | 'warning' | 'info';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  code?: boolean;
  children: React.ReactNode;
}

export const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ 
    as: Component = 'p', 
    variant = 'default', 
    size = 'base', 
    weight = 'normal',
    code = false,
    className, 
    children, 
    ...props 
  }, ref) => {
    return (
      <Component
        ref={ref as any}
        className={cn(
          'leading-relaxed',
          code && 'font-mono bg-white/5 px-1.5 py-0.5 rounded text-[0.9em]',
          {
            // Variants
            'text-gray-900 dark:text-white': variant === 'default',
            'text-gray-500 dark:text-white/60': variant === 'muted',
            'text-gray-400 dark:text-white/40': variant === 'subtle',
            'text-lg md:text-xl text-white/70 font-light': variant === 'lead',
            'text-red-500': variant === 'error',
            'text-green-500': variant === 'success',
            'text-yellow-500': variant === 'warning',
            'text-blue-500': variant === 'info',
            
            // Sizes
            'text-xs': size === 'xs',
            'text-sm': size === 'sm',
            'text-base': size === 'base',
            'text-lg': size === 'lg',
            'text-xl': size === 'xl',
            'text-2xl': size === '2xl',

            // Weights
            'font-light': weight === 'light',
            'font-normal': weight === 'normal',
            'font-medium': weight === 'medium',
            'font-semibold': weight === 'semibold',
            'font-bold': weight === 'bold',
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
