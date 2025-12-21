import { useMemo } from 'react';

/**
 * A lightweight fuzzy search utility.
 */
function fuzzyMatch(query: string, text: string): boolean {
  const q = query.toLowerCase().replace(/\s/g, '');
  const t = text.toLowerCase();
  let queryIdx = 0;
  for (let textIdx = 0; textIdx < t.length && queryIdx < q.length; textIdx++) {
    if (t[textIdx] === q[queryIdx]) queryIdx++;
  }
  return queryIdx === q.length;
}

/**
 * A hook for filtering data using a lightweight fuzzy search algorithm.
 * 
 * @example
 * const filtered = useSearch(users, query, ['name', 'email']);
 */
export function useSearch<T>(
  data: T[], 
  query: string, 
  keys: (keyof T)[]
): T[] {
  return useMemo(() => {
    if (!query.trim()) return data;

    return data.filter((item) =>
      keys.some((key) => {
        const value = item[key];
        if (value === null || value === undefined) return false;
        return fuzzyMatch(query, String(value));
      })
    );
  }, [data, query, keys]);
}
