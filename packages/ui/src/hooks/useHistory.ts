import { useState, useCallback, useMemo } from 'react';

export interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

/**
 * A generic hook for managing state with Undo and Redo capabilities.
 * 
 * @example
 * const { state, set, undo, redo, canUndo, canRedo } = useHistory(initialData);
 */
export function useHistory<T>(initialState: T) {
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

      return {
        past: [...prev.past, prev.present],
        present: resolved,
        future: [],
      };
    });
  }, []);

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
