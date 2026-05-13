import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../utils/cn';
import { ChevronDown, Brain, Timer, CheckCircle2, RefreshCw } from 'lucide-react';

export interface AIReasoningCollapseProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Title of the thoughts panel, defaults to "Thinking Process" */
  title?: React.ReactNode;
  /** Whether the AI is actively thinking/generating thoughts */
  thinking?: boolean;
  /** Fixed elapsed duration in seconds. If omitted, internal autoTimer can be used instead. */
  duration?: number;
  /** Whether to automatically start and count up an internal timer while thinking is true */
  autoTimer?: boolean;
  /** Controlled state for expansion */
  open?: boolean;
  /** Default open state if uncontrolled */
  defaultOpen?: boolean;
  /** Callback fired when expansion state changes */
  onOpenChange?: (open: boolean) => void;
  /** Custom class for the collapse trigger button */
  triggerClassName?: string;
  /** Custom class for the internal content area */
  contentClassName?: string;
}

/**
 * A state-of-the-art collapsible thoughts component for LLM reasoning steps.
 * Features an internal auto-timer, pulsing breath indicators, and glassmorphic styling.
 */
export const AIReasoningCollapse = React.forwardRef<HTMLDivElement, AIReasoningCollapseProps>(
  ({
    title,
    thinking = false,
    duration: controlledDuration,
    autoTimer = true,
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    children,
    className,
    triggerClassName,
    contentClassName,
    ...props
  }, ref) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

    // Internal timer for thinking duration
    const [seconds, setSeconds] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Track thinking state changes to manage auto-timer
    useEffect(() => {
      if (thinking && autoTimer) {
        setSeconds(0);
        timerRef.current = setInterval(() => {
          setSeconds((prev) => prev + 0.1);
        }, 100);
      } else {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }, [thinking, autoTimer]);

    // Format display duration
    const formatDuration = () => {
      const time = controlledDuration !== undefined ? controlledDuration : seconds;
      if (time <= 0) return null;
      return `${time.toFixed(1)}s`;
    };

    const handleToggle = () => {
      const newState = !isOpen;
      if (!isControlled) {
        setUncontrolledOpen(newState);
      }
      onOpenChange?.(newState);
    };

    const displayTitle = title || (thinking ? "Thinking Process" : "Thought Process");

    return (
      <div
        ref={ref}
        className={cn(
          'w-full overflow-hidden rounded-2xl border transition-all duration-300',
          thinking
            ? 'border-cyan-200/60 bg-cyan-50/20 shadow-[0_4px_20px_rgba(6,182,212,0.03)] dark:border-cyan-500/20 dark:bg-cyan-950/5'
            : 'border-gray-200 bg-gray-50/50 dark:border-white/5 dark:bg-zinc-900/30 backdrop-blur-md',
          'border-l-4 border-l-cyan-500/80',
          className
        )}
        {...props}
      >
        <button
          type="button"
          onClick={handleToggle}
          className={cn(
            'flex w-full items-center justify-between px-4 py-3.5 text-sm font-medium transition-colors hover:bg-gray-100/50 dark:hover:bg-white/[0.02]',
            triggerClassName
          )}
        >
          <div className="flex items-center gap-2.5">
            {/* Status Icons */}
            <div className="relative flex h-5 w-5 items-center justify-center">
              {thinking ? (
                <>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-30 dark:bg-cyan-500" />
                  <RefreshCw className="relative h-3.5 w-3.5 animate-spin text-cyan-600 dark:text-cyan-400" />
                </>
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
              )}
            </div>

            {/* Title Text */}
            <span className={cn(
              "font-medium transition-colors",
              thinking 
                ? "text-cyan-800 dark:text-cyan-300" 
                : "text-gray-700 dark:text-zinc-300"
            )}>
              {displayTitle}
            </span>

            {/* Time badge */}
            {formatDuration() && (
              <span className="flex items-center gap-1 rounded-full bg-gray-200/50 px-2 py-0.5 text-[11px] font-normal text-gray-500 dark:bg-white/5 dark:text-zinc-400">
                <Timer className="h-3 w-3 opacity-70" />
                {formatDuration()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <ChevronDown
              className={cn(
                'h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 dark:text-zinc-500',
                isOpen && 'rotate-180 text-cyan-600 dark:text-cyan-400'
              )}
            />
          </div>
        </button>

        {/* CSS-Grid based smooth sliding height collapse */}
        <div
          className={cn(
            'grid transition-all duration-300 ease-in-out',
            isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          )}
        >
          <div className="overflow-hidden">
            <div className={cn(
              'px-4 pb-4 pt-1 text-sm leading-relaxed text-gray-500 dark:text-zinc-400 italic font-light font-mono border-t border-gray-100 dark:border-white/5',
              contentClassName
            )}>
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

AIReasoningCollapse.displayName = 'AIReasoningCollapse';
