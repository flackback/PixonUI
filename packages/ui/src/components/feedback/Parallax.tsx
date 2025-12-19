import React, { useEffect, useRef } from 'react';
import { cn } from '../../utils/cn';

interface ParallaxProps extends React.HTMLAttributes<HTMLDivElement> {
  speed?: number; // -1 to 1. Positive = moves slower (depth), Negative = moves faster.
  direction?: 'vertical' | 'horizontal';
}

export function Parallax({ 
  children, 
  speed = 0.1, 
  direction = 'vertical',
  className,
  ...props 
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Optimization: Only animate if roughly in view
      if (rect.top > windowHeight || rect.bottom < 0) return;

      // Calculate distance from center of viewport
      // 0 = center, -val = above center, +val = below center
      const centerOffset = (windowHeight / 2) - (rect.top + rect.height / 2);
      
      const translate = centerOffset * speed;

      if (direction === 'vertical') {
        element.style.transform = `translate3d(0, ${translate}px, 0)`;
      } else {
        element.style.transform = `translate3d(${translate}px, 0, 0)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, direction]);

  return (
    <div 
      ref={ref} 
      className={cn('will-change-transform', className)} 
      {...props}
    >
      {children}
    </div>
  );
}
