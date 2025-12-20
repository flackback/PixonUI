import React, { useState, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const otpInputVariants = cva(
  "flex items-center gap-2",
  {
    variants: {
      size: {
        sm: "[&>input]:h-8 [&>input]:w-8 [&>input]:text-sm",
        md: "[&>input]:h-10 [&>input]:w-10 [&>input]:text-base",
        lg: "[&>input]:h-12 [&>input]:w-12 [&>input]:text-lg",
      }
    },
    defaultVariants: {
      size: "md"
    }
  }
);

export interface OTPInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>, VariantProps<typeof otpInputVariants> {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export const OTPInput = React.forwardRef<HTMLDivElement, OTPInputProps>(
  ({ className, size, length = 6, value = "", onChange, onComplete, disabled, error, ...props }, ref) => {
    const [localValue, setLocalValue] = useState<string[]>(new Array(length).fill(""));
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
      const val = value.split("").slice(0, length);
      const newVal = [...val, ...new Array(length - val.length).fill("")];
      setLocalValue(newVal);
    }, [value, length]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const val = e.target.value;
      if (isNaN(Number(val))) return;

      const newLocalValue = [...localValue];
      // Take the last character if multiple (paste scenario handled separately usually, but simple here)
      newLocalValue[index] = val.substring(val.length - 1);
      
      setLocalValue(newLocalValue);
      const stringValue = newLocalValue.join("");
      onChange?.(stringValue);

      if (val && index < length - 1) {
        inputsRef.current[index + 1]?.focus();
      }

      if (stringValue.length === length) {
        onComplete?.(stringValue);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (e.key === "Backspace" && !localValue[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData("text/plain").slice(0, length);
      if (!/^\d+$/.test(pastedData)) return;

      const newLocalValue = [...localValue];
      pastedData.split("").forEach((char, i) => {
        newLocalValue[i] = char;
      });
      setLocalValue(newLocalValue);
      const stringValue = newLocalValue.join("");
      onChange?.(stringValue);
      if (stringValue.length === length) onComplete?.(stringValue);
      inputsRef.current[Math.min(pastedData.length, length - 1)]?.focus();
    };

    return (
      <div ref={ref} className={cn(otpInputVariants({ size, className }))} {...props}>
        {localValue.map((digit, index) => (
          <input
            key={index}
            ref={el => inputsRef.current[index] = el}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            className={cn(
              "rounded-2xl border bg-gray-50 text-center font-semibold transition-all duration-200",
              "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "dark:bg-white/[0.03] dark:text-white",
              error 
                ? "border-rose-500 text-rose-500 focus:border-rose-500 focus:ring-rose-500/20" 
                : "border-gray-200 dark:border-white/10"
            )}
          />
        ))}
      </div>
    );
  }
);
OTPInput.displayName = "OTPInput";
