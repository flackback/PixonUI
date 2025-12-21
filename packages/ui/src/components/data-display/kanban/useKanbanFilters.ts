import { useState, useMemo, useCallback } from 'react';
import type { KanbanTask } from './types';

export function useKanbanFilters(tasks: KanbanTask[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, any[]>>({});

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          task.title.toLowerCase().includes(query) || 
          task.description?.toLowerCase().includes(query) ||
          task.tags?.some(tag => tag.toLowerCase().includes(query));
        
        if (!matchesSearch) return false;
      }

      // Category filters
      for (const [key, values] of Object.entries(activeFilters)) {
        if (!values || values.length === 0) continue;
        
        if (key === 'priority') {
          if (!values.includes(task.priority)) return false;
        }
        
        if (key === 'assignee') {
          if (!task.assignee || !values.includes(task.assignee.id)) return false;
        }

        if (key === 'tags') {
          if (!task.tags?.some(tag => values.includes(tag))) return false;
        }
      }

      return true;
    });
  }, [tasks, searchQuery, activeFilters]);

  const toggleFilter = useCallback((category: string, value: any) => {
    setActiveFilters(prev => {
      const current = prev[category] || [];
      const next = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      
      const newState = { ...prev, [category]: next };
      if (next.length === 0) delete newState[category];
      return newState;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setActiveFilters({});
    setSearchQuery('');
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    activeFilters,
    setActiveFilters,
    filteredTasks,
    toggleFilter,
    clearFilters
  };
}
