import React, { useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Label } from './Label';

const inputVariants = cva(
  "w-full rounded-2xl px-4 py-3 border focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-gray-50 dark:bg-white/[0.04] border-gray-200 dark:border-white/[0.10] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:ring-purple-400/30 focus:border-purple-500/50",
        glass: "bg-white/[0.01] backdrop-blur-xl border-white/10 text-white placeholder:text-white/30 focus:ring-purple-500/20 focus:border-purple-500/40 shadow-lg shadow-black/5"
      },
      hasError: {
        true: "border-rose-500/50 focus:ring-rose-500/20 focus:border-rose-500/60",
        false: "",
      },
      hasLeftIcon: {
        true: "pl-11",
        false: "",
      },
      hasRightIcon: {
        true: "pr-11",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      hasError: false,
      hasLeftIcon: false,
      hasRightIcon: false,
    }
  }
);

export interface TextInputProps 
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    Omit<VariantProps<typeof inputVariants>, 'hasError'> {
  /** Label text displayed above the input */
  label?: string;
  /** Error message displayed below the input. If provided, the input will show an error state. */
  error?: string;
  /** Icon to display on the left side inside the input */
  leftIcon?: React.ReactNode;
  /** Icon to display on the right side inside the input */
  rightIcon?: React.ReactNode;
  /** Callback fired when the clear button is clicked */
  onClear?: () => void;
  /** Callback fired when the value string changes */
  onValueChange?: (value: string) => void;
  /** Whether to show a character count (requires maxLength to be set) */
  showCharacterCount?: boolean;
  /** Additional CSS classes for the container div */
  containerClassName?: string;
}

/**
 * A highly customizable, state-of-the-art text input component.
 * Supports labels, errors, icon slots, clear triggers, glassmorphic variants, and reactive counters.
 */
export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ 
    className, 
    containerClassName, 
    variant = "default",
    label, 
    error: errorMsg, 
    leftIcon, 
    rightIcon, 
    id, 
    value,
    onChange,
    onValueChange,
    onClear,
    showCharacterCount = false,
    maxLength,
    ...props 
  }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const hasError = !!errorMsg;

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onValueChange?.(e.target.value);
    };

    return (
      <div className={cn('flex flex-col gap-1.5 w-full', containerClassName)}>
        <div className="flex items-center justify-between">
          {label && (
            <Label htmlFor={inputId} required={props.required}>
              {label}
            </Label>
          )}
          
          {/* Reactive Character Counter */}
          {showCharacterCount && maxLength && (
            <span className="text-[10px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-widest">
              {value ? String(value).length : 0} / {maxLength}
            </span>
          )}
        </div>
        
        <div className="relative flex items-center">
          {/* Left Icon Slot */}
          {leftIcon && (
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/35 transition-colors duration-300">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            value={value}
            onChange={handleTextChange}
            maxLength={maxLength}
            className={cn(inputVariants({ 
              variant,
              hasError: hasError, 
              hasLeftIcon: !!leftIcon, 
              hasRightIcon: !!rightIcon || !!onClear, 
              className 
            }))}
            {...props}
          />

          {/* Interactive Right Slot (Clear action OR Custom Icon) */}
          {onClear && value && String(value).length > 0 ? (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-3.5 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white transition-all active:scale-90"
              title="Limpar campo"
            >
              <X size={14} />
            </button>
          ) : (
            rightIcon && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/35">
                {rightIcon}
              </div>
            )
          )}
        </div>

        {/* Slid-in error validation tag */}
        {errorMsg && (
          <p className="text-xs text-rose-500 font-medium animate-in slide-in-from-top-1 fade-in duration-200 flex items-center gap-1 mt-0.5">
            <span className="h-1 w-1 rounded-full bg-rose-500" />
            {errorMsg}
          </p>
        )}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';
