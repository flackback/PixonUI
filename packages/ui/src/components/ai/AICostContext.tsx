import React from 'react';
import { cn } from '../../utils/cn';
import { Sparkles, DollarSign, Coins, Layers, CircleCheck } from 'lucide-react';

export interface AICostContextProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Model label name */
  modelName?: string;
  /** Number of prompt input tokens used */
  inputTokens: number;
  /** Number of generated output tokens used */
  outputTokens: number;
  /** Number of intermediate reasoning tokens used (optional) */
  reasoningTokens?: number;
  /** Unit price in dollars per 1M input tokens, e.g., 0.15 for $0.15 */
  costPerMillionInput?: number;
  /** Unit price in dollars per 1M output tokens, e.g., 0.60 for $0.60 */
  costPerMillionOutput?: number;
  /** Total maximum tokens in context window limit, e.g., 128000 */
  contextLimit?: number;
  /** Tokens currently inside active context history, e.g., 15400 */
  contextUsed?: number;
}

/**
 * A sleek model usage context dashboard displaying token volume, live cost
 * estimations, and context window capacities with highly graphical styling.
 */
export const AICostContext = React.forwardRef<HTMLDivElement, AICostContextProps>(
  ({
    modelName = "Claude 3.5 Sonnet",
    inputTokens,
    outputTokens,
    reasoningTokens = 0,
    costPerMillionInput = 3.0, // Defaults to $3.00/1M Sonnet
    costPerMillionOutput = 15.0, // Defaults to $15.00/1M Sonnet
    contextLimit = 200000,
    contextUsed = 0,
    className,
    ...props
  }, ref) => {

    // Computes costs
    const computedCost = () => {
      const inputCost = (inputTokens / 1000000) * costPerMillionInput;
      const outputCost = (outputTokens / 1000000) * costPerMillionOutput;
      const reasoningCost = (reasoningTokens / 1000000) * costPerMillionOutput;
      return inputCost + outputCost + reasoningCost;
    };

    const costValue = computedCost();
    const contextPercentage = contextLimit > 0 ? Math.min(Math.round((contextUsed / contextLimit) * 100), 100) : 0;

    return (
      <div
        ref={ref}
        className={cn(
          "w-full rounded-2xl border border-gray-200 bg-white dark:border-white/5 dark:bg-zinc-950/40 backdrop-blur-md p-5 shadow-sm flex flex-col gap-4",
          className
        )}
        {...props}
      >
        {/* Header summary info */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              Usage & Token Context
            </span>
          </div>
          <span className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
            {modelName}
          </span>
        </div>

        {/* Stats columns */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Tokens Count Breakdown */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
              <Layers className="h-3 w-3" /> Token volume
            </span>
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 dark:text-zinc-400 font-light">Prompt Input:</span>
                <span className="font-mono font-bold text-gray-800 dark:text-zinc-200">{inputTokens.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 dark:text-zinc-400 font-light">Completion Output:</span>
                <span className="font-mono font-bold text-gray-800 dark:text-zinc-200">{outputTokens.toLocaleString()}</span>
              </div>
              {reasoningTokens > 0 && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 dark:text-zinc-400 font-light">Reasoning Steps:</span>
                  <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{reasoningTokens.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Combined Estimation */}
          <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-900/40 rounded-xl p-3 border border-gray-100 dark:border-white/5 shadow-inner">
            <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1 mb-1">
              Estimated Cost
            </span>
            <div className="flex items-baseline text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xl">
              <DollarSign className="h-4.5 w-4.5 shrink-0 -mr-0.5" />
              {costValue === 0 ? "0.00" : costValue.toFixed(5)}
            </div>
            <span className="text-[9px] text-gray-400 dark:text-zinc-500 font-light mt-0.5">
              Input + Output computed
            </span>
          </div>

        </div>

        {/* Context window progress indicator bar */}
        {contextLimit > 0 && contextUsed > 0 && (
          <div className="flex flex-col gap-1.5 mt-1 border-t border-gray-100 dark:border-white/5 pt-3">
            <div className="flex items-center justify-between text-[11px] font-medium text-gray-500 dark:text-zinc-400">
              <span className="flex items-center gap-1 font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                Context window utilization
              </span>
              <span className="font-mono font-bold">
                {contextUsed.toLocaleString()} / {contextLimit.toLocaleString()} ({contextPercentage}%)
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden relative shadow-inner">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  contextPercentage > 80 ? "bg-rose-500" : contextPercentage > 50 ? "bg-amber-500" : "bg-cyan-500"
                )}
                style={{ width: `${contextPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
);

AICostContext.displayName = 'AICostContext';
