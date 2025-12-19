import React from 'react';
import { cn } from '../../utils/cn';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: number;
  gap?: number | string;
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols = 1, gap = 4, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('grid', className)}
        style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gap: typeof gap === 'number' ? `${gap * 0.25}rem` : gap,
            ...style
        }}
        {...props}
      />
    );
  }
);
Grid.displayName = 'Grid';
