import { useState, useEffect } from 'react';

export interface Orientation {
  alpha: number | null; // rotation around z-axis
  beta: number | null;  // rotation around x-axis
  gamma: number | null; // rotation around y-axis
  absolute: boolean;
}

/**
 * Hook to track device orientation.
 * Useful for mobile parallax and tilt effects.
 */
export function useOrientation(): Orientation {
  const [orientation, setOrientation] = useState<Orientation>({
    alpha: null,
    beta: null,
    gamma: null,
    absolute: false,
  });

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      setOrientation({
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma,
        absolute: event.absolute,
      });
    };

    // Check if DeviceOrientationEvent is supported and if permission is needed (iOS)
    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  return orientation;
}
