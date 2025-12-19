import React from 'react';
import { cn } from '../../utils/cn';
import { Surface } from '../../primitives/Surface';
import { Info } from 'lucide-react';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, action, className, ...props }, ref) => {
    return (
      <Surface
        ref={ref}
        className={cn('p-8 text-center', className)}
        {...props}
      >
        <div className="mx-auto w-full max-w-md space-y-3">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-white/70">
            {icon ?? <Info className="h-5 w-5" />}
          </div>
          <div className="text-lg font-semibold text-white">{title}</div>
          {description ? <div className="text-sm text-white/55">{description}</div> : null}
          {action ? <div className="pt-2 flex justify-center">{action}</div> : null}
        </div>
      </Surface>
    );
  }
);

EmptyState.displayName = 'EmptyState';
