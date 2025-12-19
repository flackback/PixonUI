import React from 'react';
import { cn } from '../utils/cn';
import { useScroll } from '../hooks/useScroll';

export interface ScrollProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: string;
  height?: number | string;
  position?: 'top' | 'bottom';
}

export function ScrollProgress({ 
  className, 
  color = 'bg-blue-500', 
  height = 2, 
  position = 'top',
  ...props 
}: ScrollProgressProps) {
  const { scrollProgressY } = useScroll();

  return (
    <div
      className={cn(
        "fixed left-0 right-0 z-[100] w-full pointer-events-none",
        position === 'top' ? 'top-0' : 'bottom-0',
        className
      )}
      style={{ height }}
      {...props}
    >
      <div
        className={cn("h-full transition-all duration-75 ease-out", color)}
        style={{ 
          width: `${scrollProgressY * 100}%`,
          boxShadow: scrollProgressY > 0 ? `0 0 10px ${color.replace('bg-', 'var(--')}` : 'none'
        }}
      />
    </div>
  );
}
