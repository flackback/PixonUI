import { useRef, useLayoutEffect } from 'react';

export interface UseScrollAnchorOptions {
  /** The ref to the scrollable element container */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Dependency array of list items. When changed, scroll anchoring is evaluated */
  items: any[];
}

/**
 * Advanced React hook for chat/timeline scroll anchoring and position restoration.
 * Keeps the scroll position stable when prepending new historical items (scrolling to top).
 */
export function useScrollAnchor({ containerRef, items }: UseScrollAnchorOptions) {
  const prevScrollHeightRef = useRef<number>(0);
  const prevScrollTopRef = useRef<number>(0);

  // Before elements render, keep track of scroll height and scrollTop
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    prevScrollHeightRef.current = el.scrollHeight;
    prevScrollTopRef.current = el.scrollTop;
  }, [items, containerRef]);

  // After elements render, restore scroll anchor
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const heightDifference = el.scrollHeight - prevScrollHeightRef.current;
    if (heightDifference > 0 && prevScrollTopRef.current < 150) {
      el.scrollTop = prevScrollTopRef.current + heightDifference;
    }
  }, [items, containerRef]);
}
