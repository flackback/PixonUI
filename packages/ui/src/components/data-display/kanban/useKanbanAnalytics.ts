import { useMemo } from 'react';
import type { KanbanTask, KanbanColumnDef } from './types';

export interface ColumnMetric {
  columnId: string;
  columnTitle: string;
  taskCount: number;
  percentage: number;
  limit?: number;
  isOverLimit: boolean;
  totalEstimatedTime: number;
  totalTimeSpent: number;
}

export interface BottleneckReport {
  columnId: string;
  columnTitle: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
}

export interface OverloadReport {
  assigneeName: string;
  taskCount: number;
  highPriorityCount: number;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface PredictiveModel {
  estimatedHoursToComplete: number;
  confidenceScore: number; // 0 - 100
  bottleneckDetected: boolean;
  neglectedTasksCount: number;
  recommendedVelocityMultiplier: number;
}

export interface KanbanAnalytics {
  totalTasks: number;
  activeTasks: number;
  archivedTasks: number;
  completedTasks: number;
  blockedTasks: number;
  completionRate: number; // percentage (0 - 100)
  blockingRate: number; // percentage (0 - 100)
  totalEstimatedTime: number; // in seconds or custom metrics unit
  totalTimeSpent: number; // in seconds
  averageTimeSpentPerTask: number; // in seconds
  columnsMetrics: ColumnMetric[];
  priorityDistribution: Record<string, { count: number, percentage: number }>;
  tagDistribution: Record<string, { count: number, percentage: number }>;
  assigneeDistribution: Record<string, { count: number, percentage: number, completedCount: number }>;
  subtaskCompletionRate: number; // percentage (0 - 100)
  checklistCompletionRate: number; // percentage (0 - 100)
  
  // Heuristic Intelligence Metrics (Exceeding clickup/jira benchmarks)
  bottlenecks: BottleneckReport[];
  overloads: OverloadReport[];
  predictions: PredictiveModel;
}

export function useKanbanAnalytics(tasks: KanbanTask[], columns: KanbanColumnDef[]): KanbanAnalytics {
  return useMemo(() => {
    const totalTasks = tasks.length;
    if (totalTasks === 0) {
      return {
        totalTasks: 0,
        activeTasks: 0,
        archivedTasks: 0,
        completedTasks: 0,
        blockedTasks: 0,
        completionRate: 0,
        blockingRate: 0,
        totalEstimatedTime: 0,
        totalTimeSpent: 0,
        averageTimeSpentPerTask: 0,
        columnsMetrics: columns.map(col => ({
          columnId: col.id,
          columnTitle: col.title,
          taskCount: 0,
          percentage: 0,
          limit: col.limit,
          isOverLimit: false,
          totalEstimatedTime: 0,
          totalTimeSpent: 0,
        })),
        priorityDistribution: {},
        tagDistribution: {},
        assigneeDistribution: {},
        subtaskCompletionRate: 0,
        checklistCompletionRate: 0,
        bottlenecks: [],
        overloads: [],
        predictions: {
          estimatedHoursToComplete: 0,
          confidenceScore: 100,
          bottleneckDetected: false,
          neglectedTasksCount: 0,
          recommendedVelocityMultiplier: 1.0
        }
      };
    }

    const activeTasks = tasks.filter(t => !t.archived).length;
    const archivedTasks = tasks.filter(t => t.archived).length;
    
    // Assume last column or columns containing 'done' or 'complete' are completed
    const doneColumnIds = new Set(
      columns
        .filter((col, idx) => col.id.toLowerCase().includes('done') || col.id.toLowerCase().includes('complete') || idx === columns.length - 1)
        .map(col => col.id)
    );

    const completedTasks = tasks.filter(t => doneColumnIds.has(t.columnId) && !t.archived).length;
    const blockedTasks = tasks.filter(t => t.blockedBy && t.blockedBy.length > 0 && !t.archived).length;

    const completionRate = Math.round((completedTasks / (activeTasks || 1)) * 100);
    const blockingRate = Math.round((blockedTasks / (activeTasks || 1)) * 100);

    let totalEstimatedTime = 0;
    let totalTimeSpent = 0;
    let subtasksCount = 0;
    let completedSubtasksCount = 0;
    let checklistCount = 0;
    let completedChecklistCount = 0;
    let neglectedTasksCount = 0;

    const priorityCounts: Record<string, number> = { urgent: 0, high: 0, medium: 0, low: 0, neutral: 0 };
    const tagCounts: Record<string, number> = {};
    const assigneeCounts: Record<string, { count: number, completedCount: number, highPriorityCount: number }> = {};
    const columnTasksMap: Record<string, KanbanTask[]> = {};

    columns.forEach(col => {
      columnTasksMap[col.id] = [];
    });

    const now = new Date().getTime();

    tasks.forEach(task => {
      if (task.archived) return;

      // Map to columns
      const colTasks = columnTasksMap[task.columnId];
      if (colTasks) {
        colTasks.push(task);
      }

      // Time tracking
      totalEstimatedTime += task.estimatedTime || 0;
      totalTimeSpent += task.timeSpent || 0;

      // Subtasks
      if (task.subtasks && task.subtasks.length > 0) {
        task.subtasks.forEach(sub => {
          subtasksCount++;
          if (sub.completed) completedSubtasksCount++;
        });
      }

      // Checklist
      if (task.checklist && task.checklist.length > 0) {
        task.checklist.forEach(item => {
          checklistCount++;
          if (item.completed) completedChecklistCount++;
        });
      }

      // Neglected (stale) Tasks: No updates in last 3 days
      if (task.updatedAt) {
        const updateTime = new Date(task.updatedAt).getTime();
        const diffDays = (now - updateTime) / (1000 * 60 * 60 * 24);
        if (diffDays >= 3 && !doneColumnIds.has(task.columnId)) {
          neglectedTasksCount++;
        }
      }

      // Priorities
      const priority = task.priority || 'neutral';
      priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;

      // Tags
      if (task.tags && task.tags.length > 0) {
        task.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }

      // Assignees
      if (task.assignee) {
        const key = task.assignee.name || task.assignee.id;
        const entry = assigneeCounts[key] || { count: 0, completedCount: 0, highPriorityCount: 0 };
        entry.count++;
        if (doneColumnIds.has(task.columnId)) {
          entry.completedCount++;
        }
        if (task.priority === 'high' || task.priority === 'urgent') {
          entry.highPriorityCount++;
        }
        assigneeCounts[key] = entry;
      }
    });

    // Subtask rates
    const subtaskCompletionRate = subtasksCount > 0 
      ? Math.round((completedSubtasksCount / subtasksCount) * 100) 
      : 0;

    const checklistCompletionRate = checklistCount > 0 
      ? Math.round((completedChecklistCount / checklistCount) * 100) 
      : 0;

    // Column metrics
    const columnsMetrics = columns.map(col => {
      const colTasks = columnTasksMap[col.id] || [];
      const taskCount = colTasks.length;
      const percentage = Math.round((taskCount / (activeTasks || 1)) * 100);
      const isOverLimit = col.limit ? taskCount > col.limit : false;
      const colEstimated = colTasks.reduce((acc, t) => acc + (t.estimatedTime || 0), 0);
      const colSpent = colTasks.reduce((acc, t) => acc + (t.timeSpent || 0), 0);

      return {
        columnId: col.id,
        columnTitle: col.title,
        taskCount,
        percentage,
        limit: col.limit,
        isOverLimit,
        totalEstimatedTime: colEstimated,
        totalTimeSpent: colSpent,
      };
    });

    // Format distributions
    const priorityDistribution: Record<string, { count: number, percentage: number }> = {};
    Object.keys(priorityCounts).forEach(key => {
      const count = priorityCounts[key] || 0;
      if (count > 0) {
        priorityDistribution[key] = {
          count,
          percentage: Math.round((count / activeTasks) * 100),
        };
      }
    });

    const tagDistribution: Record<string, { count: number, percentage: number }> = {};
    Object.keys(tagCounts).forEach(key => {
      const count = tagCounts[key] || 0;
      tagDistribution[key] = {
        count,
        percentage: Math.round((count / activeTasks) * 100),
      };
    });

    const assigneeDistribution: Record<string, { count: number, percentage: number, completedCount: number }> = {};
    Object.keys(assigneeCounts).forEach(key => {
      const entry = assigneeCounts[key] || { count: 0, completedCount: 0, highPriorityCount: 0 };
      assigneeDistribution[key] = {
        count: entry.count,
        percentage: Math.round((entry.count / activeTasks) * 100),
        completedCount: entry.completedCount,
      };
    });

    const averageTimeSpentPerTask = completedTasks > 0 
      ? Math.round(totalTimeSpent / completedTasks) 
      : 0;

    // --- HEURISTIC INTELLIGENCE ENGINE ---
    
    // 1. Detect Bottlenecks
    const bottlenecks: BottleneckReport[] = [];
    columnsMetrics.forEach(col => {
      if (doneColumnIds.has(col.columnId)) return;

      if (col.isOverLimit) {
        bottlenecks.push({
          columnId: col.columnId,
          columnTitle: col.columnTitle,
          severity: 'critical',
          reason: `WIP limit exceeded (${col.taskCount}/${col.limit} tasks). Move work downstream before adding more.`
        });
      } else if (col.percentage >= 40 && activeTasks > 4) {
        bottlenecks.push({
          columnId: col.columnId,
          columnTitle: col.columnTitle,
          severity: 'high',
          reason: `Contains ${col.percentage}% of all active tasks. Represents a major queue clog.`
        });
      } else if (col.limit && col.taskCount >= col.limit * 0.8) {
        bottlenecks.push({
          columnId: col.columnId,
          columnTitle: col.columnTitle,
          severity: 'medium',
          reason: `Approaching WIP limit capacity (${col.taskCount}/${col.limit}). Flow velocity is slowing down.`
        });
      }
    });

    // 2. Detect Assignee Overloads
    const overloads: OverloadReport[] = [];
    Object.keys(assigneeCounts).forEach(name => {
      const entry = assigneeCounts[name] || { count: 0, completedCount: 0, highPriorityCount: 0 };
      const activeCount = entry.count - entry.completedCount;

      if (activeCount >= 6) {
        overloads.push({
          assigneeName: name,
          taskCount: activeCount,
          highPriorityCount: entry.highPriorityCount,
          severity: 'high',
          recommendation: `Holding ${activeCount} active tasks. Distribute new tasks to other team members immediately to avoid burn out.`
        });
      } else if (entry.highPriorityCount >= 3) {
        overloads.push({
          assigneeName: name,
          taskCount: activeCount,
          highPriorityCount: entry.highPriorityCount,
          severity: 'high',
          recommendation: `Handling ${entry.highPriorityCount} high/urgent priority tasks simultaneously. High risk of contextual slippage.`
        });
      } else if (activeCount >= 4) {
        overloads.push({
          assigneeName: name,
          taskCount: activeCount,
          highPriorityCount: entry.highPriorityCount,
          severity: 'medium',
          recommendation: `Has ${activeCount} active tasks. Monitor task progression closely.`
        });
      }
    });

    // 3. Predictive Modeling (Confidence & Estimations)
    const remainingTasks = activeTasks - completedTasks;
    let estimatedHoursToComplete = 0;
    
    // Project based on average completion time per task, or fallback to 4 hours per task
    if (averageTimeSpentPerTask > 0) {
      estimatedHoursToComplete = Math.round((remainingTasks * averageTimeSpentPerTask) / 3600);
    } else if (totalEstimatedTime > 0) {
      // If estimatedTime is set in custom field or hours
      estimatedHoursToComplete = Math.round(totalEstimatedTime - (totalTimeSpent / 3600));
      if (estimatedHoursToComplete < 0) estimatedHoursToComplete = remainingTasks * 3;
    } else {
      estimatedHoursToComplete = remainingTasks * 4; // 4 hours heuristic fallback
    }

    // Compute Confidence Score
    let confidenceScore = 100;
    
    // Penalize score based on risks
    confidenceScore -= bottlenecks.length * 15;
    confidenceScore -= overloads.filter(o => o.severity === 'high').length * 10;
    confidenceScore -= blockedTasks * 8;
    confidenceScore -= neglectedTasksCount * 5;

    // Bounds
    confidenceScore = Math.max(10, Math.min(100, confidenceScore));

    // Recommend flow velocity multiplier (e.g. speed up by 1.5x)
    let recommendedVelocityMultiplier = 1.0;
    if (bottlenecks.length > 0 || blockedTasks > 0) {
      recommendedVelocityMultiplier = parseFloat((1.0 + (bottlenecks.length * 0.15) + (blockedTasks * 0.1)).toFixed(2));
    }

    return {
      totalTasks,
      activeTasks,
      archivedTasks,
      completedTasks,
      blockedTasks,
      completionRate,
      blockingRate,
      totalEstimatedTime,
      totalTimeSpent,
      averageTimeSpentPerTask,
      columnsMetrics,
      priorityDistribution,
      tagDistribution,
      assigneeDistribution,
      subtaskCompletionRate,
      checklistCompletionRate,
      bottlenecks,
      overloads,
      predictions: {
        estimatedHoursToComplete,
        confidenceScore,
        bottleneckDetected: bottlenecks.length > 0,
        neglectedTasksCount,
        recommendedVelocityMultiplier
      }
    };
  }, [tasks, columns]);
}
