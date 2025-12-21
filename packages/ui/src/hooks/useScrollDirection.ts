import { useState, useEffect, useRef } from 'react';

export type ScrollDirection = 'up' | 'down' | null;

/**
 * Hook to detect scroll direction with a threshold to prevent jitter.
 */
export function useScrollDirection(threshold: number = 10): ScrollDirection {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY = window.scrollY;

      if (Math.abs(scrollY - lastScrollY.current) < threshold) {
        return;
      }

      const direction = scrollY > lastScrollY.current ? 'down' : 'up';
      
      if (direction !== scrollDirection && (scrollY > 0 || direction === 'down')) {
        setScrollDirection(direction);
      }
      
      lastScrollY.current = scrollY > 0 ? scrollY : 0;
    };

    const onScroll = () => {
      window.requestAnimationFrame(updateScrollDirection);
    };

    window.addEventListener('scroll', onScroll);

    return () => window.removeEventListener('scroll', onScroll);
  }, [scrollDirection, threshold]);

  return scrollDirection;
}
