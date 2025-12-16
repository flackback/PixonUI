import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';

interface PopoverContextValue {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  triggerRef: React.RefObject<HTMLElement>;
}

const PopoverContext = createContext<PopoverContextValue | undefined>(undefined);

export interface PopoverProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Popover({ children, open, onOpenChange }: PopoverProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <PopoverContext.Provider value={{ isOpen, setIsOpen, triggerRef }}>
      <div className="relative inline-block">
        {children}
      </div>
    </PopoverContext.Provider>
  );
}

export interface PopoverTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function PopoverTrigger({ className, children, ...props }: PopoverTriggerProps) {
  const context = useContext(PopoverContext);
  if (!context) throw new Error('PopoverTrigger must be used within Popover');

  const handleClick = (e: React.MouseEvent) => {
    context.setIsOpen(!context.isOpen);
    props.onClick?.(e as any);
  };

  return (
    <button
      ref={context.triggerRef as any}
      type="button"
      aria-haspopup="dialog"
      aria-expanded={context.isOpen}
      onClick={handleClick}
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    >
      {children}
    </button>
  );
}

export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  align?: 'start' | 'end' | 'center';
  sideOffset?: number;
}

export function PopoverContent({ className, children, align = 'center', sideOffset = 4, ...props }: PopoverContentProps) {
  const context = useContext(PopoverContext);
  if (!context) throw new Error('PopoverContent must be used within Popover');

  const [position, setPosition] = useState({ top: 0, left: 0 });
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (context.isOpen && context.triggerRef.current) {
      const updatePosition = () => {
        if (!context.triggerRef.current) return;
        const rect = context.triggerRef.current.getBoundingClientRect();
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        let left = rect.left + scrollX;
        if (align === 'end') {
          left = rect.right + scrollX - (contentRef.current?.offsetWidth || 200);
        } else if (align === 'center') {
          left = rect.left + scrollX + rect.width / 2 - (contentRef.current?.offsetWidth || 200) / 2;
        }

        setPosition({
          top: rect.bottom + scrollY + sideOffset,
          left: left,
        });
      };

      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);

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
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
        document.removeEventListener('mousedown', handleOutsideClick);
      };
    }
  }, [context.isOpen, align, sideOffset]);

  if (!context.isOpen) return null;

  return createPortal(
    <div
      ref={contentRef}
      style={{ top: position.top, left: position.left }}
      className={cn(
        "absolute z-50 min-w-[12rem] rounded-xl border border-white/10 bg-[#0A0A0A] p-4 shadow-xl outline-none animate-in fade-in zoom-in-95 duration-200",
        className
      )}
      {...props}
    >
      {children}
    </div>,
    document.body
  );
}
