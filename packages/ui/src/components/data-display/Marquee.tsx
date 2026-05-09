import React from 'react';
import { cn } from '../../utils/cn';

export interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Scroll direction */
  direction?: 'left' | 'right' | 'up' | 'down';
  /** Duration of one full cycle in seconds @default 30 */
  speed?: number;
  /** Pause animation on hover @default true */
  pauseOnHover?: boolean;
  /** Fade edges with gradient mask @default true */
  fade?: boolean;
  /** Fade width in pixels @default 64 */
  fadeWidth?: number;
  /** Number of content duplicates @default 2 */
  repeat?: number;
  /** Gap between items in pixels @default 16 */
  gap?: number;
}

/**
 * Infinite scrolling marquee for logos, testimonials, or any repeating content.
 * Pure CSS animation — zero JS runtime.
 *
 * @example
 * ```tsx
 * <Marquee speed={25} pauseOnHover>
 *   <img src="/logo1.svg" />
 *   <img src="/logo2.svg" />
 *   <img src="/logo3.svg" />
 * </Marquee>
 * ```
 */
export function Marquee({
  children,
  direction = 'left',
  speed = 30,
  pauseOnHover = true,
  fade = true,
  fadeWidth = 64,
  repeat = 2,
  gap = 16,
  className,
  style,
  ...props
}: MarqueeProps) {
  const isVertical = direction === 'up' || direction === 'down';
  const isReverse = direction === 'right' || direction === 'down';

  const maskStyle = fade
    ? {
        maskImage: isVertical
          ? `linear-gradient(to bottom, transparent 0%, black ${fadeWidth}px, black calc(100% - ${fadeWidth}px), transparent 100%)`
          : `linear-gradient(to right, transparent 0%, black ${fadeWidth}px, black calc(100% - ${fadeWidth}px), transparent 100%)`,
        WebkitMaskImage: isVertical
          ? `linear-gradient(to bottom, transparent 0%, black ${fadeWidth}px, black calc(100% - ${fadeWidth}px), transparent 100%)`
          : `linear-gradient(to right, transparent 0%, black ${fadeWidth}px, black calc(100% - ${fadeWidth}px), transparent 100%)`,
      }
    : {};

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        isVertical ? 'flex flex-col' : 'flex',
        className
      )}
      style={{ ...maskStyle, ...style }}
      {...props}
    >
      {Array.from({ length: repeat }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'flex shrink-0',
            isVertical ? 'flex-col' : 'flex-row',
            pauseOnHover && '[.group:hover_&]:animation-play-state-paused',
          )}
          style={{
            gap: `${gap}px`,
            animation: `marquee-${isVertical ? 'vertical' : 'horizontal'} ${speed}s linear infinite`,
            animationDirection: isReverse ? 'reverse' : 'normal',
            ...(pauseOnHover ? {} : {}),
          }}
          aria-hidden={i > 0}
        >
          {children}
        </div>
      ))}

      <style>{`
        @keyframes marquee-horizontal {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
        @keyframes marquee-vertical {
          from { transform: translateY(0); }
          to { transform: translateY(-100%); }
        }
        ${pauseOnHover ? `
        .group:hover > div > div,
        div:hover > div {
          animation-play-state: paused !important;
        }
        ` : ''}
      `}</style>
    </div>
  );
}

Marquee.displayName = 'Marquee';
