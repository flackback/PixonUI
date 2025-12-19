import React from 'react';
import { cn } from '../../utils/cn';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: React.ReactNode;
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ as: Component = 'h2', className, children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          'font-bold tracking-tight text-gray-900 dark:text-white',
          {
            'text-4xl': Component === 'h1',
            'text-3xl': Component === 'h2',
            'text-2xl': Component === 'h3',
            'text-xl': Component === 'h4',
            'text-lg': Component === 'h5',
            'text-base': Component === 'h6',
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

Heading.displayName = 'Heading';
