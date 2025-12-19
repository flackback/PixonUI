import React from 'react';
import { cn } from '../../utils/cn';

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'vertical' | 'horizontal' | 'both';
  scrollbarSize?: 'sm' | 'md' | 'lg';
}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, orientation = 'vertical', scrollbarSize = 'sm', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'overflow-auto',
          // Scrollbar base styles
          '[&::-webkit-scrollbar]:bg-transparent',
          '[&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-white/10',
          '[&::-webkit-scrollbar-thumb]:rounded-full',
          'hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-white/20',
          '[&::-webkit-scrollbar-track]:bg-transparent',
          
          // Firefox support
          '[scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.2)_transparent] dark:[scrollbar-color:rgba(255,255,255,0.1)_transparent]',
          
          // Orientation specific
          orientation === 'vertical' && 'overflow-y-auto overflow-x-hidden',
          orientation === 'horizontal' && 'overflow-x-auto overflow-y-hidden',
          orientation === 'both' && 'overflow-auto',

          // Size specific
          scrollbarSize === 'sm' && '[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5',
          scrollbarSize === 'md' && '[&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar]:h-2.5',
          scrollbarSize === 'lg' && '[&::-webkit-scrollbar]:w-4 [&::-webkit-scrollbar]:h-4',
          
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ScrollArea.displayName = 'ScrollArea';
