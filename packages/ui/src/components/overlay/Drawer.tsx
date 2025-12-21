import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';
import { Heading } from '../typography/Heading';
import { Text } from '../typography/Text';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  position?: 'left' | 'right' | 'bottom';
  children: React.ReactNode;
  className?: string;
}

export function Drawer({ 
  isOpen, 
  onClose, 
  position = 'right', 
  children, 
  className 
}: DrawerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to allow render before animating in
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
        document.body.style.overflow = 'unset';
      }, 300); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!shouldRender) return null;

  const positionClasses = {
    left: "left-0 h-full w-3/4 max-w-sm border-r",
    right: "right-0 h-full w-3/4 max-w-sm border-l",
    bottom: "bottom-0 w-full h-auto max-h-[90vh] border-t rounded-t-2xl",
  };

  const translateClasses = {
    left: isVisible ? "translate-x-0" : "-translate-x-full",
    right: isVisible ? "translate-x-0" : "translate-x-full",
    bottom: isVisible ? "translate-y-0" : "translate-y-full",
  };

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className={cn(
        "fixed inset-0 z-[100] flex bg-black/60 backdrop-blur-sm transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0"
      )}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          "absolute bg-white dark:bg-[#0A0A0A] border-gray-200 dark:border-white/10 p-6 shadow-2xl transition-transform duration-300 ease-in-out",
          positionClasses[position],
          translateClasses[position],
          className
        )}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

export function DrawerHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left mb-6", className)} {...props}>
      {children}
    </div>
  );
}

export function DrawerFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-auto pt-6", className)} {...props}>
      {children}
    </div>
  );
}

export function DrawerTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <Heading as="h2" className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props}>
      {children}
    </Heading>
  );
}

export function DrawerDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <Text variant="muted" className={cn("text-sm", className)} {...props}>
      {children}
    </Text>
  );
}
