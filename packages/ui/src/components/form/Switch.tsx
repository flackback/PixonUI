import React from 'react';
import { cn } from '../../utils/cn';
import { Label } from './Label';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, error, id, disabled, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-within:ring-2 focus-within:ring-white/20 hover:bg-white/5">
            <input
              ref={ref}
              type="checkbox"
              id={inputId}
              disabled={disabled}
              className="peer sr-only"
              {...props}
            />
            <div className="h-6 w-11 rounded-full bg-white/10 transition-colors peer-checked:bg-white peer-disabled:cursor-not-allowed peer-disabled:opacity-50" />
            <div className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 peer-checked:translate-x-5 peer-checked:bg-black peer-disabled:cursor-not-allowed" />
          </div>

          {label && (
            <Label 
              htmlFor={inputId} 
              className={cn(
                "cursor-pointer select-none font-normal text-white/80",
                disabled && "cursor-not-allowed opacity-50"
              )}
            >
              {label}
            </Label>
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

Switch.displayName = 'Switch';
