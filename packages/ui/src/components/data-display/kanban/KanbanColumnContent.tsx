import React from 'react';
import { Plus, LayoutGrid } from 'lucide-react';
import { Button } from '../../button/Button';
import { Text } from '../../typography/Text';
import { cn } from '../../../utils/cn';
import { KanbanTask, KanbanColumn, DropPosition } from './types';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnContentProps {
  column: KanbanColumn;
  columnMap: Record<string, KanbanTask[]>;
  groupName: string;
  visibleCount: number;
  pageSize: number;
  columnHeight?: number | string;
  draggedTaskId: string | null;
  draggedColumnId: string | null;
  dragOverTaskId: string | null;
  dragOverColumnId: string | null;
  dropPosition: DropPosition | null;
  quickAddColumnId: string | null;
  quickAddValue: string;
  selectedTaskIds: string[];
  activeTimerTaskId?: string | null;
  handleDragStart: (e: React.DragEvent, id: string, type: 'task' | 'column') => void;
  handleDragEnd: () => void;
  handleDragOver: (e: React.DragEvent, columnId: string, taskId?: string) => void;
  handleDrop: (e: React.DragEvent, toColumnId: string, toTaskId?: string) => void;
  handleTouchStart: (e: React.TouchEvent, id: string, type: 'task' | 'column') => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: (e: React.TouchEvent) => void;
  handleKeyDown: (e: React.KeyboardEvent, taskId: string, columnId: string) => void;
  handleLoadMore: (columnId: string) => void;
  handleSetQuickAdd: (columnId: string, groupName?: string) => void;
  handleQuickAdd: (columnId: string, groupName?: string) => void;
  setQuickAddValue: (value: string) => void;
  setQuickAddColumnId: (id: string | null) => void;
  onTaskClick: (e: React.MouseEvent, task: KanbanTask) => void;
  onTaskFullAdd?: (columnId: string) => void;
  onTaskRemove?: (taskId: string) => void;
  onTaskTimerToggle?: (taskId: string) => void;
  onTaskSelectionChange?: (selectedIds: string[]) => void;
  renderCard?: (task: KanbanTask) => React.ReactNode;
  selectable?: boolean;
  cardClassName?: string;
}

export const KanbanColumnContent = ({
  column,
  columnMap,
  groupName,
  visibleCount,
  pageSize,
  draggedTaskId,
  draggedColumnId,
  dragOverTaskId,
  dragOverColumnId,
  dropPosition,
  quickAddColumnId,
  quickAddValue,
  selectedTaskIds,
  activeTimerTaskId,
  handleDragStart,
  handleDragEnd,
  handleDragOver,
  handleDrop,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  handleKeyDown,
  handleLoadMore,
  handleSetQuickAdd,
  handleQuickAdd,
  setQuickAddValue,
  setQuickAddColumnId,
  onTaskClick,
  onTaskFullAdd,
  onTaskRemove,
  onTaskTimerToggle,
  onTaskSelectionChange,
  renderCard,
  selectable,
  cardClassName
}: KanbanColumnContentProps) => {
  const columnTasks = columnMap[column.id] || [];
  const visibleTasks = columnTasks.slice(0, visibleCount);
  const hasMore = columnTasks.length > visibleCount;

  return (
    <div className="flex flex-col gap-4 h-full min-h-0">
      {/* Quick Add Input */}
      {quickAddColumnId === `${groupName}-${column.id}` ? (
        <div className="p-4 bg-white/[0.03] border border-cyan-500/30 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <input
            autoFocus
            className="w-full bg-transparent border-none outline-none text-sm text-white placeholder:text-white/20"
            placeholder="Task title..."
            value={quickAddValue}
            onChange={(e) => setQuickAddValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleQuickAdd(column.id, groupName);
              if (e.key === 'Escape') setQuickAddColumnId(null);
            }}
            onBlur={() => {
              if (!quickAddValue.trim()) setQuickAddColumnId(null);
            }}
          />
          <div className="flex items-center justify-between mt-3">
            <Text className="text-[10px] text-white/30 uppercase font-bold">Press Enter to save</Text>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-[10px] hover:bg-white/[0.06]"
                onClick={() => setQuickAddColumnId(null)}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                className="h-7 px-3 text-[10px] bg-cyan-500 hover:bg-cyan-400 text-black font-bold"
                onClick={() => handleQuickAdd(column.id, groupName)}
              >
                Add Task
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => handleSetQuickAdd(column.id, groupName)}
          className="group/add flex items-center justify-center gap-2 p-4 border border-dashed border-white/10 hover:border-cyan-500/30 hover:bg-cyan-500/[0.02] rounded-2xl transition-all duration-200"
        >
          <Plus className="h-4 w-4 text-white/20 group-hover/add:text-cyan-400 transition-colors" />
          <Text className="text-xs font-bold text-white/20 group-hover/add:text-cyan-400 uppercase tracking-widest transition-colors">
            Add New Task
          </Text>
        </button>
      )}

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4 min-h-0 pb-20">
        {visibleTasks.map((task) => (
          <React.Fragment key={task.id}>
            {/* Task Ghost Placeholder TOP */}
            {draggedTaskId && dragOverTaskId === task.id && dropPosition === 'top' && draggedTaskId !== task.id && (
              <div className="h-1 bg-cyan-500/50 rounded-full animate-pulse" />
            )}

            <div
              draggable
              onDragStart={(e) => handleDragStart(e, task.id, 'task')}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, column.id, task.id)}
              onDrop={(e) => handleDrop(e, column.id, task.id)}
              onTouchStart={(e) => handleTouchStart(e, task.id, 'task')}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onKeyDown={(e) => handleKeyDown(e, task.id, column.id)}
              tabIndex={0}
              data-task-id={task.id}
              className={cn(
                "outline-none transition-all duration-200",
                draggedTaskId === task.id ? "opacity-20 scale-95" : "opacity-100 scale-100",
                dragOverTaskId === task.id && draggedTaskId ? "ring-2 ring-cyan-500/30 rounded-2xl" : ""
              )}
            >
              <KanbanCard 
                task={task}
                columnId={column.id}
                selectedTaskIds={selectedTaskIds}
                activeTimerTaskId={activeTimerTaskId}
                selectable={selectable}
                cardClassName={cardClassName}
                onTaskClick={onTaskClick}
                onTaskSelectionChange={onTaskSelectionChange}
                onTaskRemove={onTaskRemove}
                onTaskTimerToggle={onTaskTimerToggle}
                renderCard={renderCard}
              />
            </div>

            {/* Task Ghost Placeholder BOTTOM */}
            {draggedTaskId && dragOverTaskId === task.id && dropPosition === 'bottom' && draggedTaskId !== task.id && (
              <div className="h-1 bg-cyan-500/50 rounded-full animate-pulse" />
            )}
          </React.Fragment>
        ))}

        {/* Load More Trigger */}
        {hasMore && (
          <button
            onClick={() => handleLoadMore(column.id)}
            className="flex items-center justify-center gap-2 p-4 text-white/30 hover:text-cyan-400 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest">
              Load {columnTasks.length - visibleCount} more tasks
            </span>
          </button>
        )}

        {/* Empty State */}
        {columnTasks.length === 0 && !draggedTaskId && (
          <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-white/5 rounded-[2rem] opacity-20">
            <LayoutGrid className="h-8 w-8 mb-3" />
            <Text className="text-xs font-medium">No tasks yet</Text>
          </div>
        )}

        {/* Drop Zone for empty column */}
        {columnTasks.length === 0 && draggedTaskId && (
          <div 
            className="flex-1 min-h-[200px] border-2 border-dashed border-cyan-500/20 rounded-[2rem] bg-cyan-500/[0.02] flex items-center justify-center"
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <Text className="text-xs font-bold text-cyan-500/40 uppercase tracking-widest">Drop here</Text>
          </div>
        )}
      </div>
    </div>
  );
};
