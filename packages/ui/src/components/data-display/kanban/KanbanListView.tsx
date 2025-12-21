import React from 'react';
import { cn } from '../../../utils/cn';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../Table';
import { Badge } from '../../../primitives/Badge';
import { Avatar } from '../Avatar';
import type { KanbanTask, KanbanColumnDef } from './types';

interface KanbanListViewProps {
  tasks: KanbanTask[];
  columns: KanbanColumnDef[];
  onTaskClick?: (task: KanbanTask) => void;
  className?: string;
}

export function KanbanListView({ tasks, columns, onTaskClick, className }: KanbanListViewProps) {
  const getColumn = (id: string) => columns.find(c => c.id === id);

  return (
    <div className={cn("bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden", className)}>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-white/5">
            <TableHead className="text-white/40 uppercase text-[10px] font-bold">Task</TableHead>
            <TableHead className="text-white/40 uppercase text-[10px] font-bold">Status</TableHead>
            <TableHead className="text-white/40 uppercase text-[10px] font-bold">Priority</TableHead>
            <TableHead className="text-white/40 uppercase text-[10px] font-bold">Assignee</TableHead>
            <TableHead className="text-white/40 uppercase text-[10px] font-bold">Due Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => {
            const column = getColumn(task.columnId);
            return (
              <TableRow 
                key={task.id} 
                className="border-white/5 hover:bg-white/[0.03] cursor-pointer transition-colors"
                onClick={() => onTaskClick?.(task)}
              >
                <TableCell className="font-medium text-white">{task.title}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: column?.color || '#3b82f6' }} />
                    <span className="text-xs text-white/60">{column?.title}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={task.priority === 'urgent' ? 'danger' : task.priority === 'high' ? 'warning' : 'info'}
                    className="text-[10px] uppercase"
                  >
                    {task.priority || 'medium'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {task.assignee && (
                    <div className="flex items-center gap-2">
                      <Avatar src={task.assignee.avatar} alt={task.assignee.name} size="sm" />
                      <span className="text-xs text-white/60">{task.assignee.name}</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-xs text-white/40">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
