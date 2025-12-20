import React from 'react';
import { cn } from '../../utils/cn';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  gap?: number | string;
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols = 1, sm, md, lg, xl, gap = 4, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          sm && `sm:grid-cols-${sm}`,
          md && `md:grid-cols-${md}`,
          lg && `lg:grid-cols-${lg}`,
          xl && `xl:grid-cols-${xl}`,
          className
        )}
        style={{
            gridTemplateColumns: cols ? `repeat(${cols}, minmax(0, 1fr))` : undefined,
            gap: typeof gap === 'number' ? `${gap * 0.25}rem` : gap,
            ...style
        }}
        {...props}
      />
    );
  }
);
Grid.displayName = 'Grid';
