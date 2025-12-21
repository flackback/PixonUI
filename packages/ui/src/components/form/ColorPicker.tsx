import React from 'react';
import { cn } from '../../utils/cn';
import { Label } from './Label';

export interface ColorPickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
}

/**
 * A styled color picker component.
 */
export function ColorPicker({
  label,
  value,
  onChange,
  error,
  className,
}: ColorPickerProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && <Label>{label}</Label>}
      
      <div className="flex items-center gap-3">
        <div 
          className="h-10 w-10 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden relative"
          style={{ backgroundColor: value }}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-2xl bg-gray-50 dark:bg-white/[0.04] px-4 py-2 border border-gray-200 dark:border-white/[0.10] text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/30 transition-all"
        />
      </div>

      {error && (
        <p className="text-xs text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}
