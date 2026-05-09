import React, { useRef, useState } from 'react';
import { cn } from '../../utils/cn';
import { useMousePosition } from '../../hooks/useMousePosition';

export interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: string;
  glowSize?: number;
}

export const GlowCard = React.forwardRef<HTMLDivElement, GlowCardProps>(
  (
    {
      className,
      children,
      glowColor = 'rgba(6, 182, 212, 0.15)',
      glowSize = 300,
      style,
      onMouseEnter,
      onMouseLeave,
      ...props
    },
    ref
  ) => {
    const localRef = useRef<HTMLDivElement>(null);
    const resolvedRef = (ref || localRef) as React.RefObject<HTMLDivElement>;
    const [isHovered, setIsHovered] = useState(false);

    const { elementX, elementY } = useMousePosition(resolvedRef);

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
      setIsHovered(true);
      if (onMouseEnter) onMouseEnter(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      setIsHovered(false);
      if (onMouseLeave) onMouseLeave(e);
    };

    return (
      <div
        ref={resolvedRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-gray-200/50 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-md p-6 shadow-sm transition-shadow duration-300 hover:shadow-md dark:hover:shadow-cyan-500/5",
          className
        )}
        style={style}
        {...props}
      >
        {/* Glow spotlight layer overlay */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(${glowSize}px circle at ${elementX}px ${elementY}px, ${glowColor}, transparent 80%)`,
          }}
        />

        {/* Border glow layer (highly premium aesthetic) */}
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            border: '1px solid transparent',
            background: `radial-gradient(${glowSize / 1.5}px circle at ${elementX}px ${elementY}px, ${glowColor.replace(/[^,]+(?=\))/, '0.4')}, transparent 80%) border-box`,
            WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'destination-out',
            maskComposite: 'exclude',
          }}
        />

        {/* Content container */}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

GlowCard.displayName = "GlowCard";
