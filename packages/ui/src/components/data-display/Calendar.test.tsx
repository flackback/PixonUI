import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Calendar } from './Calendar';
import React from 'react';

describe('Calendar', () => {
  it('renders correctly', () => {
    render(<Calendar />);
    expect(screen.getByText(/January|February|March|April|May|June|July|August|September|October|November|December/)).toBeTruthy();
  });

  it('navigates months', () => {
    render(<Calendar value={new Date(2024, 0, 1)} />); // Jan 2024
    expect(screen.getByText(/January/)).toBeTruthy();
    expect(screen.getByText(/2024/)).toBeTruthy();

    const buttons = screen.getAllByRole('button');
    
    fireEvent.click(buttons[0]!);
    expect(screen.getByText(/December/)).toBeTruthy();
    expect(screen.getByText(/2023/)).toBeTruthy();
    
    // Wait, if we clicked prev, we are in Dec 2023.
    // Clicking next (which is the 2nd button) should go back to Jan 2024.
    fireEvent.click(buttons[1]!);
    expect(screen.getByText(/January/)).toBeTruthy();
    expect(screen.getByText(/2024/)).toBeTruthy();
  });

  it('selects a date', () => {
    const handleChange = vi.fn();
    render(<Calendar value={new Date(2024, 0, 1)} onChange={handleChange} />);
    
    // Click on day 15
    fireEvent.click(screen.getByText('15'));
    
    expect(handleChange).toHaveBeenCalled();
    const date = handleChange.mock.calls[0]![0] as Date;
    expect(date.getDate()).toBe(15);
    expect(date.getMonth()).toBe(0); // Jan
    expect(date.getFullYear()).toBe(2024);
  });
});
