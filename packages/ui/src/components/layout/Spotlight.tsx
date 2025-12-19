import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';

export interface SpotlightProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: number;
  color?: string;
}

export const Spotlight = ({ 
  children, 
  className, 
  size = 300, 
  color = "rgba(255, 255, 255, 0.1)",
  ...props 
}: SpotlightProps) => {
  const divRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = divRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty('--mouse-x', `${x}px`);
    el.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleMouseEnter = () => {
    divRef.current?.style.setProperty('--opacity', '1');
  };

  const handleMouseLeave = () => {
    divRef.current?.style.setProperty('--opacity', '0');
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-black",
        className
      )}
      {...props}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity: 'var(--opacity, 0)',
          background: `radial-gradient(${size}px circle at var(--mouse-x, center) var(--mouse-y, center), ${color}, transparent 80%)`,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
};
