import React, { useRef, useState, useEffect } from 'react';
import { cn } from '../../utils/cn';

export interface MagneticProps {
  children: React.ReactElement;
  strength?: number;
  className?: string;
}

export function Magnetic({ children, strength = 0.5, className }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent) => {
    if (!ref.current) return;
    
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;
    
    // Only apply if mouse is relatively close
    const threshold = Math.max(width, height) * 1.5;
    if (Math.abs(distanceX) < threshold && Math.abs(distanceY) < threshold) {
      setPosition({ 
        x: distanceX * strength, 
        y: distanceY * strength 
      });
    } else {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
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
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
      }}
    >
      {children}
    </div>
  );
}
