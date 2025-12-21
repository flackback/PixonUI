import { useState, useEffect, useRef } from 'react';

interface SpringConfig {
  stiffness?: number;
  damping?: number;
  mass?: number;
  precision?: number;
}

/**
 * A lightweight spring physics hook for smooth value transitions.
 * Zero dependencies, high performance using requestAnimationFrame.
 */
export function useSpring(
  targetValue: number,
  config: SpringConfig = {}
): number {
  const {
    stiffness = 0.15,
    damping = 0.8,
    mass = 1,
    precision = 0.01
  } = config;

  const [currentValue, setCurrentValue] = useState(targetValue);
  const velocityRef = useRef(0);
  const currentRef = useRef(targetValue);
  const requestRef = useRef<number>();

  useEffect(() => {
    const animate = () => {
      const distance = targetValue - currentRef.current;
      const force = distance * stiffness;
      const acceleration = force / mass;
      
      velocityRef.current = (velocityRef.current + acceleration) * damping;
      currentRef.current += velocityRef.current;

      if (Math.abs(distance) < precision && Math.abs(velocityRef.current) < precision) {
        currentRef.current = targetValue;
        setCurrentValue(targetValue);
        requestRef.current = undefined;
        return;
      }

      setCurrentValue(currentRef.current);
      requestRef.current = requestAnimationFrame(animate);
    };

    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [targetValue, stiffness, damping, mass, precision]);

  return currentValue;
}
