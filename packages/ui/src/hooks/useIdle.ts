import { useState, useEffect, useRef } from 'react';

/**
 * Hook to detect user inactivity.
 * Useful for dimming UI or triggering ambient animations.
 */
export function useIdle(timeout: number = 3000): boolean {
  const [isIdle, setIsIdle] = useState(false);
  const timeoutId = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleActivity = () => {
      setIsIdle(false);
      if (timeoutId.current) clearTimeout(timeoutId.current);
      
      timeoutId.current = setTimeout(() => {
        setIsIdle(true);
      }, timeout);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    handleActivity(); // Initialize

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (timeoutId.current) clearTimeout(timeoutId.current);
    };
  }, [timeout]);

  return isIdle;
}
