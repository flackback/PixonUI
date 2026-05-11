import { useState, useEffect, useRef } from 'react';

export interface UseScrollSpyOptions {
  /**
   * Intersection observer root element margin
   * @default '0px 0px -50% 0px' (triggers when element reaches the middle of viewport)
   */
  rootMargin?: string;
  /**
   * Threshold for triggering intersecting state
   * @default 0
   */
  threshold?: number | number[];
}

export function useScrollSpy(
  ids: string[],
  { rootMargin = '0px 0px -50% 0px', threshold = 0 }: UseScrollSpyOptions = {}
) {
  const [activeId, setActiveId] = useState<string>('');
  const idsRef = useRef(ids);

  useEffect(() => {
    idsRef.current = ids;
  }, [ids]);

  useEffect(() => {
    const currentIds = idsRef.current;
    if (currentIds.length === 0) return;

    // Map of id to boolean representing intersection status
    const intersectionStates: Record<string, boolean> = {};

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          intersectionStates[id] = entry.isIntersecting;
        });

        // Find the first intersecting ID in the order they were defined in the ids array
        const firstVisibleId = currentIds.find((id) => intersectionStates[id]);
        if (firstVisibleId) {
          setActiveId(firstVisibleId);
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    // Observe all elements by their ID
    const observedElements: HTMLElement[] = [];
    currentIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
        observedElements.push(el);
      }
    });

    return () => {
      observedElements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [rootMargin, threshold]);

  return activeId;
}
