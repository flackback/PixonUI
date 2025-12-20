import React, { useState, useCallback } from 'react';
import { 
  Plus, 
  MoreHorizontal, 
  Settings, 
  SortAsc, 
  ArrowUpDown, 
  CalendarDays, 
  Archive, 
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from '../button/Button';
import { Badge } from '../../primitives/Badge';
import { Heading } from '../typography/Heading';
import { Text } from '../typography/Text';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '../overlay/DropdownMenu';

import { KanbanProps, KanbanTask, KanbanColumn } from './kanban/types';
export type { KanbanProps, KanbanTask, KanbanColumn };
import { useKanbanTasks } from './kanban/useKanbanTasks';
import { useKanbanDragAndDrop } from './kanban/useKanbanDragAndDrop';
import { useKanbanBoardScroll } from './kanban/useKanbanBoardScroll';
import { KanbanColumnContent } from './kanban/KanbanColumnContent';

export function Kanban({
  columns,
  tasks,
  onTaskMove,
  onColumnMove,
  onTaskClick,
  onTaskAdd,
  onTaskFullAdd,
  onTaskRemove,
  onColumnAction,
  onTaskDrop,
  onTaskDragStart,
  onTaskDragEnd,
  onTaskSelectionChange,
  onTaskTimerToggle,
  renderCard,
  className,
  columnClassName,
  cardClassName,
  groupBy,
  accentColor = 'cyan',
  showTaskCount = true,
  showDividers = true,
  columnHeight = 'calc(100vh - 200px)',
  pageSize = 10,
  selectable = false,
  selectedTaskIds = [],
  activeTimerTaskId = null,
}: KanbanProps) {
  const [quickAddColumnId, setQuickAddColumnId] = useState<string | null>(null);
  const [quickAddValue, setQuickAddValue] = useState('');

  const {
    tasksByGroupAndColumn,
    sortConfig,
    setSortConfig,
    visibleCounts,
    handleLoadMore
  } = useKanbanTasks({ tasks, columns, groupBy, pageSize });

  const {
    draggedTaskId,
    draggedColumnId,
    dragOverColumnId,
    dragOverTaskId,
    dropPosition,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    setDraggedTaskId
  } = useKanbanDragAndDrop({
    tasks,
    columns,
    selectedTaskIds,
    onTaskMove,
    onColumnMove,
    onTaskDrop,
    onTaskDragStart,
    onTaskDragEnd
  });

  const {
    boardRef,
    isDraggingBoard,
    handleBoardMouseDown,
    handleBoardMouseMove,
    handleBoardMouseUp
  } = useKanbanBoardScroll();

  const handleSetQuickAdd = (columnId: string, groupName: string = 'default') => {
    setQuickAddColumnId(`${groupName}-${columnId}`);
  };

  const handleQuickAdd = (columnId: string, groupName: string = 'default') => {
    if (quickAddValue.trim() && onTaskAdd) {
      onTaskAdd(columnId, quickAddValue.trim());
      setQuickAddValue('');
      setQuickAddColumnId(null);
    }
  };

  const handleTaskClickInternal = useCallback((e: React.MouseEvent, task: KanbanTask) => {
    if (selectable && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      e.stopPropagation();
      const isSelected = selectedTaskIds.includes(task.id);
      const newSelection = isSelected
        ? selectedTaskIds.filter(id => id !== task.id)
        : [...selectedTaskIds, task.id];
      onTaskSelectionChange?.(newSelection);
    } else {
      onTaskClick?.(task);
    }
  }, [selectable, selectedTaskIds, onTaskSelectionChange, onTaskClick]);

  const handleKeyDown = (e: React.KeyboardEvent, taskId: string, columnId: string) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (draggedTaskId === taskId) {
        if (onTaskMove) {
          onTaskMove(draggedTaskId, columnId);
        }
        handleDragEnd();
      } else {
        setDraggedTaskId(taskId);
      }
    }

    if (draggedTaskId === taskId) {
      const colIndex = columns.findIndex(c => c.id === columnId);
      
      let taskIndex = -1;
      let currentGroupName = 'default';
      
      for (const [groupName, columnMap] of Object.entries(tasksByGroupAndColumn)) {
        const groupTasks = columnMap[columnId] || [];
        const idx = groupTasks.findIndex(t => t.id === taskId);
        if (idx !== -1) {
          taskIndex = idx;
          currentGroupName = groupName;
          break;
        }
      }

      const columnTasks = tasksByGroupAndColumn[currentGroupName]?.[columnId] || [];

      if (e.key === 'ArrowRight' && colIndex < columns.length - 1) {
        onTaskMove?.(taskId, columns[colIndex + 1]!.id);
      } else if (e.key === 'ArrowLeft' && colIndex > 0) {
        onTaskMove?.(taskId, columns[colIndex - 1]!.id);
      } else if (e.key === 'ArrowDown' && taskIndex < columnTasks.length - 1) {
        const nextTask = columnTasks[taskIndex + 1];
        if (nextTask) onTaskMove?.(taskId, columnId, nextTask.id, 'bottom');
      } else if (e.key === 'ArrowUp' && taskIndex > 0) {
        const prevTask = columnTasks[taskIndex - 1];
        if (prevTask) onTaskMove?.(taskId, columnId, prevTask.id, 'top');
      }
    }
  };

  return (
    <div 
      ref={boardRef}
      onMouseDown={handleBoardMouseDown}
      onMouseMove={handleBoardMouseMove}
      onMouseUp={handleBoardMouseUp}
      onMouseLeave={handleBoardMouseUp}
      className={cn(
        "flex flex-col overflow-x-auto overflow-y-hidden pb-4 select-none board-scroll-container snap-x snap-mandatory scroll-smooth",
        isDraggingBoard ? "cursor-grabbing" : "cursor-grab",
        className
      )}
      style={{ height: typeof columnHeight === 'number' ? `${columnHeight}px` : columnHeight }}
    >
      {/* Column Headers (Sticky) */}
      <div className="flex sticky top-0 z-20 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10 w-fit">
        {columns.map((column, idx) => {
          const columnTasks = tasks.filter(t => t.columnId === column.id);
          const isOverLimit = column.limit && columnTasks.length > column.limit;

          return (
            <div 
              key={column.id}
              className={cn(
                "flex-shrink-0 w-[480px] flex items-center justify-between px-8 py-6 group/header snap-start",
                showDividers && idx > 0 && "border-l border-white/10"
              )}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div 
                draggable
                onDragStart={(e) => handleDragStart(e, column.id, 'column')}
                onDragEnd={handleDragEnd}
                onTouchStart={(e) => handleTouchStart(e, column.id, 'column')}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="flex items-center gap-3 cursor-grab active:cursor-grabbing flex-1 min-w-0"
              >
                <div 
                  className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]" 
                  style={{ backgroundColor: column.color || `var(--${accentColor}-500)` }} 
                />
                <Heading as="h4" className="text-sm font-bold uppercase tracking-[0.1em] text-white/90 truncate">
                  {column.title}
                </Heading>
                {showTaskCount && (
                  <Badge 
                    variant={isOverLimit ? "danger" : "neutral"} 
                    className={cn(
                      "ml-1 text-[10px] px-2 py-0.5 rounded-full font-bold",
                      !isOverLimit && "bg-white/[0.06] border-white/5 text-white/60"
                    )}
                  >
                    {columnTasks.length}{column.limit ? ` / ${column.limit}` : ''}
                  </Badge>
                )}
                {isOverLimit && (
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                )}
              </div>
              <div className="flex items-center gap-1.5 opacity-0 group-hover/header:opacity-100 transition-all duration-200">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-white/[0.06] rounded-full text-white/40 hover:text-white"
                  onClick={() => handleSetQuickAdd(column.id)}
                >
                  <Plus className="h-4.5 w-4.5" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger className="h-8 w-8 p-0 hover:bg-white/[0.06] rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors">
                    <MoreHorizontal className="h-4.5 w-4.5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 p-1.5 shadow-2xl z-50 rounded-2xl">
                    <div className="px-2 py-1.5 mb-1">
                      <Text className="text-[10px] font-bold uppercase tracking-widest text-white/30">Column Actions</Text>
                    </div>
                    
                    <DropdownMenuItem 
                      onClick={() => onColumnAction?.(column.id, 'settings')}
                      className="gap-2.5 text-xs text-white/70 hover:text-white hover:bg-white/[0.03] rounded-xl py-2"
                    >
                      <Settings className="h-4 w-4" /> Column Settings
                    </DropdownMenuItem>

                    <div className="h-px bg-white/[0.03] my-1.5" />
                    
                    <div className="px-2 py-1.5 mb-1">
                      <Text className="text-[10px] font-bold uppercase tracking-widest text-white/30">Sort Tasks</Text>
                    </div>

                    <DropdownMenuItem 
                      onClick={() => setSortConfig({ field: 'title', direction: sortConfig?.field === 'title' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                      className={cn(
                        "gap-2.5 text-xs hover:bg-white/[0.03] rounded-xl py-2",
                        sortConfig?.field === 'title' ? "text-cyan-400 bg-cyan-500/5" : "text-white/70 hover:text-white"
                      )}
                    >
                      <SortAsc className="h-4 w-4" /> Sort by Title
                      {sortConfig?.field === 'title' && (
                        <span className="ml-auto text-[10px] uppercase font-bold opacity-50">{sortConfig.direction}</span>
                      )}
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      onClick={() => setSortConfig({ field: 'priority', direction: sortConfig?.field === 'priority' && sortConfig.direction === 'desc' ? 'asc' : 'desc' })}
                      className={cn(
                        "gap-2.5 text-xs hover:bg-white/[0.03] rounded-xl py-2",
                        sortConfig?.field === 'priority' ? "text-cyan-400 bg-cyan-500/5" : "text-white/70 hover:text-white"
                      )}
                    >
                      <ArrowUpDown className="h-4 w-4" /> Sort by Priority
                      {sortConfig?.field === 'priority' && (
                        <span className="ml-auto text-[10px] uppercase font-bold opacity-50">{sortConfig.direction}</span>
                      )}
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      onClick={() => setSortConfig({ field: 'dueDate', direction: sortConfig?.field === 'dueDate' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                      className={cn(
                        "gap-2.5 text-xs hover:bg-white/[0.03] rounded-xl py-2",
                        sortConfig?.field === 'dueDate' ? "text-cyan-400 bg-cyan-500/5" : "text-white/70 hover:text-white"
                      )}
                    >
                      <CalendarDays className="h-4 w-4" /> Sort by Date
                      {sortConfig?.field === 'dueDate' && (
                        <span className="ml-auto text-[10px] uppercase font-bold opacity-50">{sortConfig.direction}</span>
                      )}
                    </DropdownMenuItem>

                    <div className="h-px bg-white/[0.03] my-1.5" />

                    <DropdownMenuItem className="gap-2.5 text-xs text-white/70 hover:text-white hover:bg-white/[0.03] rounded-xl py-2">
                      <Archive className="h-4 w-4" /> Archive All Tasks
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem className="gap-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl py-2">
                      <Trash2 className="h-4 w-4" /> Delete Column
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>

      {/* Swimlanes / Groups */}
      <div className="flex-1 min-h-0 overflow-y-auto w-fit">
        {Object.entries(tasksByGroupAndColumn).map(([groupName, columnMap]) => (
          <div key={groupName} className="flex flex-col h-full min-h-0">
            {groupBy && (
              <div className="sticky top-0 z-10 flex items-center gap-3 px-6 py-2 bg-[#0a0a0a]/60 backdrop-blur-sm border-b border-white/5">
                <Badge variant="neutral" className="bg-white/[0.06] border-white/10 text-[10px] uppercase font-bold tracking-widest px-3">
                  {groupName}
                </Badge>
                <div className="h-px flex-1 bg-white/[0.03]" />
              </div>
            )}
            
            <div className="flex min-w-max h-full min-h-0">
              {columns.map((column, idx) => (
              <React.Fragment key={column.id}>
                {/* Column Ghost Placeholder LEFT */}
                {draggedColumnId && dragOverColumnId === column.id && dropPosition === 'left' && draggedColumnId !== column.id && (
                  <div className="flex-shrink-0 w-1 bg-cyan-500/50 mx-2 rounded-full animate-pulse" />
                )}

                <div 
                  key={column.id}
                  data-column-id={column.id}
                  className={cn(
                    "flex-shrink-0 w-[480px] flex flex-col gap-6 transition-all duration-300 p-4 rounded-[2rem] snap-start h-full min-h-0 overflow-hidden",
                    showDividers && idx > 0 && "border-l border-white/10",
                    draggedColumnId === column.id ? "opacity-20" : "opacity-100",
                    dragOverColumnId === column.id && draggedColumnId ? "bg-cyan-500/5" : "",
                    column.limit && (columnMap[column.id] || []).length > column.limit && "bg-red-500/[0.02] ring-1 ring-inset ring-red-500/20",
                    columnClassName
                  )}
                  onDragOver={(e) => handleDragOver(e, column.id)}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  <KanbanColumnContent 
                    column={column}
                    columnMap={columnMap}
                    groupName={groupName}
                    visibleCount={visibleCounts[column.id] || pageSize}
                    pageSize={pageSize}
                    draggedTaskId={draggedTaskId}
                    draggedColumnId={draggedColumnId}
                    dragOverTaskId={dragOverTaskId}
                    dragOverColumnId={dragOverColumnId}
                    dropPosition={dropPosition}
                    quickAddColumnId={quickAddColumnId}
                    quickAddValue={quickAddValue}
                    selectedTaskIds={selectedTaskIds}
                    activeTimerTaskId={activeTimerTaskId}
                    handleDragStart={handleDragStart}
                    handleDragEnd={handleDragEnd}
                    handleDragOver={handleDragOver}
                    handleDrop={handleDrop}
                    handleTouchStart={handleTouchStart}
                    handleTouchMove={handleTouchMove}
                    handleTouchEnd={handleTouchEnd}
                    handleKeyDown={handleKeyDown}
                    handleLoadMore={handleLoadMore}
                    handleSetQuickAdd={handleSetQuickAdd}
                    handleQuickAdd={handleQuickAdd}
                    setQuickAddValue={setQuickAddValue}
                    setQuickAddColumnId={setQuickAddColumnId}
                    onTaskClick={handleTaskClickInternal}
                    onTaskFullAdd={onTaskFullAdd}
                    onTaskRemove={onTaskRemove}
                    onTaskTimerToggle={onTaskTimerToggle}
                    onTaskSelectionChange={onTaskSelectionChange}
                    renderCard={renderCard}
                    selectable={selectable}
                    cardClassName={cardClassName}
                  />
                </div>

                {/* Column Ghost Placeholder RIGHT */}
                {draggedColumnId && dragOverColumnId === column.id && dropPosition === 'right' && draggedColumnId !== column.id && (
                  <div className="flex-shrink-0 w-1 bg-cyan-500/50 mx-2 rounded-full animate-pulse" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}
