import React from 'react';
import { cn } from '../../utils/cn';
import { Label } from './Label';

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'type'> {
  label?: string;
  error?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (event: { target: { checked: boolean } }) => void;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, label, error, id, disabled, checked, defaultChecked, onChange, ...props }, ref) => {
    const inputId = id || React.useId();
    const [isChecked, setIsChecked] = React.useState(defaultChecked || checked || false);

    React.useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(checked);
      }
    }, [checked]);

    const handleClick = () => {
      if (disabled) return;
      const newValue = !isChecked;
      setIsChecked(newValue);
      if (onChange) {
        onChange({ target: { checked: newValue } } as any);
      }
    };

    return (
      <div className={cn("flex flex-col gap-1.5", className)}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            id={inputId}
            role="switch"
            aria-checked={isChecked}
            onClick={handleClick}
            disabled={disabled}
            className={cn(
              'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50',
              isChecked ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-white/[0.06]'
            )}
            {...props}
          >
            <span
              className={cn(
                'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform',
                isChecked ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          </button>
          {label && (
            <Label 
              htmlFor={inputId} 
              className="cursor-pointer select-none text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              onClick={handleClick}
            >
              {label}
            </Label>
          )}
        </div>
        {error && (
          <p className="text-xs text-rose-500 mt-1 ml-1">{error}</p>
        )}
      </div>
    );
  }
);

Switch.displayName = 'Switch';
