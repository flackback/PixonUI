import React from 'react';
import { cn } from '../../utils/cn';
import { Label } from './Label';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, disabled, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <Label 
            htmlFor={inputId}
            className={cn(disabled && "opacity-50 cursor-not-allowed")}
          >
            {label}
          </Label>
        )}
        
        <textarea
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={cn(
            'w-full rounded-2xl bg-gray-50 dark:bg-white/[0.04] px-4 py-3',
            'border border-gray-200 dark:border-white/[0.10]',
            'text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30',
            'focus:outline-none focus:ring-2 focus:ring-purple-400/30',
            'resize-none',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-rose-400/25 focus:ring-rose-300/25',
            className
          )}
          {...props}
        />

        {error && (
          <p className="text-xs text-rose-400 animate-in slide-in-from-top-1 fade-in duration-200">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
