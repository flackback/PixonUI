import { useState, useCallback, useEffect } from 'react';

interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

/**
 * A hook for managing asynchronous operations.
 */
export function useAsync<T>(asyncFunction: () => Promise<T>, immediate = true) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = useCallback(async () => {
    setState({ data: null, error: null, isLoading: true });
    try {
      const response = await asyncFunction();
      setState({ data: response, error: null, isLoading: false });
      return response;
    } catch (error: any) {
      setState({ data: null, error: error as Error, isLoading: false });
      throw error;
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { ...state, execute };
}

/**
 * A hook for fetching data from a URL.
 */
export function useFetch<T>(url: string, options?: RequestInit) {
  const fetcher = useCallback(() => fetch(url, options).then((res) => res.json()), [url, options]);
  return useAsync<T>(fetcher);
}
