import React from 'react';
import { Motion } from '../feedback/Motion';
import { cn } from '../../utils/cn';

export interface CometLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Diameter in px. */
  size?: number;
  /** Thickness of the orbit ring in px. */
  thickness?: number;
  /** Duration in ms per revolution. */
  duration?: number;
  /** Color used for the comet (defaults to currentColor). */
  color?: string;
}

export function CometLoader({
  size = 48,
  thickness = 3,
  duration = 1100,
  color = 'currentColor',
  className,
  style,
  ...props
}: CometLoaderProps) {
  const dot = Math.max(4, Math.round(thickness * 2.2));

  return (
    <div
      className={cn('relative inline-block', className)}
      style={{ width: size, height: size, ...style }}
      aria-label={props['aria-label'] ?? 'Loading'}
      {...props}
    >
      {/* faint ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          border: `${thickness}px solid rgba(255,255,255,0.12)`,
        }}
      />

      {/* comet head + tail (rotation is visible because gradient is not symmetric) */}
      <Motion
        viewport={false}
        visible={true}
        loop
        easing="linear"
        duration={duration}
        keyframes={[{ rotate: 0 }, { rotate: 360 }]}
        className="absolute inset-0"
        style={{ willChange: 'transform' }}
      >
        {/* tail */}
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            width: size,
            height: thickness,
            marginLeft: -size / 2,
            marginTop: -thickness / 2,
            borderRadius: 9999,
            background: `linear-gradient(90deg, rgba(255,255,255,0) 0%, ${color} 100%)`,
            opacity: 0.9,
            filter: 'blur(0.2px)',
          }}
        />

        {/* head */}
        <div
          className="absolute left-1/2 top-0"
          style={{
            width: dot,
            height: dot,
            marginLeft: -dot / 2,
            marginTop: -dot / 2,
            borderRadius: 9999,
            backgroundColor: color,
            boxShadow: `0 0 ${Math.max(10, dot * 2)}px ${color}`,
          }}
        />
      </Motion>
    </div>
  );
}

export default CometLoader;

