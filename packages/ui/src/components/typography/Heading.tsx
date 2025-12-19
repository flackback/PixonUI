import React from 'react';
import { cn } from '../../utils/cn';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
  children: React.ReactNode;
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ as: Component = 'h2', weight = 'bold', className, children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          'tracking-tight text-white',
          {
            'text-4xl md:text-5xl lg:text-6xl': Component === 'h1',
            'text-3xl md:text-4xl': Component === 'h2',
            'text-2xl md:text-3xl': Component === 'h3',
            'text-xl md:text-2xl': Component === 'h4',
            'text-lg md:text-xl': Component === 'h5',
            'text-base md:text-lg': Component === 'h6',
          },
          {
            'font-normal': weight === 'normal',
            'font-medium': weight === 'medium',
            'font-semibold': weight === 'semibold',
            'font-bold': weight === 'bold',
            'font-extrabold': weight === 'extrabold',
            'font-black': weight === 'black',
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
