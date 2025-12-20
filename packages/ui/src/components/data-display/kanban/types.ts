import type { ReactNode } from 'react';

export interface KanbanTask {
  id: string;
  columnId: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  assignee?: {
    name: string;
    avatar?: string;
  };
  dueDate?: string;
  progress?: number;
  comments?: number;
  attachments?: number;
  timeSpent?: number; // in seconds
  blockedBy?: string[];
  [key: string]: any; // Allow for custom properties
}

export interface KanbanColumn {
  id: string;
  title: string;
  color?: string;
  limit?: number;
}

export type DropPosition = 'top' | 'bottom' | 'left' | 'right';

export interface KanbanProps {
  columns: KanbanColumn[];
  tasks: KanbanTask[];
  onTaskMove?: (taskId: string, toColumnId: string, toTaskId?: string, position?: 'top' | 'bottom') => void;
  onColumnMove?: (columnId: string, toColumnId: string, position?: 'left' | 'right') => void;
  onTaskClick?: (task: KanbanTask) => void;
  onTaskAdd?: (columnId: string, title: string) => void;
  onTaskFullAdd?: (columnId: string) => void;
  onTaskRemove?: (taskId: string) => void;
  onColumnAction?: (columnId: string, action: string) => void;
  onTaskDrop?: (taskId: string, fromColumnId: string, toColumnId: string, index: number) => void;
  onTaskDragStart?: (taskId: string) => void;
  onTaskDragEnd?: (taskId: string) => void;
  onTaskSelectionChange?: (selectedIds: string[]) => void;
  onTaskTimerToggle?: (taskId: string) => void;
  renderCard?: (task: KanbanTask) => ReactNode;
  className?: string;
  columnClassName?: string;
  cardClassName?: string;
  groupBy?: keyof KanbanTask;
  accentColor?: string;
  showTaskCount?: boolean;
  showDividers?: boolean;
  columnHeight?: number | string;
  pageSize?: number;
  selectable?: boolean;
  selectedTaskIds?: string[];
  activeTimerTaskId?: string | null;
}

export interface SortConfig {
  field: 'title' | 'priority' | 'dueDate';
  direction: 'asc' | 'desc';
}
