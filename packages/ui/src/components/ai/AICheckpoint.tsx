import React from 'react';
import { cn } from '../../utils/cn';
import { GitCommit, ArrowUpRight, History, ShieldAlert, Sparkles, Check } from 'lucide-react';

export interface AICheckpointProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** The headline / title of this chronological checkpoint */
  title: string;
  /** Optional secondary context or summary describing what was saved */
  description?: string;
  /** Human-readable time indication (e.g., "2 mins ago", "14:32") */
  timestamp?: string;
  /** Current state of the checkpoint in the branching flow */
  status?: 'active' | 'saved' | 'restored';
  /** Number of specific delta changes or file versions recorded at this point */
  changesCount?: number;
  /** Callback to restore conversation state to this checkpoint */
  onRestore?: () => void;
  /** Callback to fork a new chat thread from this checkpoint */
  onFork?: () => void;
}

/**
 * AICheckpoint represents chronological milestone commits or saved conversational checkpoints
 * within an AI execution loop. Enables users to inspect snapshots, fork sessions, or restore histories.
 */
export const AICheckpoint = React.forwardRef<HTMLDivElement, AICheckpointProps>(
  ({
    title,
    description,
    timestamp = 'Just now',
    status = 'saved',
    changesCount = 0,
    onRestore,
    onFork,
    className,
    ...props
  }, ref) => {
    
    const isSaved = status === 'saved';
    const isActive = status === 'active';
    const isRestored = status === 'restored';

    return (
      <div
        ref={ref}
        className={cn(
          "w-full group rounded-2xl border transition-all duration-300 relative overflow-hidden backdrop-blur-md",
          isActive && "border-purple-300 bg-purple-500/[0.01] dark:border-purple-500/20 shadow-lg shadow-purple-500/[0.02]",
          isSaved && "border-gray-200 dark:border-white/5 bg-white/30 dark:bg-zinc-950/20 shadow-sm",
          isRestored && "border-emerald-200 dark:border-emerald-500/10 bg-emerald-50/[0.01] opacity-90",
          className
        )}
        {...props}
      >
        {/* Background highlight pattern */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-r pointer-events-none opacity-[0.02] transition-opacity duration-300 group-hover:opacity-[0.04]",
          isActive && "from-purple-500 to-indigo-500",
          isSaved && "from-gray-500 to-zinc-500",
          isRestored && "from-emerald-500 to-teal-500"
        )} />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4.5">
          <div className="flex items-start gap-3.5 min-w-0">
            {/* Git-like Node/Timeline Circle with interactive connection bars */}
            <div className="relative shrink-0 flex items-center justify-center mt-0.5">
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center border transition-all duration-300",
                isActive && "bg-purple-500/10 border-purple-500/30 text-purple-500 shadow-lg shadow-purple-500/10",
                isSaved && "bg-gray-100 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-500",
                isRestored && "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
              )}>
                {isActive && <Sparkles className="h-4 w-4 animate-pulse" />}
                {isSaved && <GitCommit className="h-4 w-4" />}
                {isRestored && <Check className="h-4 w-4" />}
              </div>
            </div>

            {/* Checkpoint text details */}
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs font-extrabold text-gray-800 dark:text-zinc-200 tracking-tight font-sans">
                  {title}
                </h4>
                
                {changesCount > 0 && (
                  <span className="rounded-md px-1.5 py-0.5 text-[9px] font-bold font-mono bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                    +{changesCount} snapshots
                  </span>
                )}

                <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-semibold font-mono">
                  • {timestamp}
                </span>
              </div>

              {description && (
                <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Timetravel Action Controls */}
          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
            {onFork && (
              <button
                type="button"
                onClick={onFork}
                className="flex h-8 px-3 items-center justify-center rounded-xl text-[11px] font-bold bg-gray-50 dark:bg-zinc-900 border border-gray-150 dark:border-white/5 text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-850 active:scale-95 transition-all gap-1 shadow-sm"
                title="Branch conversation from here"
              >
                <ArrowUpRight className="h-3.5 w-3.5 text-gray-400 dark:text-zinc-500" />
                <span>Fork Thread</span>
              </button>
            )}

            {onRestore && !isRestored && (
              <button
                type="button"
                onClick={onRestore}
                className={cn(
                  "flex h-8 px-3 items-center justify-center rounded-xl text-[11px] font-extrabold active:scale-95 transition-all gap-1 shadow-sm",
                  isActive 
                    ? "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/10"
                    : "bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-white"
                )}
                title="Restore conversation to this checkpoint"
              >
                <History className="h-3.5 w-3.5" />
                <span>Restore here</span>
              </button>
            )}

            {isRestored && (
              <div className="flex h-8 px-3.5 items-center text-[10px] uppercase font-black text-emerald-600 dark:text-emerald-400 tracking-wider gap-1 select-none">
                <Check className="h-4 w-4" />
                <span>Active Branch</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

AICheckpoint.displayName = 'AICheckpoint';
