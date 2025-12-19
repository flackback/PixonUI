import React, { useState, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { Sparkles, Paperclip, ArrowUp, Square, Mic, X, File } from 'lucide-react';
import { Button } from '../button/Button';

const aiPromptInputVariants = cva(
  "relative flex w-full flex-col rounded-3xl border transition-all duration-200 focus-within:ring-4",
  {
    variants: {
      variant: {
        default: "bg-white border-gray-200 shadow-sm focus-within:border-purple-500/50 focus-within:ring-purple-500/10 dark:bg-white/[0.03] dark:border-white/10 dark:shadow-none",
        ghost: "bg-transparent border-transparent shadow-none focus-within:bg-white/50 dark:focus-within:bg-white/5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface Attachment {
  id: string;
  name: string;
  type?: string;
  url?: string;
}

export interface AIPromptInputProps 
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onSubmit'>,
    VariantProps<typeof aiPromptInputVariants> {
  /** Callback fired when the user submits the prompt (Enter or Click) */
  onSubmit?: (value: string) => void;
  /** Whether the AI is currently generating a response */
  isGenerating?: boolean;
  /** Callback fired when the attach button is clicked. If onFilesSelected is provided, this is ignored. */
  onAttach?: () => void;
  /** Callback fired when files are selected via the built-in file picker */
  onFilesSelected?: (files: FileList) => void;
  /** Callback fired when the stop button is clicked */
  onStop?: () => void;
  /** Callback fired when the microphone button is clicked */
  onMic?: () => void;
  /** Maximum number of characters allowed */
  maxLength?: number;
  /** Custom footer content to render below the input */
  footer?: React.ReactNode;
  /** List of attached files to display */
  attachments?: Attachment[];
  /** Callback fired when an attachment is removed */
  onRemoveAttachment?: (attachmentId: string) => void;
  /** Accepted file types for the built-in file picker */
  accept?: string;
  /** Whether to allow multiple files in the built-in file picker */
  multiple?: boolean;
}

/**
 * A specialized input component for AI prompts with support for attachments, 
 * voice input, and generation control.
 */
export const AIPromptInput = React.forwardRef<HTMLTextAreaElement, AIPromptInputProps>(
  ({ 
    className, 
    variant,
    onSubmit, 
    isGenerating, 
    onAttach, 
    onFilesSelected,
    onStop,
    onMic,
    maxLength,
    footer,
    attachments,
    onRemoveAttachment,
    accept,
    multiple,
    placeholder = "Ask AI anything...", 
    value: controlledValue,
    onChange,
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = useState('');
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? (controlledValue as string) : internalValue;
    
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const adjustHeight = () => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    };

    useEffect(() => {
      adjustHeight();
    }, [value]);

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      if (maxLength && newValue.length > maxLength) return;
      
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (value.trim() && !isGenerating) {
          onSubmit?.(value);
          if (!isControlled) setInternalValue('');
        }
      }
      props.onKeyDown?.(e);
    };

    const handleSubmit = () => {
      if (isGenerating && onStop) {
        onStop();
      } else if (value.trim()) {
        onSubmit?.(value);
        if (!isControlled) setInternalValue('');
      }
    };

    const handleAttachClick = () => {
      if (onFilesSelected && fileInputRef.current) {
        fileInputRef.current.click();
      } else {
        onAttach?.();
      }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onFilesSelected?.(e.target.files);
      }
      // Reset value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    return (
      <div className={cn(aiPromptInputVariants({ variant, className }))}>
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept={accept}
          multiple={multiple}
        />

        {/* Attachments Area */}
        {attachments && attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pt-4">
            {attachments.map((att) => (
              <div 
                key={att.id} 
                className="group relative flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm transition-colors hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded bg-white dark:bg-white/10">
                  <File className="h-3 w-3 text-purple-500" />
                </div>
                <span className="max-w-[120px] truncate text-gray-700 dark:text-gray-300">
                  {att.name}
                </span>
                <button 
                  onClick={() => onRemoveAttachment?.(att.id)}
                  className="ml-1 rounded-full p-0.5 text-gray-400 opacity-0 transition-all hover:bg-gray-200 hover:text-gray-600 group-hover:opacity-100 dark:hover:bg-white/20 dark:hover:text-white"
                  type="button"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <textarea
          ref={(node) => {
            textareaRef.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
          }}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className={cn(
            "w-full resize-none bg-transparent px-4 py-4 text-base outline-none max-h-[200px]",
            "text-gray-900 placeholder:text-gray-400",
            "dark:text-white dark:placeholder:text-white/40"
          )}
          disabled={isGenerating && !onStop}
          {...props}
        />
        
        <div className="flex items-center justify-between px-2 pb-2">
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-400 hover:text-gray-600 dark:text-white/40 dark:hover:text-white"
              onClick={handleAttachClick}
              type="button"
              title="Attach file"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            
            {onMic && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-400 hover:text-gray-600 dark:text-white/40 dark:hover:text-white"
                onClick={onMic}
                type="button"
                title="Use microphone"
              >
                <Mic className="h-5 w-5" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {maxLength && (
              <span className="text-xs text-gray-400 dark:text-white/30">
                {value.length}/{maxLength}
              </span>
            )}

            <Button
              size="icon"
              disabled={(!value.trim() && !isGenerating) || (isGenerating && !onStop)}
              onClick={handleSubmit}
              className={cn(
                "h-8 w-8 rounded-full transition-all duration-200",
                (value.trim() || isGenerating)
                  ? "bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-500/25" 
                  : "bg-gray-100 text-gray-400 dark:bg-white/10 dark:text-white/20"
              )}
            >
              {isGenerating ? (
                onStop ? (
                  <Square className="h-3 w-3 fill-current" />
                ) : (
                  <Sparkles className="h-4 w-4 animate-pulse" />
                )
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        {footer && (
          <div className="border-t border-gray-100 px-4 py-2 text-xs text-gray-400 dark:border-white/5 dark:text-white/30">
            {footer}
          </div>
        )}
      </div>
    );
  }
);

AIPromptInput.displayName = 'AIPromptInput';
