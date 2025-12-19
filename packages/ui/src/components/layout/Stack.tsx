import React from 'react';
import { cn } from '../../utils/cn';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  gap?: number | string;
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
}

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className, direction = 'col', gap = 4, align, justify, wrap, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          {
            'flex-row': direction === 'row',
            'flex-col': direction === 'col',
            'flex-row-reverse': direction === 'row-reverse',
            'flex-col-reverse': direction === 'col-reverse',
            'flex-wrap': wrap,
            'items-start': align === 'start',
            'items-end': align === 'end',
            'items-center': align === 'center',
            'items-baseline': align === 'baseline',
            'items-stretch': align === 'stretch',
            'justify-start': justify === 'start',
            'justify-end': justify === 'end',
            'justify-center': justify === 'center',
            'justify-between': justify === 'between',
            'justify-around': justify === 'around',
            'justify-evenly': justify === 'evenly',
          },
          className
        )}
        style={{
            gap: typeof gap === 'number' ? `${gap * 0.25}rem` : gap,
            ...style
        }}
        {...props}
      />
    );
  }
);
Stack.displayName = 'Stack';
