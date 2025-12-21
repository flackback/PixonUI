import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface PageLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'spinner' | 'bar' | 'dots' | 'logo' | 'glass';
  text?: string;
  fullscreen?: boolean;
}

export function PageLoader({
  variant = 'spinner',
  text,
  fullscreen = true,
  className,
  ...props
}: PageLoaderProps) {
  const baseStyles = fullscreen
    ? 'fixed inset-0 z-[200] flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm'
    : 'flex items-center justify-center p-8 w-full h-full min-h-[200px]';

  if (variant === 'bar') {
    return (
      <div className={cn('fixed top-0 left-0 right-0 z-[200] h-1 bg-transparent', className)} {...props}>
        <div className="h-full bg-blue-500 animate-indeterminate-progress origin-left" />
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={cn(baseStyles, className)} {...props}>
        <div className="flex space-x-2">
          <div className="h-3 w-3 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
          <div className="h-3 w-3 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]" />
          <div className="h-3 w-3 rounded-full bg-blue-500 animate-bounce" />
        </div>
        {text && <span className="ml-4 text-sm font-medium text-gray-500 dark:text-white/70">{text}</span>}
      </div>
    );
  }

  if (variant === 'logo') {
    return (
      <div className={cn(baseStyles, className)} {...props}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-white/[0.06] shadow-lg ring-1 ring-black/5">
            <div className="absolute inset-0 rounded-full animate-ping bg-blue-500/20" />
            <div className="h-8 w-8 rounded bg-blue-500" />
          </div>
          {text && <span className="text-sm font-medium text-gray-500 dark:text-white/70 animate-pulse">{text}</span>}
        </div>
      </div>
    );
  }

  if (variant === 'glass') {
    return (
      <div className={cn(baseStyles, 'bg-white/30 dark:bg-black/30 backdrop-blur-md', className)} {...props}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          {text && <span className="text-sm font-medium text-white tracking-wider">{text}</span>}
        </div>
      </div>
    );
  }

  // Default: spinner
  return (
    <div className={cn(baseStyles, className)} {...props}>
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        {text && <span className="text-sm font-medium text-gray-500 dark:text-white/70">{text}</span>}
      </div>
    </div>
  );
}
