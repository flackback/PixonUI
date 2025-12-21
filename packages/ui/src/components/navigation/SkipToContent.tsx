import React from 'react';
import { cn } from '../../utils/cn';

export interface SkipToContentProps {
  contentId?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * A component that allows keyboard users to skip navigation and jump to the main content.
 * It is hidden by default and becomes visible on focus.
 */
export function SkipToContent({
  contentId = 'main-content',
  className,
  children = 'Skip to content',
}: SkipToContentProps) {
  return (
    <a
      href={`#${contentId}`}
      className={cn(
        "sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-xl focus:shadow-2xl focus:outline-none focus:ring-2 focus:ring-white/20 transition-all",
        className
      )}
    >
      {children}
    </a>
  );
}
