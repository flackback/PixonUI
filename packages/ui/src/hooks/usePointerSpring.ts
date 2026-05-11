import { useEffect, useRef, useState } from 'react';

export interface UsePointerSpringOptions {
  stiffness?: number; // Spring stiffness factor (0.01 - 1.0)
  damping?: number;   // Spring damping factor (0.01 - 1.0)
  mass?: number;      // Virtual mass of the follower
}

export function usePointerSpring(
  targetRef: React.RefObject<HTMLElement | null>,
  options: UsePointerSpringOptions = {}
) {
  const { stiffness = 0.08, damping = 0.15, mass = 1 } = options;
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const mouseRef = useRef({ x: 0, y: 0 });
  const springRef = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (targetRef.current) {
        const rect = targetRef.current.getBoundingClientRect();
        mouseRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
      } else {
        mouseRef.current = {
          x: e.clientX,
          y: e.clientY
        };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      if (targetRef.current) {
        const rect = targetRef.current.getBoundingClientRect();
        mouseRef.current = {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top
        };
      } else {
        mouseRef.current = {
          x: touch.clientX,
          y: touch.clientY
        };
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    const animate = () => {
      const spring = springRef.current;
      const target = mouseRef.current;

      // Elastic spring physics formula: ax = k * (target - x) - c * vx
      const ax = (target.x - spring.x) * stiffness - spring.vx * damping;
      const ay = (target.y - spring.y) * stiffness - spring.vy * damping;

      spring.vx += ax / mass;
      spring.vy += ay / mass;
      spring.x += spring.vx;
      spring.y += spring.vy;

      // Only trigger state updates if we are actively moving to optimize performance
      const deltaX = Math.abs(target.x - spring.x);
      const deltaY = Math.abs(target.y - spring.y);
      const velocity = Math.sqrt(spring.vx * spring.vx + spring.vy * spring.vy);

      if (deltaX > 0.01 || deltaY > 0.01 || velocity > 0.01) {
        setPosition({ x: spring.x, y: spring.y });
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [targetRef, stiffness, damping, mass]);

  return position;
}
export type UsePointerSpringReturn = ReturnType<typeof usePointerSpring>;
