import React, { useState, useMemo } from 'react';
import { cn } from '../../../utils/cn';
import { KanbanHeader } from './KanbanHeader';
import { KanbanColumn } from './KanbanColumn';
import { KanbanListView } from './KanbanListView';
import { KanbanTimelineView } from './KanbanTimelineView';
import { KanbanTableView } from './KanbanTableView';
import { KanbanCalendarView } from './KanbanCalendarView';
import { KanbanFilterBar } from './KanbanFilterBar';
import { KanbanTaskModal } from './KanbanTaskModal';
import { useKanbanFilters } from './useKanbanFilters';
import { useKanbanUndo } from './useKanbanUndo';
import { useKanbanKeyboard } from './useKanbanKeyboard';
import { useKanbanDragAndDrop } from './useKanbanDragAndDrop';
import type { KanbanProps, KanbanTask, KanbanColumnDef } from './types';

export function KanbanBoard({
  columns: initialColumns,
  tasks: initialTasks,
  onTaskMove,
  onColumnMove,
  onTaskClick,
  onTaskAdd,
  onColumnAction,
  className,
  ...props
}: KanbanProps) {
  const [view, setView] = useState<'board' | 'list' | 'calendar' | 'timeline' | 'table'>('board');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
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

  const {
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd
  } = useKanbanDragAndDrop({ 
    columns, 
    tasks, 
    selectedTaskIds: [], 
    onTaskMove: (taskId, toColumnId, toTaskId, position) => {
      // This is a simplified update logic for the demo/component
      const updatedTasks = tasks.map(t => {
        if (t.id === taskId) {
          return { ...t, columnId: toColumnId };
        }
        return t;
      });
      pushState({ tasks: updatedTasks, columns });
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

  const renderView = () => {
    const handleTaskClick = (task: KanbanTask) => {
      setSelectedTaskId(task.id);
      onTaskClick?.(task);
    };

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
        return (
          <div className="flex gap-6 overflow-x-auto pb-4 min-h-[500px] scrollbar-thin scrollbar-thumb-white/10">
            {columns.map(column => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={filteredTasks.filter(t => t.columnId === column.id)}
                onTaskClick={handleTaskClick}
                onAddTask={() => onTaskAdd?.(column.id, 'New Task')}
                onAction={(action) => onColumnAction?.(column.id, action)}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDrop={(e) => handleDrop(e, column.id)}
              />
            ))}
          </div>
        );
    }
  };

  return (
    <div className={cn("flex flex-col gap-4 h-full", className)}>
      <KanbanHeader 
        title="Project Board"
        view={view}
        onViewChange={(v) => setView(v as any)}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
      />
      
      <KanbanFilterBar 
        onSearchChange={setSearchQuery}
        onFilterChange={setActiveFilters}
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
    </div>
  );
}
