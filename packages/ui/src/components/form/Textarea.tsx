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
            'flex min-h-[80px] w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/20 transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20',
            'hover:bg-white/[0.05]',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white/[0.03]',
            error && 'border-rose-500/50 focus:border-rose-500/50 focus:ring-rose-500/20',
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
