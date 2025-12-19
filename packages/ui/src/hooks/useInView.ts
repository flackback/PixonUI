import { useEffect, useState, useRef } from 'react';

export interface UseInViewOptions {
  threshold?: number | number[];
  rootMargin?: string;
  root?: Element | null;
  enabled?: boolean;
}

export function useInView(options: UseInViewOptions = { threshold: 0.1, rootMargin: '0px', enabled: true }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const { enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;
    
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry && entry.isIntersecting) {
        setIsInView(true);
        setHasAnimated(true);
      } else {
        setIsInView(false);
      }
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options.threshold, options.rootMargin, options.root, enabled]);

  return { ref, isInView, hasAnimated };
}
