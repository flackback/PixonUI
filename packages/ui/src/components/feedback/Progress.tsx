import React, { useId, useMemo } from 'react';
import { cn } from '../../utils/cn';

export type ProgressVariant = 'default' | 'success' | 'warning' | 'danger' | 'gradient' | 'purple';
export type ProgressSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current value @default 0 */
  value?: number;
  /** Maximum value @default 100 */
  max?: number;
  /** Color variant */
  variant?: ProgressVariant;
  /** Track height */
  size?: ProgressSize;
  /** Indeterminate loading state */
  isIndeterminate?: boolean;
  /** Show animated diagonal stripes */
  hasStripe?: boolean;
  /** Show numeric label (e.g. "75%") */
  showValue?: boolean;
  /** Custom label (overrides showValue text) */
  label?: string;
  /** Buffer track value (YouTube-style double track) */
  buffer?: number;
  /** Custom class for indicator bar */
  indicatorClassName?: string;
}

/** Circular / radial progress ring */
export interface CircularProgressProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  value?: number;
  max?: number;
  variant?: ProgressVariant;
  /** Ring diameter in pixels @default 48 */
  size?: number;
  /** Ring thickness in pixels @default 4 */
  thickness?: number;
  /** Show numeric label inside */
  showValue?: boolean;
  /** Content inside the ring (overrides showValue) */
  children?: React.ReactNode;
}

const variants: Record<ProgressVariant, string> = {
  default: 'bg-gray-900 dark:bg-white dark:shadow-[0_0_10px_rgba(255,255,255,0.3)]',
  success: 'bg-emerald-500 shadow-sm dark:shadow-[0_0_10px_rgba(16,185,129,0.4)]',
  warning: 'bg-amber-500 shadow-sm dark:shadow-[0_0_10px_rgba(245,158,11,0.4)]',
  danger: 'bg-rose-500 shadow-sm dark:shadow-[0_0_10px_rgba(244,63,94,0.4)]',
  gradient: 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 shadow-sm dark:shadow-[0_0_15px_rgba(99,102,241,0.4)]',
  purple: 'bg-purple-500 shadow-sm dark:shadow-[0_0_10px_rgba(168,85,247,0.4)]',
};

const sizes: Record<ProgressSize, string> = {
  xs: 'h-0.5',
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-4',
};

const strokeVariants: Record<ProgressVariant, string> = {
  default: 'stroke-gray-900 dark:stroke-white',
  success: 'stroke-emerald-500',
  warning: 'stroke-amber-500',
  danger: 'stroke-rose-500',
  gradient: 'stroke-purple-500',
  purple: 'stroke-purple-500',
};

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({
    className,
    value = 0,
    max = 100,
    variant = 'default',
    size = 'md',
    isIndeterminate = false,
    hasStripe = false,
    showValue = false,
    label,
    buffer,
    indicatorClassName,
    ...props
  }, ref) => {
    const percentage = isIndeterminate ? 0 : Math.min(Math.max((value || 0) / max, 0), 1) * 100;
    const bufferPercentage = buffer !== undefined ? Math.min(Math.max(buffer / max, 0), 1) * 100 : undefined;
    const displayLabel = label || `${Math.round(percentage)}%`;

    return (
      <div className={cn('w-full', showValue || label ? 'space-y-1.5' : '', className)}>
        {/* Label row */}
        {(showValue || label) && (
          <div className="flex items-center justify-between">
            {label && (
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{label}</span>
            )}
            {showValue && (
              <span className="text-xs font-bold tabular-nums text-zinc-700 dark:text-zinc-300 ml-auto">{displayLabel}</span>
            )}
          </div>
        )}

        {/* Track */}
        <div
          ref={ref}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={isIndeterminate ? undefined : value}
          className={cn(
            'relative w-full overflow-hidden rounded-full bg-gray-200 dark:bg-white/[0.04] border border-gray-200/50 dark:border-white/5',
            sizes[size],
          )}
          {...props}
        >
          {/* Buffer track */}
          {bufferPercentage !== undefined && (
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gray-300 dark:bg-white/[0.08] transition-all duration-300"
              style={{ width: `${bufferPercentage}%` }}
            />
          )}

          {/* Main indicator */}
          <div
            className={cn(
              'h-full w-full flex-1 rounded-full transition-all duration-500 ease-out relative overflow-hidden',
              variants[variant],
              isIndeterminate && 'absolute inset-0 w-full origin-left animate-indeterminate-progress',
              indicatorClassName
            )}
            style={{
              transform: isIndeterminate ? undefined : `translateX(-${100 - percentage}%)`,
            }}
          >
            {hasStripe && !isIndeterminate && (
              <div
                className="absolute inset-0 w-full h-full animate-progress-stripe"
                style={{
                  backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)',
                  backgroundSize: '1rem 1rem',
                }}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';

// ─── Circular Progress ──────────────────────────────────────────────────────

export const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  ({
    value = 0,
    max = 100,
    variant = 'default',
    size = 48,
    thickness = 4,
    showValue = false,
    children,
    className,
    ...props
  }, ref) => {
    const percentage = Math.min(Math.max((value || 0) / max, 0), 1);
    const radius = (size - thickness) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - percentage);
    const rawId = useId();
    const gradId = `prog-grad-${rawId.replace(/:/g, '')}`;

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        className={cn('relative inline-flex items-center justify-center', className)}
        style={{ width: size, height: size }}
        {...props}
      >
        <svg width={size} height={size} className="rotate-[-90deg]">
          {variant === 'gradient' && (
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          )}
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={thickness}
            className="stroke-gray-200 dark:stroke-white/[0.06]"
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={thickness}
            strokeLinecap="round"
            className={cn(
              'transition-all duration-500 ease-out',
              variant === 'gradient' ? '' : strokeVariants[variant],
            )}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: offset,
              ...(variant === 'gradient' ? { stroke: `url(#${gradId})` } : {}),
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          {children || (showValue && (
            <span className="text-xs font-bold tabular-nums text-zinc-700 dark:text-zinc-300">
              {Math.round(percentage * 100)}%
            </span>
          ))}
        </div>
      </div>
    );
  }
);

CircularProgress.displayName = 'CircularProgress';
