import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../utils/cn';

const surfaceVariants = cva(
  "rounded-2xl backdrop-blur-xl transition-colors duration-200 bg-white/80 border border-black/5 shadow-sm text-gray-900 dark:bg-white/[0.03] dark:border-white/10 dark:shadow-[0_18px_55px_rgba(0,0,0,.45)] dark:text-white",
  {
    variants: {
      variant: {
        default: "",
        ghost: "bg-transparent border-transparent shadow-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface SurfaceProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof surfaceVariants> {
  asChild?: boolean;
}

export const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return (
      <Comp
        ref={ref}
        className={cn(surfaceVariants({ variant, className }))}
        {...props}
      />
    );
  }
);

Surface.displayName = 'Surface';