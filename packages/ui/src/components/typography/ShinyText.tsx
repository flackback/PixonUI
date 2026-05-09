import React from 'react';
import { cn } from '../../utils/cn';

export interface ShinyTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * The predefined premium gradient variant
   * @default 'default'
   */
  variant?: 'default' | 'gold' | 'neon' | 'rainbow' | 'sunset' | 'cyber';
  /**
   * The color of the shimmer sweep (only used for 'default' variant)
   * @default 'rgba(255,255,255,0.3)'
   */
  shimmerColor?: string;
  /**
   * Base text color (only used for 'default' variant)
   * @default 'currentColor'
   */
  baseColor?: string;
  /**
   * Duration/speed of the shimmer sweep animation
   * @default '2s'
   */
  duration?: string;
  /**
   * The angle of the gradient sweep in degrees
   * @default 90
   */
  angle?: number;
  /**
   * Whether the shimmer animation should only play on hover
   * @default false
   */
  hoverOnly?: boolean;
  /**
   * Whether to add a gorgeous text glow backing that matches the gradient
   * @default false
   */
  glow?: boolean;
}

const gradientMap = {
  default: (base: string, shim: string, angle: number) => 
    `linear-gradient(${angle}deg, ${base} 0%, ${base} 40%, ${shim} 50%, ${base} 60%, ${base} 100%)`,
  gold: (angle: number) => 
    `linear-gradient(${angle}deg, #a17c30 0%, #c5a059 35%, #fff3d1 50%, #c5a059 65%, #a17c30 100%)`,
  neon: (angle: number) => 
    `linear-gradient(${angle}deg, #d946ef 0%, #ec4899 30%, #22d3ee 50%, #ec4899 70%, #d946ef 100%)`,
  rainbow: (angle: number) => 
    `linear-gradient(${angle}deg, #ef4444 0%, #f97316 20%, #eab308 40%, #22c55e 60%, #3b82f6 80%, #a855f7 100%)`,
  sunset: (angle: number) => 
    `linear-gradient(${angle}deg, #ea580c 0%, #f97316 35%, #fbcfe8 50%, #f97316 65%, #ea580c 100%)`,
  cyber: (angle: number) => 
    `linear-gradient(${angle}deg, #4f46e5 0%, #6366f1 35%, #a3e635 50%, #6366f1 65%, #4f46e5 100%)`,
};

const glowClassMap = {
  default: 'drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]',
  gold: 'drop-shadow-[0_2px_12px_rgba(197,160,89,0.35)]',
  neon: 'drop-shadow-[0_2px_12px_rgba(217,70,239,0.35)]',
  rainbow: 'drop-shadow-[0_2px_12px_rgba(59,130,246,0.3)]',
  sunset: 'drop-shadow-[0_2px_12px_rgba(249,115,22,0.35)]',
  cyber: 'drop-shadow-[0_2px_12px_rgba(163,230,53,0.35)]',
};

/**
 * A highly interactive, premium typography component that adds a beautiful,
 * flowing shimmer sweep effect to text. Supports premium preset variants,
 * angle configurations, hover triggers, and dynamic backing glows.
 */
export const ShinyText = React.forwardRef<HTMLSpanElement, ShinyTextProps>(
  ({ 
    variant = 'default',
    shimmerColor = 'rgba(255,255,255,0.35)', 
    baseColor = 'currentColor',
    duration = '2s', 
    angle = 90,
    hoverOnly = false,
    glow = false,
    className, 
    children, 
    ...props 
  }, ref) => {
    
    const backgroundImage = variant === 'default'
      ? gradientMap.default(baseColor, shimmerColor, angle)
      : gradientMap[variant](angle);

    return (
      <span
        ref={ref}
        className={cn(
          'inline-block bg-clip-text text-transparent will-change-[background-position] select-none transition-all duration-300',
          hoverOnly ? 'hover:animate-shimmer' : 'animate-shimmer',
          glow && glowClassMap[variant],
          className
        )}
        style={{
          backgroundImage,
          backgroundSize: '200% 100%',
          animationDuration: duration,
          animationIterationCount: 'infinite',
          animationTimingFunction: 'linear',
          backgroundPosition: hoverOnly ? '200% 0' : undefined,
        }}
        {...props}
      >
        {children}
      </span>
    );
  }
);

ShinyText.displayName = 'ShinyText';
