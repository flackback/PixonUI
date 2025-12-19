import React from 'react';
import { cn } from '../../utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circle' | 'text';
}

export function Skeleton({ className, variant = 'default', ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-gray-200 dark:bg-white/10",
        variant === 'circle' && "rounded-full",
        variant === 'default' && "rounded-xl",
        variant === 'text' && "rounded h-4 w-full",
        className
      )}
      {...props}
    />
  );
}
