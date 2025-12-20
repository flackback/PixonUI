import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Calendar } from './Calendar';
import React from 'react';

describe('Calendar', () => {
  it('renders correctly', () => {
    render(<Calendar />);
    expect(screen.getByText(/January|February|March|April|May|June|July|August|September|October|November|December/)).toBeInTheDocument();
  });

  it('navigates months', () => {
    render(<Calendar value={new Date(2024, 0, 1)} />); // Jan 2024
    expect(screen.getByText(/January/)).toBeInTheDocument();
    expect(screen.getByText(/2024/)).toBeInTheDocument();

    const buttons = screen.getAllByRole('button');
    
    const prevBtn = buttons[0];
    if (!prevBtn) throw new Error('Previous button not found');
    fireEvent.click(prevBtn);
    expect(screen.getByText(/December/)).toBeInTheDocument();
    expect(screen.getByText(/2023/)).toBeInTheDocument();
    
    const nextBtn = buttons[1]; 
    if (!nextBtn) throw new Error('Next button not found');
    // Wait, if we clicked prev, we are in Dec 2023.
    // Clicking next (which is the 2nd button) should go back to Jan 2024.
    fireEvent.click(nextBtn);
    expect(screen.getByText(/January/)).toBeInTheDocument();
    expect(screen.getByText(/2024/)).toBeInTheDocument();
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
