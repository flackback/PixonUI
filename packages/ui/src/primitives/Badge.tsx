import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';
import { X } from 'lucide-react';

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border font-semibold whitespace-nowrap transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400/20",
  {
    variants: {
      variant: {
        default: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-white/[0.04] dark:text-zinc-300 dark:border-white/5",
        neutral: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-white/[0.04] dark:text-zinc-300 dark:border-white/5",
        success: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/15",
        warning: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/15",
        danger: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/15",
        info: "bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/15",
        outline: "bg-transparent text-zinc-600 dark:text-white/60 border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/[0.04]",
        
        // Premium Elite Variants
        glass: "bg-zinc-900/[0.03] dark:bg-white/[0.02] backdrop-blur-md text-zinc-800 dark:text-zinc-200 border-zinc-200/50 dark:border-white/[0.06] shadow-sm",
        cyber: "bg-purple-500/5 text-purple-600 dark:text-purple-400 border-purple-500/30 dark:border-purple-500/30 shadow-[0_0_8px_rgba(168,85,247,0.05)] dark:shadow-[0_0_10px_rgba(168,85,247,0.15)] animate-pulse",
        gradient: "bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-transparent shadow-sm hover:opacity-95",
        shimmer: "relative overflow-hidden bg-zinc-900 text-white border-transparent dark:bg-zinc-800",
      },
      size: {
        xs: "px-1.5 py-0 text-[10px] leading-4",
        sm: "px-2 py-0.5 text-[11px]",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps 
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  /** Display a pulsing active status indicator dot inside the badge */
  dot?: boolean;
  /** Pulse animation color for status dot */
  dotColor?: string;
  /** Display an interactive clearable close icon on the right */
  dismissible?: boolean;
  /** Close click action callback */
  onDismiss?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Render as a clickable element */
  asLink?: boolean;
  /** Click handler when asLink is true */
  onBadgeClick?: () => void;
}

/**
 * A highly customizable, high-fidelity Badge chip component.
 * Features neon glowing boundaries, glassmorphism templates, pulsing live dot indicators,
 * linear sweeps, dismissible close mechanics, and multiple sizes.
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, children, dot = false, dotColor = "bg-purple-500", dismissible = false, onDismiss, asLink = false, onBadgeClick, ...props }, ref) => {
    const Component = asLink ? 'button' : 'span';
    
    return (
      <Component
        ref={ref as any}
        className={cn(
          badgeVariants({ variant, size }),
          asLink && 'cursor-pointer hover:opacity-80 active:scale-95 transition-transform',
          className
        )}
        onClick={asLink ? onBadgeClick : undefined}
        type={asLink ? 'button' : undefined}
        {...(props as any)}
      >
        {/* Shimmer metallic slide effect sweep */}
        {variant === 'shimmer' && (
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
        )}

        {/* Pulsing live dot state indicator */}
        {dot && (
          <span className="relative flex h-2 w-2 shrink-0">
            <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", dotColor)} />
            <span className={cn("relative inline-flex rounded-full h-2 w-2", dotColor)} />
          </span>
        )}

        {/* Child textual labels */}
        <span className="relative z-10">{children}</span>

        {/* Clear dismiss icon buttons */}
        {dismissible && (
          <button
            type="button"
            onClick={onDismiss}
            className={cn(
              "p-0.5 rounded-full inline-flex items-center justify-center transition-colors shrink-0",
              "text-zinc-400 hover:text-zinc-600 dark:hover:text-white",
              "hover:bg-zinc-200/50 dark:hover:bg-white/10"
            )}
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </Component>
    );
  }
);

Badge.displayName = 'Badge';

// ─── NotificationBadge (Count Badge) ────────────────────────────────────────

export interface NotificationBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The count to display */
  count: number;
  /** Max count before showing "99+" style @default 99 */
  max?: number;
  /** Show even when count is 0 */
  showZero?: boolean;
  /** Color variant */
  variant?: 'danger' | 'purple' | 'default';
  /** Render as a small dot without number */
  dot?: boolean;
  children?: React.ReactNode;
}

const notifVariants: Record<string, string> = {
  danger: 'bg-rose-500 text-white',
  purple: 'bg-purple-500 text-white',
  default: 'bg-zinc-700 text-white dark:bg-white dark:text-zinc-900',
};

export function NotificationBadge({
  count,
  max = 99,
  showZero = false,
  variant = 'danger',
  dot = false,
  children,
  className,
  ...props
}: NotificationBadgeProps) {
  const shouldShow = dot || count > 0 || showZero;
  const displayCount = count > max ? `${max}+` : `${count}`;

  return (
    <span className={cn('relative inline-flex', className)} {...props}>
      {children}
      {shouldShow && (
        <span
          className={cn(
            'absolute flex items-center justify-center rounded-full font-bold leading-none',
            notifVariants[variant],
            dot
              ? 'top-0 right-0 h-2.5 w-2.5 -translate-y-1 translate-x-1'
              : 'top-0 right-0 min-w-[18px] h-[18px] px-1 text-[10px] -translate-y-1/2 translate-x-1/2',
          )}
        >
          {!dot && displayCount}
        </span>
      )}
    </span>
  );
}

NotificationBadge.displayName = 'NotificationBadge';
