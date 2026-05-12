import { useRef, useEffect, useCallback } from 'react';

export interface UseVirtualScrollRestorationOptions {
  /** SessionStorage key for caching the coordinates dictionary */
  storageKey?: string;
}

/**
 * Advanced React hook for preserving virtual scroll layouts when switching views.
 * Memorizes precise vertical scroll positions inside sessionStorage mapped by unique keys 
 * (such as chat/room IDs), binding event listeners and restoring positions automatically.
 */
export function useVirtualScrollRestoration({
  storageKey = 'pixon-scroll-positions',
}: UseVirtualScrollRestorationOptions = {}) {
  const positionsRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const saved = sessionStorage.getItem(storageKey);
    if (saved) {
      try {
        positionsRef.current = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse scroll positions', e);
      }
    }
  }, [storageKey]);

  const saveScrollPosition = useCallback((key: string, position: number) => {
    positionsRef.current[key] = position;
    sessionStorage.setItem(storageKey, JSON.stringify(positionsRef.current));
  }, [storageKey]);

  const getScrollPosition = useCallback((key: string) => {
    return positionsRef.current[key] || 0;
  }, []);

  const bindContainer = useCallback((key: string, element: HTMLElement | null) => {
    if (!element) return;

    // Restore previous position
    const savedPos = positionsRef.current[key] || 0;
    element.scrollTop = savedPos;

    // Track position changes on scroll
    const handleScroll = () => {
      positionsRef.current[key] = element.scrollTop;
      sessionStorage.setItem(storageKey, JSON.stringify(positionsRef.current));
    };

    element.addEventListener('scroll', handleScroll);
    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [storageKey]);

  return {
    bindContainer,
    saveScrollPosition,
    getScrollPosition,
  };
}
