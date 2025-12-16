import React from 'react';
import { cn } from '../utils/cn';

interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Surface.displayName = 'Surface';