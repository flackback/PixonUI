import React from 'react';
import { cn } from '../../utils/cn';
import { Surface } from '../../primitives/Surface';
import { Info } from 'lucide-react';

export type EmptyStateLayout = 'default' | 'compact' | 'full-page';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  /** Secondary action (e.g. a "Learn more" link) */
  secondaryAction?: React.ReactNode;
  /** Layout variant */
  layout?: EmptyStateLayout;
  /** Illustration image src (replaces icon) */
  illustration?: string;
}

const layoutStyles: Record<EmptyStateLayout, string> = {
  default: 'p-8',
  compact: 'p-5',
  'full-page': 'p-12 min-h-[400px] flex items-center justify-center',
};

const iconSizes: Record<EmptyStateLayout, string> = {
  default: 'h-12 w-12',
  compact: 'h-9 w-9',
  'full-page': 'h-16 w-16',
};

const titleSizes: Record<EmptyStateLayout, string> = {
  default: 'text-lg',
  compact: 'text-base',
  'full-page': 'text-xl',
};

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, action, secondaryAction, layout = 'default', illustration, className, ...props }, ref) => {
    return (
      <Surface
        ref={ref}
        className={cn(
          'text-center',
          layoutStyles[layout],
          className
        )}
        {...props}
      >
        <div className="mx-auto w-full max-w-md space-y-3">
          {illustration ? (
            <img
              src={illustration}
              alt=""
              className={cn(
                'mx-auto object-contain',
                layout === 'full-page' ? 'h-32 w-32' : layout === 'compact' ? 'h-16 w-16' : 'h-24 w-24',
              )}
            />
          ) : (
            <div
              className={cn(
                'mx-auto grid place-items-center rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03] text-gray-400 dark:text-white/40',
                iconSizes[layout],
              )}
            >
              {icon ?? <Info className={cn(layout === 'compact' ? 'h-4 w-4' : 'h-5 w-5')} />}
            </div>
          )}

          <div className={cn('font-semibold text-zinc-900 dark:text-white', titleSizes[layout])}>
            {title}
          </div>

          {description && (
            <div className={cn('text-sm text-zinc-500 dark:text-white/55 leading-relaxed', layout === 'compact' && 'text-xs')}>
              {description}
            </div>
          )}

          {(action || secondaryAction) && (
            <div className={cn('pt-2 flex items-center justify-center', secondaryAction ? 'gap-3' : '')}>
              {action}
              {secondaryAction}
            </div>
          )}
        </div>
      </Surface>
    );
  }
);

EmptyState.displayName = 'EmptyState';
