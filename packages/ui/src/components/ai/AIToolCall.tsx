import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { ChevronDown, Cpu, Check, AlertCircle, RefreshCw, Terminal, Code } from 'lucide-react';

export interface AIToolCallProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Name of the tool being called (e.g., "search_web") */
  name: string;
  /** Status of the tool execution */
  status?: 'pending' | 'running' | 'completed' | 'error';
  /** Parameters/Arguments object passed to the tool */
  args?: Record<string, any> | string;
  /** Result object returned by the tool */
  result?: any;
  /** Error message if the tool failed */
  error?: string;
  /** Controlled expansion state */
  open?: boolean;
  /** Default expansion state if uncontrolled */
  defaultOpen?: boolean;
  /** Callback fired when expansion changes */
  onOpenChange?: (open: boolean) => void;
}

/**
 * A sleek, high-fidelity component for displaying AI tool/function calling details.
 * Features automated JSON formatting, status blurs, and animated borders.
 */
export const AIToolCall = React.forwardRef<HTMLDivElement, AIToolCallProps>(
  ({
    name,
    status = 'completed',
    args,
    result,
    error,
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    className,
    ...props
  }, ref) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

    const handleToggle = () => {
      const newState = !isOpen;
      if (!isControlled) {
        setUncontrolledOpen(newState);
      }
      onOpenChange?.(newState);
    };

    // Format arguments as a clean string if it's an object
    const formattedArgs = typeof args === 'object' 
      ? JSON.stringify(args, null, 2) 
      : args;

    // Format results
    const formattedResult = typeof result === 'object'
      ? JSON.stringify(result, null, 2)
      : typeof result === 'string'
      ? result
      : JSON.stringify(result);

    // Dynamic borders and icon styling based on status
    const statusConfig = {
      pending: {
        border: 'border-dashed border-gray-200 dark:border-white/10',
        bg: 'bg-gray-50/50 dark:bg-white/[0.01]',
        icon: Cpu,
        iconClass: 'text-gray-400 dark:text-zinc-500',
        badge: 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-zinc-400',
        label: 'Pending'
      },
      running: {
        border: 'border-amber-300 bg-amber-50/5 dark:border-amber-500/20 dark:bg-amber-500/[0.02]',
        bg: 'bg-amber-50/20 dark:bg-amber-950/5',
        icon: RefreshCw,
        iconClass: 'text-amber-500 animate-spin',
        badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 animate-pulse',
        label: 'Running'
      },
      completed: {
        border: 'border-emerald-200/80 bg-emerald-50/5 dark:border-emerald-500/20 dark:bg-emerald-500/[0.02]',
        bg: 'bg-emerald-50/10 dark:bg-emerald-950/5',
        icon: Check,
        iconClass: 'text-emerald-500 dark:text-emerald-400',
        badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400',
        label: 'Completed'
      },
      error: {
        border: 'border-rose-300 bg-rose-50/5 dark:border-rose-500/20 dark:bg-rose-500/[0.02]',
        bg: 'bg-rose-50/10 dark:bg-rose-950/5',
        icon: AlertCircle,
        iconClass: 'text-rose-500 dark:text-rose-400',
        badge: 'bg-rose-100 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400',
        label: 'Failed'
      }
    };

    const config = statusConfig[status];
    const StatusIcon = config.icon;

    return (
      <div
        ref={ref}
        className={cn(
          'w-full overflow-hidden rounded-2xl border transition-all duration-300 shadow-sm border-l-4',
          status === 'pending' && 'border-l-gray-400',
          status === 'running' && 'border-l-amber-500',
          status === 'completed' && 'border-l-emerald-500',
          status === 'error' && 'border-l-rose-500',
          config.border,
          config.bg,
          className
        )}
        {...props}
      >
        <button
          type="button"
          onClick={handleToggle}
          className="flex w-full items-center justify-between px-4 py-3.5 text-sm transition-colors hover:bg-gray-100/30 dark:hover:bg-white/[0.01]"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Status indicator icon wrapper */}
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/60 dark:bg-zinc-900/60 shadow-sm border border-gray-150 dark:border-white/5">
              <StatusIcon className={cn("h-3.5 w-3.5", config.iconClass)} />
            </div>

            {/* Tool Name */}
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-mono text-xs font-bold text-gray-500 dark:text-zinc-500">
                tool:
              </span>
              <span className="font-mono text-xs font-bold text-gray-800 dark:text-zinc-200 truncate">
                {name}
              </span>
            </div>

            {/* Status badge */}
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider shrink-0", config.badge)}>
              {config.label}
            </span>
          </div>

          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 dark:text-zinc-500',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {/* Dynamic height sliding wrapper */}
        <div
          className={cn(
            'grid transition-all duration-300 ease-in-out',
            isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          )}
        >
          <div className="overflow-hidden">
            <div className="border-t border-gray-150/50 dark:border-white/5 p-4 flex flex-col gap-4">
              
              {/* Arguments Block */}
              {formattedArgs && (
                <div className="flex flex-col gap-1.5">
                  <div className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                    <Terminal className="h-3 w-3" /> Input Parameters (Arguments)
                  </div>
                  <pre className="rounded-xl bg-gray-950 dark:bg-zinc-950 p-3.5 text-xs text-amber-400 font-mono overflow-x-auto border border-gray-900 leading-relaxed max-h-[250px] scrollbar-thin shadow-inner">
                    <code>{formattedArgs}</code>
                  </pre>
                </div>
              )}

              {/* Response Block (only if Completed) */}
              {status === 'completed' && formattedResult && (
                <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1">
                  <div className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                    <Code className="h-3 w-3" /> Output Result (Response)
                  </div>
                  <pre className="rounded-xl bg-gray-950 dark:bg-zinc-950 p-3.5 text-xs text-cyan-400 font-mono overflow-x-auto border border-gray-900 leading-relaxed max-h-[250px] scrollbar-thin shadow-inner">
                    <code>{formattedResult}</code>
                  </pre>
                </div>
              )}

              {/* Error Block */}
              {status === 'error' && error && (
                <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1">
                  <div className="text-[10px] font-bold text-rose-500/80 dark:text-rose-400/80 uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Execution Error
                  </div>
                  <div className="rounded-xl bg-rose-50 border border-rose-200/50 dark:bg-rose-950/10 dark:border-rose-900/20 p-3.5 text-xs text-rose-600 dark:text-rose-400 font-mono leading-relaxed shadow-sm">
                    {error}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    );
  }
);

AIToolCall.displayName = 'AIToolCall';
