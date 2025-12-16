import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { Label } from './Label';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ label, options, value, onChange, placeholder = 'Select an option', error, disabled, className }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const id = React.useId();

    const selectedOption = options.find((opt) => opt.value === value);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
      if (disabled) return;
      onChange?.(optionValue);
      setIsOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;
      
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(!isOpen);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    return (
      <div 
        ref={containerRef} 
        className={cn("flex flex-col gap-1.5 relative", className)}
      >
        {label && (
          <Label 
            htmlFor={id}
            className={cn(disabled && "opacity-50 cursor-not-allowed")}
          >
            {label}
          </Label>
        )}

        <div
          ref={ref}
          id={id}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={`${id}-listbox`}
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20',
            'hover:bg-white/[0.05] cursor-pointer',
            disabled && 'cursor-not-allowed opacity-50 hover:bg-white/[0.03]',
            isOpen && 'border-white/20 ring-2 ring-white/10',
            error && 'border-rose-500/50 focus:border-rose-500/50 focus:ring-rose-500/20'
          )}
        >
          <span className={cn(!selectedOption && "text-white/20")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("text-white/40 transition-transform duration-200", isOpen && "rotate-180")}
          >
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 z-50 mt-1 w-full overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A] p-1 shadow-xl animate-in fade-in zoom-in-95 duration-100">
            <ul
              id={`${id}-listbox`}
              role="listbox"
              className="max-h-60 overflow-auto py-1"
            >
              {options.map((option) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={value === option.value}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'relative flex cursor-pointer select-none items-center rounded-lg px-2 py-1.5 text-sm outline-none transition-colors',
                    'hover:bg-white/10 hover:text-white',
                    value === option.value ? 'bg-white/10 text-white' : 'text-white/70'
                  )}
                >
                  <span className="flex-1 truncate">{option.label}</span>
                  {value === option.value && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="ml-2 text-white"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <p className="text-xs text-rose-400 animate-in slide-in-from-top-1 fade-in duration-200">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
