import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';
import { Combobox, ComboboxInput, ComboboxList, ComboboxItem, ComboboxEmpty, ComboboxProps } from '../form/Combobox';
import { Search } from 'lucide-react';

export interface CommandDialogProps extends ComboboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Command({ children, ...props }: ComboboxProps) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white dark:bg-black/90 text-gray-900 dark:text-white">
      <Combobox usePopover={false} {...props}>
        {children}
      </Combobox>
    </div>
  );
}

export function CommandDialog({ 
  children, 
  open, 
  onOpenChange,
  ...props 
}: CommandDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onOpenChange]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onOpenChange(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 pt-[20vh]"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/90 shadow-2xl animate-in zoom-in-95 duration-200">
        <Combobox usePopover={false} {...props}>
          {children}
        </Combobox>
      </div>
    </div>,
    document.body
  );
}

export function CommandInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex items-center border-b border-gray-200 dark:border-white/10 px-3" cmdk-input-wrapper="">
      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
      <ComboboxInput 
        className={cn(
          "flex h-12 w-full rounded-md bg-transparent py-3 text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-white/50 disabled:cursor-not-allowed disabled:opacity-50 border-none focus:ring-0 px-0",
          className
        )}
        {...props}
      />
    </div>
  );
}

export function CommandList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <ComboboxList 
      className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden p-2", className)} 
      {...props} 
    />
  );
}

export function CommandEmpty(props: React.HTMLAttributes<HTMLDivElement>) {
  return <ComboboxEmpty className="py-6 text-center text-sm" {...props} />;
}

export function CommandGroup({ 
  children, 
  heading, 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & { heading?: React.ReactNode }) {
  return (
    <div className={cn("overflow-hidden p-1 text-gray-900 dark:text-white", className)} {...props}>
      {heading && (
        <div className="px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-white/50">
          {heading}
        </div>
      )}
      {children}
    </div>
  );
}

export function CommandItem({ 
  className, 
  ...props 
}: React.ComponentProps<typeof ComboboxItem>) {
  return (
    <ComboboxItem 
      className={cn(
        "relative flex cursor-default select-none items-center rounded-2xl px-2 py-1.5 text-sm outline-none text-gray-900 dark:text-white aria-selected:bg-gray-100 dark:aria-selected:bg-white/[0.06] aria-selected:text-gray-900 dark:aria-selected:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )} 
      {...props} 
    />
  );
}

export function CommandShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-gray-400 dark:text-white/50",
        className
      )}
      {...props}
    />
  );
}
