import { useState, useCallback, useEffect, useRef } from 'react';
import type { KanbanTask, KanbanColumnDef } from './types';

interface KanbanState {
  tasks: KanbanTask[];
  columns: KanbanColumnDef[];
}

export function useKanbanUndo(initialState: KanbanState) {
  const [history, setHistory] = useState<KanbanState[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const lastInitialState = useRef(initialState);

  // Sync with external state changes
  useEffect(() => {
    const tasksChanged = initialState.tasks.length !== lastInitialState.current.tasks.length ||
                        initialState.tasks.some((t, i) => t.id !== lastInitialState.current.tasks[i]?.id || t.columnId !== lastInitialState.current.tasks[i]?.columnId);
    const columnsChanged = initialState.columns.length !== lastInitialState.current.columns.length ||
                          initialState.columns.some((c, i) => c.id !== lastInitialState.current.columns[i]?.id);

    if (tasksChanged || columnsChanged) {
      setHistory([initialState]);
      setCurrentIndex(0);
      lastInitialState.current = initialState;
    }
  }, [initialState]);

  const pushState = useCallback((newState: KanbanState) => {
    setHistory(prev => {
      const nextHistory = prev.slice(0, currentIndex + 1);
      return [...nextHistory, newState];
    });
    setCurrentIndex(prev => prev + 1);
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      return history[currentIndex - 1];
    }
    return null;
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
      return history[currentIndex + 1];
    }
    return null;
  }, [currentIndex, history]);

  return {
    state: history[currentIndex],
    pushState,
    undo,
    redo,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1
  };
}
