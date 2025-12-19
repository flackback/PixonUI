import React from 'react';
import { cn } from '../../utils/cn';
import { useInView } from '../../hooks/useInView';

export interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  delay?: number;
  boxColor?: string;
}

export function Reveal({
  children,
  direction = 'up',
  duration = 0.5,
  delay = 0,
  boxColor = 'bg-blue-500',
  className,
  ...props
}: RevealProps) {
  const { ref, hasAnimated } = useInView({ threshold: 0.2 });

  const directionClasses = {
    up: 'translate-y-full',
    down: '-translate-y-full',
    left: 'translate-x-full',
    right: '-translate-x-full',
  };

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden inline-block", className)}
      {...props}
    >
      <div
        className={cn(
          "transition-all ease-out",
          hasAnimated ? "translate-x-0 translate-y-0 opacity-100" : cn("opacity-0", directionClasses[direction])
        )}
        style={{ 
          transitionDuration: `${duration}s`,
          transitionDelay: `${delay}s`
        }}
      >
        {children}
      </div>
      
      {/* Reveal Box Overlay */}
      <div
        className={cn(
          "absolute inset-0 z-10 transition-transform ease-in-out",
          boxColor,
          hasAnimated ? (direction === 'left' || direction === 'right' ? 'scale-x-0' : 'scale-y-0') : 'scale-100'
        )}
        style={{ 
          transitionDuration: `${duration}s`,
          transitionDelay: `${delay}s`,
          transformOrigin: direction === 'up' ? 'top' : direction === 'down' ? 'bottom' : direction === 'left' ? 'left' : 'right'
        }}
      />
    </div>
  );
}
