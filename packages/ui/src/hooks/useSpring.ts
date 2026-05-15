import { useState, useEffect, useRef } from 'react';

interface SpringConfig {
  stiffness?: number;
  damping?: number;
  mass?: number;
  precision?: number;
  onUpdate?: (v: number) => void;
}

/**
 * A lightweight spring physics hook for smooth value transitions.
 * Zero dependencies, high performance using requestAnimationFrame.
 * Optional onUpdate callback bypasses React state rerenders for direct DOM styling.
 */
export function useSpring(
  targetValue: number,
  config: SpringConfig = {}
): number {
  const {
    stiffness = 280,
    damping = 18,
    mass = 1,
    precision = 0.001,
    onUpdate
  } = config;

  const [currentValue, setCurrentValue] = useState(targetValue);
  const velocityRef = useRef(0);
  const currentRef = useRef(targetValue);
  const requestRef = useRef<number>();
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    let lastTime = performance.now();
    
    const animate = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.67, 2);
      lastTime = time;

      const distance = targetValue - currentRef.current;
      const m = Math.max(0.1, mass);
      const force = (distance * (stiffness / 100)) - (velocityRef.current * (damping / 10));
      const acceleration = force / m;
      
      // Stability clamp
      const clampedAcc = Math.max(-100, Math.min(100, acceleration));
      
      velocityRef.current += clampedAcc * dt;
      currentRef.current += velocityRef.current * dt;

      if (isNaN(currentRef.current)) {
        currentRef.current = targetValue;
        velocityRef.current = 0;
      }

      const isSettled = Math.abs(targetValue - currentRef.current) < precision && Math.abs(velocityRef.current) < precision;

      if (isSettled) {
        currentRef.current = targetValue;
        velocityRef.current = 0;
        if (onUpdateRef.current) {
          onUpdateRef.current(targetValue);
        } else {
          setCurrentValue(targetValue);
        }
        requestRef.current = undefined;
        return;
      }

      if (onUpdateRef.current) {
        onUpdateRef.current(currentRef.current);
      } else {
        setCurrentValue(currentRef.current);
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [targetValue, stiffness, damping, mass, precision]);

  return onUpdate ? targetValue : currentValue;
}
