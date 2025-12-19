import React from 'react';
import { cn } from '../../utils/cn';
import { Label } from './Label';

export interface CheckboxProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  label?: string;
  error?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (event: { target: { checked: boolean } }) => void;
}

export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
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
        <button
          ref={ref}
          type="button"
          id={inputId}
          role="checkbox"
          aria-checked={isChecked}
          aria-label={label}
          onClick={handleClick}
          disabled={disabled}
          className={cn(
            'flex items-center gap-3 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03] px-4 py-3',
            'hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          {...props}
        >
          <span
            aria-hidden="true"
            className={cn(
              'grid h-6 w-6 place-items-center rounded-lg border',
              isChecked 
                ? 'border-emerald-400/30 bg-emerald-400/15' 
                : 'border-gray-300 dark:border-white/10 bg-white dark:bg-white/[0.02]'
            )}
          >
            {isChecked ? (
              <svg className="h-4 w-4 text-emerald-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : null}
          </span>
          {label && (
            <span className="text-sm text-gray-700 dark:text-white/70">{label}</span>
          )}
        </button>
        {error && (
          <p className="text-xs text-rose-500 mt-1 ml-1">{error}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
