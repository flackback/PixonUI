import { useState, useCallback, useEffect, useRef } from 'react';
import type { KanbanTask, KanbanColumnDef } from './types';

interface KanbanState {
  tasks: KanbanTask[];
  columns: KanbanColumnDef[];
}

interface HistoryState {
  history: KanbanState[];
  currentIndex: number;
}

export function useKanbanUndo(initialState: KanbanState) {
  const [state, setState] = useState<HistoryState>({
    history: [initialState],
    currentIndex: 0
  });
  
  const lastInitialState = useRef(initialState);

  // Sync with external state changes
  useEffect(() => {
    const tasksChanged = initialState.tasks.length !== lastInitialState.current.tasks.length ||
                        initialState.tasks.some((t, i) => t.id !== lastInitialState.current.tasks[i]?.id || t.columnId !== lastInitialState.current.tasks[i]?.columnId);
    const columnsChanged = initialState.columns.length !== lastInitialState.current.columns.length ||
                          initialState.columns.some((c, i) => c.id !== lastInitialState.current.columns[i]?.id);

    if (tasksChanged || columnsChanged) {
      // Check if the new initialState matches our current state to avoid resetting history on our own changes
      const currentState = state.history[state.currentIndex];
      const isSameAsCurrent = currentState && 
                             initialState.tasks.length === currentState.tasks.length &&
                             initialState.tasks.every((t, i) => t.id === currentState.tasks[i]?.id && t.columnId === currentState.tasks[i]?.columnId);

      if (!isSameAsCurrent) {
        setState({
          history: [initialState],
          currentIndex: 0
        });
      }
      lastInitialState.current = initialState;
    }
  }, [initialState, state.history, state.currentIndex]);

  const pushState = useCallback((newState: KanbanState) => {
    setState(prev => {
      const nextHistory = prev.history.slice(0, prev.currentIndex + 1);
      return {
        history: [...nextHistory, newState],
        currentIndex: prev.currentIndex + 1
      };
    });
  }, []);

  const undo = useCallback(() => {
    setState(prev => {
      if (prev.currentIndex > 0) {
        return { ...prev, currentIndex: prev.currentIndex - 1 };
      }
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    setState(prev => {
      if (prev.currentIndex < prev.history.length - 1) {
        return { ...prev, currentIndex: prev.currentIndex + 1 };
      }
      return prev;
    });
  }, []);

  return {
    state: state.history[state.currentIndex],
    pushState,
    undo,
    redo,
    canUndo: state.currentIndex > 0,
    canRedo: state.currentIndex < state.history.length - 1
  };
}
