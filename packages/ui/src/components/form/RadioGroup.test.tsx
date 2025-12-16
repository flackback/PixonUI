import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RadioGroup, RadioGroupItem } from './RadioGroup';
import React from 'react';

describe('RadioGroup', () => {
  it('renders correctly with label', () => {
    render(
      <RadioGroup label="Choose option">
        <RadioGroupItem value="1" label="Option 1" />
        <RadioGroupItem value="2" label="Option 2" />
      </RadioGroup>
    );
    expect(screen.getByText('Choose option')).toBeInTheDocument();
    expect(screen.getByLabelText('Option 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Option 2')).toBeInTheDocument();
  });

  it('handles selection change', () => {
    const handleChange = vi.fn();
    render(
      <RadioGroup onChange={handleChange} value="1">
        <RadioGroupItem value="1" label="Option 1" />
        <RadioGroupItem value="2" label="Option 2" />
      </RadioGroup>
    );

    const radio2 = screen.getByLabelText('Option 2');
    fireEvent.click(radio2);
    expect(handleChange).toHaveBeenCalledWith('2');
  });

  it('respects disabled state on group', () => {
    const handleChange = vi.fn();
    render(
      <RadioGroup disabled onChange={handleChange}>
        <RadioGroupItem value="1" label="Option 1" />
      </RadioGroup>
    );

    const radio = screen.getByLabelText('Option 1');
    expect(radio).toBeDisabled();
    fireEvent.click(radio);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('respects disabled state on item', () => {
    const handleChange = vi.fn();
    render(
      <RadioGroup onChange={handleChange}>
        <RadioGroupItem value="1" label="Option 1" disabled />
        <RadioGroupItem value="2" label="Option 2" />
      </RadioGroup>
    );

    const radio1 = screen.getByLabelText('Option 1');
    expect(radio1).toBeDisabled();
    fireEvent.click(radio1);
    expect(handleChange).not.toHaveBeenCalled();

    const radio2 = screen.getByLabelText('Option 2');
    expect(radio2).not.toBeDisabled();
    fireEvent.click(radio2);
    expect(handleChange).toHaveBeenCalledWith('2');
  });
});
