import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { ChevronDown } from 'lucide-react';

export interface CollapseProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  children: React.ReactNode;
  triggerClassName?: string;
  contentClassName?: string;
}

export function Collapse({
  title,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  children,
  className,
  triggerClassName,
  contentClassName,
  ...props
}: CollapseProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const handleToggle = () => {
    if (disabled) return;
    const newState = !isOpen;
    if (!isControlled) {
      setUncontrolledOpen(newState);
    }
    onOpenChange?.(newState);
  };

  return (
    <div 
      className={cn(
        'w-full overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/[0.02]',
        className
      )} 
      {...props}
    >
      {title && (
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={cn(
            'flex w-full items-center justify-between px-4 py-3 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02]',
            disabled && 'cursor-not-allowed opacity-50',
            triggerClassName
          )}
        >
          {title}
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200 dark:text-gray-400',
              isOpen && 'rotate-180'
            )}
          />
        </button>
      )}
      
      <div
        className={cn(
          'grid transition-all duration-300 ease-in-out',
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="overflow-hidden">
          <div className={cn('px-4 pb-4 pt-0', title && 'pt-1', contentClassName)}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
