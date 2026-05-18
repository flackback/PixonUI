import { useState, useCallback, useRef } from 'react';
import type { KanbanTask, KanbanColumnDef, DropPosition } from './types';

interface UseKanbanDragAndDropProps {
  tasks: KanbanTask[];
  columns: KanbanColumnDef[];
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
  const touchMoveRaf = useRef<number | null>(null);
  const dragOverRaf = useRef<number | null>(null);
  const pendingDragOver = useRef<null | {
    isColumnDrag: boolean;
    columnId: string;
    taskId?: string;
    isTargetingContainer: boolean;
    clientX: number;
    clientY: number;
    currentTarget: HTMLElement;
  }>(null);

  const preventDefaultDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  }, []);

  const handleDragStart = (e: React.DragEvent, id: string, type: 'task' | 'column') => {
    if (type === 'task') {
      e.dataTransfer.setData('taskId', id);
      onTaskDragStart?.(id);
      if (typeof document !== 'undefined') {
        document.body.classList.add('is-dragging-task');
        document.addEventListener('dragover', preventDefaultDragOver);
      }
      // Delay state update so the browser captures the original full-opacity element as the drag image first
      setTimeout(() => {
        setDraggedTaskId(id);
      }, 50);
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
    if (typeof document !== 'undefined') {
      document.body.classList.remove('is-dragging-task');
      document.removeEventListener('dragover', preventDefaultDragOver);
    }
    if (dragOverRaf.current !== null && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(dragOverRaf.current);
      dragOverRaf.current = null;
    }
    pendingDragOver.current = null;
    setDraggedTaskId(null);
    setDraggedColumnId(null);
    setDragOverColumnId(null);
    setDragOverTaskId(null);
    setDropPosition(null);
  }, [draggedTaskId, onTaskDragEnd, preventDefaultDragOver]);

  const flushDragOver = useCallback(() => {
    dragOverRaf.current = null;
    const pending = pendingDragOver.current;
    if (!pending) return;

    setDragOverColumnId(pending.columnId);

    const rect = pending.currentTarget.getBoundingClientRect();
    if (pending.isColumnDrag) {
      const midpoint = rect.left + rect.width / 2;
      setDropPosition(pending.clientX < midpoint ? 'left' : 'right');
      return;
    }

    if (pending.taskId) {
      const midpoint = rect.top + rect.height / 2;
      setDragOverTaskId(pending.taskId);
      setDropPosition(pending.clientY < midpoint ? 'top' : 'bottom');
      return;
    }

    if (pending.isTargetingContainer) {
      setDragOverTaskId(null);
      setDropPosition(null);
    }
  }, []);

  const scheduleDragOverFlush = useCallback(() => {
    if (dragOverRaf.current !== null) return;
    if (typeof requestAnimationFrame !== 'function') {
      flushDragOver();
      return;
    }
    dragOverRaf.current = requestAnimationFrame(flushDragOver);
  }, [flushDragOver]);

  const handleDragOver = useCallback((e: React.DragEvent, columnId: string, taskId?: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    pendingDragOver.current = {
      isColumnDrag: Boolean(draggedColumnId),
      columnId,
      taskId,
      isTargetingContainer: e.target === e.currentTarget,
      clientX: e.clientX,
      clientY: e.clientY,
      currentTarget: e.currentTarget as HTMLElement,
    };

    scheduleDragOverFlush();
  }, [draggedColumnId, scheduleDragOverFlush]);

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

    lastTouchPos.current = { x: touch.clientX, y: touch.clientY };
    if (touchMoveRaf.current !== null) return;

    touchMoveRaf.current = requestAnimationFrame(() => {
      touchMoveRaf.current = null;
      const pos = lastTouchPos.current;
      if (!pos) return;

      const target = document.elementFromPoint(pos.x, pos.y);
      if (!target) return;

      const columnEl = target.closest('[data-column-id]');
      const taskEl = target.closest('[data-task-id]');

      if (!columnEl) return;

      const columnId = columnEl.getAttribute('data-column-id')!;
      setDragOverColumnId(columnId);

      if (draggedColumnId) {
        const rect = (columnEl as HTMLElement).getBoundingClientRect();
        const midpoint = rect.left + rect.width / 2;
        setDropPosition(pos.x < midpoint ? 'left' : 'right');
        return;
      }

      if (taskEl) {
        const taskId = taskEl.getAttribute('data-task-id')!;
        setDragOverTaskId(taskId);
        const rect = (taskEl as HTMLElement).getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        setDropPosition(pos.y < midpoint ? 'top' : 'bottom');
      }
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    clearTimeout(touchTimeout.current);
    if (touchMoveRaf.current !== null) {
      cancelAnimationFrame(touchMoveRaf.current);
      touchMoveRaf.current = null;
    }
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
