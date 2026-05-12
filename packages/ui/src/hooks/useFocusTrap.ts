import { useEffect, useRef } from 'react';

export interface UseFocusTrapOptions {
  /** Whether the focus trap is actively enabled */
  active: boolean;
}

/**
 * Advanced focus entrapment React hook for premium modal, sheet and drawer accessibility.
 * Keeps the focus navigation tab cycling strictly inside the active container ref, 
 * fulfilling WCAG AAA requirements.
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>({ active }: UseFocusTrapOptions) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!active) return;

    const el = ref.current;
    if (!el) return;

    // Standard CSS selector containing all possible keyboard-focusable elements
    const getFocusableElements = () => {
      return el.querySelectorAll<HTMLElement>(
        'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]'
      );
    };

    const focusable = getFocusableElements();
    if (focusable.length > 0) {
      // Focus on the first element when the trap activates
      focusable[0]?.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = Array.from(getFocusableElements());
      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusableElements[0]!;
      const lastElement = focusableElements[focusableElements.length - 1]!;

      if (e.shiftKey) {
        // Shift + Tab -> Cycle backwards from first to last
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        // Tab -> Cycle forwards from last to first
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [active]);

  return ref;
}
