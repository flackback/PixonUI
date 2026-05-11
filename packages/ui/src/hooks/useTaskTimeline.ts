import { useState, useCallback, useMemo } from 'react';

export interface Assignee {
  name: string;
  avatar?: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'on_hold';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface TaskItem {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: Assignee;
  startCol: number; // 1-indexed column on the timeline grid
  duration: number; // Number of columns spanned (minimum 1)
  progress: number; // 0 to 100
  dependencies?: string[]; // IDs of tasks this task depends on (must finish before this starts)
}

export interface TimelineGroup {
  id: string;
  name: string;
  color: string; // Tailwind colors: e.g. "purple", "emerald", "blue", "pink", "amber"
  tasks: TaskItem[];
}

export interface TimelineDragState {
  taskId: string;
  groupId: string;
  type: 'move' | 'resize-start' | 'resize-end';
  startX: number;
  startCol: number;
  originalStartCol: number;
  originalDuration: number;
}

export interface TaskTimelineStats {
  totalTasks: number;
  completedTasks: number;
  averageProgress: number;
  criticalTasksCount: number;
}

export interface UseTaskTimelineOptions {
  initialGroups?: TimelineGroup[];
  columnsCount?: number;
}

export function useTaskTimeline({
  initialGroups = [],
  columnsCount = 14,
}: UseTaskTimelineOptions = {}) {
  const [groups, setGroups] = useState<TimelineGroup[]>(initialGroups);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [dragState, setDragState] = useState<TimelineDragState | null>(null);

  // Helper: Propagate dependencies in cascade (Auto-Push constraints solver)
  const propagateDependencies = useCallback((currentGroups: TimelineGroup[], updatedTaskId: string, visited = new Set<string>()): TimelineGroup[] => {
    if (visited.has(updatedTaskId)) return currentGroups;
    visited.add(updatedTaskId);

    // Find the master task that just moved/updated
    let masterTask: TaskItem | null = null;
    for (const group of currentGroups) {
      const found = group.tasks.find((t) => t.id === updatedTaskId);
      if (found) {
        masterTask = found;
        break;
      }
    }
    if (!masterTask) return currentGroups;

    // The minimum day the dependent tasks must start on is: masterTask.startCol + masterTask.duration
    const minDependentStart = masterTask.startCol + masterTask.duration;
    let nextGroups = currentGroups;
    const tasksToPropagate: string[] = [];

    nextGroups = nextGroups.map((group) => {
      let changed = false;
      const updatedTasks = group.tasks.map((task) => {
        // If this task depends on the master task and is starting too early, push it forward!
        if (task.dependencies?.includes(updatedTaskId) && task.startCol < minDependentStart) {
          changed = true;
          tasksToPropagate.push(task.id);
          
          let newStartCol = minDependentStart;
          let newDuration = task.duration;

          // Clamp to stay within grid bounds
          if (newStartCol > columnsCount) newStartCol = columnsCount;
          if (newStartCol + newDuration - 1 > columnsCount) {
            newDuration = Math.max(1, columnsCount - newStartCol + 1);
          }

          return {
            ...task,
            startCol: newStartCol,
            duration: newDuration,
          };
        }
        return task;
      });

      return changed ? { ...group, tasks: updatedTasks } : group;
    });

    // Recursively propagate to all affected child tasks
    for (const childId of tasksToPropagate) {
      nextGroups = propagateDependencies(nextGroups, childId, visited);
    }

    return nextGroups;
  }, [columnsCount]);

  // Toggle group expansion/collapse
  const toggleGroup = useCallback((groupId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  }, []);

  // Update a single task field
  const updateTask = useCallback((taskId: string, updates: Partial<Omit<TaskItem, 'id'>>) => {
    setGroups((prevGroups) => {
      const nextGroups = prevGroups.map((group) => {
        const hasTask = group.tasks.some((t) => t.id === taskId);
        if (!hasTask) return group;

        return {
          ...group,
          tasks: group.tasks.map((task) => {
            if (task.id !== taskId) return task;
            
            const updated = { ...task, ...updates };
            // Ensure bounds are within limits
            if (updated.startCol < 1) updated.startCol = 1;
            if (updated.startCol > columnsCount) updated.startCol = columnsCount;
            if (updated.duration < 1) updated.duration = 1;
            if (updated.startCol + updated.duration - 1 > columnsCount) {
              updated.duration = columnsCount - updated.startCol + 1;
            }
            return updated;
          }),
        };
      });

      // If dates changed (startCol or duration), propagate cascade scheduling to dependents
      if ('startCol' in updates || 'duration' in updates) {
        return propagateDependencies(nextGroups, taskId);
      }
      return nextGroups;
    });
  }, [columnsCount, propagateDependencies]);

  // Move task to a different group or column
  const moveTask = useCallback((taskId: string, targetGroupId: string, newStartCol: number) => {
    setGroups((prevGroups) => {
      // Find the task and its original group
      let foundTask: TaskItem | null = null;
      let sourceGroupId = '';

      for (const g of prevGroups) {
        const t = g.tasks.find((tk) => tk.id === taskId);
        if (t) {
          foundTask = t;
          sourceGroupId = g.id;
          break;
        }
      }

      if (!foundTask) return prevGroups;

      const adjustedStartCol = Math.max(1, Math.min(columnsCount - foundTask.duration + 1, newStartCol));

      // Rebuild groups array with moved task
      const nextGroups = prevGroups.map((group) => {
        // If source group, filter out the task
        if (group.id === sourceGroupId && group.id !== targetGroupId) {
          return {
            ...group,
            tasks: group.tasks.filter((tk) => tk.id !== taskId),
          };
        }

        // If target group, add the task (or update it if it's the same group)
        if (group.id === targetGroupId) {
          const taskExistsInTarget = group.tasks.some((tk) => tk.id === taskId);
          const updatedTask = { ...foundTask!, startCol: adjustedStartCol };

          if (taskExistsInTarget) {
            return {
              ...group,
              tasks: group.tasks.map((tk) => (tk.id === taskId ? updatedTask : tk)),
            };
          } else {
            return {
              ...group,
              tasks: [...group.tasks, updatedTask],
            };
          }
        }

        return group;
      });

      // Propagate dependencies Cascade from the new position
      return propagateDependencies(nextGroups, taskId);
    });
  }, [columnsCount, propagateDependencies]);

  // Add a new task to a group
  const addTask = useCallback((groupId: string, taskData: Partial<Omit<TaskItem, 'id'>>) => {
    const id = `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newTask: TaskItem = {
      id,
      title: taskData.title || 'Nova Tarefa',
      status: taskData.status || 'pending',
      priority: taskData.priority || 'medium',
      assignee: taskData.assignee,
      startCol: taskData.startCol || 1,
      duration: taskData.duration || 2,
      progress: taskData.progress || 0,
      dependencies: taskData.dependencies || [],
    };

    setGroups((prevGroups) =>
      prevGroups.map((group) => {
        if (group.id !== groupId) return group;
        return {
          ...group,
          tasks: [...group.tasks, newTask],
        };
      })
    );
    return id;
  }, []);

  // Delete a task and clean up references to it in dependencies
  const deleteTask = useCallback((taskId: string) => {
    setGroups((prevGroups) =>
      prevGroups.map((group) => ({
        ...group,
        tasks: group.tasks
          .filter((t) => t.id !== taskId)
          .map((t) => ({
            ...t,
            dependencies: t.dependencies?.filter((depId) => depId !== taskId),
          })),
      }))
    );
  }, []);

  // Drag operations
  const startDrag = useCallback((
    taskId: string,
    groupId: string,
    type: 'move' | 'resize-start' | 'resize-end',
    clientX: number,
    currentStartCol: number,
    currentDuration: number
  ) => {
    setDragState({
      taskId,
      groupId,
      type,
      startX: clientX,
      startCol: currentStartCol,
      originalStartCol: currentStartCol,
      originalDuration: currentDuration,
    });
  }, []);

  const updateDrag = useCallback((clientX: number, colWidth: number) => {
    if (!dragState || colWidth <= 0) return;

    const deltaX = clientX - dragState.startX;
    const deltaCol = Math.round(deltaX / colWidth);

    if (dragState.type === 'move') {
      const newStartCol = Math.max(1, Math.min(columnsCount - dragState.originalDuration + 1, dragState.originalStartCol + deltaCol));
      moveTask(dragState.taskId, dragState.groupId, newStartCol);
    } else if (dragState.type === 'resize-start') {
      const newStartCol = Math.max(1, Math.min(dragState.originalStartCol + dragState.originalDuration - 1, dragState.originalStartCol + deltaCol));
      const newDuration = dragState.originalDuration - (newStartCol - dragState.originalStartCol);
      updateTask(dragState.taskId, { startCol: newStartCol, duration: newDuration });
    } else if (dragState.type === 'resize-end') {
      const newDuration = Math.max(1, Math.min(columnsCount - dragState.originalStartCol + 1, dragState.originalDuration + deltaCol));
      updateTask(dragState.taskId, { duration: newDuration });
    }
  }, [dragState, columnsCount, moveTask, updateTask]);

  const endDrag = useCallback(() => {
    setDragState(null);
  }, []);

  // Aggregate statistics calculations
  const stats = useMemo<TaskTimelineStats>(() => {
    let totalTasks = 0;
    let completedTasks = 0;
    let progressSum = 0;
    let criticalTasksCount = 0;

    groups.forEach((group) => {
      group.tasks.forEach((task) => {
        totalTasks++;
        if (task.status === 'completed') completedTasks++;
        progressSum += task.progress;
        if (task.priority === 'critical') criticalTasksCount++;
      });
    });

    return {
      totalTasks,
      completedTasks,
      averageProgress: totalTasks > 0 ? Math.round(progressSum / totalTasks) : 0,
      criticalTasksCount,
    };
  }, [groups]);

  // Advanced: Assignee workload distribution aggregator per day (column)
  const workloadStats = useMemo<Record<string, number[]>>(() => {
    const statsMap: Record<string, number[]> = {};

    groups.forEach((group) => {
      group.tasks.forEach((task) => {
        if (!task.assignee?.name) return;
        const name = task.assignee.name;
        if (!statsMap[name]) {
          statsMap[name] = Array(columnsCount).fill(0);
        }

        const userMap = statsMap[name]!;

        // Add 1 to workload on each day of duration
        const start = task.startCol;
        const end = Math.min(columnsCount, task.startCol + task.duration - 1);
        for (let day = start; day <= end; day++) {
          const currentVal = userMap[day - 1] ?? 0;
          userMap[day - 1] = currentVal + 1;
        }
      });
    });

    return statsMap;
  }, [groups, columnsCount]);

  const getGroupStats = useCallback((groupId: string): TaskTimelineStats => {
    const group = groups.find((g) => g.id === groupId);
    if (!group || group.tasks.length === 0) {
      return { totalTasks: 0, completedTasks: 0, averageProgress: 0, criticalTasksCount: 0 };
    }

    let completedTasks = 0;
    let progressSum = 0;
    let criticalTasksCount = 0;

    group.tasks.forEach((task) => {
      if (task.status === 'completed') completedTasks++;
      progressSum += task.progress;
      if (task.priority === 'critical') criticalTasksCount++;
    });

    return {
      totalTasks: group.tasks.length,
      completedTasks,
      averageProgress: Math.round(progressSum / group.tasks.length),
      criticalTasksCount,
    };
  }, [groups]);

  return {
    groups,
    setGroups,
    collapsedGroups,
    toggleGroup,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    dragState,
    startDrag,
    updateDrag,
    endDrag,
    stats,
    workloadStats,
    getGroupStats,
  };
}
