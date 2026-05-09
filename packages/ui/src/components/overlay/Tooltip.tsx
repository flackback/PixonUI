import React, { useState, useRef, useEffect, useId, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';
import { useFloating } from '../../hooks/useFloating';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export type TooltipVariant = 'dark' | 'light' | 'glass';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: TooltipPosition;
  /** Delay in ms before showing @default 200 */
  delay?: number;
  /** Visual variant */
  variant?: TooltipVariant;
  /** Show directional arrow @default true */
  arrow?: boolean;
  /** Max width in pixels @default 280 */
  maxWidth?: number;
  /** Disable tooltip entirely */
  disabled?: boolean;
  className?: string;
}

/** Rich tooltip with title + description */
export interface RichTooltipProps extends Omit<TooltipProps, 'content'> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

const variantStyles: Record<TooltipVariant, string> = {
  dark: 'bg-zinc-900 text-white border-zinc-800 dark:bg-zinc-800 dark:border-zinc-700',
  light: 'bg-white text-zinc-900 border-zinc-200 shadow-lg',
  glass: 'bg-white/80 dark:bg-zinc-900/80 text-zinc-900 dark:text-white border-zinc-200/50 dark:border-white/10 backdrop-blur-xl',
};

const arrowVariantStyles: Record<TooltipVariant, string> = {
  dark: 'bg-zinc-900 border-zinc-800 dark:bg-zinc-800 dark:border-zinc-700',
  light: 'bg-white border-zinc-200',
  glass: 'bg-white/80 dark:bg-zinc-900/80 border-zinc-200/50 dark:border-white/10',
};

function ArrowElement({ position, variant }: { position: TooltipPosition; variant: TooltipVariant }) {
  const base = cn(
    'absolute w-2 h-2 rotate-45',
    arrowVariantStyles[variant],
  );

  const positionStyles: Record<TooltipPosition, string> = {
    top: 'bottom-[-5px] left-1/2 -translate-x-1/2 border-r border-b',
    bottom: 'top-[-5px] left-1/2 -translate-x-1/2 border-l border-t',
    left: 'right-[-5px] top-1/2 -translate-y-1/2 border-t border-r',
    right: 'left-[-5px] top-1/2 -translate-y-1/2 border-b border-l',
  };

  return <div className={cn(base, positionStyles[position])} />;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 200,
  variant = 'dark',
  arrow = true,
  maxWidth = 280,
  disabled = false,
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const { position: floatingPosition, isPositioned } = useFloating(triggerRef, contentRef, {
    side: position,
    align: 'center',
    sideOffset: arrow ? 10 : 8,
    isOpen: isVisible,
  });

  const showTooltip = () => {
    if (disabled) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && createPortal(
        <div
          ref={contentRef}
          role="tooltip"
          style={{
            top: floatingPosition.top,
            left: floatingPosition.left,
            maxWidth: `${maxWidth}px`,
          }}
          className={cn(
            'fixed z-[120] rounded-xl border px-3 py-1.5 text-xs font-medium shadow-xl',
            'transition-all duration-150',
            isPositioned ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
            variantStyles[variant],
            className
          )}
        >
          {content}
          {arrow && <ArrowElement position={position} variant={variant} />}
        </div>,
        document.body
      )}
    </div>
  );
}

/** Rich Tooltip with title, description, and optional icon */
export function RichTooltip({
  title,
  description,
  icon,
  variant = 'glass',
  maxWidth = 320,
  ...props
}: RichTooltipProps) {
  return (
    <Tooltip
      variant={variant}
      maxWidth={maxWidth}
      content={
        <div className="flex items-start gap-2.5 py-1">
          {icon && (
            <div className="shrink-0 mt-0.5 text-zinc-400 dark:text-zinc-500">{icon}</div>
          )}
          <div className="space-y-0.5">
            <div className="text-xs font-semibold">{title}</div>
            {description && (
              <div className="text-[11px] opacity-70 font-normal leading-relaxed">{description}</div>
            )}
          </div>
        </div>
      }
      {...props}
    />
  );
}
