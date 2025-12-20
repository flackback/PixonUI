import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const timelineItemVariants = cva(
  "relative pl-8 pb-8 last:pb-0",
  {
    variants: {
      status: {
        default: "[&>div:first-child]:bg-gray-200 dark:[&>div:first-child]:bg-white/20",
        active: "[&>div:first-child]:bg-blue-500",
        success: "[&>div:first-child]:bg-emerald-500",
        error: "[&>div:first-child]:bg-rose-500",
      }
    },
    defaultVariants: {
      status: "default"
    }
  }
);

export interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof timelineItemVariants> {
  title: string;
  date?: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  isLast?: boolean;
}

export const TimelineItem = React.forwardRef<HTMLDivElement, TimelineItemProps>(
  ({ className, status, title, date, description, icon, isLast, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(timelineItemVariants({ status, className }))} {...props}>
        {/* Line */}
        {!isLast && (
          <div className="absolute left-[11px] top-[24px] bottom-0 w-px bg-gray-200 dark:bg-white/[0.06]" />
        )}
        
        {/* Dot / Icon */}
        <div className={cn(
          "absolute left-0 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white dark:border-black ring-1 ring-transparent transition-colors",
          status === 'active' ? "bg-blue-500 ring-blue-500/30" : 
          status === 'success' ? "bg-emerald-500 ring-emerald-500/30" :
          status === 'error' ? "bg-rose-500 ring-rose-500/30" :
          "bg-gray-200 dark:bg-white/20"
        )}>
          {icon && <span className="text-white text-[10px]">{icon}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">{title}</span>
            {date && <span className="text-xs text-gray-500 dark:text-white/40">{date}</span>}
          </div>
          {description && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {description}
            </div>
          )}
        </div>
      </div>
    );
  }
);
TimelineItem.displayName = 'TimelineItem';

export const Timeline = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return <div className={cn("flex flex-col", className)}>{children}</div>;
};
