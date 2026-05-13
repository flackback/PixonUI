import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { Shield, Check, X, ChevronDown, Terminal, AlertTriangle, Play, HelpCircle } from 'lucide-react';

export interface AIConfirmationProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Name of the tool being executed (e.g., "delete_database", "execute_command") */
  toolName: string;
  /** Description of what the action does */
  description?: string;
  /** Risk level of the action to customize the visual theme */
  riskLevel?: 'low' | 'moderate' | 'high' | 'critical';
  /** Arguments passed to the tool */
  args: Record<string, any>;
  /** Initial confirmation status */
  status?: 'pending' | 'approved' | 'rejected';
  /** Callback fired when user approves the action */
  onApprove: () => void;
  /** Callback fired when user rejects/cancels the action */
  onReject: () => void;
  /** Callback when user wants to edit args first (optional) */
  onEdit?: (editedArgs: Record<string, any>) => void;
  /** Whether approval is being processed in a loading state */
  isLoading?: boolean;
}

/**
 * An ultra-premium, interactive confirmation component designed for secure Agentic Tool executions.
 * Features state transition animations, dynamic risk-level styling, and detailed parameter inspectors.
 */
export const AIConfirmation = React.forwardRef<HTMLDivElement, AIConfirmationProps>(
  ({
    toolName,
    description,
    riskLevel = 'moderate',
    args,
    status: initialStatus = 'pending',
    onApprove,
    onReject,
    onEdit,
    isLoading = false,
    className,
    ...props
  }, ref) => {
    const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>(initialStatus);
    const [argsOpen, setArgsOpen] = useState(false);

    const handleApprove = () => {
      setStatus('approved');
      onApprove();
    };

    const handleReject = () => {
      setStatus('rejected');
      onReject();
    };

    // Format risk configurations
    const riskConfigs = {
      low: {
        border: 'border-blue-200 dark:border-blue-500/20 bg-blue-50/[0.02]',
        leftBorder: 'border-l-blue-500',
        badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400',
        glow: 'shadow-blue-500/5',
        label: 'Low Risk'
      },
      moderate: {
        border: 'border-amber-200 dark:border-amber-500/20 bg-amber-50/[0.02]',
        leftBorder: 'border-l-amber-500',
        badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400',
        glow: 'shadow-amber-500/5',
        label: 'Moderate Risk'
      },
      high: {
        border: 'border-orange-200 dark:border-orange-500/20 bg-orange-50/[0.02]',
        leftBorder: 'border-l-orange-500',
        badge: 'bg-orange-100 text-orange-800 dark:bg-orange-950/20 dark:text-orange-400',
        glow: 'shadow-orange-500/5',
        label: 'High Risk'
      },
      critical: {
        border: 'border-rose-200 dark:border-rose-500/20 bg-rose-50/[0.02]',
        leftBorder: 'border-l-rose-500',
        badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400',
        glow: 'shadow-rose-500/5',
        label: 'Critical'
      }
    };

    const currentConfig = riskConfigs[riskLevel];

    // Status visual wrappers overrides
    const isPending = status === 'pending';
    const isApproved = status === 'approved';
    const isRejected = status === 'rejected';

    return (
      <div
        ref={ref}
        className={cn(
          "w-full rounded-2xl border transition-all duration-300 shadow-lg border-l-4 overflow-hidden backdrop-blur-md",
          isPending && cn(currentConfig.border, currentConfig.leftBorder, currentConfig.glow),
          isApproved && "border-emerald-200 border-l-emerald-500 bg-emerald-50/[0.01] dark:border-emerald-500/20 shadow-emerald-500/5",
          isRejected && "border-gray-200 border-l-gray-400 bg-gray-50/[0.01] dark:border-white/5 shadow-none opacity-80",
          className
        )}
        {...props}
      >
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
          <div className="flex items-start gap-3.5 min-w-0">
            {/* Left Safety Shield status bubble */}
            <div className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 shadow-sm",
              isPending && "bg-amber-500/10 border-amber-500/25 text-amber-500",
              isApproved && "bg-emerald-500/10 border-emerald-500/25 text-emerald-500",
              isRejected && "bg-gray-500/10 border-gray-500/25 text-gray-500"
            )}>
              {isPending && <Shield className="h-4 w-4 animate-pulse" />}
              {isApproved && <Check className="h-4 w-4" />}
              {isRejected && <X className="h-4 w-4" />}
            </div>

            {/* Title / Description area */}
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                  Action Required:
                </span>
                <span className="font-mono text-xs font-black text-gray-800 dark:text-zinc-200">
                  {toolName}
                </span>
                
                {isPending && (
                  <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest shrink-0", currentConfig.badge)}>
                    {currentConfig.label}
                  </span>
                )}
                
                {isApproved && (
                  <span className="rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 shrink-0">
                    Authorized
                  </span>
                )}

                {isRejected && (
                  <span className="rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-zinc-400 shrink-0">
                    Cancelled
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed font-medium">
                {description || `The AI Agent is requesting permission to execute the function "${toolName}" on your behalf.`}
              </p>
            </div>
          </div>

          {/* Action Trigger Options */}
          {isPending && (
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                type="button"
                onClick={handleReject}
                disabled={isLoading}
                className="flex h-9 px-4 items-center justify-center rounded-xl text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10 active:scale-95 disabled:opacity-50 transition-all gap-1.5"
              >
                <X className="h-3.5 w-3.5" />
                <span>Deny</span>
              </button>

              <button
                type="button"
                onClick={handleApprove}
                disabled={isLoading}
                className="flex h-9 px-4.5 items-center justify-center rounded-xl text-xs font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-500/10 hover:shadow-purple-500/20 active:scale-95 disabled:opacity-50 transition-all gap-1.5"
              >
                {isLoading ? (
                  <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Play className="h-3.5 w-3.5 fill-current" />
                )}
                <span>Approve Action</span>
              </button>
            </div>
          )}

          {/* Collateral logs if already executed */}
          {!isPending && (
            <div className="text-right text-[11px] text-gray-400 dark:text-zinc-500 font-medium self-end sm:self-center">
              {isApproved && "Approved at " + new Date().toLocaleTimeString()}
              {isRejected && "Rejected by user"}
            </div>
          )}
        </div>

        {/* Collapsible Arguments Inspector */}
        <div className="border-t border-gray-100 dark:border-white/5">
          <button
            type="button"
            onClick={() => setArgsOpen(!argsOpen)}
            className="flex w-full items-center justify-between px-5 py-2.5 bg-gray-50/20 dark:bg-white/[0.01] hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest select-none">
              <Terminal className="h-3.5 w-3.5" />
              <span>Inspect parameters ({Object.keys(args).length})</span>
            </div>
            <ChevronDown className={cn(
              "h-4 w-4 text-gray-400 transition-transform duration-200 dark:text-zinc-500",
              argsOpen && "rotate-180"
            )} />
          </button>

          {/* Dynamic Grid sliding height wrapper */}
          <div className={cn(
            "grid transition-all duration-300 ease-in-out",
            argsOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}>
            <div className="overflow-hidden">
              <div className="p-5 pt-1.5 bg-gray-50/10 dark:bg-black/5 flex flex-col gap-3">
                {/* Visual Alert Cue for High Risk */}
                {isPending && (riskLevel === 'high' || riskLevel === 'critical') && (
                  <div className="flex items-start gap-2 rounded-xl bg-rose-50/40 border border-rose-200/30 dark:bg-rose-950/5 dark:border-rose-900/10 p-3 animate-in fade-in duration-200">
                    <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                    <div className="flex-1 text-[11px] leading-relaxed text-rose-600 dark:text-rose-400 font-medium">
                      <span className="font-bold uppercase tracking-wider block mb-0.5">Security Warning:</span>
                      This is a high-privilege tool execution that might mutate, update, or remove critical resources. Inspect the input arguments carefully.
                    </div>
                  </div>
                )}

                {/* Preformatted interactive parameters view */}
                <pre className="rounded-xl bg-zinc-950 p-4 text-[11px] font-mono text-zinc-300 overflow-x-auto border border-zinc-900/50 leading-relaxed shadow-inner max-h-[300px] scrollbar-thin">
                  <code>
                    {JSON.stringify(args, null, 2)}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

AIConfirmation.displayName = 'AIConfirmation';
