import { useRef, useEffect } from 'react';

/**
 * A hook that stores the previous value of a variable.
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
