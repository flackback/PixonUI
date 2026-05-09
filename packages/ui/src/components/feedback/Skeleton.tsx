import React from 'react';
import { cn } from '../../utils/cn';

export type SkeletonVariant = 'default' | 'circle' | 'text' | 'avatar' | 'button' | 'card' | 'image';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Shape variant */
  variant?: SkeletonVariant;
  /** Use shimmer gradient effect instead of pulse */
  shimmer?: boolean;
  /** Number of skeleton items to render */
  count?: number;
  /** Gap between items when count > 1 (px) @default 8 */
  gap?: number;
  /** Width override (CSS value) */
  width?: string | number;
  /** Height override (CSS value) */
  height?: string | number;
  /** Disable animation entirely */
  animate?: boolean;
}

const variantStyles: Record<SkeletonVariant, string> = {
  default: 'rounded-2xl',
  circle: 'rounded-full aspect-square',
  text: 'rounded h-4 w-full',
  avatar: 'rounded-full h-10 w-10',
  button: 'rounded-xl h-10 w-28',
  card: 'rounded-2xl h-32 w-full',
  image: 'rounded-2xl aspect-video w-full',
};

function SkeletonItem({
  className,
  variant = 'default',
  shimmer = false,
  width,
  height,
  animate = true,
  style,
  ...props
}: Omit<SkeletonProps, 'count' | 'gap'>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-gray-200 dark:bg-white/[0.04]',
        animate && !shimmer && 'animate-pulse',
        variantStyles[variant],
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
      {...props}
    >
      {shimmer && animate && (
        <div
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/[0.06] to-transparent"
          style={{
            animation: 'shimmer 1.8s infinite',
          }}
        />
      )}
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

export function Skeleton({ count = 1, gap = 8, ...rest }: SkeletonProps) {
  if (count <= 1) return <SkeletonItem {...rest} />;

  return (
    <div className="flex flex-col" style={{ gap: `${gap}px` }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonItem key={i} {...rest} />
      ))}
    </div>
  );
}

// ─── Composed Skeletons ─────────────────────────────────────────────────────

export interface SkeletonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
}

/** A pre-composed card skeleton with avatar, title line, and body lines */
Skeleton.Card = function SkeletonCard({ shimmer = false, className, ...props }: SkeletonGroupProps) {
  return (
    <div className={cn('space-y-4 p-5 rounded-2xl border border-gray-200/50 dark:border-white/5', className)} {...props}>
      <div className="flex items-center gap-3">
        <SkeletonItem variant="avatar" shimmer={shimmer} />
        <div className="flex-1 space-y-2">
          <SkeletonItem variant="text" shimmer={shimmer} width="60%" />
          <SkeletonItem variant="text" shimmer={shimmer} width="40%" height={12} />
        </div>
      </div>
      <SkeletonItem shimmer={shimmer} height={16} />
      <SkeletonItem shimmer={shimmer} height={16} width="85%" />
      <SkeletonItem shimmer={shimmer} height={16} width="70%" />
    </div>
  );
};

/** A pre-composed table row skeleton */
Skeleton.Table = function SkeletonTable({ shimmer = false, className, ...props }: SkeletonGroupProps & { rows?: number }) {
  const rows = (props as any).rows ?? 4;
  return (
    <div className={cn('space-y-3', className)} {...(props as any)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <SkeletonItem shimmer={shimmer} height={14} width="25%" />
          <SkeletonItem shimmer={shimmer} height={14} width="35%" />
          <SkeletonItem shimmer={shimmer} height={14} width="20%" />
          <SkeletonItem shimmer={shimmer} height={14} width="20%" />
        </div>
      ))}
    </div>
  );
};

Skeleton.displayName = 'Skeleton';
