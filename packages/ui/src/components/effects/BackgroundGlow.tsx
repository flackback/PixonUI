import React from 'react';
import { cn } from '../../utils/cn';

export interface BackgroundGlowProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Main glow spot color tint
   * @default "rgba(139, 92, 246, 0.15)" (violet-500 light tint)
   */
  color?: string;
  /**
   * Diameter of the glowing spot in pixels
   * @default 350
   */
  size?: number;
  /**
   * The animation floating cycle speed in seconds
   * @default 18
   */
  duration?: number;
  /**
   * Optional second color tint for a dual-blob aesthetic
   * @default "rgba(236, 72, 153, 0.1)" (pink-500 light tint)
   */
  colorSecondary?: string;
}

export const BackgroundGlow = ({
  color = 'rgba(139, 92, 246, 0.15)',
  size = 350,
  duration = 18,
  colorSecondary = 'rgba(236, 72, 153, 0.1)',
  className,
  ...props
}: BackgroundGlowProps) => {
  return (
    <div
      className={cn(
        'absolute inset-0 overflow-hidden pointer-events-none z-0 rounded-[inherit]',
        className
      )}
      {...props}
    >
      {/* Primary Blob */}
      <div
        className="absolute rounded-full filter blur-[80px] animate-bg-glow-float"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: color,
          top: '10%',
          left: '15%',
          animationDuration: `${duration}s`,
        }}
      />

      {/* Secondary Blob (Dual Orbital effect) */}
      <div
        className="absolute rounded-full filter blur-[100px] animate-bg-glow-float-reverse"
        style={{
          width: `${size * 0.9}px`,
          height: `${size * 0.9}px`,
          backgroundColor: colorSecondary,
          bottom: '15%',
          right: '15%',
          animationDuration: `${duration * 1.2}s`,
        }}
      />

      <style>{`
        @keyframes bgGlowFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          33% {
            transform: translate3d(40px, -60px, 0) scale(1.15);
          }
          66% {
            transform: translate3d(-40px, 40px, 0) scale(0.9);
          }
        }
        @keyframes bgGlowFloatReverse {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          33% {
            transform: translate3d(-30px, 50px, 0) scale(0.9);
          }
          66% {
            transform: translate3d(50px, -30px, 0) scale(1.1);
          }
        }
        .animate-bg-glow-float {
          animation: bgGlowFloat ease-in-out infinite;
        }
        .animate-bg-glow-float-reverse {
          animation: bgGlowFloatReverse ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

BackgroundGlow.displayName = 'BackgroundGlow';
