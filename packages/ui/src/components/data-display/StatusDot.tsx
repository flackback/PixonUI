import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const statusDotVariants = cva(
  "inline-block rounded-full",
  {
    variants: {
      variant: {
        success: "bg-emerald-500",
        warning: "bg-amber-500",
        error: "bg-rose-500",
        info: "bg-blue-500",
        neutral: "bg-gray-400",
      },
      size: {
        sm: "h-2 w-2",
        md: "h-2.5 w-2.5",
        lg: "h-3 w-3",
      },
      animate: {
        true: "animate-pulse",
        false: "",
      }
    },
    defaultVariants: {
      variant: "neutral",
      size: "md",
      animate: false,
    }
  }
);

export interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof statusDotVariants> {}

export const StatusDot = React.forwardRef<HTMLSpanElement, StatusDotProps>(
  ({ className, variant, size, animate, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(statusDotVariants({ variant, size, animate, className }))}
        {...props}
      />
    );
  }
);
StatusDot.displayName = "StatusDot";
