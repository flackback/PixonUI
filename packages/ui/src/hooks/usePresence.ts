import { useState, useEffect } from 'react';

/**
 * Hook to manage the presence of a component for unmounting animations.
 * @param isVisible Whether the component should be visible
 * @param exitDuration Duration of the exit animation in ms
 */
export function usePresence(isVisible: boolean, exitDuration: number = 200) {
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, exitDuration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, exitDuration]);

  return shouldRender;
}
