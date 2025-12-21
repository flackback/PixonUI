import { useState, useCallback } from 'react';

export interface UseClipboardOptions {
  /** Time in ms to reset the 'copied' state */
  timeout?: number;
}

/**
 * A hook to interact with the system clipboard.
 * 
 * @example
 * const { copy, copied } = useClipboard();
 * return <button onClick={() => copy('Hello')}> {copied ? 'Copied!' : 'Copy'} </button>;
 */
export function useClipboard({ timeout = 2000 }: UseClipboardOptions = {}) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const copy = useCallback(async (text: string) => {
    if (!navigator?.clipboard) {
      setError(new Error('Clipboard API not supported'));
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), timeout);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to copy'));
    }
  }, [timeout]);

  return { copy, copied, error };
}
