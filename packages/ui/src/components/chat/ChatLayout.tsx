import React from 'react';
import { cn } from '../../utils/cn';

interface ChatLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ChatLayout({ children, className, ...props }: ChatLayoutProps) {
  return (
    <div 
      className={cn(
        "flex h-[800px] w-full overflow-hidden rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/40 backdrop-blur-xl shadow-2xl",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}
