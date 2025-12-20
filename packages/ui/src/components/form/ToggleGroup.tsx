import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const toggleGroupVariants = cva(
  "inline-flex items-center rounded-2xl border border-gray-200 bg-gray-50 p-1 dark:border-white/10 dark:bg-white/[0.03]",
  {
    variants: {
      size: {
        sm: "h-8",
        md: "h-10",
        lg: "h-12",
      },
      fullWidth: {
        true: "w-full flex",
        false: "",
      }
    },
    defaultVariants: {
      size: "md",
      fullWidth: false
    }
  }
);

const toggleItemVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300",
  {
    variants: {
      selected: {
        true: "bg-white text-gray-950 shadow-sm dark:bg-gray-800 dark:text-gray-50",
        false: "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
      },
      fullWidth: {
        true: "flex-1",
        false: "",
      }
    },
    defaultVariants: {
      selected: false,
      fullWidth: false
    }
  }
);

export interface ToggleGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>, VariantProps<typeof toggleGroupVariants> {
  value?: string;
  onChange?: (value: string) => void;
  options: { label: string; value: string; icon?: React.ReactNode }[];
}

export const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  ({ className, size, fullWidth, value, onChange, options, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(toggleGroupVariants({ size, fullWidth, className }))} {...props}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange?.(option.value)}
            className={cn(toggleItemVariants({ selected: value === option.value, fullWidth }))}
          >
            {option.icon && <span className="mr-2">{option.icon}</span>}
            {option.label}
          </button>
        ))}
      </div>
    );
  }
);
ToggleGroup.displayName = "ToggleGroup";
