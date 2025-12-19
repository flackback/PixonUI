import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface RatingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  max?: number;
  value?: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  ({ className, max = 5, value = 0, onChange, readOnly = false, size = 'md', ...props }, ref) => {
    const [hoverValue, setHoverValue] = useState<number | null>(null);

    const sizes = {
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
    };

    return (
      <div ref={ref} className={cn("flex items-center gap-1", className)} {...props}>
        {Array.from({ length: max }).map((_, i) => {
          const index = i + 1;
          const isFilled = (hoverValue !== null ? hoverValue : value) >= index;
          
          return (
            <button
              key={i}
              type="button"
              disabled={readOnly}
              onClick={() => onChange?.(index)}
              onMouseEnter={() => !readOnly && setHoverValue(index)}
              onMouseLeave={() => !readOnly && setHoverValue(null)}
              className={cn(
                "transition-transform hover:scale-110 focus:outline-none",
                readOnly && "cursor-default hover:scale-100"
              )}
            >
              <Star
                className={cn(
                  sizes[size],
                  "transition-colors duration-200",
                  isFilled 
                    ? "fill-amber-400 text-amber-400" 
                    : "fill-transparent text-gray-300 dark:text-white/20"
                )}
              />
            </button>
          );
        })}
      </div>
    );
  }
);
Rating.displayName = "Rating";
