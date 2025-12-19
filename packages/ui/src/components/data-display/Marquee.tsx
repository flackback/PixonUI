import React from 'react';
import { cn } from '../../utils/cn';

export interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  pauseOnHover?: boolean;
  direction?: 'left' | 'right';
  speed?: 'slow' | 'normal' | 'fast';
  children: React.ReactNode;
}

export const Marquee = ({ 
  className, 
  pauseOnHover = false, 
  direction = 'left', 
  speed = 'normal',
  children, 
  ...props 
}: MarqueeProps) => {
  
  const speeds = {
    slow: "40s",
    normal: "20s",
    fast: "10s",
  };

  return (
    <div 
      className={cn("group flex overflow-hidden p-2 [--gap:1rem] [gap:var(--gap)]", className)} 
      {...props}
    >
      <div 
        className={cn(
          "flex shrink-0 justify-around [gap:var(--gap)] min-w-full",
          direction === 'left' ? "animate-marquee" : "animate-marquee-reverse",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
        style={{ animationDuration: speeds[speed] }}
      >
        {children}
      </div>
      <div 
        aria-hidden="true"
        className={cn(
          "flex shrink-0 justify-around [gap:var(--gap)] min-w-full",
          direction === 'left' ? "animate-marquee" : "animate-marquee-reverse",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
        style={{ animationDuration: speeds[speed] }}
      >
        {children}
      </div>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(calc(-100% - var(--gap))); }
        }
        @keyframes marquee-reverse {
          from { transform: translateX(calc(-100% - var(--gap))); }
          to { transform: translateX(0); }
        }
        .animate-marquee {
          animation: marquee linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse linear infinite;
        }
      `}</style>
    </div>
  );
};
