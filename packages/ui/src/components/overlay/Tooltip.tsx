import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';
import { useFloating } from '../../hooks/useFloating';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: TooltipPosition;
  delay?: number;
  className?: string;
}

export function Tooltip({ 
  content, 
  children, 
  position = 'top', 
  delay = 200,
  className 
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const { position: floatingPosition, isPositioned } = useFloating(triggerRef, contentRef, {
    side: position,
    align: 'center',
    sideOffset: 8,
    isOpen: isVisible,
  });

  const showTooltip = () => {
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

  const animationClasses = {
    top: 'slide-in-from-bottom-2',
    bottom: 'slide-in-from-top-2',
    left: 'slide-in-from-right-2',
    right: 'slide-in-from-left-2',
  };

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
          }}
          className={cn(
            "fixed z-[100] min-w-max max-w-xs rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A]/90 px-3 py-1.5 text-xs text-gray-900 dark:text-white shadow-xl backdrop-blur-md",
            "duration-200",
            isPositioned ? "animate-in fade-in opacity-100" : "opacity-0",
            animationClasses[position],
            className
          )}
        >
          {content}
        </div>,
        document.body
      )}
    </div>
  );
}
