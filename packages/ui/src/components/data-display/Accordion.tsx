import React, { createContext, useContext, useState } from 'react';
import { cn } from '../../utils/cn';

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
      <div className={cn("space-y-1", className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

// Helper context for Item
const AccordionItemContext = createContext<{ value: string }>({ value: '' });

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}

export function AccordionItem({ className, value, children, ...props }: AccordionItemProps) {
  return (
    <AccordionItemContext.Provider value={{ value }}>
      <div
        className={cn("border-b border-white/10 last:border-0", className)}
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
  
  return (
    <AccordionItemContext.Consumer>
      {({ value }) => {
        const isOpen = Array.isArray(context?.value)
          ? context?.value.includes(value)
          : context?.value === value;

        return (
          <button
            type="button"
            onClick={() => context?.onValueChange(value)}
            aria-expanded={isOpen}
            className={cn(
              "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:text-white/80 [&[aria-expanded=true]>svg]:rotate-180",
              className
            )}
            {...props}
          >
            {children}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 shrink-0 transition-transform duration-200 text-white/50"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        );
      }}
    </AccordionItemContext.Consumer>
  );
}

export interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function AccordionContent({ className, children, ...props }: AccordionContentProps) {
  const context = useContext(AccordionContext);
  const itemContext = useContext(AccordionItemContext);
  
  const isOpen = Array.isArray(context?.value)
    ? context?.value.includes(itemContext.value)
    : context?.value === itemContext.value;

  return (
    <div
      className={cn(
        "overflow-hidden text-sm transition-all duration-200 ease-in-out",
        isOpen ? "grid-rows-[1fr] opacity-100 pb-4" : "grid-rows-[0fr] opacity-0",
        "grid"
      )}
      {...props}
    >
      <div className={cn("min-h-0", className)}>
        {children}
      </div>
    </div>
  );
}
