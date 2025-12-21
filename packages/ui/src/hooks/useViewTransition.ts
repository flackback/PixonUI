import { flushSync } from 'react-dom';

/**
 * Hook to wrap the native View Transitions API.
 * Allows for seamless transitions between DOM states.
 */
export function useViewTransition() {
  const startTransition = (updateCallback: () => void) => {
    // Fallback for browsers that don't support the View Transitions API
    if (!document.startViewTransition) {
      updateCallback();
      return;
    }

    document.startViewTransition(() => {
      // flushSync is required to ensure React updates the DOM synchronously
      // so the browser can capture the new state for the transition.
      flushSync(() => {
        updateCallback();
      });
    });
  };

  return { startTransition };
}
