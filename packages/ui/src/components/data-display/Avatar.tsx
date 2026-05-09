import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';

// ─── Avatar ─────────────────────────────────────────────────────────────────

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: React.ReactNode;
  size?: AvatarSize;
  /** Show colored status indicator */
  status?: AvatarStatus;
  /** Colored ring border */
  ring?: boolean;
  /** Ring color class (e.g. 'ring-purple-500') */
  ringColor?: string;
  /** Show as square instead of circle */
  square?: boolean;
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
  '2xl': 'h-28 w-28 text-2xl',
};

const statusColors: Record<AvatarStatus, string> = {
  online: 'bg-emerald-500',
  offline: 'bg-gray-400 dark:bg-zinc-600',
  busy: 'bg-rose-500',
  away: 'bg-amber-500',
};

const statusSizes: Record<AvatarSize, string> = {
  xs: 'h-1.5 w-1.5 border',
  sm: 'h-2 w-2 border-[1.5px]',
  md: 'h-2.5 w-2.5 border-2',
  lg: 'h-3.5 w-3.5 border-2',
  xl: 'h-4 w-4 border-2',
  '2xl': 'h-5 w-5 border-[3px]',
};

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = 'md', status, ring = false, ringColor, square = false, ...props }, ref) => {
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
      setImageError(false);
    }, [src]);

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex shrink-0 overflow-visible',
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'relative flex shrink-0 overflow-hidden bg-gray-200 dark:bg-white/[0.06]',
            square ? 'rounded-xl' : 'rounded-full',
            sizeClasses[size],
            ring && cn(
              'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-zinc-950',
              ringColor || 'ring-purple-500'
            ),
          )}
        >
          {src && !imageError ? (
            <img
              src={src}
              alt={alt}
              className="aspect-square h-full w-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/70 font-medium">
              {fallback || (alt ? alt.charAt(0).toUpperCase() : '?')}
            </div>
          )}
        </div>

        {/* Status indicator */}
        {status && (
          <span
            className={cn(
              'absolute bottom-0 right-0 rounded-full border-white dark:border-zinc-950',
              statusColors[status],
              statusSizes[size],
              status === 'online' && 'animate-pulse',
            )}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

// ─── AvatarGroup ────────────────────────────────────────────────────────────

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Max visible avatars before showing +N overflow */
  max?: number;
  /** Size applied to all child avatars */
  size?: AvatarSize;
  /** Spacing between avatars (negative = overlap) */
  spacing?: number;
}

export function AvatarGroup({
  children,
  max = 4,
  size = 'md',
  spacing = -8,
  className,
  ...props
}: AvatarGroupProps) {
  const childArray = React.Children.toArray(children).filter(React.isValidElement);
  const visibleChildren = childArray.slice(0, max);
  const overflowCount = childArray.length - max;

  return (
    <div
      className={cn('flex items-center', className)}
      {...props}
    >
      {visibleChildren.map((child, index) => (
        <div
          key={index}
          className="relative"
          style={{ marginLeft: index === 0 ? 0 : `${spacing}px`, zIndex: visibleChildren.length - index }}
        >
          {React.cloneElement(child as React.ReactElement<any>, {
            size,
            ring: true,
            ringColor: 'ring-white dark:ring-zinc-950',
          })}
        </div>
      ))}

      {overflowCount > 0 && (
        <div
          className={cn(
            'relative flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-white/70 font-bold ring-2 ring-white dark:ring-zinc-950',
            sizeClasses[size],
          )}
          style={{ marginLeft: `${spacing}px`, zIndex: 0 }}
        >
          +{overflowCount}
        </div>
      )}
    </div>
  );
}

AvatarGroup.displayName = 'AvatarGroup';
