import React from 'react';
import { cn } from '../../utils/cn';

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <aside
        ref={ref}
        className={cn(
          "flex h-full w-64 flex-col border-r backdrop-blur-xl transition-colors duration-200",
          "border-gray-200 bg-white/50",
          "dark:border-white/10 dark:bg-black/20",
          className
        )}
        {...props}
      >
        {children}
      </aside>
    );
  }
);

export interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SidebarHeader = React.forwardRef<HTMLDivElement, SidebarHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex h-16 items-center px-6 border-b border-gray-200 dark:border-white/5", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

export interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SidebarContent = React.forwardRef<HTMLDivElement, SidebarContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex-1 overflow-y-auto py-4 px-3 space-y-1", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

export interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SidebarFooter = React.forwardRef<HTMLDivElement, SidebarFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("p-4 border-t border-gray-200 dark:border-white/5", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

export interface SidebarItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

export const SidebarItem = React.forwardRef<HTMLButtonElement, SidebarItemProps>(
  ({ className, children, active, icon, badge, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
          "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/5 dark:hover:text-white",
          active 
            ? "bg-gray-200 text-gray-900 dark:bg-white/10 dark:text-white" 
            : "text-gray-600 dark:text-white/60",
          className
        )}
        {...props}
      >
        {icon && <span className={cn("flex h-4 w-4 items-center justify-center", active ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-white/60")}>{icon}</span>}
        <span className="flex-1 text-left">{children}</span>
        {badge && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-200 dark:bg-white/10 px-1.5 text-[10px] font-bold text-gray-900 dark:text-white">
            {badge}
          </span>
        )}
      </button>
    );
  }
);

export interface SidebarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
}

export const SidebarGroup = React.forwardRef<HTMLDivElement, SidebarGroupProps>(
  ({ className, children, label, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("mb-6", className)} {...props}>
        {label && (
          <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/40">
            {label}
          </div>
        )}
        <div className="space-y-1">{children}</div>
      </div>
    );
  }
);
