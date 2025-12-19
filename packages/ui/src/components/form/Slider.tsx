import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '../../utils/cn';

export interface SliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
}

export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ className, value: controlledValue, defaultValue = 0, min = 0, max = 100, step = 1, onChange, disabled, ...props }, ref) => {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;
    const trackRef = useRef<HTMLDivElement>(null);

    const percentage = ((value - min) / (max - min)) * 100;

    const handleMove = useCallback((clientX: number) => {
      if (disabled || !trackRef.current) return;

      const rect = trackRef.current.getBoundingClientRect();
      const width = rect.width;
      const left = rect.left;
      
      let newValue = ((clientX - left) / width) * (max - min) + min;
      
      // Clamp
      newValue = Math.min(Math.max(newValue, min), max);
      
      // Step
      const steps = Math.round((newValue - min) / step);
      newValue = min + steps * step;

      // Precision fix
      newValue = Number(newValue.toFixed(10)); // Avoid floating point errors

      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    }, [disabled, isControlled, max, min, onChange, step]);

    const handleMouseDown = (e: React.MouseEvent) => {
      if (disabled) return;
      handleMove(e.clientX);

      const handleMouseMove = (e: MouseEvent) => {
        handleMove(e.clientX);
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
      if (disabled) return;
      const startTouch = e.touches[0];
      if (startTouch) {
        handleMove(startTouch.clientX);
      }

      const handleTouchMove = (e: TouchEvent) => {
        const moveTouch = e.touches[0];
        if (moveTouch) {
          handleMove(moveTouch.clientX);
        }
      };

      const handleTouchEnd = () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };

      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      let newValue = value;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        newValue = Math.min(value + step, max);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        newValue = Math.max(value - step, min);
      } else if (e.key === 'Home') {
        newValue = min;
      } else if (e.key === 'End') {
        newValue = max;
      } else {
        return;
      }

      e.preventDefault();
      if (newValue !== value) {
        if (!isControlled) {
          setInternalValue(newValue);
        }
        onChange?.(newValue);
      }
    };

    return (
      <div
        ref={ref}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative flex w-full touch-none select-none items-center py-4 group",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        {...props}
      >
        <div
          ref={trackRef}
          className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-gray-200 dark:bg-white/10 backdrop-blur-sm border border-gray-200 dark:border-white/5"
        >
          <div
            className="absolute h-full bg-gray-900 dark:bg-white transition-none dark:shadow-[0_0_10px_rgba(255,255,255,0.5)]"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div
          className="absolute h-5 w-5 rounded-full border-2 border-gray-900 dark:border-white bg-white dark:bg-black shadow-md dark:shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-transform hover:scale-110 focus:scale-110"
          style={{ left: `calc(${percentage}% - 10px)` }}
        />
      </div>
    );
  }
);
