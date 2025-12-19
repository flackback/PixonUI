import React from 'react';
import { cn } from '../../utils/cn';

export interface ShinyTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * The color of the shimmer effect
   * @default 'rgba(255,255,255,0.3)'
   */
  shimmerColor?: string;
  /**
   * Duration of the animation
   * @default '2s'
   */
  duration?: string;
  /**
   * Base text color
   * @default 'currentColor'
   */
  baseColor?: string;
}

export const ShinyText = React.forwardRef<HTMLSpanElement, ShinyTextProps>(
  ({ 
    shimmerColor = 'rgba(255,255,255,0.3)', 
    duration = '2s', 
    baseColor = 'currentColor',
    className, 
    children, 
    ...props 
  }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-block bg-clip-text text-transparent animate-shimmer will-change-[background-position]',
          className
        )}
        style={{
          backgroundImage: `linear-gradient(90deg, ${baseColor} 0%, ${baseColor} 40%, ${shimmerColor} 50%, ${baseColor} 60%, ${baseColor} 100%)`,
          backgroundSize: '200% 100%',
          animationDuration: duration,
          animationIterationCount: 'infinite',
          animationTimingFunction: 'linear',
        }}
        {...props}
      >
        {children}
      </span>
    );
  }
);

ShinyText.displayName = 'ShinyText';
