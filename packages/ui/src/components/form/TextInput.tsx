import React from 'react';
import { cn } from '../../utils/cn';
import { Label } from './Label';

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, containerClassName, label, error, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {label && <Label htmlFor={inputId} required={props.required}>{label}</Label>}
        
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center text-white/40 pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'flex h-10 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/20',
              'focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'transition-all duration-200',
              {
                'pl-9': !!leftIcon,
                'pr-9': !!rightIcon,
                'border-rose-500/50 focus:border-rose-500/50 focus:ring-rose-500/20': !!error,
              },
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 flex items-center text-white/40 pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-rose-400 animate-in slide-in-from-top-1 fade-in duration-200">
            {error}
          </p>
        )}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';
