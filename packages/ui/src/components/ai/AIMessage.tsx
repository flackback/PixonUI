import React from 'react';
import { cn } from '../../utils/cn';
import type { AIResponseSource } from './AIResponse';
import { AIResponse } from './AIResponse';
import type { AIAttachmentItem } from './AIAttachment';
import { AIAttachment } from './AIAttachment';
import { User } from 'lucide-react';

export interface AIMessageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'role'> {
  /** Role in the message thread */
  role: 'user' | 'assistant';
  /** Main message text or elements content */
  children: React.ReactNode;
  /** Label name for sender entity, e.g. "Anderson" */
  name?: string;
  /** Timestamp string, e.g. "Just now" */
  timestamp?: string;
  /** Optional custom avatar ReactNode or string initial */
  avatar?: React.ReactNode | string;
  /** Array of file attachments associated with this message */
  attachments?: AIAttachmentItem[];
  
  // Assistant response variables forwarding
  onCopy?: () => void;
  onRegenerate?: () => void;
  onShare?: () => void;
  onEdit?: () => void;
  onFeedback?: (type: 'up' | 'down') => void;
  model?: string;
  usage?: string | number;
  sources?: AIResponseSource[];
  headerActions?: React.ReactNode;
}

/**
 * A supreme, high-performance conversational message wrapper for SaaS.
 * Unifies both User prompt blocks and Assistant response cards with seamless layout grids.
 */
export const AIMessage = React.forwardRef<HTMLDivElement, AIMessageProps>(
  ({
    role,
    children,
    name,
    timestamp,
    avatar,
    attachments,
    
    // Assistant actions
    onCopy,
    onRegenerate,
    onShare,
    onEdit,
    onFeedback,
    model,
    usage,
    sources,
    headerActions,
    
    className,
    ...props
  }, ref) => {
    
    if (role === 'assistant') {
      return (
        <AIResponse
          ref={ref}
          onCopy={onCopy}
          onRegenerate={onRegenerate}
          onShare={onShare}
          onEdit={onEdit}
          onFeedback={onFeedback}
          timestamp={timestamp}
          sources={sources}
          model={model || name}
          usage={usage}
          headerActions={headerActions}
          className={cn("w-full shadow-sm", className)}
          {...props}
        >
          {children}
          
          {/* Support attachments inside assistant messages if any */}
          {attachments && attachments.length > 0 && (
            <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {attachments.map((file) => (
                <AIAttachment key={file.id} item={file} variant="badge" />
              ))}
            </div>
          )}
        </AIResponse>
      );
    }

    // User prompt block rendering
    return (
      <div
        ref={ref}
        className={cn(
          "w-full flex items-start gap-3 justify-end animate-in fade-in slide-in-from-right-3 duration-200",
          className
        )}
        {...props}
      >
        <div className="flex flex-col items-end gap-2 max-w-[80%] min-w-0">
          
          {/* User speech bubble */}
          <div className={cn(
            "rounded-2xl px-4 py-3 text-sm font-medium shadow-sm border select-text leading-relaxed break-words",
            "bg-gradient-to-tr from-purple-600 via-indigo-600 to-indigo-500 text-white border-indigo-500/20 shadow-indigo-500/10",
            "dark:from-purple-950/40 dark:via-indigo-950/40 dark:to-indigo-900/40 dark:text-zinc-100 dark:border-white/5"
          )}>
            {children}
          </div>

          {/* Render User Attachments List */}
          {attachments && attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-end w-full">
              {attachments.map((file) => (
                <AIAttachment key={file.id} item={file} variant="badge" className="shadow-sm" />
              ))}
            </div>
          )}

          {/* User message subtitle meta */}
          {(name || timestamp) && (
            <div className="flex items-center gap-1.5 px-1.5 text-[10px] font-medium text-gray-400 dark:text-zinc-500">
              {name && <span>{name}</span>}
              {name && timestamp && <span className="h-0.5 w-0.5 rounded-full bg-gray-200 dark:bg-zinc-800" />}
              {timestamp && <span>{timestamp}</span>}
            </div>
          )}
        </div>

        {/* User Avatar Circle wrapper */}
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-100 dark:border-white/5 shadow-sm">
          {avatar ? (
            typeof avatar === 'string' ? (
              <span className="text-xs font-bold uppercase">{avatar}</span>
            ) : (
              avatar
            )
          ) : (
            <User className="h-3.5 w-3.5" />
          )}
        </div>
      </div>
    );
  }
);

AIMessage.displayName = 'AIMessage';
