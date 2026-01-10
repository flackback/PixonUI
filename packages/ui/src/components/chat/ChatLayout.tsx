import React from 'react';
import { cn } from '../../utils/cn';

interface ChatLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ChatLayout({ children, className, ...props }: ChatLayoutProps) {
  return (
    <div 
      className={cn(
        "flex h-full w-full overflow-hidden border border-gray-200 dark:border-white/5 bg-zinc-50 dark:bg-zinc-950/50 backdrop-blur-xl",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}
