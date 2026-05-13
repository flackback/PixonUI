import React from 'react';
import { cn } from '../../../utils/cn';
import { Plus, MoreVertical, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '../../button/Button';
import { ColumnLimit } from './components/ColumnLimit';
import { KanbanCard } from './KanbanCard';
import type { KanbanColumnDef, KanbanTask, DropPosition } from './types';

// ─── KANBAN CARD SKELETON ───
export function KanbanCardSkeleton() {
  return (
    <div className="w-full bg-white dark:bg-neutral-900 rounded-3xl border border-gray-100 dark:border-white/5 p-4 space-y-3 shadow-sm animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gray-200 dark:bg-white/[0.06]" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-white/[0.06] rounded-md w-3/4" />
          <div className="h-3 bg-gray-100 dark:bg-white/[0.04] rounded-md w-1/2" />
        </div>
      </div>
      
      {/* Description Line */}
      <div className="h-3 bg-gray-100 dark:bg-white/[0.04] rounded-md w-full" />
      
      {/* Progress Bar Placeholder */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between">
          <div className="h-3 bg-gray-100 dark:bg-white/[0.04] rounded w-12" />
          <div className="h-3 bg-gray-100 dark:bg-white/[0.04] rounded w-6" />
        </div>
        <div className="h-1.5 bg-gray-200 dark:bg-white/[0.06] rounded-full w-full" />
      </div>

      {/* Footer Pill/Avatar */}
      <div className="flex justify-between items-center pt-1.5 border-t border-gray-100/50 dark:border-white/5">
        <div className="flex gap-1.5">
          <div className="h-5 w-12 bg-gray-100 dark:bg-white/[0.04] rounded-full" />
          <div className="h-5 w-10 bg-gray-100 dark:bg-white/[0.04] rounded-full" />
        </div>
        <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-white/[0.06]" />
      </div>
    </div>
  );
}

// ─── KANBAN COLUMN SKELETON ───
export function KanbanColumnSkeleton() {
  return (
    <div className="w-80 flex flex-col p-2 rounded-3xl border border-transparent space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-gray-200 dark:bg-white/[0.06]" />
          <div className="h-4 w-24 rounded bg-gray-200 dark:bg-white/[0.06] animate-pulse" />
          <div className="h-4 w-6 rounded bg-gray-100 dark:bg-white/[0.04]" />
        </div>
        <div className="flex gap-1">
          <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-white/[0.04]" />
          <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-white/[0.04]" />
        </div>
      </div>

      {/* Card Skeletons */}
      <div className="flex-1 space-y-3 overflow-hidden px-2">
        <KanbanCardSkeleton />
        <KanbanCardSkeleton />
        <KanbanCardSkeleton />
      </div>
    </div>
  );
}

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
  isDragOver?: boolean;
  draggedTaskId?: string | null;
  selectable?: boolean;
  selectedTaskIds?: string[];
  onTaskSelectionChange?: (selectedIds: string[]) => void;
  activeTimerTaskId?: string | null;
  maxVisibleCards?: number;
  dragOverTaskId?: string | null;
  dropPosition?: DropPosition | null;
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
  className,
  isDragOver,
  draggedTaskId,
  selectable,
  selectedTaskIds,
  onTaskSelectionChange,
  activeTimerTaskId,
  maxVisibleCards,
  dragOverTaskId,
  dropPosition
}: KanbanColumnProps) {
  const isOverLimit = !isCollapsed && column.limit && tasks.length > column.limit;
  const [isHeaderHovered, setIsHeaderHovered] = React.useState(false);

  return (
    <div 
      data-column-id={column.id}
      className={cn(
        "flex flex-col h-full transition-all duration-300 ease-out rounded-3xl border border-transparent p-2",
        isCollapsed ? "w-12" : "w-80",
        isDragOver && !isCollapsed && "bg-cyan-500/[0.04] border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.15)] scale-[1.01] backdrop-blur-xl transform-gpu ring-2 ring-cyan-500/20",
        isOverLimit && "border-rose-500/30 bg-rose-500/[0.01] shadow-[0_0_20px_rgba(244,63,94,0.05)]",
        className
      )}
      onDragOver={(e) => onDragOver?.(e)}
      onDrop={(e) => onDrop?.(e)}
      onDragStart={(e) => onDragStart?.(e, column.id, 'column')}
      draggable={!isCollapsed && isHeaderHovered}
    >
      {/* Header */}
      <div 
        onMouseEnter={() => setIsHeaderHovered(true)}
        onMouseLeave={() => setIsHeaderHovered(false)}
        className={cn(
          "flex items-center justify-between mb-4 px-2 select-none",
          !isCollapsed && "cursor-grab active:cursor-grabbing",
          isCollapsed && "flex-col gap-4"
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <button 
            onClick={() => onCollapse?.(column.id)}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-white/40"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          {!isCollapsed && (
            <>
              <div 
                className="h-2 w-2 rounded-full" 
                style={{ backgroundColor: column.color || '#3b82f6' }} 
              />
              <h3 className="font-bold text-sm text-gray-950 dark:text-white truncate">{column.title}</h3>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/40">
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
              className="h-8 w-8 text-gray-400 hover:text-gray-900 dark:text-white/40 dark:hover:text-white"
              onClick={() => onAddTask?.(column.id)}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-gray-400 hover:text-gray-900 dark:text-white/40 dark:hover:text-white"
              onClick={() => onAction?.('more')}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* WIP Limit */}
      {!isCollapsed && column.limit && (
        <div className="px-2 mb-3">
          <ColumnLimit count={tasks.length} limit={column.limit} />
        </div>
      )}

      {/* Over Limit Bottleneck Alert banner */}
      {!isCollapsed && column.limit && tasks.length > column.limit && (
        <div className="px-2 mb-3 animate-pulse">
          <div className="flex items-center gap-1.5 text-[10px] font-bold py-1.5 px-3 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 shadow-inner">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span>Gargalo Detectado ({tasks.length - column.limit} acima do limite)</span>
          </div>
        </div>
      )}

      {/* Content scrollable container with optional max height control */}
      <div 
        className={cn(
          "flex-1 overflow-y-auto min-h-0 px-2 space-y-3 custom-scrollbar",
          isCollapsed && "hidden"
        )}
        style={{
          maxHeight: maxVisibleCards ? `${maxVisibleCards * 195}px` : undefined
        }}
      >
        {children || tasks.map(task => {
          const isCurrentDragOver = dragOverTaskId === task.id;
          return (
            <KanbanCard 
              key={task.id}
              task={task} 
              onTaskClick={(_, t) => onTaskClick?.(t)}
              onDragStart={(e) => onDragStart?.(e, task.id, 'task')}
              onDragOver={(e) => onDragOver?.(e, task.id)}
              onDrop={(e) => onDrop?.(e, task.id)}
              isDragged={draggedTaskId === task.id}
              selectable={selectable}
              isSelected={selectedTaskIds?.includes(task.id)}
              onTaskSelectionChange={onTaskSelectionChange}
              activeTimerTaskId={activeTimerTaskId}
              isDragOver={isCurrentDragOver}
              dropPosition={isCurrentDragOver && (dropPosition === 'top' || dropPosition === 'bottom') ? dropPosition : null}
            />
          );
        })}
      </div>

      {/* Collapsed Label */}
      {isCollapsed && (
        <div className="flex-1 flex items-center justify-center">
          <span className="rotate-90 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/20">
            {column.title}
          </span>
        </div>
      )}
    </div>
  );
}
