import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';
import { useFloating } from '../../hooks/useFloating';

interface DropdownMenuContextValue {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  triggerRef: React.RefObject<HTMLElement>;
}

const DropdownMenuContext = createContext<DropdownMenuContextValue | undefined>(undefined);

export interface DropdownMenuProps {
  children: React.ReactNode;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);

  return (
    <DropdownMenuContext.Provider value={{ isOpen, setIsOpen, triggerRef }}>
      <div className="relative inline-block text-left">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

export interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function DropdownMenuTrigger({ className, children, ...props }: DropdownMenuTriggerProps) {
  const context = useContext(DropdownMenuContext);
  if (!context) throw new Error('DropdownMenuTrigger must be used within DropdownMenu');

  const handleClick = (e: React.MouseEvent) => {
    context.setIsOpen(!context.isOpen);
    props.onClick?.(e as any);
  };

  return (
    <button
      ref={context.triggerRef as any}
      type="button"
      aria-haspopup="menu"
      aria-expanded={context.isOpen ? "true" : "false"}
      onClick={handleClick}
      className={cn("inline-flex items-center justify-center focus:outline-none", className)}
      {...props}
    >
      {children}
    </button>
  );
}

export interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  align?: 'start' | 'end' | 'center';
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export function DropdownMenuContent({ className, children, align = 'start', side = 'bottom', ...props }: DropdownMenuContentProps) {
  const context = useContext(DropdownMenuContext);
  if (!context) throw new Error('DropdownMenuContent must be used within DropdownMenu');

  const contentRef = useRef<HTMLDivElement>(null);
  const { position, isPositioned } = useFloating(context.triggerRef, contentRef, {
    side,
    align,
    isOpen: context.isOpen,
  });

  useEffect(() => {
    if (context.isOpen) {
      const handleOutsideClick = (e: MouseEvent) => {
        if (
          contentRef.current &&
          !contentRef.current.contains(e.target as Node) &&
          context.triggerRef.current &&
          !context.triggerRef.current.contains(e.target as Node)
        ) {
          context.setIsOpen(false);
        }
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          context.setIsOpen(false);
          context.triggerRef.current?.focus();
        }
        
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          const items = contentRef.current?.querySelectorAll('[role^="menuitem"]') as NodeListOf<HTMLElement>;
          if (!items.length) return;
          
          const currentIndex = Array.from(items).indexOf(document.activeElement as HTMLElement);
          let nextIndex = 0;
          
          if (e.key === 'ArrowDown') {
            nextIndex = (currentIndex + 1) % items.length;
          } else {
            nextIndex = (currentIndex - 1 + items.length) % items.length;
          }
          
          items[nextIndex]?.focus();
        }
      };

      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('mousedown', handleOutsideClick);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [context.isOpen, context.setIsOpen, context.triggerRef]);

  if (!context.isOpen) return null;

  const getTransformOrigin = () => {
    if (side === 'bottom') {
      if (align === 'start') return 'top left';
      if (align === 'end') return 'top right';
      return 'top center';
    }
    if (side === 'top') {
      if (align === 'start') return 'bottom left';
      if (align === 'end') return 'bottom right';
      return 'bottom center';
    }
    if (side === 'left') {
      if (align === 'start') return 'top right';
      if (align === 'end') return 'bottom right';
      return 'center right';
    }
    if (side === 'right') {
      if (align === 'start') return 'top left';
      if (align === 'end') return 'bottom left';
      return 'center left';
    }
    return 'center center';
  };

  return createPortal(
    <div
      ref={contentRef}
      role="menu"
      aria-orientation="vertical"
      style={{ 
        top: position.top, 
        left: position.left,
        transformOrigin: getTransformOrigin(),
      }}
      className={cn(
        "fixed z-[130] min-w-[12rem] overflow-hidden rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl p-1.5 shadow-xl transition duration-150",
        isPositioned ? "animate-in fade-in zoom-in-95 opacity-100" : "opacity-0",
        className
      )}
      {...props}
    >
      {children}
    </div>,
    document.body
  );
}

export interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function DropdownMenuItem({ className, children, ...props }: DropdownMenuItemProps) {
  const context = useContext(DropdownMenuContext);
  
  const handleClick = (e: React.MouseEvent) => {
    context?.setIsOpen(false);
    props.onClick?.(e as any);
  };

  return (
    <button
      type="button"
      role="menuitem"
      onClick={handleClick}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm outline-none transition-all duration-150",
        "text-zinc-700 dark:text-zinc-300",
        "hover:bg-zinc-50 hover:text-zinc-900 dark:hover:bg-white/[0.04] dark:hover:text-white",
        "focus:bg-zinc-50 focus:text-zinc-900 dark:focus:bg-white/[0.04] dark:focus:text-white",
        "disabled:pointer-events-none disabled:opacity-40",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export interface DropdownMenuCheckboxItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  children: React.ReactNode;
}

export function DropdownMenuCheckboxItem({ className, checked, onCheckedChange, children, ...props }: DropdownMenuCheckboxItemProps) {
  const context = useContext(DropdownMenuContext);
  
  const handleClick = (e: React.MouseEvent) => {
    onCheckedChange?.(!checked);
    context?.setIsOpen(false);
    props.onClick?.(e as any);
  };

  return (
    <button
      type="button"
      role="menuitemcheckbox"
      aria-checked={checked}
      onClick={handleClick}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-xl pl-9 pr-3 py-2 text-sm outline-none transition-all duration-150",
        "text-zinc-700 dark:text-zinc-300",
        "hover:bg-zinc-50 hover:text-zinc-900 dark:hover:bg-white/[0.04] dark:hover:text-white",
        "focus:bg-zinc-50 focus:text-zinc-900 dark:focus:bg-white/[0.04] dark:focus:text-white",
        className
      )}
      {...props}
    >
      <span className="absolute left-3 flex h-4 w-4 items-center justify-center shrink-0">
        {checked && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-purple-600 dark:text-purple-400"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
      {children}
    </button>
  );
}

interface DropdownMenuRadioGroupContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
}

const DropdownMenuRadioGroupContext = createContext<DropdownMenuRadioGroupContextValue | undefined>(undefined);

export interface DropdownMenuRadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export function DropdownMenuRadioGroup({ value, onValueChange, children, ...props }: DropdownMenuRadioGroupProps) {
  return (
    <DropdownMenuRadioGroupContext.Provider value={{ value, onValueChange }}>
      <div {...props}>{children}</div>
    </DropdownMenuRadioGroupContext.Provider>
  );
}

export interface DropdownMenuRadioItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: React.ReactNode;
}

export function DropdownMenuRadioItem({ className, value, children, ...props }: DropdownMenuRadioItemProps) {
  const context = useContext(DropdownMenuContext);
  const groupContext = useContext(DropdownMenuRadioGroupContext);
  const isChecked = groupContext?.value === value;

  const handleClick = (e: React.MouseEvent) => {
    groupContext?.onValueChange?.(value);
    context?.setIsOpen(false);
    props.onClick?.(e as any);
  };

  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={isChecked}
      onClick={handleClick}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-xl pl-9 pr-3 py-2 text-sm outline-none transition-all duration-150",
        "text-zinc-700 dark:text-zinc-300",
        "hover:bg-zinc-50 hover:text-zinc-900 dark:hover:bg-white/[0.04] dark:hover:text-white",
        "focus:bg-zinc-50 focus:text-zinc-900 dark:focus:bg-white/[0.04] dark:focus:text-white",
        className
      )}
      {...props}
    >
      <span className="absolute left-3.5 flex h-2 w-2 items-center justify-center shrink-0">
        {isChecked && (
          <span className="h-2 w-2 rounded-full bg-purple-600 dark:bg-purple-400 animate-in zoom-in duration-100" />
        )}
      </span>
      {children}
    </button>
  );
}

export function DropdownMenuLabel({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-3 py-1.5 text-xs font-semibold tracking-wider uppercase text-zinc-400 dark:text-zinc-500", className)} {...props}>
      {children}
    </div>
  );
}

export function DropdownMenuSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("-mx-1.5 my-1 h-px bg-zinc-100 dark:bg-white/[0.03]", className)} {...props} />
  );
}

export function DropdownMenuShortcut({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "ml-auto text-[10px] tracking-widest opacity-50 font-mono font-semibold",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
