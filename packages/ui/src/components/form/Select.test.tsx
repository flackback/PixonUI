import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Select } from './Select';
import React from 'react';

const options = [
  { label: 'Option 1', value: 'opt1' },
  { label: 'Option 2', value: 'opt2' },
  { label: 'Option 3', value: 'opt3' },
];

describe('Select', () => {
  it('renders correctly with placeholder', () => {
    render(<Select options={options} placeholder="Choose..." />);
    expect(screen.getByText('Choose...')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<Select options={options} label="My Select" />);
    expect(screen.getByText('My Select')).toBeInTheDocument();
  });

  it('opens dropdown on click', () => {
    render(<Select options={options} />);
    const trigger = screen.getByRole('combobox');
    
    fireEvent.click(trigger);
    
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('selects an option and calls onChange', () => {
    const handleChange = vi.fn();
    render(<Select options={options} onChange={handleChange} />);
    
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    
    const option = screen.getByText('Option 2');
    fireEvent.click(option);
    
    expect(handleChange).toHaveBeenCalledWith('opt2');
    // Dropdown should close (not be in document or not visible, but simple check is if it's gone from query if we conditionally render)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('displays selected value', () => {
    render(<Select options={options} value="opt3" />);
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<Select options={options} error="Selection required" />);
    expect(screen.getByText('Selection required')).toBeInTheDocument();
  });

  it('is disabled when prop is set', () => {
    const handleChange = vi.fn();
    render(<Select options={options} disabled onChange={handleChange} />);
    
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(handleChange).not.toHaveBeenCalled();
  });
});
