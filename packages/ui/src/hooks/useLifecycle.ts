import { useEffect, useRef } from 'react';

/**
 * A hook that runs an effect only once when the component mounts.
 */
export function useOnMount(effect: () => void) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      effect();
    }
  }, []);
}

/**
 * A hook that runs an effect only once when the component unmounts.
 */
export function useOnUnmount(effect: () => void) {
  useEffect(() => {
    return () => {
      effect();
    };
  }, []);
}
