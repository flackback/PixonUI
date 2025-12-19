import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';

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
      aria-expanded={context.isOpen}
      onClick={handleClick}
      className={cn("inline-flex items-center justify-center", className)}
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

  const [position, setPosition] = useState({ top: 0, left: 0 });
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (context.isOpen && context.triggerRef.current) {
      const rect = context.triggerRef.current.getBoundingClientRect();
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      const contentWidth = contentRef.current?.offsetWidth || 200;
      const contentHeight = contentRef.current?.offsetHeight || 0;

      let top = 0;
      let left = 0;

      // Calculate Top
      if (side === 'bottom') {
        top = rect.bottom + scrollY + 4;
      } else if (side === 'top') {
        top = rect.top + scrollY - contentHeight - 4;
      } else {
        // left or right
        top = rect.top + scrollY; // Default align start
        if (align === 'end') top = rect.bottom + scrollY - contentHeight;
        if (align === 'center') top = rect.top + scrollY + (rect.height / 2) - (contentHeight / 2);
      }

      // Calculate Left
      if (side === 'left') {
        left = rect.left + scrollX - contentWidth - 4;
      } else if (side === 'right') {
        left = rect.right + scrollX + 4;
      } else {
        // top or bottom
        left = rect.left + scrollX; // Default align start
        if (align === 'end') left = rect.right + scrollX - contentWidth;
        if (align === 'center') left = rect.left + scrollX + (rect.width / 2) - (contentWidth / 2);
      }

      setPosition({ top, left });

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

      document.addEventListener('mousedown', handleOutsideClick);
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }
  }, [context.isOpen, align, side]);

  if (!context.isOpen) return null;

  return createPortal(
    <div
      ref={contentRef}
      style={{ top: position.top, left: position.left }}
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] p-1 shadow-md animate-in fade-in zoom-in-95 duration-100",
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
        "relative flex w-full cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm outline-none transition-colors",
        "text-gray-700 dark:text-white/80",
        "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white",
        "focus:bg-gray-100 focus:text-gray-900 dark:focus:bg-white/10 dark:focus:text-white",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownMenuLabel({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-2 py-1.5 text-sm font-semibold text-gray-900 dark:text-white", className)} {...props}>
      {children}
    </div>
  );
}

export function DropdownMenuSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("-mx-1 my-1 h-px bg-gray-200 dark:bg-white/10", className)} {...props} />
  );
}
