import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Kanban } from './Kanban';
import React from 'react';

const mockColumns = [
  { id: 'todo', title: 'To Do' },
  { id: 'done', title: 'Done' }
];

const mockTasks = [
  { id: '1', title: 'Task 1', columnId: 'todo' },
  { id: '2', title: 'Task 2', columnId: 'todo' }
];

describe('Kanban', () => {
  it('renders columns and tasks', () => {
    render(
      <Kanban 
        columns={mockColumns} 
        tasks={mockTasks} 
        onTaskMove={() => {}} 
      />
    );
    
    expect(screen.getByText('To Do')).toBeTruthy();
    expect(screen.getByText('Done')).toBeTruthy();
    expect(screen.getByText('Task 1')).toBeTruthy();
    expect(screen.getByText('Task 2')).toBeTruthy();
  });

  it('calls onTaskRemove when remove button is clicked', () => {
    const onTaskRemove = vi.fn();
    render(
      <Kanban 
        columns={mockColumns} 
        tasks={mockTasks} 
        onTaskMove={() => {}} 
        onTaskRemove={onTaskRemove}
      />
    );
    
    const removeButtons = screen.getAllByRole('button').filter(btn => btn.querySelector('svg.lucide-trash2'));
    fireEvent.click(removeButtons[0]!);
    
    expect(onTaskRemove).toHaveBeenCalledWith('1');
  });

  it('respects pageSize for lazy loading', () => {
    const manyTasks = Array.from({ length: 20 }, (_, i) => ({
      id: String(i),
      title: `Task ${i}`,
      columnId: 'todo'
    }));

    render(
      <Kanban 
        columns={mockColumns} 
        tasks={manyTasks} 
        onTaskMove={() => {}} 
        pageSize={5}
      />
    );
    
    // Should only show 5 tasks initially
    expect(screen.queryByText('Task 0')).toBeTruthy();
    expect(screen.queryByText('Task 4')).toBeTruthy();
    expect(screen.queryByText('Task 5')).toBeFalsy();
  });
});
