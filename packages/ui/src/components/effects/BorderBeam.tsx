import React from 'react';
import { cn } from '../../utils/cn';

export interface BorderBeamProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The animation cycle duration in seconds
   * @default 8
   */
  duration?: number;
  /**
   * Border stroke thickness in pixels
   * @default 1.5
   */
  borderWidth?: number;
  /**
   * Laser start color
   * @default "#a855f7" (violet-500)
   */
  colorFrom?: string;
  /**
   * Laser end/glow color
   * @default "#ec4899" (pink-500)
   */
  colorTo?: string;
  /**
   * Angular spread size of the laser gradient beam (0-360 degrees)
   * @default 90
   */
  beamSize?: number;
}

export const BorderBeam = ({
  duration = 8,
  borderWidth = 1.5,
  colorFrom = '#a855f7',
  colorTo = '#ec4899',
  beamSize = 90,
  className,
  style,
  ...props
}: BorderBeamProps) => {
  return (
    <div
      className={cn(
        'absolute inset-0 pointer-events-none rounded-[inherit]',
        className
      )}
      style={{
        padding: `${borderWidth}px`,
        // CSS Masks to hide everything except the border padding boundary
        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        maskComposite: 'exclude',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        ...style,
      }}
      {...props}
    >
      <div
        className="absolute inset-[-1000%] animate-border-spin"
        style={{
          background: `conic-gradient(from 0deg, transparent ${360 - beamSize}deg, ${colorFrom} ${360 - beamSize / 2}deg, ${colorTo} 360deg)`,
          animationDuration: `${duration}s`,
        }}
      />
      <style>{`
        @keyframes borderSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-border-spin {
          animation: borderSpin linear infinite;
        }
      `}</style>
    </div>
  );
};

BorderBeam.displayName = 'BorderBeam';
