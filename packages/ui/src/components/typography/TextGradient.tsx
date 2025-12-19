import React from 'react';
import { cn } from '../../utils/cn';

export interface TextGradientProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Starting color (Tailwind class)
   * @default 'from-blue-500'
   */
  from?: string;
  /**
   * Ending color (Tailwind class)
   * @default 'to-purple-500'
   */
  to?: string;
  /**
   * Middle color (Tailwind class)
   */
  via?: string;
  /**
   * Gradient direction
   * @default 'r'
   */
  direction?: 'r' | 'l' | 't' | 'b' | 'tr' | 'tl' | 'br' | 'bl';
  /**
   * Enable animated gradient shift
   * @default false
   */
  animate?: boolean;
}

export const TextGradient = React.forwardRef<HTMLSpanElement, TextGradientProps>(
  ({ 
    from = 'from-blue-500', 
    to = 'to-purple-500', 
    via, 
    direction = 'r', 
    animate = false, 
    className, 
    children, 
    ...props 
  }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'bg-clip-text text-transparent bg-gradient-to-' + direction,
          from,
          to,
          via,
          animate && 'animate-gradient bg-[length:200%_auto]',
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

TextGradient.displayName = 'TextGradient';
