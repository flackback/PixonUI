import { useState, useCallback } from 'react';

export interface KanbanBoardTask {
  id: string;
  columnId: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  assignee?: {
    name: string;
    avatar?: string;
  };
  tags?: string[];
  [key: string]: any;
}

export interface KanbanBoardColumn {
  id: string;
  title: string;
  taskIds: string[];
}

export interface KanbanBoardState {
  columns: Record<string, KanbanBoardColumn>;
  columnOrder: string[];
  tasks: Record<string, KanbanBoardTask>;
}

/**
 * A specialized hook for managing Kanban board logic, including task movement and reordering.
 * 
 * @example
 * const { board, moveTask } = useKanban(initialData);
 */
export function useKanban(initialBoard: KanbanBoardState) {
  const [board, setBoard] = useState<KanbanBoardState>(initialBoard);

  /**
   * Moves a task within the same column or to a different column.
   */
  const moveTask = useCallback((
    taskId: string,
    sourceColumnId: string,
    destinationColumnId: string,
    destinationIndex: number
  ) => {
    setBoard((prev) => {
      const sourceColumn = prev.columns[sourceColumnId];
      const destColumn = prev.columns[destinationColumnId];
      const task = prev.tasks[taskId];
      
      if (!sourceColumn || !destColumn || !task) return prev;

      const newTaskIds = Array.from(sourceColumn.taskIds);
      newTaskIds.splice(newTaskIds.indexOf(taskId), 1);

      const newSourceColumn: KanbanBoardColumn = {
        ...sourceColumn,
        taskIds: newTaskIds,
      };

      const newDestTaskIds = sourceColumnId === destinationColumnId 
        ? newTaskIds 
        : Array.from(destColumn.taskIds);
      
      newDestTaskIds.splice(destinationIndex, 0, taskId);

      const newDestColumn: KanbanBoardColumn = {
        ...destColumn,
        taskIds: newDestTaskIds,
      };

      return {
        ...prev,
        columns: {
          ...prev.columns,
          [sourceColumnId]: newSourceColumn,
          [destinationColumnId]: newDestColumn,
        },
        tasks: {
          ...prev.tasks,
          [taskId]: {
            ...task,
            columnId: destinationColumnId,
          },
        },
      };
    });
  }, []);

  /**
   * Reorders columns in the board.
   */
  const moveColumn = useCallback((columnId: string, destinationIndex: number) => {
    setBoard((prev) => {
      const newColumnOrder = Array.from(prev.columnOrder);
      newColumnOrder.splice(newColumnOrder.indexOf(columnId), 1);
      newColumnOrder.splice(destinationIndex, 0, columnId);

      return {
        ...prev,
        columnOrder: newColumnOrder,
      };
    });
  }, []);

  /**
   * Adds a new task to a specific column.
   */
  const addTask = useCallback((columnId: string, task: KanbanBoardTask) => {
    setBoard((prev) => {
      const column = prev.columns[columnId];
      if (!column) return prev;

      const newColumn: KanbanBoardColumn = {
        ...column,
        taskIds: [...column.taskIds, task.id],
      };

      return {
        ...prev,
        tasks: {
          ...prev.tasks,
          [task.id]: task,
        },
        columns: {
          ...prev.columns,
          [columnId]: newColumn,
        },
      };
    });
  }, []);

  /**
   * Removes a task from the board.
   */
  const removeTask = useCallback((taskId: string) => {
    setBoard((prev) => {
      const task = prev.tasks[taskId];
      if (!task) return prev;

      const column = prev.columns[task.columnId];
      if (!column) return prev;

      const newTasks = { ...prev.tasks };
      delete newTasks[taskId];

      const newColumn: KanbanBoardColumn = {
        ...column,
        taskIds: column.taskIds.filter((id) => id !== taskId),
      };

      return {
        ...prev,
        tasks: newTasks,
        columns: {
          ...prev.columns,
          [task.columnId]: newColumn,
        },
      };
    });
  }, []);

  return {
    board,
    setBoard,
    moveTask,
    moveColumn,
    addTask,
    removeTask,
  };
}
