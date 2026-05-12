import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from '../../utils/Slot';
import { cn } from '../../utils/cn';

const buttonVariants = cva(
  "group relative inline-flex items-center justify-center font-semibold tracking-tight transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100 hover:scale-[1.02] active:scale-[0.98] overflow-hidden",
  {
    variants: {
      variant: {
        primary: "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-[size:200%_auto] text-white border-transparent hover:bg-right",
        secondary: "bg-zinc-100 text-zinc-900 border border-zinc-200 hover:bg-zinc-200 dark:bg-white/[0.05] dark:text-white dark:border-white/10 dark:hover:bg-white/[0.10] dark:hover:border-white/20",
        outline: "bg-transparent text-zinc-900 border border-zinc-300 hover:bg-zinc-100 dark:text-white dark:border-white/20 dark:hover:bg-white/[0.05] dark:hover:border-white/30",
        ghost: "bg-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-white/80 dark:hover:text-white dark:hover:bg-white/[0.05] border-transparent",
        danger: "bg-rose-500/10 text-rose-600 border border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/30 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300",
        success: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/30 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300",
        alert: "bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/30 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300",
        // NEW VARIANTS
        glass: "bg-black/[0.03] dark:bg-white/[0.02] backdrop-blur-xl text-zinc-900 dark:text-white border border-black/10 dark:border-white/10 hover:bg-black/[0.06] dark:hover:bg-white/[0.06] hover:border-black/20 dark:hover:border-white/20 shadow-lg shadow-black/[0.02] dark:shadow-black/10",
        shine: "bg-zinc-900 dark:bg-zinc-950 border border-zinc-800 text-white hover:border-zinc-700 active:scale-[0.98]",
        cyber: "bg-transparent border border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 dark:hover:bg-purple-500/15 hover:text-purple-700 dark:hover:text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.08)] dark:shadow-[0_0_15px_rgba(168,85,247,0.1)] focus:ring-purple-400/30 focus:border-purple-500",
      },
      size: {
        sm: "h-9 px-4 text-xs gap-1.5",
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
        class: "shadow-[0_4px_25px_-5px_rgba(168,85,247,0.4)] hover:shadow-[0_10px_35px_-5px_rgba(168,85,247,0.55)]",
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
 * A highly refined, beautiful button component.
 * Features customizable glass, glow, cyber, and shine gradients.
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
        {/* Shimmer sweep effect for premium variants (primary & shine) */}
        {(variant === 'primary' || variant === 'shine') && !asChild && (
          <span 
            className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out z-0"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)',
            }}
          />
        )}

        {/* Reflection sweep for glass style */}
        {variant === 'glass' && !asChild && (
          <span 
            className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out z-0"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
            }}
          />
        )}
        
        <span className="relative inline-flex items-center justify-center z-10">
          {isLoading && (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {!isLoading && leftIcon && <span className={cn("mr-2 shrink-0", size === 'sm' && "mr-1.5")}>{leftIcon}</span>}
          {children}
          {!isLoading && rightIcon && <span className={cn("ml-2 shrink-0", size === 'sm' && "ml-1.5")}>{rightIcon}</span>}
        </span>
      </Comp>
    );
  }
);

Button.displayName = 'Button';
