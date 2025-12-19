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
        ref={ref as React.Ref<any>}
        className={cn(
          'leading-relaxed transition-colors duration-200',
          code && 'font-mono bg-zinc-100 dark:bg-white/5 px-1.5 py-0.5 rounded text-[0.9em]',
          {
            // Variants
            'text-zinc-900 dark:text-white': variant === 'default',
            'text-zinc-500 dark:text-zinc-400': variant === 'muted',
            'text-zinc-400 dark:text-zinc-500': variant === 'subtle',
            'text-lg md:text-xl text-zinc-600 dark:text-zinc-300 font-light': variant === 'lead',
            'text-rose-600 dark:text-rose-400': variant === 'error',
            'text-emerald-600 dark:text-emerald-400': variant === 'success',
            'text-amber-600 dark:text-amber-400': variant === 'warning',
            'text-sky-600 dark:text-sky-400': variant === 'info',
            
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
