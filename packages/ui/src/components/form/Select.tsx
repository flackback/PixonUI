import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { Label } from './Label';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  label?: string;
  name?: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ label, name, options, value, defaultValue, onChange, placeholder = 'Select an option', error, disabled, className }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [activeIndex, setActiveIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const id = React.useId();

    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;
    const selectedOption = options.find((opt) => opt.value === currentValue);

    useEffect(() => {
      if (isOpen) {
        const index = options.findIndex(opt => opt.value === currentValue);
        setActiveIndex(index !== -1 ? index : 0);
      } else {
        setActiveIndex(-1);
      }
    }, [isOpen, currentValue, options]);

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
      if (!isControlled) {
        setInternalValue(optionValue);
      }
      onChange?.(optionValue);
      setIsOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;
      
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (isOpen && activeIndex !== -1) {
          handleSelect(options[activeIndex]!.value);
        } else {
          setIsOpen(true);
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setActiveIndex((prev) => (prev + 1) % options.length);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setActiveIndex((prev) => (prev - 1 + options.length) % options.length);
        }
      } else if (e.key === 'Home') {
        e.preventDefault();
        if (isOpen) setActiveIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        if (isOpen) setActiveIndex(options.length - 1);
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
            'w-full appearance-none rounded-2xl bg-gray-50 dark:bg-white/[0.04] px-4 py-3',
            'border border-gray-200 dark:border-white/[0.10]',
            'text-gray-900 dark:text-white flex items-center',
            'focus:outline-none focus:ring-2 focus:ring-purple-400/30',
            'hover:bg-gray-100 dark:hover:bg-white/[0.05] cursor-pointer',
            disabled && 'cursor-not-allowed opacity-50 hover:bg-gray-50 dark:hover:bg-white/[0.04]',
            isOpen && 'border-gray-300 dark:border-white/20 ring-2 ring-purple-400/20',
            error && 'border-rose-400/25 focus:ring-rose-300/25'
          )}
        >
          <span className={cn("block truncate", !selectedOption && "text-gray-400 dark:text-white/20")}>
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
            className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          >
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 z-50 mt-1 w-full overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] p-1 shadow-xl animate-in fade-in zoom-in-95 duration-100">
            <ul
              id={`${id}-listbox`}
              role="listbox"
              aria-activedescendant={activeIndex !== -1 ? `${id}-option-${activeIndex}` : undefined}
              className="max-h-60 overflow-auto p-1 flex flex-col gap-2"
            >
              {options.map((option, index) => (
                <li
                  key={option.value}
                  id={`${id}-option-${index}`}
                  role="option"
                  aria-selected={currentValue === option.value}
                  onClick={() => handleSelect(option.value)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    'w-full rounded-xl px-3 py-2 text-left text-sm transition-colors cursor-pointer',
                    'hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white',
                    (currentValue === option.value || activeIndex === index)
                      ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white/90' 
                      : 'text-gray-700 dark:text-white/80'
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex-1 truncate">{option.label}</span>
                    {currentValue === option.value && (
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
                        className="text-gray-900 dark:text-white"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
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
        <input type="hidden" name={name} value={currentValue || ''} />
      </div>
    );
  }
);

Select.displayName = 'Select';
