import React from 'react';
import { cn } from '../../utils/cn';

export interface TerminalProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: React.ReactNode;
}

export const Terminal = React.forwardRef<HTMLDivElement, TerminalProps>(
  ({ className, title = "Terminal", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "overflow-hidden rounded-2xl border border-gray-200 bg-gray-950 shadow-xl dark:border-white/10",
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-2">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-rose-500/80" />
            <div className="h-3 w-3 rounded-full bg-amber-500/80" />
            <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
          </div>
          <div className="text-xs font-medium text-white/50">{title}</div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
        <div className="p-4 font-mono text-sm text-gray-300">
          {children}
        </div>
      </div>
    );
  }
);
Terminal.displayName = "Terminal";

export const TerminalLine = ({ children, prefix = "$", className }: { children: React.ReactNode, prefix?: string, className?: string }) => (
  <div className={cn("flex gap-2", className)}>
    <span className="select-none text-emerald-400">{prefix}</span>
    <span>{children}</span>
  </div>
);
