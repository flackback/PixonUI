import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';
import { Heading } from '../typography/Heading';
import { Text } from '../typography/Text';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  spotlight?: boolean;
  spotlightColor?: string;
  spotlightSize?: number;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-5xl',
  full: 'max-w-full m-4',
};

export function Modal({ 
  isOpen, 
  onClose, 
  children, 
  className, 
  size = 'md',
  spotlight = true,
  spotlightColor,
  spotlightSize = 600,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [mounted, setMounted] = React.useState(false);
  const [coords, setCoords] = React.useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = React.useState(false);
  const [isDark, setIsDark] = React.useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof document !== 'undefined') {
      setIsDark(document.documentElement.classList.contains('dark'));
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!spotlight) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const activeColor = spotlightColor || (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
        document.body.style.overflow = 'hidden';
      }
    } else {
      if (dialog.open) {
        dialog.close();
        document.body.style.overflow = 'unset';
      }
    }
  }, [isOpen, mounted]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };

    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onClose, mounted]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  if (!mounted) return null;

  return createPortal(
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className={cn(
        "fixed inset-0 z-[100] m-auto bg-transparent p-0 backdrop:bg-black/60 backdrop:backdrop-blur-sm open:flex open:items-center open:justify-center",
        "animate-in fade-in duration-200",
        className
      )}
    >
      <div
        onMouseMove={handleMouseMove}
        onMouseEnter={() => spotlight && setIsHovered(true)}
        onMouseLeave={() => spotlight && setIsHovered(false)}
        className={cn(
          // Glass treatment (matching DatePicker/Calendar): translucent surface + strong blur + deep shadow.
          "relative w-full scale-100 flex flex-col max-h-[90vh] border border-gray-200 dark:border-white/10 bg-white/95 dark:bg-black/40 p-6 shadow-2xl shadow-black/10 dark:shadow-black/50 backdrop-blur-xl transition-all sm:rounded-2xl",
          sizeClasses[size],
          "animate-in fade-in zoom-in-95 duration-200 slide-in-from-bottom-2"
        )}
      >
        {spotlight && (
          <div
            data-testid="modal-spotlight"
            className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 rounded-[inherit]"
            style={{
              opacity: isHovered ? 1 : 0,
              background: `radial-gradient(${spotlightSize}px circle at ${coords.x}px ${coords.y}px, ${activeColor}, transparent 40%)`,
            }}
          />
        )}
        {children}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-white/20 disabled:pointer-events-none z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900 dark:text-white">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          <span className="sr-only">Close</span>
        </button>
      </div>
    </dialog>,
    document.body
  );
}

export function ModalHeader({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left mb-4", className)}>
      {children}
    </div>
  );
}

export function ModalFooter({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6", className)}>
      {children}
    </div>
  );
}

export function ModalTitle({ className, children }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <Heading as="h2" className={cn("text-lg font-semibold leading-none tracking-tight", className)}>
      {children}
    </Heading>
  );
}

export function ModalDescription({ className, children }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <Text variant="muted" className={cn("text-sm", className)}>
      {children}
    </Text>
  );
}
