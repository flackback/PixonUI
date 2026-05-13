import React from 'react';
import { cn } from '../../utils/cn';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface AIMessageBranchProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The 1-based index of the currently active message generation */
  current: number;
  /** The total number of alternate message generations available */
  total: number;
  /** Callback fired when navigating to the previous generation */
  onPrev?: () => void;
  /** Callback fired when navigating to the next generation */
  onNext?: () => void;
}

/**
 * A pagination-style message variant branching selector badge.
 * Frequently used to select alternative LLM responses on prompt regeneration.
 */
export const AIMessageBranch = React.forwardRef<HTMLDivElement, AIMessageBranchProps>(
  ({ current, total, onPrev, onNext, className, ...props }, ref) => {
    if (total <= 1) return null;

    const hasPrev = current > 1;
    const hasNext = current < total;

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white dark:border-white/15 dark:bg-zinc-900/80 px-2 py-0.5 shadow-sm transition-all duration-200",
          className
        )}
        {...props}
      >
        {/* Prev Arrow */}
        <button
          type="button"
          disabled={!hasPrev}
          onClick={onPrev}
          className={cn(
            "flex h-4 w-4 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/5 dark:hover:text-white transition-all",
            !hasPrev && "opacity-30 cursor-not-allowed hover:bg-transparent hover:text-gray-500 dark:hover:bg-transparent"
          )}
        >
          <ChevronLeft className="h-3 w-3" />
        </button>

        {/* Counter indicator */}
        <span className="font-mono text-[10px] font-bold text-gray-600 dark:text-zinc-400 select-none">
          {current} <span className="opacity-40">/</span> {total}
        </span>

        {/* Next Arrow */}
        <button
          type="button"
          disabled={!hasNext}
          onClick={onNext}
          className={cn(
            "flex h-4 w-4 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/5 dark:hover:text-white transition-all",
            !hasNext && "opacity-30 cursor-not-allowed hover:bg-transparent hover:text-gray-500 dark:hover:bg-transparent"
          )}
        >
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    );
  }
);

AIMessageBranch.displayName = 'AIMessageBranch';
