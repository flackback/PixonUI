import React from 'react';
import { cn } from '../../utils/cn';
import { Label } from './Label';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, disabled, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-start gap-2">
          <div className="relative flex items-center">
            <input
              ref={ref}
              type="checkbox"
              id={inputId}
              disabled={disabled}
              className="peer h-4 w-4 appearance-none rounded border border-white/20 bg-white/5 transition-all checked:border-white checked:bg-white hover:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:cursor-not-allowed disabled:opacity-50"
              {...props}
            />
            <svg
              className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 text-black opacity-0 transition-opacity peer-checked:opacity-100"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          
          {label && (
            <Label 
              htmlFor={inputId} 
              className={cn(
                "mt-0.5 cursor-pointer select-none font-normal text-white/80",
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

Checkbox.displayName = 'Checkbox';
