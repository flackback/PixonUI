import { useState, useEffect, useRef } from 'react';

export interface ElementScrollValues {
  progress: number; // 0 to 1
  scrollY: number;
  isIntersecting: boolean;
}

/**
 * Hook to track the scroll progress of a specific element relative to the viewport.
 * Perfect for parallax effects on specific sections.
 */
export function useElementScroll(ref: React.RefObject<HTMLElement>): ElementScrollValues {
  const [values, setValues] = useState<ElementScrollValues>({
    progress: 0,
    scrollY: 0,
    isIntersecting: false,
  });

  const ticking = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const rect = element.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          
          // Calculate how much of the element has passed through the viewport
          // 0 = element top is at window bottom
          // 1 = element bottom is at window top
          const totalDistance = windowHeight + rect.height;
          const currentDistance = windowHeight - rect.top;
          const progress = Math.max(0, Math.min(1, currentDistance / totalDistance));

          setValues({
            progress,
            scrollY: window.scrollY,
            isIntersecting: rect.top < windowHeight && rect.bottom > 0,
          });
          
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll);
    updateScroll();

    return () => {
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
    };
  }, [ref]);

  return values;
}
