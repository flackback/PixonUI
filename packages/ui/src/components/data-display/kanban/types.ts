import type { ReactNode } from 'react';

export interface KanbanUser {
  id: string;
  name: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface KanbanLabel {
  id: string;
  name: string;
  color: string;
}

export interface KanbanTask {
  id: string;
  columnId: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  assignee?: KanbanUser;
  dueDate?: string;
  progress?: number;
  comments?: number;
  attachments?: number;
  timeSpent?: number; // in seconds
  blockedBy?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: KanbanUser;
  subtasks?: Subtask[];
  checklist?: ChecklistItem[];
  estimatedTime?: number;
  customFields?: Record<string, any>;
  labels?: KanbanLabel[];
  watchers?: KanbanUser[];
  order?: number;
  archived?: boolean;
  parentId?: string;
  [key: string]: any;
}

export interface KanbanColumnDef {
  id: string;
  title: string;
  color?: string;
  limit?: number;
  description?: string;
  isCollapsed?: boolean;
  order?: number;
  icon?: ReactNode;
  autoMove?: {
    when: 'overdue' | 'completed';
    toColumnId: string;
  };
}

export type DropPosition = 'top' | 'bottom' | 'left' | 'right';

export interface KanbanProps {
  columns: KanbanColumnDef[];
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
  onColumnAdd?: () => void;
  onColumnEdit?: (columnId: string) => void;
  onColumnDelete?: (columnId: string) => void;
  onColumnCollapse?: (columnId: string) => void;
  collapsedColumns?: string[];
  onBulkAction?: (taskIds: string[], action: string) => void;
  sortBy?: 'priority' | 'dueDate' | 'title' | 'created' | 'order';
  sortOrder?: 'asc' | 'desc';
  view?: 'board' | 'list' | 'calendar' | 'timeline';
  onViewChange?: (view: string) => void;
  swimlanes?: boolean;
  swimlaneBy?: keyof KanbanTask;
  showColumnActions?: boolean;
  showQuickAdd?: boolean;
  enableKeyboardNavigation?: boolean;
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
  field: 'title' | 'priority' | 'dueDate' | 'created' | 'order';
  direction: 'asc' | 'desc';
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface SavedFilter {
  id: string;
  name: string;
  query: any;
}
