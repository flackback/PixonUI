import { useState, useCallback } from 'react';
import type { KanbanUser } from './types';

export interface KanbanHistoryEntry {
  id: string;
  taskId?: string;
  columnId?: string;
  user: KanbanUser;
  action: string;
  details?: string;
  timestamp: Date;
}

export function useKanbanHistory() {
  const [history, setHistory] = useState<KanbanHistoryEntry[]>([]);

  const addEntry = useCallback((entry: Omit<KanbanHistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: KanbanHistoryEntry = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    };
    setHistory(prev => [newEntry, ...prev]);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    history,
    addEntry,
    clearHistory
  };
}
