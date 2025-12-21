import { useState, useEffect, useRef } from 'react';

/**
 * Hook to track scroll velocity.
 * Useful for intensity-based animations (e.g., faster scroll = more blur).
 */
export function useScrollVelocity(): number {
  const [velocity, setVelocity] = useState(0);
  const lastScrollY = useRef(0);
  const lastTime = useRef(Date.now());
  const requestRef = useRef<number>();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const currentTime = Date.now();
      const deltaTime = currentTime - lastTime.current;

      if (deltaTime > 0) {
        const distance = currentScrollY - lastScrollY.current;
        const currentVelocity = distance / deltaTime;
        setVelocity(currentVelocity);
      }

      lastScrollY.current = currentScrollY;
      lastTime.current = currentTime;

      // Decay velocity if no scroll event occurs
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      requestRef.current = requestAnimationFrame(decayVelocity);
    };

    const decayVelocity = () => {
      setVelocity(prev => {
        if (Math.abs(prev) < 0.01) return 0;
        return prev * 0.9; // Decay factor
      });
      requestRef.current = requestAnimationFrame(decayVelocity);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return velocity;
}
