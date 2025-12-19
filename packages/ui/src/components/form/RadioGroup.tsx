import React, { createContext, useContext } from 'react';
import { cn } from '../../utils/cn';
import { Label } from './Label';

interface RadioGroupContextValue {
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue>({});

export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  label?: string;
}

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onChange, name, disabled, label, children, ...props }, ref) => {
    const id = React.useId();
    
    return (
      <div ref={ref} className={cn("flex flex-col gap-2", className)} {...props}>
        {label && (
          <Label className={cn(disabled && "opacity-50 cursor-not-allowed")}>
            {label}
          </Label>
        )}
        <div className="flex flex-col gap-2" role="radiogroup">
          <RadioGroupContext.Provider value={{ value, onChange, name: name || id, disabled }}>
            {children}
          </RadioGroupContext.Provider>
        </div>
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

export interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  label?: string;
}

export const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, label, disabled, ...props }, ref) => {
    const context = useContext(RadioGroupContext);
    const isChecked = context.value === value;
    const isDisabled = context.disabled || disabled;
    const id = React.useId();

    return (
      <label
        htmlFor={id}
        className={cn(
          "flex items-center gap-3 cursor-pointer group",
          isDisabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <div className="relative flex items-center justify-center">
          <input
            ref={ref}
            id={id}
            type="radio"
            name={context.name}
            value={value}
            checked={isChecked}
            disabled={isDisabled}
            onChange={(e) => {
              if (e.target.checked) {
                context.onChange?.(value);
              }
            }}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              "h-5 w-5 rounded-full border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/[0.03] transition-all duration-200",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-gray-400 dark:peer-focus-visible:ring-white/20 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white dark:peer-focus-visible:ring-offset-[#0A0A0A]",
              "group-hover:bg-gray-100 dark:group-hover:bg-white/[0.05]",
              isChecked && "border-gray-900 bg-gray-900 dark:border-white dark:bg-white"
            )}
          >
            {isChecked && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-white dark:bg-black" />
              </div>
            )}
          </div>
        </div>
        {label && (
          <span className="text-sm text-gray-900 dark:text-white/90 select-none font-medium">
            {label}
          </span>
        )}
      </label>
    );
  }
);

RadioGroupItem.displayName = 'RadioGroupItem';
