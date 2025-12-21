import React from 'react';
import { cn } from '../../../utils/cn';
import { Plus, MoreVertical, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '../../button/Button';
import { ColumnLimit } from './components/ColumnLimit';
import { KanbanCard } from './KanbanCard';
import type { KanbanColumnDef, KanbanTask } from './types';

interface KanbanColumnProps {
  column: KanbanColumnDef;
  tasks: KanbanTask[];
  onAddTask?: (columnId: string) => void;
  onCollapse?: (columnId: string) => void;
  onTaskClick?: (task: KanbanTask) => void;
  onAction?: (action: string) => void;
  onDragStart?: (e: React.DragEvent, id: string, type: 'task' | 'column') => void;
  onDragOver?: (e: React.DragEvent, taskId?: string) => void;
  onDrop?: (e: React.DragEvent, taskId?: string) => void;
  isCollapsed?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function KanbanColumn({ 
  column, 
  tasks, 
  onAddTask, 
  onCollapse, 
  onTaskClick,
  onAction,
  onDragStart,
  onDragOver, 
  onDrop, 
  isCollapsed, 
  children,
  className 
}: KanbanColumnProps) {
  return (
    <div 
      className={cn(
        "flex flex-col h-full transition-all duration-300",
        isCollapsed ? "w-12" : "w-80",
        className
      )}
      onDragOver={(e) => onDragOver?.(e)}
      onDrop={(e) => onDrop?.(e)}
      onDragStart={(e) => onDragStart?.(e, column.id, 'column')}
      draggable={!isCollapsed}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between mb-4 px-2",
        isCollapsed && "flex-col gap-4"
      )}>
        <div className="flex items-center gap-2 min-w-0">
          <button 
            onClick={() => onCollapse?.(column.id)}
            className="p-1 rounded hover:bg-white/5 text-white/40"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          {!isCollapsed && (
            <>
              <div 
                className="h-2 w-2 rounded-full" 
                style={{ backgroundColor: column.color || '#3b82f6' }} 
              />
              <h3 className="font-bold text-sm text-white truncate">{column.title}</h3>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/5 text-white/40">
                {tasks.length}
              </span>
            </>
          )}
        </div>

        {!isCollapsed && (
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-white/40 hover:text-white"
              onClick={() => onAddTask?.(column.id)}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-white/40 hover:text-white"
              onClick={() => onAction?.('more')}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* WIP Limit */}
      {!isCollapsed && column.limit && (
        <div className="px-2 mb-4">
          <ColumnLimit count={tasks.length} limit={column.limit} />
        </div>
      )}

      {/* Content */}
      <div className={cn(
        "flex-1 overflow-y-auto min-h-0 px-2 space-y-3 custom-scrollbar",
        isCollapsed && "hidden"
      )}>
        {children || tasks.map(task => (
          <KanbanCard 
            key={task.id} 
            task={task} 
            onTaskClick={(_, t) => onTaskClick?.(t)}
            onDragStart={(e) => onDragStart?.(e, task.id, 'task')}
            onDragOver={(e) => onDragOver?.(e, task.id)}
            onDrop={(e) => onDrop?.(e, task.id)}
          />
        ))}
      </div>

      {/* Collapsed Label */}
      {isCollapsed && (
        <div className="flex-1 flex items-center justify-center">
          <span className="rotate-90 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest text-white/20">
            {column.title}
          </span>
        </div>
      )}
    </div>
  );
}
