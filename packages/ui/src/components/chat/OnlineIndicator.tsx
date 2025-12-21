import React from 'react';
import { cn } from '../../utils/cn';

interface OnlineIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: 'online' | 'offline' | 'away' | 'busy';
  size?: 'sm' | 'md' | 'lg';
}

export function OnlineIndicator({ status = 'offline', size = 'md', className, ...props }: OnlineIndicatorProps) {
  const colors = {
    online: "bg-green-500",
    offline: "bg-gray-400",
    away: "bg-amber-500",
    busy: "bg-red-500"
  };

  const sizes = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4"
  };

  return (
    <span 
      className={cn(
        "rounded-full border-2 border-white dark:border-black shrink-0",
        colors[status],
        sizes[size],
        status === 'online' && "animate-pulse",
        className
      )} 
      {...props}
    />
  );
}
