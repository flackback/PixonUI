import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../overlay/Popover';
import { cn } from '../../utils/cn';

interface ComboboxContextValue {
  value: string;
  onValueChange: (value: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  registerItem: (id: string, text: string, value: string) => () => void;
  isItemVisible: (id: string, text: string) => boolean;
  hasVisibleItems: boolean;
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  visibleItems: { id: string, value: string }[];
}

const ComboboxContext = createContext<ComboboxContextValue | undefined>(undefined);

export interface ComboboxProps {
  children: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  filter?: (value: string, search: string) => boolean;
  usePopover?: boolean;
}

export function Combobox({ 
  children, 
  value: controlledValue, 
  defaultValue = '', 
  onValueChange,
  filter = (text, search) => text.toLowerCase().includes(search.toLowerCase()),
  usePopover = true
}: ComboboxProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<Map<string, { text: string, value: string }>>(new Map());
  const [activeIndex, setActiveIndex] = useState(-1);

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleValueChange = (newValue: string) => {
    if (!isControlled) setInternalValue(newValue);
    onValueChange?.(newValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const registerItem = React.useCallback((id: string, text: string, value: string) => {
    setItems(prev => {
      const next = new Map(prev);
      next.set(id, { text, value });
      return next;
    });
    return () => {
      setItems(prev => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
    };
  }, []);

  const visibleItems = useMemo(() => {
    return Array.from(items.entries())
      .filter(([_, item]) => filter(item.text, searchTerm))
      .map(([id, item]) => ({ id, value: item.value }));
  }, [items, searchTerm, filter]);

  const hasVisibleItems = visibleItems.length > 0;

  useEffect(() => {
    if (isOpen) {
      setActiveIndex(0);
    } else {
      setActiveIndex(-1);
    }
  }, [isOpen]);

  return (
    <ComboboxContext.Provider value={{ 
      value, 
      onValueChange: handleValueChange, 
      searchTerm, 
      setSearchTerm, 
      isOpen, 
      setIsOpen,
      registerItem,
      isItemVisible: (id, text) => filter(text, searchTerm),
      hasVisibleItems,
      activeIndex,
      setActiveIndex,
      visibleItems
    }}>
      {usePopover ? (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          {children}
        </Popover>
      ) : (
        children
      )}
    </ComboboxContext.Provider>
  );
}

export function ComboboxTrigger({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <PopoverTrigger
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-white/40 dark:focus:border-white/20 dark:focus:ring-white/10",
        className
      )}
      {...props}
      {...props}
    >
      {children}
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
        className="ml-2 opacity-50"
      >
        <path d="m6 9 6 6 6-6"/>
      </svg>
    </PopoverTrigger>
  );
}

export function ComboboxContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <PopoverContent className={cn("p-0 w-[200px]", className)} align="start" {...props}>
      {children}
    </PopoverContent>
  );
}

export function ComboboxInput({ className, placeholder = "Search...", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  const context = useContext(ComboboxContext);
  if (!context) throw new Error('ComboboxInput must be used within Combobox');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      context.setActiveIndex((prev) => (prev + 1) % context.visibleItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      context.setActiveIndex((prev) => (prev - 1 + context.visibleItems.length) % context.visibleItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (context.activeIndex !== -1 && context.visibleItems[context.activeIndex]) {
        context.onValueChange(context.visibleItems[context.activeIndex]!.value);
      }
    } else if (e.key === 'Escape') {
      context.setIsOpen(false);
    }
    props.onKeyDown?.(e);
  };

  return (
    <div className="flex items-center border-b border-gray-200 dark:border-white/10 px-3">
      <svg
        className="mr-2 h-4 w-4 shrink-0 opacity-50"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        className={cn(
          "flex h-10 w-full rounded-md bg-transparent py-3 text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        placeholder={placeholder}
        value={context.searchTerm}
        onChange={(e) => context.setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        {...props}
      />
    </div>
  );
}

export function ComboboxList({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden p-1", className)} {...props}>
      {children}
    </div>
  );
}

export function ComboboxEmpty({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const context = useContext(ComboboxContext);
  if (!context) throw new Error('ComboboxEmpty must be used within Combobox');

  if (context.hasVisibleItems) return null;

  return (
    <div className={cn("py-6 text-center text-sm text-gray-500 dark:text-white/40", className)} {...props}>
      {children}
    </div>
  );
}

export interface ComboboxItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
  textValue?: string;
}

export function ComboboxItem({ className, value, children, textValue, ...props }: ComboboxItemProps) {
  const context = useContext(ComboboxContext);
  if (!context) throw new Error('ComboboxItem must be used within Combobox');

  const id = React.useId();
  const text = textValue || (typeof children === 'string' ? children : value);
  const isVisible = context.isItemVisible(id, text);
  const isSelected = context.value === value;
  
  const itemIndex = context.visibleItems.findIndex(item => item.id === id);
  const isActive = context.activeIndex === itemIndex;

  useEffect(() => {
    return context.registerItem(id, text, value);
  }, [id, text, value, context.registerItem]);

  if (!isVisible) return null;

  return (
    <div
      onClick={() => context.onValueChange(value)}
      onMouseEnter={() => context.setActiveIndex(itemIndex)}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-xl px-3 py-2 text-sm outline-none transition-colors",
        "text-gray-700 dark:text-white/80",
        "aria-selected:bg-gray-100 aria-selected:text-gray-900 dark:aria-selected:bg-white/10 dark:aria-selected:text-white",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white",
        (isSelected || isActive) && "bg-gray-100 text-gray-900 dark:bg-white/10 dark:text-white",
        className
      )}
      {...props}
    >
      <svg
        className={cn(
          "mr-2 h-4 w-4",
          isSelected ? "opacity-100" : "opacity-0"
        )}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
      {children}
    </div>
  );
}
