import React, { useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';

export interface TiltProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /**
   * Maximum rotation angle in degrees
   * @default 15
   */
  maxTilt?: number;
  /**
   * Perspective distance in pixels (lower = more intense 3D effect)
   * @default 1000
   */
  perspective?: number;
  /**
   * Scale factor on hover
   * @default 1.04
   */
  scale?: number;
  /**
   * Enable dynamic glare/reflection effect
   * @default true
   */
  glare?: boolean;
  /**
   * Maximum opacity of the glare reflection
   * @default 0.15
   */
  glareMaxOpacity?: number;
}

export const Tilt = ({
  children,
  maxTilt = 15,
  perspective = 1000,
  scale = 1.04,
  glare = true,
  glareMaxOpacity = 0.15,
  className,
  style,
  ...props
}: TiltProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number>(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const left = rect.left;
    const top = rect.top;

    // Mouse position relative to element center (-0.5 to 0.5)
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;

    // Invert Y axes rotation so moving up rotates backward, etc.
    const rotateX = -(y * maxTilt);
    const rotateY = x * maxTilt;

    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      // Apply transforms on container
      el.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;

      if (glare && glareRef.current) {
        const glareEl = glareRef.current;
        const angle = Math.atan2(y, x) * (180 / Math.PI);
        const distance = Math.sqrt(x * x + y * y);
        const opacity = Math.min(distance * glareMaxOpacity, glareMaxOpacity);

        glareEl.style.opacity = '1';
        glareEl.style.background = `linear-gradient(${angle - 180}deg, rgba(255,255,255,${opacity}) 0%, rgba(255,255,255,0) 80%)`;
      }
    });
  };

  const handleMouseEnter = () => {
    const el = containerRef.current;
    if (!el) return;
    el.style.transition = 'transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)';
    if (glare && glareRef.current) {
      glareRef.current.style.transition = 'opacity 0.1s cubic-bezier(0.25, 1, 0.5, 1)';
    }
  };

  const handleMouseLeave = () => {
    const el = containerRef.current;
    if (!el) return;

    cancelAnimationFrame(rafId.current);
    // Reset back to original position smoothly
    el.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
    el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;

    if (glare && glareRef.current) {
      glareRef.current.style.transition = 'opacity 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
      glareRef.current.style.opacity = '0';
    }
  };

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'relative overflow-hidden transition-transform duration-200 ease-out will-change-transform rounded-2xl',
        className
      )}
      style={{
        transformStyle: 'preserve-3d',
        ...style,
      }}
      {...props}
    >
      <div style={{ transform: 'translateZ(20px)', transformStyle: 'preserve-3d' }}>
        {children}
      </div>

      {glare && (
        <div
          ref={glareRef}
          className="absolute inset-0 pointer-events-none opacity-0 mix-blend-overlay"
          style={{
            willChange: 'background, opacity',
          }}
        />
      )}
    </div>
  );
};

Tilt.displayName = 'Tilt';
