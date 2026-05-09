import { useState, useCallback, useMemo } from 'react';

export interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export interface UseHistoryOptions {
  /** Maximum number of history states to retain in the undo buffer. Prevents memory leaks. */
  maxHistoryLimit?: number;
}

/**
 * A generic hook for managing state with Undo and Redo capabilities.
 * 
 * @example
 * const { state, set, undo, redo, canUndo, canRedo } = useHistory(initialData, { maxHistoryLimit: 50 });
 */
export function useHistory<T>(initialState: T, options: UseHistoryOptions = {}) {
  const { maxHistoryLimit } = options;
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const undo = useCallback(() => {
    if (!canUndo) return;

    setHistory((prev) => {
      const previous = prev.past[prev.past.length - 1];
      if (previous === undefined) return prev;
      
      const newPast = prev.past.slice(0, prev.past.length - 1);

      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future],
      };
    });
  }, [canUndo]);

  const redo = useCallback(() => {
    if (!canRedo) return;

    setHistory((prev) => {
      const next = prev.future[0];
      if (next === undefined) return prev;

      const newFuture = prev.future.slice(1);

      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture,
      };
    });
  }, [canRedo]);

  const set = useCallback((newPresent: T | ((prev: T) => T)) => {
    setHistory((prev) => {
      const resolved = typeof newPresent === 'function' 
        ? (newPresent as (p: T) => T)(prev.present) 
        : newPresent;

      if (prev.present === resolved) return prev;

      let newPast = [...prev.past, prev.present];
      if (maxHistoryLimit && newPast.length > maxHistoryLimit) {
        newPast = newPast.slice(newPast.length - maxHistoryLimit);
      }

      return {
        past: newPast,
        present: resolved,
        future: [],
      };
    });
  }, [maxHistoryLimit]);

  const clear = useCallback(() => {
    setHistory({
      past: [],
      present: initialState,
      future: [],
    });
  }, [initialState]);

  return {
    state: history.present,
    set,
    undo,
    redo,
    clear,
    canUndo,
    canRedo,
    history,
  };
}
