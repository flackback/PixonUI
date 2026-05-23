import React from 'react';
import { Motion } from '../feedback/Motion';
import { cn } from '../../utils/cn';

export interface OrbitLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Diameter in px. */
  size?: number;
  /** Number of dots. */
  dots?: number;
  /** Dot diameter in px. */
  dotSize?: number;
  /** Rotation duration in ms. */
  duration?: number;
  /** Dot color (defaults to currentColor). */
  color?: string;
}

export function OrbitLoader({
  size = 48,
  dots = 8,
  dotSize = 6,
  duration = 1200,
  color = 'currentColor',
  className,
  style,
  ...props
}: OrbitLoaderProps) {
  const radius = Math.max(0, size / 2 - dotSize / 2);

  return (
    <Motion
      viewport={false}
      visible={true}
      loop
      easing="linear"
      duration={duration}
      keyframes={[{ rotate: 0 }, { rotate: 360 }]}
      className={cn('relative inline-block', className)}
      style={{ width: size, height: size, ...style }}
      aria-label={props['aria-label'] ?? 'Loading'}
      {...props}
    >
      {Array.from({ length: dots }).map((_, i) => {
        const angle = (i / dots) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const delay = (i / dots) * duration;

        return (
          <Motion
            key={i}
            viewport={false}
            visible={true}
            loop
            duration={duration}
            delay={delay}
            easing="linear"
            keyframes={[
              { opacity: 1, scale: 1 },
              { opacity: 0.35, scale: 0.65 },
              { opacity: 1, scale: 1 },
            ]}
            className="absolute"
            style={{
              width: dotSize,
              height: dotSize,
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              marginLeft: -dotSize / 2,
              marginTop: -dotSize / 2,
              borderRadius: 9999,
              backgroundColor: color,
              willChange: 'transform, opacity',
            }}
          >
            {null}
          </Motion>
        );
      })}
    </Motion>
  );
}

export default OrbitLoader;
