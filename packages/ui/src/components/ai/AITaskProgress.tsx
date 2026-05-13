import React from 'react';
import { cn } from '../../utils/cn';
import { Check, Loader2, AlertCircle, Circle, ArrowRight, Activity } from 'lucide-react';

export interface WorkflowTask {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  /** Individual progress percentage from 0 to 100 (optional) */
  progress?: number;
}

export interface AITaskProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Title of the workflow action list, e.g. "AI Code Modifications" */
  title?: string;
  /** Subtitle description */
  description?: string;
  /** Array of tasks inside the workflow queue */
  tasks: WorkflowTask[];
  /** Overall combined percentage progress (0 to 100). If omitted, computes average. */
  progress?: number;
  /** Whether the workflow is currently active/running */
  active?: boolean;
}

/**
 * An advanced SaaS workflow progress list representing steps taken by AI agents.
 * Includes status indicators, subtask progress circles, and sleek linear loaders.
 */
export const AITaskProgress = React.forwardRef<HTMLDivElement, AITaskProgressProps>(
  ({
    title = "Workflow Tasks Progress",
    description,
    tasks,
    progress: controlledProgress,
    active = false,
    className,
    ...props
  }, ref) => {
    
    // Auto compute progress if not provided
    const computedProgress = () => {
      if (controlledProgress !== undefined) return controlledProgress;
      if (!tasks || tasks.length === 0) return 0;
      
      let sum = 0;
      tasks.forEach(t => {
        if (t.status === 'completed') sum += 100;
        else if (t.status === 'running') sum += (t.progress || 50);
        else if (t.status === 'error') sum += 0;
      });
      return Math.round(sum / tasks.length);
    };

    const overallProgress = computedProgress();

    // Render task state indicators
    const renderTaskIcon = (task: WorkflowTask) => {
      switch (task.status) {
        case 'completed':
          return (
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Check className="h-3 w-3 stroke-[3]" />
            </div>
          );
        case 'running':
          return (
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400">
              <Loader2 className="h-3 w-3 animate-spin stroke-[2.5]" />
            </div>
          );
        case 'error':
          return (
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <AlertCircle className="h-3 w-3 stroke-[2.5]" />
            </div>
          );
        case 'pending':
        default:
          return (
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-zinc-800 dark:text-zinc-500">
              <Circle className="h-2 w-2 fill-current" />
            </div>
          );
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'w-full rounded-2xl border border-gray-200 bg-white/80 dark:border-white/5 dark:bg-zinc-950/40 backdrop-blur-md p-5 shadow-md flex flex-col gap-4',
          className
        )}
        {...props}
      >
        {/* Header Block */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col">
            <h4 className="text-sm font-bold text-gray-800 dark:text-zinc-100 flex items-center gap-2">
              <Activity className={cn("h-4 w-4 text-cyan-500", active && "animate-pulse")} />
              {title}
            </h4>
            {description && (
              <p className="text-xs text-gray-500 dark:text-zinc-400 font-light mt-0.5">
                {description}
              </p>
            )}
          </div>
          <span className="text-xs font-bold font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/30 px-2.5 py-1 rounded-lg">
            {overallProgress}% Done
          </span>
        </div>

        {/* Global Progress Bar */}
        <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden relative shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${overallProgress}%` }}
          />
        </div>

        {/* Workflow steps/list */}
        <div className="flex flex-col gap-3.5 mt-1.5">
          {tasks.map((task, index) => {
            const isLast = index === tasks.length - 1;
            const isRunning = task.status === 'running';
            const isCompleted = task.status === 'completed';
            const isPending = task.status === 'pending';
            
            return (
              <div 
                key={task.id} 
                className={cn(
                  "relative flex items-start gap-3 p-3 rounded-xl border transition-all duration-200",
                  isRunning
                    ? "border-cyan-200 bg-cyan-50/10 dark:border-cyan-500/20 dark:bg-cyan-950/5 shadow-sm"
                    : "border-transparent bg-transparent"
                )}
              >
                {/* Visual Connector Line */}
                {!isLast && (
                  <div className={cn(
                    "absolute left-[22px] top-11 w-0.5 h-6 bg-gray-100 dark:bg-zinc-800",
                    isCompleted && "bg-emerald-500/30 dark:bg-emerald-500/10"
                  )} />
                )}

                {/* Left Step status icon */}
                <div className="mt-0.5">
                  {renderTaskIcon(task)}
                </div>

                {/* Task textual parameters */}
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                      "text-xs font-semibold",
                      isPending ? "text-gray-400 dark:text-zinc-500" : "text-gray-800 dark:text-zinc-200",
                      isRunning && "text-cyan-700 dark:text-cyan-400"
                    )}>
                      {task.title}
                    </span>
                    {isRunning && task.progress !== undefined && (
                      <span className="text-[10px] font-bold font-mono text-cyan-600 dark:text-cyan-400 animate-pulse">
                        {task.progress}%
                      </span>
                    )}
                  </div>
                  
                  {task.description && !isPending && (
                    <p className={cn(
                      "text-[11px] font-light leading-relaxed mt-0.5",
                      isCompleted ? "text-gray-400 dark:text-zinc-500 line-through" : "text-gray-500 dark:text-zinc-400"
                    )}>
                      {task.description}
                    </p>
                  )}

                  {/* Tiny sliding progress sub-bar inside active step */}
                  {isRunning && task.progress !== undefined && (
                    <div className="h-1 w-full bg-cyan-100 dark:bg-cyan-950/40 rounded-full mt-2 overflow-hidden shadow-inner">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full transition-all duration-300"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

AITaskProgress.displayName = 'AITaskProgress';
