import React from 'react';
import { cn } from '../utils/cn';

interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
}

export const Divider = React.forwardRef<HTMLHRElement, DividerProps>(
  ({ orientation = 'horizontal', className, ...props }, ref) => {
    return (
      <hr
        ref={ref}
        className={cn(
          'border-0 bg-white/10',
          {
            'h-px w-full': orientation === 'horizontal',
            'h-full w-px': orientation === 'vertical',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Divider.displayName = 'Divider';
