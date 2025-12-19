import React, { createContext, useContext, useState } from 'react';
import { cn } from '../../utils/cn';
import { ChevronDown } from 'lucide-react';

interface AccordionContextValue {
  value: string | string[];
  onValueChange: (value: string) => void;
  type: 'single' | 'multiple';
}

const AccordionContext = createContext<AccordionContextValue | undefined>(undefined);

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  children: React.ReactNode;
}

export function Accordion({
  type = 'single',
  defaultValue,
  value,
  onValueChange,
  className,
  children,
  ...props
}: AccordionProps) {
  const [internalValue, setInternalValue] = useState<string | string[]>(
    defaultValue || (type === 'multiple' ? [] : '')
  );

  const currentValue = value !== undefined ? value : internalValue;

  const handleValueChange = (itemValue: string) => {
    let newValue: string | string[];

    if (type === 'multiple') {
      const arrayValue = Array.isArray(currentValue) ? currentValue : [];
      if (arrayValue.includes(itemValue)) {
        newValue = arrayValue.filter((v) => v !== itemValue);
      } else {
        newValue = [...arrayValue, itemValue];
      }
    } else {
      newValue = currentValue === itemValue ? '' : itemValue;
    }

    if (value === undefined) {
      setInternalValue(newValue);
    }
    
    onValueChange?.(newValue as any);
  };

  return (
    <AccordionContext.Provider
      value={{ value: currentValue, onValueChange: handleValueChange, type }}
    >
      <div className={cn("space-y-2", className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

// Helper context for Item
const AccordionItemContext = createContext<{ value: string; isOpen: boolean }>({ value: '', isOpen: false });

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}

export function AccordionItem({ className, value, children, ...props }: AccordionItemProps) {
  const context = useContext(AccordionContext);
  const isOpen = Array.isArray(context?.value)
    ? context?.value.includes(value)
    : context?.value === value;

  return (
    <AccordionItemContext.Provider value={{ value, isOpen: !!isOpen }}>
      <div
        className={cn(
          "overflow-hidden rounded-2xl border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.03] transition-all duration-200",
          isOpen && "bg-white dark:bg-white/[0.04] border-gray-300 dark:border-white/10",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

export interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function AccordionTrigger({ className, children, ...props }: AccordionTriggerProps) {
  const context = useContext(AccordionContext);
  const { value, isOpen } = useContext(AccordionItemContext);
  
  return (
    <button
      type="button"
      onClick={() => context?.onValueChange(value)}
      aria-expanded={isOpen}
      aria-controls={`accordion-content-${value}`}
      id={`accordion-trigger-${value}`}
      className={cn(
        "flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-gray-900 dark:text-white transition-all hover:text-gray-700 dark:hover:text-white/90 focus:outline-none",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown
        className={cn(
          "h-4 w-4 shrink-0 text-gray-400 dark:text-white/50 transition-transform duration-200",
          isOpen && "rotate-180 text-gray-900 dark:text-white"
        )}
      />
    </button>
  );
}

export interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function AccordionContent({ className, children, ...props }: AccordionContentProps) {
  const { isOpen, value } = useContext(AccordionItemContext);

  if (!isOpen) return null;

  return (
    <div
      id={`accordion-content-${value}`}
      role="region"
      aria-labelledby={`accordion-trigger-${value}`}
      className={cn(
        "px-4 pb-3 pt-0 text-sm text-gray-600 dark:text-white/70 animate-in slide-in-from-top-1 fade-in duration-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
