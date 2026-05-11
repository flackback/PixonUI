import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '../../utils/cn';

export interface AdvancedSliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  /** Height values for vertical histogram bars above the slider (0 to 100 values recommended) */
  bars?: number[];
  /** Suffix to display after the number (e.g., '$', 'px', ' users') */
  suffix?: string;
  /** Prefix to display before the number (e.g., '$') */
  prefix?: string;
}

/**
 * An extremely advanced and premium Slider component.
 * Features an interactive histogram/distribution bar chart,
 * a dynamic floating tooltip showing the exact number (nº) as you drag,
 * and high-fidelity micro-interactions.
 */
export const AdvancedSlider = React.forwardRef<HTMLDivElement, AdvancedSliderProps>(
  ({ 
    className, 
    value: controlledValue, 
    defaultValue = 0, 
    min = 0, 
    max = 100, 
    step = 1, 
    onChange, 
    disabled,
    bars = [20, 40, 60, 45, 30, 65, 80, 95, 70, 50, 35, 20, 45, 60, 80, 100, 75, 40, 15],
    suffix = '',
    prefix = '',
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [isDragging, setIsDragging] = useState(false);
    
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
      
      // Clamp values
      newValue = Math.min(Math.max(newValue, min), max);
      
      // Handle Step matching
      const steps = Math.round((newValue - min) / step);
      newValue = min + steps * step;

      // Precision decimal fix
      newValue = Number(newValue.toFixed(10));

      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    }, [disabled, isControlled, max, min, onChange, step]);

    const handleMouseDown = (e: React.MouseEvent) => {
      if (disabled) return;
      setIsDragging(true);
      handleMove(e.clientX);

      const handleMouseMove = (e: MouseEvent) => {
        handleMove(e.clientX);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
      if (disabled) return;
      setIsDragging(true);
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
        setIsDragging(false);
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
          "relative flex flex-col w-full touch-none select-none py-6 group",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        {...props}
      >
        {/* Histogram / Distribution Bars ("com barras") */}
        {bars.length > 0 && (
          <div className="flex items-end justify-between w-full h-16 px-1 mb-4 pointer-events-none">
            {bars.map((barHeight, idx) => {
              const barPercentage = (idx / (bars.length - 1)) * 100;
              const isSelected = barPercentage <= percentage;

              return (
                <div
                  key={idx}
                  className={cn(
                    "w-[4%] rounded-t-sm transition-all duration-300 origin-bottom",
                    isSelected 
                      ? "bg-gradient-to-t from-purple-500/80 to-indigo-500/90 dark:from-purple-500 dark:to-indigo-500" 
                      : "bg-zinc-200 dark:bg-zinc-800/60"
                  )}
                  style={{ 
                    height: `${barHeight}%`,
                    transform: isSelected && isDragging ? 'scaleY(1.05)' : 'scaleY(1)'
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Floating Tooltip displaying current selected number (nº) above thumb */}
        <div 
          className={cn(
            "absolute -top-3 h-8 px-2.5 rounded-lg flex items-center justify-center font-bold text-xs pointer-events-none transition-all duration-200 z-30",
            "bg-zinc-900 text-white dark:bg-zinc-800 border border-zinc-800 dark:border-zinc-700 shadow-md",
            isDragging ? "opacity-100 scale-105" : "opacity-0 group-hover:opacity-100 scale-100"
          )}
          style={{ 
            left: `${percentage}%`,
            transform: 'translateX(-50%) translateY(-100%)'
          }}
        >
          {prefix}{value}{suffix}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-800" />
        </div>

        {/* Main Slider Track */}
        <div
          ref={trackRef}
          className="relative h-2 w-full grow overflow-hidden rounded-full bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/5 cursor-pointer"
        >
          {/* Highlighted filled selection bar */}
          <div
            className="absolute h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-none"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Slider Thumb knob */}
        <div
          className={cn(
            "absolute h-5 w-5 rounded-full border-2 border-purple-500 dark:border-purple-400 bg-white dark:bg-zinc-950 shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing",
            "hover:scale-125 focus:scale-125 hover:shadow-[0_0_12px_rgba(168,85,247,0.4)]",
            isDragging && "scale-125 shadow-[0_0_15px_rgba(168,85,247,0.5)] border-indigo-500"
          )}
          style={{ 
            left: `calc(${percentage}% - 10px)`,
            top: 'calc(50% - 10px)' // Center perfectly on track
          }}
        />
      </div>
    );
  }
);

AdvancedSlider.displayName = 'AdvancedSlider';
