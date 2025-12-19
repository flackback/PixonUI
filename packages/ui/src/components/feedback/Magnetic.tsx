import React, { useRef, useState, useEffect } from 'react';
import { cn } from '../../utils/cn';

export interface MagneticProps {
  children: React.ReactElement;
  strength?: number;
  className?: string;
}

export function Magnetic({ children, strength = 0.5, className }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    
    const { clientX, clientY } = e;
    const { left, top, width, height } = el.getBoundingClientRect();
    
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;
    
    // Only apply if mouse is relatively close
    const threshold = Math.max(width, height) * 1.5;
    if (Math.abs(distanceX) < threshold && Math.abs(distanceY) < threshold) {
      el.style.setProperty('--mag-x', `${distanceX * strength}px`);
      el.style.setProperty('--mag-y', `${distanceY * strength}px`);
    } else {
      el.style.setProperty('--mag-x', '0px');
      el.style.setProperty('--mag-y', '0px');
    }
  };

  const handleMouseLeave = () => {
    const el = ref.current;
    if (el) {
      el.style.setProperty('--mag-x', '0px');
      el.style.setProperty('--mag-y', '0px');
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [strength]);

  return (
    <div
      ref={ref}
      className={cn("inline-block transition-transform duration-300 ease-out will-change-transform", className)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `translate3d(var(--mag-x, 0px), var(--mag-y, 0px), 0)`,
      }}
    >
      {children}
    </div>
  );
}
