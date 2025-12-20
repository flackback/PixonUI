import { useMemo, useState, useCallback } from 'react';
import type { KanbanTask, KanbanColumn, SortConfig } from './types';

interface UseKanbanTasksProps {
  tasks: KanbanTask[];
  columns: KanbanColumn[];
  groupBy?: keyof KanbanTask;
  pageSize: number;
}

export function useKanbanTasks({ tasks, columns, groupBy, pageSize }: UseKanbanTasksProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({});

  const sortedTasks = useMemo(() => {
    if (!sortConfig) return tasks;

    return [...tasks].sort((a, b) => {
      const { field, direction } = sortConfig;
      let comparison = 0;

      if (field === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (field === 'priority') {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1, neutral: 0 };
        const aPrio = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        const bPrio = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
        comparison = aPrio - bPrio;
      } else if (field === 'dueDate') {
        comparison = (a.dueDate || '').localeCompare(b.dueDate || '');
      }

      return direction === 'asc' ? comparison : -comparison;
    });
  }, [tasks, sortConfig]);

  const tasksByGroupAndColumn = useMemo(() => {
    const groups: Record<string, Record<string, KanbanTask[]>> = {};

    if (groupBy) {
      sortedTasks.forEach(task => {
        const groupValue = String(task[groupBy] || 'Other');
        if (!groups[groupValue]) groups[groupValue] = {};
        const group = groups[groupValue]!;
        if (!group[task.columnId]) group[task.columnId] = [];
        group[task.columnId]!.push(task);
      });
    } else {
      groups['default'] = {};
      const defaultGroup = groups['default']!;
      columns.forEach(col => {
        defaultGroup[col.id] = sortedTasks.filter(t => t.columnId === col.id);
      });
    }

    return groups;
  }, [sortedTasks, columns, groupBy]);

  const handleLoadMore = useCallback((columnId: string) => {
    setVisibleCounts(prev => ({
      ...prev,
      [columnId]: (prev[columnId] || pageSize) + pageSize
    }));
  }, [pageSize]);

  return {
    tasksByGroupAndColumn,
    sortConfig,
    setSortConfig,
    visibleCounts,
    handleLoadMore,
    sortedTasks
  };
}
