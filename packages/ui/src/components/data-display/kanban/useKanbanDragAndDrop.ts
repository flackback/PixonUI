import { useState, useCallback, useRef } from 'react';
import { KanbanTask, KanbanColumn, DropPosition } from './types';

interface UseKanbanDragAndDropProps {
  tasks: KanbanTask[];
  columns: KanbanColumn[];
  selectedTaskIds: string[];
  onTaskMove?: (taskId: string, toColumnId: string, toTaskId?: string, position?: 'top' | 'bottom') => void;
  onColumnMove?: (columnId: string, toColumnId: string, position?: 'left' | 'right') => void;
  onTaskDrop?: (taskId: string, fromColumnId: string, toColumnId: string, index: number) => void;
  onTaskDragStart?: (taskId: string) => void;
  onTaskDragEnd?: (taskId: string) => void;
}

export function useKanbanDragAndDrop({
  tasks,
  columns,
  selectedTaskIds,
  onTaskMove,
  onColumnMove,
  onTaskDrop,
  onTaskDragStart,
  onTaskDragEnd
}: UseKanbanDragAndDropProps) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<DropPosition | null>(null);
  
  const touchTimeout = useRef<any>(null);
  const lastTouchPos = useRef<{ x: number, y: number } | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string, type: 'task' | 'column') => {
    if (type === 'task') {
      setDraggedTaskId(id);
      e.dataTransfer.setData('taskId', id);
      onTaskDragStart?.(id);
    } else {
      setDraggedColumnId(id);
      e.dataTransfer.setData('columnId', id);
    }
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = useCallback(() => {
    if (draggedTaskId) {
      onTaskDragEnd?.(draggedTaskId);
    }
    setDraggedTaskId(null);
    setDraggedColumnId(null);
    setDragOverColumnId(null);
    setDragOverTaskId(null);
    setDropPosition(null);
  }, [draggedTaskId, onTaskDragEnd]);

  const handleDragOver = (e: React.DragEvent, columnId: string, taskId?: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedColumnId) {
      setDragOverColumnId(columnId);
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const midpoint = rect.left + rect.width / 2;
      setDropPosition(e.clientX < midpoint ? 'left' : 'right');
    } else {
      setDragOverColumnId(columnId);
      
      if (taskId) {
        setDragOverTaskId(taskId);
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        setDropPosition(e.clientY < midpoint ? 'top' : 'bottom');
      } else if (e.target === e.currentTarget) {
        setDragOverTaskId(null);
        setDropPosition(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent, toColumnId: string, toTaskId?: string) => {
    e.preventDefault();
    const taskId = draggedTaskId || e.dataTransfer.getData('taskId');
    const columnId = draggedColumnId || e.dataTransfer.getData('columnId');

    if (columnId && onColumnMove) {
      onColumnMove(columnId, toColumnId, dropPosition === 'right' ? 'right' : 'left');
    } else if (taskId && onTaskMove) {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const tasksToMove = selectedTaskIds.includes(taskId) 
        ? selectedTaskIds 
        : [taskId];

      tasksToMove.forEach((id) => {
        const currentTask = tasks.find(t => t.id === id);
        const fromColumnId = currentTask?.columnId || '';
        onTaskMove(id, toColumnId, toTaskId, dropPosition === 'bottom' ? 'bottom' : 'top');
        onTaskDrop?.(id, fromColumnId, toColumnId, 0);
      });
    }

    handleDragEnd();
  };

  const handleTouchStart = (e: React.TouchEvent, id: string, type: 'task' | 'column') => {
    const touch = e.touches[0];
    if (!touch) return;

    touchTimeout.current = setTimeout(() => {
      if (type === 'task') {
        setDraggedTaskId(id);
        onTaskDragStart?.(id);
      } else {
        setDraggedColumnId(id);
      }
      lastTouchPos.current = { x: touch.clientX, y: touch.clientY };
    }, 500);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!draggedTaskId && !draggedColumnId) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    if (!touch) return;

    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!target) return;

    const columnEl = target.closest('[data-column-id]');
    const taskEl = target.closest('[data-task-id]');

    if (columnEl) {
      const columnId = columnEl.getAttribute('data-column-id')!;
      setDragOverColumnId(columnId);
      
      if (draggedColumnId) {
        const rect = columnEl.getBoundingClientRect();
        const midpoint = rect.left + rect.width / 2;
        setDropPosition(touch.clientX < midpoint ? 'left' : 'right');
      } else if (taskEl) {
        const taskId = taskEl.getAttribute('data-task-id')!;
        setDragOverTaskId(taskId);
        const rect = taskEl.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        setDropPosition(touch.clientY < midpoint ? 'top' : 'bottom');
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    clearTimeout(touchTimeout.current);
    if (draggedTaskId || draggedColumnId) {
      if (dragOverColumnId) {
        const taskId = draggedTaskId;
        const columnId = draggedColumnId;

        if (columnId && onColumnMove) {
          onColumnMove(columnId, dragOverColumnId, dropPosition === 'right' ? 'right' : 'left');
        } else if (taskId && onTaskMove) {
          onTaskMove(taskId, dragOverColumnId, dragOverTaskId || undefined, dropPosition === 'bottom' ? 'bottom' : 'top');
        }
      }
      handleDragEnd();
    }
  };

  return {
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
  };
}
