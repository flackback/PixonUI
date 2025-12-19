import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-white/10 dark:text-white/70 dark:border-white/10",
        neutral: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-white/10 dark:text-white/70 dark:border-white/10",
        success: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-400/15 dark:text-emerald-200 dark:border-emerald-400/20",
        warning: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-400/15 dark:text-amber-200 dark:border-amber-400/20",
        danger: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-400/15 dark:text-rose-200 dark:border-rose-400/20",
        info: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-400/15 dark:text-sky-200 dark:border-sky-400/20",
        outline: "bg-transparent text-white/60 border-white/10 hover:bg-white/5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps 
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';
