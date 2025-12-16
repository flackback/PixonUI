import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DatePicker } from './DatePicker';
import React from 'react';

describe('DatePicker', () => {
  it('renders placeholder correctly', () => {
    render(<DatePicker placeholder="Select date" />);
    expect(screen.getByText('Select date')).toBeInTheDocument();
  });

  it('opens calendar on click', () => {
    render(<DatePicker />);
    fireEvent.click(screen.getByText('Pick a date'));
    expect(screen.getByText(/January|February|March|April|May|June|July|August|September|October|November|December/)).toBeInTheDocument();
  });

  it('selects a date and closes', () => {
    const handleChange = vi.fn();
    render(<DatePicker onChange={handleChange} />);
    
    fireEvent.click(screen.getByText('Pick a date'));
    
    // Find a day to click, e.g., 15
    fireEvent.click(screen.getByText('15'));
    
    expect(handleChange).toHaveBeenCalled();
    // Should close popover (Calendar should disappear)
    // Note: Popover animation might delay removal, but queryByText should fail if it's unmounted or hidden?
    // Our Popover implementation uses conditional rendering for content: if (!context.isOpen) return null;
    // So it should be gone immediately from DOM.
    expect(screen.queryByText(/January|February/)).not.toBeInTheDocument();
  });
});
