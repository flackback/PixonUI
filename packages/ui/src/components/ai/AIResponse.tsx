import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { Copy, RefreshCw, ThumbsUp, ThumbsDown, Sparkles, Share, Edit, ExternalLink } from 'lucide-react';
import { Button } from '../button/Button';

const aiResponseVariants = cva(
  "group relative overflow-hidden rounded-2xl border transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-gray-50 border-gray-200 dark:bg-white/[0.02] dark:border-white/10",
        ghost: "bg-transparent border-transparent",
        outline: "bg-transparent border-gray-200 dark:border-white/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface AIResponseSource {
  title: string;
  url: string;
}

export interface AIResponseProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof aiResponseVariants> {
  /** The content of the response */
  children: React.ReactNode;
  /** Callback fired when the copy button is clicked */
  onCopy?: () => void;
  /** Callback fired when the regenerate button is clicked */
  onRegenerate?: () => void;
  /** Callback fired when feedback buttons are clicked */
  onFeedback?: (type: 'up' | 'down') => void;
  /** Callback fired when the share button is clicked */
  onShare?: () => void;
  /** Callback fired when the edit button is clicked */
  onEdit?: () => void;
  /** Timestamp string to display (e.g., "Just now", "2 mins ago") */
  timestamp?: string;
  /** List of sources/citations to display */
  sources?: AIResponseSource[];
  /** Name of the model used (e.g., "GPT-4") */
  model?: string;
  /** Usage information (e.g., "245 tokens") */
  usage?: string | number;
}

/**
 * A container component for displaying AI-generated responses with 
 * built-in actions for copying, regenerating, and providing feedback.
 */
export const AIResponse = React.forwardRef<HTMLDivElement, AIResponseProps>(
  ({ 
    className, 
    variant,
    children, 
    onCopy, 
    onRegenerate, 
    onFeedback, 
    onShare, 
    onEdit,
    timestamp,
    sources,
    model,
    usage,
    ...props 
  }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn(aiResponseVariants({ variant, className }))}
        {...props}
      >
        {/* Header / Icon */}
        <div className="absolute left-4 top-4 flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg shadow-purple-500/20">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          {timestamp && (
            <span className="text-xs font-medium text-gray-400 dark:text-white/30">
              {timestamp}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="pl-14 pr-4 py-4">
          <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
            {children}
          </div>

          {/* Sources */}
          {sources && sources.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {sources.map((source, index) => (
                <a
                  key={index}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors",
                    "border-gray-200 bg-white text-gray-600 hover:bg-gray-50",
                    "dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10"
                  )}
                >
                  <span className="max-w-[150px] truncate">{source.title}</span>
                  <ExternalLink className="h-3 w-3 opacity-50" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-white/50 px-2 py-1.5 backdrop-blur dark:border-white/5 dark:bg-white/[0.02]">
          
          {/* Meta Info (Model/Usage) */}
          <div className="flex items-center gap-3 px-2 text-[10px] font-medium text-gray-400 dark:text-white/20">
            {model && <span>{model}</span>}
            {usage && <span>{usage}</span>}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs text-gray-500 hover:text-gray-900 dark:text-white/40 dark:hover:text-white"
              onClick={onCopy}
            >
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              Copy
            </Button>

            {onShare && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-gray-500 hover:text-gray-900 dark:text-white/40 dark:hover:text-white"
                onClick={onShare}
                title="Share"
              >
                <Share className="h-3.5 w-3.5" />
              </Button>
            )}

            {onEdit && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-gray-500 hover:text-gray-900 dark:text-white/40 dark:hover:text-white"
                onClick={onEdit}
                title="Edit"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
            )}
            
            <div className="mx-1 h-3 w-px bg-gray-200 dark:bg-white/10" />
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-gray-500 hover:text-gray-900 dark:text-white/40 dark:hover:text-white"
              onClick={onRegenerate}
              title="Regenerate"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-gray-500 hover:text-gray-900 dark:text-white/40 dark:hover:text-white"
              onClick={() => onFeedback?.('up')}
              title="Helpful"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-gray-500 hover:text-gray-900 dark:text-white/40 dark:hover:text-white"
              onClick={() => onFeedback?.('down')}
              title="Not helpful"
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

AIResponse.displayName = 'AIResponse';
