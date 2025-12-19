import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Checkbox } from './Checkbox';
import { Switch } from './Switch';
import React from 'react';

describe('Checkbox', () => {
  it('renders correctly with label', () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByLabelText('Accept terms')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('handles change events', () => {
    const handleChange = vi.fn();
    render(<Checkbox onChange={handleChange} label="Check me" />);
    
    const checkbox = screen.getByLabelText('Check me');
    fireEvent.click(checkbox);
    
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(checkbox).toBeChecked();
  });

  it('shows error message', () => {
    render(<Checkbox label="Terms" error="Must accept terms" />);
    expect(screen.getByText('Must accept terms')).toBeInTheDocument();
  });

  it('is disabled when prop is set', () => {
    render(<Checkbox label="Disabled" disabled />);
    expect(screen.getByLabelText('Disabled')).toBeDisabled();
  });
});

describe('Switch', () => {
  it('renders correctly with label', () => {
    render(<Switch label="Notifications" />);
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('handles change events', () => {
    const handleChange = vi.fn();
    render(<Switch onChange={handleChange} label="Toggle me" />);
    
    const toggle = screen.getByLabelText('Toggle me');
    fireEvent.click(toggle);
    
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(toggle).toBeChecked();
  });

  it('shows error message', () => {
    render(<Switch label="Settings" error="Failed to save" />);
    expect(screen.getByText('Failed to save')).toBeInTheDocument();
  });

  it('is disabled when prop is set', () => {
    render(<Switch label="Disabled" disabled />);
    expect(screen.getByLabelText('Disabled')).toBeDisabled();
  });
});
