import { useState, useEffect, useRef } from 'react';

export interface MousePosition {
  x: number;
  y: number;
  elementX: number;
  elementY: number;
  percentageX: number;
  percentageY: number;
}

/**
 * Hook to track mouse position relative to the window or a specific element.
 * Uses requestAnimationFrame for 120fps performance.
 */
export function useMousePosition(ref?: React.RefObject<HTMLElement>): MousePosition {
  const [position, setPosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    elementX: 0,
    elementY: 0,
    percentageX: 0,
    percentageY: 0,
  });

  const requestRef = useRef<number>();
  const latestMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      latestMousePos.current = { x: event.clientX, y: event.clientY };
      
      if (!requestRef.current) {
        requestRef.current = requestAnimationFrame(updatePosition);
      }
    };

    const updatePosition = () => {
      const { x, y } = latestMousePos.current;
      let elementX = 0;
      let elementY = 0;
      let percentageX = 0;
      let percentageY = 0;

      if (ref?.current) {
        const rect = ref.current.getBoundingClientRect();
        elementX = x - rect.left;
        elementY = y - rect.top;
        percentageX = Math.max(0, Math.min(100, (elementX / rect.width) * 100));
        percentageY = Math.max(0, Math.min(100, (elementY / rect.height) * 100));
      }

      setPosition({
        x,
        y,
        elementX,
        elementY,
        percentageX,
        percentageY,
      });

      requestRef.current = undefined;
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [ref]);

  return position;
}
