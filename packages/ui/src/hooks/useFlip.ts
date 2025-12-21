import { useLayoutEffect, useRef } from 'react';

/**
 * Hook to implement the FLIP (First, Last, Invert, Play) technique.
 * Enables smooth layout transitions when elements change position or size.
 */
export function useFlip(id: string, dependencies: any[]) {
  const lastRectRef = useRef<DOMRect | null>(null);

  useLayoutEffect(() => {
    const element = document.querySelector(`[data-flip-id="${id}"]`) as HTMLElement;
    if (!element) return;

    const first = lastRectRef.current;
    const last = element.getBoundingClientRect();

    if (first) {
      const deltaX = first.left - last.left;
      const deltaY = first.top - last.top;
      const deltaW = first.width / last.width;
      const deltaH = first.height / last.height;

      // Only animate if there's a significant change
      if (Math.abs(deltaX) > 0.5 || Math.abs(deltaY) > 0.5 || Math.abs(deltaW - 1) > 0.01 || Math.abs(deltaH - 1) > 0.01) {
        element.animate([
          {
            transformOrigin: 'top left',
            transform: `translate(${deltaX}px, ${deltaY}px) scale(${deltaW}, ${deltaH})`
          },
          {
            transformOrigin: 'top left',
            transform: 'none'
          }
        ], {
          duration: 400,
          easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        });
      }
    }

    lastRectRef.current = last;
  }, dependencies);

  return { 'data-flip-id': id };
}
