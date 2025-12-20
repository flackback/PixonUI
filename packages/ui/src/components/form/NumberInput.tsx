import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Minus, Plus } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from '../button/Button';

const numberInputVariants = cva(
  "flex items-center rounded-2xl border bg-gray-50 dark:bg-white/[0.03] dark:border-white/10",
  {
    variants: {
      size: {
        sm: "h-8",
        md: "h-10",
        lg: "h-12",
      },
      error: {
        true: "border-rose-500",
        false: "border-gray-200",
      }
    },
    defaultVariants: {
      size: "md",
      error: false
    }
  }
);

export interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'>, VariantProps<typeof numberInputVariants> {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, size, error, value = 0, onChange, min = -Infinity, max = Infinity, step = 1, disabled, ...props }, ref) => {
    
    const handleDecrement = () => {
      if (value - step >= min) {
        onChange?.(value - step);
      }
    };

    const handleIncrement = () => {
      if (value + step <= max) {
        onChange?.(value + step);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val)) {
        onChange?.(val);
      }
    };

    return (
      <div className={cn(numberInputVariants({ size, error, className }))}>
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          className="flex h-full items-center justify-center px-3 text-gray-500 hover:text-gray-900 disabled:opacity-50 dark:text-white/50 dark:hover:text-white"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        
        <div className="h-full w-px bg-gray-200 dark:bg-white/[0.06]" />
        
        <input
          ref={ref}
          type="number"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className="h-full w-full min-w-[3rem] bg-transparent text-center text-sm font-medium text-gray-900 focus:outline-none dark:text-white"
          {...props}
        />
        
        <div className="h-full w-px bg-gray-200 dark:bg-white/[0.06]" />
        
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          className="flex h-full items-center justify-center px-3 text-gray-500 hover:text-gray-900 disabled:opacity-50 dark:text-white/50 dark:hover:text-white"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }
);
NumberInput.displayName = "NumberInput";
