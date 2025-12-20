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
    
    expect(screen.getByText('To Do')).toBeDefined();
    expect(screen.getByText('Done')).toBeDefined();
    expect(screen.getByText('Task 1')).toBeDefined();
    expect(screen.getByText('Task 2')).toBeDefined();
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
    const removeBtn = removeButtons[0];
    if (!removeBtn) throw new Error('Remove button not found');
    fireEvent.click(removeBtn);
    
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
    expect(screen.queryByText('Task 0')).toBeDefined();
    expect(screen.queryByText('Task 4')).toBeDefined();
    expect(screen.queryByText('Task 5')).toBeNull();
  });
});
