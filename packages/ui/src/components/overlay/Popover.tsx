import React, { createContext, useContext, useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';
import { useFloating } from '../../hooks/useFloating';

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

  const contentRef = useRef<HTMLDivElement>(null);
  const { position, isPositioned } = useFloating(context.triggerRef, contentRef, {
    side: 'bottom',
    align,
    sideOffset,
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

      document.addEventListener('mousedown', handleOutsideClick);
      return () => {
        document.removeEventListener('mousedown', handleOutsideClick);
      };
    }
  }, [context.isOpen, context.setIsOpen, context.triggerRef]);

  if (!context.isOpen) return null;

  const getTransformOrigin = () => {
    // Popover currently only supports top/bottom in its logic, but let's make it robust
    const side = position.top > (context.triggerRef.current?.getBoundingClientRect().top || 0) ? 'bottom' : 'top';
    
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
    return 'center center';
  };

  return createPortal(
    <div
      ref={contentRef}
      style={{ 
        top: position.top, 
        left: position.left,
        transformOrigin: getTransformOrigin(),
      }}
      className={cn(
        "fixed z-50 min-w-[12rem] rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl p-4 shadow-xl outline-none duration-200",
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
