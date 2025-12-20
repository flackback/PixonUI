import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from '../../utils/Slot';
import { cn } from '../../utils/cn';

const buttonVariants = cva(
  "group relative inline-flex items-center justify-center font-semibold tracking-tight transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100 hover:scale-[1.02] active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white border-transparent",
        secondary: "bg-zinc-100 text-zinc-900 border border-zinc-200 hover:bg-zinc-200 dark:bg-white/[0.05] dark:text-white dark:border-white/10 dark:hover:bg-white/[0.10] dark:hover:border-white/20",
        outline: "bg-transparent text-zinc-900 border border-zinc-300 hover:bg-zinc-100 dark:text-white dark:border-white/20 dark:hover:bg-white/[0.05] dark:hover:border-white/30",
        ghost: "bg-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-white/80 dark:hover:text-white dark:hover:bg-white/[0.05] border-transparent",
        danger: "bg-rose-500/10 text-rose-600 border border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/30 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300",
        success: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/30 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300",
        alert: "bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/30 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300",
      },
      size: {
        sm: "h-9 px-3 text-xs gap-1.5",
        md: "h-11 px-5 text-sm gap-2",
        lg: "h-14 px-8 text-base gap-3",
        icon: "h-10 w-10 p-0 flex items-center justify-center",
      },
      shape: {
        default: "rounded-2xl",
        pill: "rounded-full",
        square: "rounded-lg",
      },
      shadow: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "primary",
        shadow: true,
        class: "shadow-[0_12px_40px_rgba(99,102,241,.45)] hover:shadow-[0_18px_60px_rgba(99,102,241,.6)]",
      },
      {
        variant: "secondary",
        shadow: true,
        class: "shadow-sm",
      }
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
      shape: "default",
      shadow: true,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Whether the button should be rendered as a child component using Slot */
  asChild?: boolean;
  /** Icon to display on the left side of the button text */
  leftIcon?: React.ReactNode;
  /** Icon to display on the right side of the button text */
  rightIcon?: React.ReactNode;
  /** Whether the button is in a loading state, showing a spinner and disabling interaction */
  isLoading?: boolean;
}

/**
 * A versatile button component with multiple variants, sizes, and states.
 * Supports glassmorphism, gradients, and icons.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    shape,
    shadow,
    asChild = false,
    leftIcon, 
    rightIcon, 
    isLoading,
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(buttonVariants({ variant, size, shape, shadow, className }))}
        {...props}
      >
        {variant === 'primary' && !asChild && (
          <span className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-r from-white/18 via-white/5 to-white/18 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-100" />
        )}
        
        <span className="relative inline-flex items-center justify-center">
          {isLoading && (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {!isLoading && leftIcon && <span className={cn("mr-2", size === 'sm' && "mr-1.5")}>{leftIcon}</span>}
          {children}
          {!isLoading && rightIcon && <span className={cn("ml-2", size === 'sm' && "ml-1.5")}>{rightIcon}</span>}
        </span>
      </Comp>
    );
  }
);

Button.displayName = 'Button';
