import { useState, useEffect, useCallback } from 'react';

/**
 * A hook for managing state in sessionStorage with automatic synchronization.
 */
export function useSessionStorage<T>(key: string, initialValue: T) {
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') return initialValue;

    try {
      const item = window.sessionStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting sessionStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  return [storedValue, setValue] as const;
}
