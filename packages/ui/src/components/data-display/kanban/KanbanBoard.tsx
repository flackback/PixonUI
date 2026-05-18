import React, { useState, useMemo } from 'react';
import { cn } from '../../../utils/cn';
import { KanbanHeader } from './KanbanHeader';
import { KanbanColumn, KanbanColumnSkeleton } from './KanbanColumn';
import { KanbanListView } from './KanbanListView';
import { KanbanTimelineView } from './KanbanTimelineView';
import { KanbanTableView } from './KanbanTableView';
import { KanbanCalendarView } from './KanbanCalendarView';
import { KanbanFilterBar } from './KanbanFilterBar';
import { KanbanTaskModal } from './KanbanTaskModal';
import { KanbanSwimlane } from './KanbanSwimlane';
import { useKanbanFilters } from './useKanbanFilters';
import { useKanbanUndo } from './useKanbanUndo';
import { useKanbanKeyboard } from './useKanbanKeyboard';
import { useKanbanDragAndDrop } from './useKanbanDragAndDrop';
import { useKanbanBoardScroll } from './useKanbanBoardScroll';
import type { KanbanProps, KanbanTask, KanbanColumnDef } from './types';

export function KanbanBoard({
  columns: initialColumns,
  tasks: initialTasks,
  onTaskMove,
  onColumnMove,
  onTaskClick,
  onTaskAdd,
  onColumnAction,
  swimlanes = false,
  swimlaneBy = 'priority',
  view: propView,
  onViewChange,
  className,
  selectable = false,
  selectedTaskIds = [],
  onTaskSelectionChange,
  activeTimerTaskId = null,
  sortBy = 'order',
  sortOrder = 'asc',
  isLoading = false,
  maxVisibleCards,
  rtl,
  locale = 'en',
  translations,
  dropZones,
  onDropInZone,
  ...props
}: KanbanProps) {
  const [internalView, setInternalView] = useState<'board' | 'list' | 'calendar' | 'timeline' | 'table'>(propView || 'board');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [collapsedSwimlanes, setCollapsedSwimlanes] = useState<string[]>([]);
  const [dragOverZoneId, setDragOverZoneId] = useState<string | null>(null);

  const {
    boardRef,
    isDraggingBoard,
    handleBoardMouseDown,
    handleBoardMouseMove,
    handleBoardMouseUp
  } = useKanbanBoardScroll();

  const view = propView || internalView;
  const setView = (v: 'board' | 'list' | 'calendar' | 'timeline' | 'table') => {
    setInternalView(v);
    onViewChange?.(v);
  };
  
  const { 
    state, 
    pushState, 
    undo, 
    redo, 
    canUndo, 
    canRedo 
  } = useKanbanUndo({ tasks: initialTasks, columns: initialColumns });

  const tasks = state?.tasks || [];
  const columns = state?.columns || [];

  const {
    setSearchQuery,
    setActiveFilters,
    filteredTasks
  } = useKanbanFilters(tasks);

  const swimlaneGroups = useMemo(() => {
    if (!swimlanes) return null;
    const groups: Record<string, KanbanTask[]> = {};
    
    const getNestedValue = (obj: any, path: string) => {
      if (!path.includes('.')) return obj[path];
      return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    filteredTasks.forEach(task => {
      const rawValue = getNestedValue(task, swimlaneBy as string);
      const value = String(rawValue || 'Uncategorized');
      if (!groups[value]) groups[value] = [];
      groups[value].push(task);
    });
    return groups;
  }, [filteredTasks, swimlanes, swimlaneBy]);

  const {
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    draggedTaskId,
    dragOverColumnId,
    dragOverTaskId,
    dropPosition
  } = useKanbanDragAndDrop({ 
    columns, 
    tasks, 
    selectedTaskIds, 
    onTaskDragEnd: () => {
      setDragOverZoneId(null);
    },
    onTaskMove: (taskId, toColumnId, toTaskId, position) => {
      const newTasks = [...tasks];
      const taskIndex = newTasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return;

      const task = { ...newTasks[taskIndex], columnId: toColumnId } as KanbanTask;
      newTasks.splice(taskIndex, 1);
      
      if (!toTaskId) {
        newTasks.push(task);
      } else {
        const targetIndex = newTasks.findIndex(t => t.id === toTaskId);
        const insertIndex = position === 'bottom' ? targetIndex + 1 : targetIndex;
        newTasks.splice(insertIndex, 0, task);
      }

      pushState({ tasks: newTasks, columns });
      onTaskMove?.(taskId, toColumnId, toTaskId, position);
    }
  });

  useKanbanKeyboard({
    onUndo: undo,
    onRedo: redo,
    onSearch: () => document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')?.focus(),
    onNewTask: () => onTaskAdd?.('todo', 'New Task')
  });

  const selectedTask = useMemo(() => 
    tasks.find(t => t.id === selectedTaskId), 
    [tasks, selectedTaskId]
  );

  const sortedTasks = useMemo(() => {
    const list = [...filteredTasks];
    if (!sortBy) return list;

    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'title') {
        comparison = (a.title || '').localeCompare(b.title || '');
      } else if (sortBy === 'priority') {
        const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
        const aWeight = priorityWeight[a.priority as keyof typeof priorityWeight] || 0;
        const bWeight = priorityWeight[b.priority as keyof typeof priorityWeight] || 0;
        comparison = aWeight - bWeight;
      } else if (sortBy === 'dueDate') {
        const aDate = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const bDate = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        comparison = aDate - bDate;
      } else if (sortBy === 'created') {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        comparison = aTime - bTime;
      } else {
        comparison = (a.order || 0) - (b.order || 0);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return list;
  }, [filteredTasks, sortBy, sortOrder]);

  const tasksByColumn = useMemo(() => {
    const map: Record<string, KanbanTask[]> = {};
    columns.forEach(col => {
      map[col.id] = [];
    });
    sortedTasks.forEach(task => {
      let list = map[task.columnId];
      if (!list) {
        list = [];
        map[task.columnId] = list;
      }
      list.push(task);
    });
    return map;
  }, [columns, sortedTasks]);

  const renderView = () => {
    const handleTaskClick = (task: KanbanTask) => {
      setSelectedTaskId(task.id);
      onTaskClick?.(task);
    };

    // ─── SKELETON LOADING STATE ───
    if (isLoading) {
      return (
        <div className="flex gap-6 overflow-x-auto pb-4 min-h-[500px]">
          {Array.from({ length: 4 }).map((_, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div className="w-px self-stretch bg-gray-200/50 dark:bg-white/5 mx-1 my-4 flex-shrink-0" />}
              <KanbanColumnSkeleton />
            </React.Fragment>
          ))}
        </div>
      );
    }

    switch (view) {
      case 'list':
        return <KanbanListView tasks={filteredTasks} columns={columns} onTaskClick={handleTaskClick} />;
      case 'timeline':
        return <KanbanTimelineView tasks={filteredTasks} />;
      case 'table':
        return <KanbanTableView tasks={filteredTasks} columns={columns} onTaskClick={handleTaskClick} />;
      case 'calendar':
        return <KanbanCalendarView tasks={filteredTasks} onTaskClick={handleTaskClick} />;
      default:
        if (swimlanes) {
          const groups = swimlaneGroups && Object.keys(swimlaneGroups).length > 0 
            ? swimlaneGroups 
            : { 'All Tasks': [] };

          return (
            <div className="flex flex-col gap-8 overflow-y-auto h-full pr-2 custom-scrollbar">
              {Object.entries(groups).map(([groupName, groupTasks]) => (
                <KanbanSwimlane
                  key={groupName}
                  title={groupName}
                  count={groupTasks.length}
                  isCollapsed={collapsedSwimlanes.includes(groupName)}
                  onToggle={() => setCollapsedSwimlanes(prev => 
                    prev.includes(groupName) ? prev.filter(s => s !== groupName) : [...prev, groupName]
                  )}
                >
                  <div className="flex gap-6 min-h-[200px]">
                    {columns.map((column, index) => (
                      <React.Fragment key={column.id}>
                        {index > 0 && <div className="w-px self-stretch bg-gray-200/50 dark:bg-white/5 mx-1 my-4 flex-shrink-0" />}
                        <KanbanColumn
                          column={column}
                          tasks={groupTasks.filter(t => t.columnId === column.id)}
                          onTaskClick={handleTaskClick}
                          onAddTask={() => onTaskAdd?.(column.id, 'New Task')}
                          onAction={(action) => onColumnAction?.(column.id, action)}
                          onDragStart={handleDragStart}
                          onDragOver={(e, taskId) => handleDragOver(e, column.id, taskId)}
                          onDrop={(e, taskId) => handleDrop(e, column.id, taskId)}
                          isDragOver={dragOverColumnId === column.id}
                          draggedTaskId={draggedTaskId}
                          selectable={selectable}
                          selectedTaskIds={selectedTaskIds}
                          onTaskSelectionChange={onTaskSelectionChange}
                          activeTimerTaskId={activeTimerTaskId}
                          maxVisibleCards={maxVisibleCards}
                          dragOverTaskId={dragOverTaskId}
                          dropPosition={dropPosition}
                        />
                      </React.Fragment>
                    ))}
                  </div>
                </KanbanSwimlane>
              ))}
            </div>
          );
        }
 
        return (
          <div 
            ref={boardRef}
            onMouseDown={handleBoardMouseDown}
            onMouseMove={handleBoardMouseMove}
            onMouseUp={handleBoardMouseUp}
            onMouseLeave={handleBoardMouseUp}
            className={cn(
              "flex gap-6 overflow-x-auto pb-4 min-h-[500px] scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-white/10",
              isDraggingBoard ? "cursor-grabbing select-none" : "cursor-grab"
            )}
          >
            {columns.map((column, index) => (
              <React.Fragment key={column.id}>
                {index > 0 && <div className="w-px self-stretch bg-gray-200/50 dark:bg-white/5 mx-1 my-4 flex-shrink-0" />}
                <KanbanColumn
                  column={column}
                  tasks={tasksByColumn[column.id] || []}
                  onTaskClick={handleTaskClick}
                  onAddTask={() => onTaskAdd?.(column.id, 'New Task')}
                  onAction={(action) => onColumnAction?.(column.id, action)}
                  onDragStart={handleDragStart}
                  onDragOver={(e, taskId) => handleDragOver(e, column.id, taskId)}
                  onDrop={(e, taskId) => handleDrop(e, column.id, taskId)}
                  isDragOver={dragOverColumnId === column.id}
                  draggedTaskId={draggedTaskId}
                  selectable={selectable}
                  selectedTaskIds={selectedTaskIds}
                  onTaskSelectionChange={onTaskSelectionChange}
                  activeTimerTaskId={activeTimerTaskId}
                  maxVisibleCards={maxVisibleCards}
                  dragOverTaskId={dragOverTaskId}
                  dropPosition={dropPosition}
                />
              </React.Fragment>
            ))}
          </div>
        );
    }
  };
  const isRtl = rtl ?? (typeof document !== 'undefined' ? document.documentElement.dir === 'rtl' : false);
 
  return (
    <div className={cn("flex flex-col gap-4 h-full relative overflow-hidden", className)} dir={isRtl ? "rtl" : "ltr"}>
      <style dangerouslySetInnerHTML={{ __html: `
        body.is-dragging-task,
        body.is-dragging-task * {
          cursor: grabbing !important;
        }
        .is-being-dragged-snapshot {
          background-color: rgba(255, 255, 255, 0.96) !important;
          border-color: rgba(6, 182, 212, 0.5) !important;
          box-shadow: 0 25px 35px -5px rgba(0, 0, 0, 0.15), 0 0 20px rgba(6, 182, 212, 0.25) !important;
          transform: scale(1.02) rotate(-1.5deg);
          opacity: 0.98 !important;
          backdrop-filter: blur(24px) !important;
          -webkit-backdrop-filter: blur(24px) !important;
          border-style: solid !important;
          border-width: 1.5px !important;
          border-radius: 1rem !important;
        }
        .is-being-dragged-snapshot * {
          opacity: 1 !important;
          visibility: visible !important;
        }
        .dark .is-being-dragged-snapshot {
          background-color: rgba(18, 18, 20, 0.94) !important;
          border-color: rgba(6, 182, 212, 0.6) !important;
          box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.8), 0 0 30px rgba(6, 182, 212, 0.45) !important;
        }
      ` }} />
      <KanbanHeader 
        title={translations?.projectBoard || (locale === 'pt' ? "Quadro de Projetos" : "Project Board")}
        view={view}
        onViewChange={(v) => setView(v as any)}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        locale={locale}
        translations={translations}
      />
      
      <KanbanFilterBar 
        onSearchChange={setSearchQuery}
        onFilterChange={setActiveFilters}
        locale={locale}
        translations={translations}
      />

      <div className="flex-1 overflow-hidden">
        {renderView()}
      </div>

      {selectedTask && (
        <KanbanTaskModal
          isOpen={!!selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          task={selectedTask}
          onSave={(updatedTask) => {
            const updatedTasks = tasks.map(t => t.id === selectedTask.id ? { ...t, ...updatedTask } : t);
            pushState({ tasks: updatedTasks, columns });
            setSelectedTaskId(null);
          }}
        />
      )}

      {/* Bitrix24-style Bottom Action Drop Zones */}
      {draggedTaskId && dropZones && dropZones.length > 0 && (
        <div 
          className="absolute bottom-4 left-4 right-4 z-40 flex h-20 items-stretch justify-around gap-4 px-4 py-2.5 bg-white/20 dark:bg-black/40 backdrop-blur-3xl border border-zinc-200/40 dark:border-white/5 rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-6 duration-300 ease-out"
        >
          {dropZones.map((zone) => {
            const isOver = dragOverZoneId === zone.id;
            
            // Map variants or custom colors to premium, hyper-fluid interactive styles
            let variantClasses = "";
            if (zone.variant === 'danger') {
              variantClasses = isOver
                ? "bg-gradient-to-r from-red-500 to-rose-600 text-white border-red-400 shadow-[0_10px_25px_rgba(239,68,68,0.3)]"
                : "bg-red-500/10 dark:bg-rose-500/5 text-red-600 dark:text-rose-400 border-red-500/10 dark:border-rose-500/5 hover:bg-red-500/20";
            } else if (zone.variant === 'success') {
              variantClasses = isOver
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-400 shadow-[0_10px_25px_rgba(16,185,129,0.3)]"
                : "bg-emerald-500/10 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/10 dark:border-emerald-500/5 hover:bg-emerald-500/20";
            } else if (zone.variant === 'info' || zone.variant === 'primary') {
              variantClasses = isOver
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400 shadow-[0_10px_25px_rgba(6,182,212,0.3)]"
                : "bg-cyan-500/10 dark:bg-cyan-500/5 text-cyan-600 dark:text-cyan-400 border-cyan-500/10 dark:border-cyan-500/5 hover:bg-cyan-500/20";
            } else if (zone.variant === 'warning') {
              variantClasses = isOver
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-400 shadow-[0_10px_25px_rgba(245,158,11,0.3)]"
                : "bg-amber-500/10 dark:bg-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/10 dark:border-amber-500/5 hover:bg-amber-500/20";
            } else {
              if (zone.color) {
                variantClasses = isOver
                  ? `${zone.color} text-white shadow-[0_10px_25px_rgba(0,0,0,0.2)] border-white/20`
                  : `${zone.color}/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/10 hover:bg-zinc-500/15`;
              } else {
                variantClasses = isOver
                  ? "bg-gradient-to-r from-zinc-500 to-zinc-600 text-white border-zinc-400 shadow-md"
                  : "bg-zinc-500/10 dark:bg-zinc-500/5 text-zinc-700 dark:text-zinc-400 border-zinc-500/10 hover:bg-zinc-500/20";
              }
            }

            return (
              <div
                key={zone.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverZoneId(zone.id);
                }}
                onDragLeave={() => setDragOverZoneId(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedTaskId) {
                    onDropInZone?.(draggedTaskId, zone.id);
                  }
                  setDragOverZoneId(null);
                }}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-1 rounded-2xl border text-sm font-semibold transition-all duration-300 ease-out",
                  "cursor-pointer select-none border-zinc-200/50 dark:border-white/5",
                  variantClasses,
                  isOver ? "scale-[1.03] -translate-y-1.5" : ""
                )}
              >
                <div className={cn(
                  "flex items-center gap-2 transition-transform duration-300",
                  isOver ? "scale-110" : "scale-100"
                )}>
                  {zone.icon && <span className="text-base shrink-0">{zone.icon}</span>}
                  <span className="text-xs tracking-wide">{zone.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
