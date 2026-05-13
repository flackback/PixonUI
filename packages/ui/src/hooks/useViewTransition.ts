import { startPixonTransition } from '../utils/motion/viewTransition';

/**
 * Hook to wrap the native View Transitions API with a reliable WAAPI fallback.
 * Allows for seamless transitions between DOM states.
 */
export function useViewTransition() {
  const startTransition = (updateCallback: () => void) => {
    startPixonTransition(updateCallback);
  };

  return { startTransition };
}
