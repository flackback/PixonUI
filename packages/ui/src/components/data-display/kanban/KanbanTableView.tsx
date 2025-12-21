import React from 'react';
import { cn } from '../../../utils/cn';
import { KanbanListView } from './KanbanListView';
import type { KanbanTask, KanbanColumnDef } from './types';

interface KanbanTableViewProps {
  tasks: KanbanTask[];
  columns: KanbanColumnDef[];
  onTaskClick?: (task: KanbanTask) => void;
  className?: string;
}

export function KanbanTableView({ tasks, columns, onTaskClick, className }: KanbanTableViewProps) {
  // Table view is essentially a more detailed list view
  return <KanbanListView tasks={tasks} columns={columns} onTaskClick={onTaskClick} className={className} />;
}
