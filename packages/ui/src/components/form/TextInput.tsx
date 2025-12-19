import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { Label } from './Label';

const inputVariants = cva(
  "w-full rounded-2xl bg-gray-50 dark:bg-white/[0.04] px-4 py-3 border border-gray-200 dark:border-white/[0.10] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/30 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
  {
    variants: {
      hasError: {
        true: "border-rose-400/25 focus:ring-rose-300/25",
        false: "",
      },
      hasLeftIcon: {
        true: "pl-10",
        false: "",
      },
      hasRightIcon: {
        true: "pr-10",
        false: "",
      },
    },
    defaultVariants: {
      hasError: false,
      hasLeftIcon: false,
      hasRightIcon: false,
    },
  }
);

export interface TextInputProps 
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    Omit<VariantProps<typeof inputVariants>, 'hasError'> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, containerClassName, label, error: errorMsg, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || React.useId();
    const hasError = !!errorMsg;

    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {label && <Label htmlFor={inputId} required={props.required}>{label}</Label>}
        
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/35">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={cn(inputVariants({ 
              hasError: hasError, 
              hasLeftIcon: !!leftIcon, 
              hasRightIcon: !!rightIcon, 
              className 
            }))}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {rightIcon}
            </div>
          )}
        </div>

        {errorMsg && (
          <p className="text-xs text-rose-400 animate-in slide-in-from-top-1 fade-in duration-200">
            {errorMsg}
          </p>
        )}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';
