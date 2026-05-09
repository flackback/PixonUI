import { describe, it, expect } from 'vitest';
import { useKanbanAnalytics } from './useKanbanAnalytics';
import type { KanbanTask, KanbanColumnDef } from './types';

// Wrapper for useMemo testing outside of component render
function testKanbanAnalytics(tasks: KanbanTask[], columns: KanbanColumnDef[]) {
  // Simulating the hook return by calling the pure function logic directly
  // or because useMemo is pure, we can call it. Wait! useKanbanAnalytics 
  // uses useMemo internally so it must be run inside a component or hook render,
  // or we can mock/call the inner useMemo computation. Since we want to test it
  // directly, let's render a dummy hook or we can use React Testing Library's renderHook.
  // Let's import renderHook from '@testing-library/react'.
  return useKanbanAnalytics(tasks, columns);
}

// Since useKanbanAnalytics is a pure calculation wrapped in useMemo,
// we can test it using renderHook to safely execute it in the React context.
import { renderHook } from '@testing-library/react';

describe('useKanbanAnalytics', () => {
  const mockColumns: KanbanColumnDef[] = [
    { id: 'todo', title: 'To Do', limit: 3 },
    { id: 'progress', title: 'In Progress', limit: 2 },
    { id: 'review', title: 'Review', limit: 2 },
    { id: 'done', title: 'Done' }
  ];

  it('should handle empty task list gracefully without crashing', () => {
    const { result } = renderHook(() => useKanbanAnalytics([], mockColumns));
    
    expect(result.current.totalTasks).toBe(0);
    expect(result.current.activeTasks).toBe(0);
    expect(result.current.completedTasks).toBe(0);
    expect(result.current.completionRate).toBe(0);
    expect(result.current.bottlenecks).toEqual([]);
    expect(result.current.predictions.confidenceScore).toBe(100);
  });

  it('should calculate completion rates correctly', () => {
    const mockTasks: KanbanTask[] = [
      { id: '1', columnId: 'todo', title: 'Task 1' },
      { id: '2', columnId: 'progress', title: 'Task 2' },
      { id: '3', columnId: 'done', title: 'Task 3' }, // Completed
      { id: '4', columnId: 'done', title: 'Task 4' }, // Completed
    ];

    const { result } = renderHook(() => useKanbanAnalytics(mockTasks, mockColumns));

    expect(result.current.totalTasks).toBe(4);
    expect(result.current.activeTasks).toBe(4);
    expect(result.current.completedTasks).toBe(2);
    expect(result.current.completionRate).toBe(50); // 2 out of 4 is 50%
  });

  it('should trigger critical bottleneck when WIP limits are exceeded', () => {
    const overloadedTasks: KanbanTask[] = [
      { id: '1', columnId: 'progress', title: 'Task 1' },
      { id: '2', columnId: 'progress', title: 'Task 2' },
      { id: '3', columnId: 'progress', title: 'Task 3' }, // Limit is 2, so 3 tasks triggers over limit
    ];

    const { result } = renderHook(() => useKanbanAnalytics(overloadedTasks, mockColumns));

    expect(result.current.columnsMetrics.find(c => c.columnId === 'progress')?.isOverLimit).toBe(true);
    expect(result.current.bottlenecks.length).toBeGreaterThan(0);
    expect(result.current.bottlenecks[0]?.severity).toBe('critical');
    expect(result.current.bottlenecks[0]?.reason).toContain('WIP limit exceeded');
  });

  it('should detect assignee overload based on task count', () => {
    const mockUser = { id: 'dev1', name: 'Anderson' };
    const overloadTasks: KanbanTask[] = [
      { id: '1', columnId: 'todo', title: 'Task 1', assignee: mockUser },
      { id: '2', columnId: 'todo', title: 'Task 2', assignee: mockUser },
      { id: '3', columnId: 'todo', title: 'Task 3', assignee: mockUser },
      { id: '4', columnId: 'todo', title: 'Task 4', assignee: mockUser },
      { id: '5', columnId: 'todo', title: 'Task 5', assignee: mockUser },
      { id: '6', columnId: 'todo', title: 'Task 6', assignee: mockUser }, // 6 active tasks triggers high overload
    ];

    const { result } = renderHook(() => useKanbanAnalytics(overloadTasks, mockColumns));

    expect(result.current.overloads.length).toBe(1);
    expect(result.current.overloads[0]?.assigneeName).toBe('Anderson');
    expect(result.current.overloads[0]?.severity).toBe('high');
    expect(result.current.overloads[0]?.recommendation).toContain('Distribute new tasks');
  });

  it('should penalize delivery confidence score for high risks', () => {
    const problematicTasks: KanbanTask[] = [
      { id: '1', columnId: 'todo', title: 'Task 1', blockedBy: ['some-dependency'] }, // Blocked task penalizes confidence
      { id: '2', columnId: 'progress', title: 'Task 2' },
      { id: '3', columnId: 'progress', title: 'Task 3' },
      { id: '4', columnId: 'progress', title: 'Task 4' }, // WIP Limit exceeded (critical bottleneck)
    ];

    const { result } = renderHook(() => useKanbanAnalytics(problematicTasks, mockColumns));

    // Confidence score starts at 100 and gets subtracted for bottleneck & blocked tasks
    expect(result.current.predictions.confidenceScore).toBeLessThan(100);
    expect(result.current.predictions.bottleneckDetected).toBe(true);
  });
});
