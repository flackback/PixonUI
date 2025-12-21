import { useLayoutEffect } from 'react';

/**
 * Hook to lock body scroll.
 * Useful for modals, drawers, and overlays.
 * Handles scrollbar width to prevent layout shift.
 */
export function useScrollLock(lock: boolean = true) {
  useLayoutEffect(() => {
    if (!lock) return;

    // Get original body overflow and padding
    const originalStyle = window.getComputedStyle(document.body).overflow;
    const originalPaddingRight = window.getComputedStyle(document.body).paddingRight;

    // Calculate scrollbar width
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // Apply lock
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${parseFloat(originalPaddingRight) + scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalStyle;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [lock]);
}
