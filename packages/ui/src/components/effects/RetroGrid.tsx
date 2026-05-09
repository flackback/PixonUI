import React from 'react';
import { cn } from '../../utils/cn';

export interface RetroGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Grid line color @default 'rgba(168, 85, 247, 0.15)' */
  color?: string;
  /** Perspective depth (higher = flatter) @default 300 */
  perspective?: number;
  /** Grid cell size in pixels @default 60 */
  cellSize?: number;
  /** Animate the grid scrolling @default true */
  animated?: boolean;
  /** Animation speed in seconds @default 8 */
  speed?: number;
  /** Overlay gradient to fade bottom @default true */
  fade?: boolean;
}

/**
 * Retro perspective grid background with optional animation.
 * Perfect for hero sections and landing pages.
 *
 * @example
 * ```tsx
 * <div className="relative h-[400px]">
 *   <RetroGrid color="rgba(99, 102, 241, 0.15)" />
 *   <div className="relative z-10 flex items-center justify-center h-full">
 *     <h1>Welcome</h1>
 *   </div>
 * </div>
 * ```
 */
export function RetroGrid({
  color = 'rgba(168, 85, 247, 0.15)',
  perspective = 300,
  cellSize = 60,
  animated = true,
  speed = 8,
  fade = true,
  className,
  style,
  ...props
}: RetroGridProps) {
  return (
    <div
      className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}
      style={style}
      {...props}
    >
      {/* Grid plane */}
      <div
        className="absolute inset-0 [transform-style:preserve-3d]"
        style={{
          perspective: `${perspective}px`,
        }}
      >
        <div
          className="absolute inset-x-[-50%] top-[50%] h-[200%] origin-top"
          style={{
            transform: 'rotateX(65deg)',
            backgroundImage: `
              linear-gradient(to right, ${color} 1px, transparent 1px),
              linear-gradient(to bottom, ${color} 1px, transparent 1px)
            `,
            backgroundSize: `${cellSize}px ${cellSize}px`,
            animation: animated ? `retro-grid-scroll ${speed}s linear infinite` : undefined,
          }}
        />
      </div>

      {/* Fade overlay */}
      {fade && (
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, var(--retro-grid-bg, rgb(9, 9, 11)) 90%)',
          }}
        />
      )}

      <style>{`
        @keyframes retro-grid-scroll {
          from { transform: rotateX(65deg) translateY(0); }
          to { transform: rotateX(65deg) translateY(${cellSize}px); }
        }
      `}</style>
    </div>
  );
}

RetroGrid.displayName = 'RetroGrid';
