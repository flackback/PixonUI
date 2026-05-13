import { RefObject, useEffect, useState } from 'react';

export interface UseScrollOptions {
  container?: RefObject<HTMLElement>;
  axis?: 'x' | 'y';
}

export function usePixonScroll({ container, axis = 'y' }: UseScrollOptions = {}) {
  const [scrollY, setScrollY] = useState(0);
  const [scrollYProgress, setScrollYProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = (e?: Event) => {
      // Dynamically resolve target at event time to prevent React Ref timing bugs
      const target = container?.current || window;
      
      // If a container scroll event is triggered, but the target is window, ignore if container is ready
      if (e && container?.current && e.target !== container.current && !container.current.contains(e.target as Node)) {
        return;
      }

      if (!ticking) {
        requestAnimationFrame(() => {
          const isWindow = target === window;
          
          let currentScroll = 0;
          let maxScroll = 1;

          if (isWindow) {
            currentScroll = axis === 'y' ? window.scrollY : window.scrollX;
            maxScroll = axis === 'y' 
              ? document.documentElement.scrollHeight - window.innerHeight
              : document.documentElement.scrollWidth - window.innerWidth;
          } else {
            const el = target as HTMLElement;
            currentScroll = axis === 'y' ? el.scrollTop : el.scrollLeft;
            maxScroll = axis === 'y'
              ? el.scrollHeight - el.clientHeight
              : el.scrollWidth - el.clientWidth;
          }

          setScrollY(currentScroll);
          setScrollYProgress(maxScroll > 0 ? currentScroll / maxScroll : 0);
          
          ticking = false;
        });
        ticking = true;
      }
    };

    // Use capture: true on window to intercept scroll events from any nested container dynamically
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    
    // Initial call
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [container, axis]);

  return { scrollY, scrollYProgress };
}

/**
 * Interpolates a value from an input range to an output range.
 * Example: usePixonTransform(scrollYProgress, [0, 1], [0, 100])
 */
export function usePixonTransform<T extends number | string>(
  value: number,
  inputRange: number[],
  outputRange: T[]
): T {
  if (inputRange.length !== outputRange.length || inputRange.length < 2) {
    console.warn('usePixonTransform: inputRange and outputRange must have the same length and at least 2 items.');
    return outputRange[0] as T;
  }

  // Find the segment
  let i = 1;
  while (i < inputRange.length - 1 && value > inputRange[i]!) {
    i++;
  }

  const inStart = inputRange[i - 1]!;
  const inEnd = inputRange[i]!;
  const outStart = outputRange[i - 1]!;
  const outEnd = outputRange[i]!;

  const progress = Math.max(0, Math.min(1, (value - inStart) / (inEnd - inStart)));

  if (typeof outStart === 'number' && typeof outEnd === 'number') {
    return (outStart + progress * (outEnd - outStart)) as T;
  }

  // Very basic unit interpolation (e.g. "0px" to "100px")
  const numStart = parseFloat(outStart as string) || 0;
  const numEnd = parseFloat(outEnd as string) || 0;
  const unit = (outStart as string).replace(/[0-9.-]/g, '');
  
  const interpolated = numStart + progress * (numEnd - numStart);
  return `${interpolated}${unit}` as T;
}
