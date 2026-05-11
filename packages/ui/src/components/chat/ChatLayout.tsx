import React from 'react';
import { cn } from '../../utils/cn';

interface ChatLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  rtl?: boolean;
  locale?: 'en' | 'pt';
  translations?: Record<string, string>;
}

export function ChatLayout({ children, className, rtl, locale = 'en', translations, ...props }: ChatLayoutProps) {
  const isRtl = rtl ?? (typeof document !== 'undefined' ? document.documentElement.dir === 'rtl' : false);
  return (
    <div 
      dir={isRtl ? "rtl" : "ltr"}
      className={cn(
        "flex h-full w-full overflow-hidden border border-gray-200 dark:border-white/5 bg-white dark:bg-zinc-950/50 backdrop-blur-xl",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}
