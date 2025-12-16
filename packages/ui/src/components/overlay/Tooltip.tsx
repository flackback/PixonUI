import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';

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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const animationClasses = {
    top: 'slide-in-from-bottom-2',
    bottom: 'slide-in-from-top-2',
    left: 'slide-in-from-right-2',
    right: 'slide-in-from-left-2',
  };

  return (
    <div 
      className="relative inline-flex" 
      onMouseEnter={showTooltip} 
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={cn(
            "absolute z-50 min-w-max max-w-xs rounded-lg border border-white/10 bg-[#0A0A0A]/90 px-3 py-1.5 text-xs text-white shadow-xl backdrop-blur-md",
            "animate-in fade-in duration-200",
            positionClasses[position],
            animationClasses[position],
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
