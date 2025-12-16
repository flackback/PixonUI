import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Slider } from './Slider';
import React from 'react';

describe('Slider', () => {
  it('renders correctly with default props', () => {
    render(<Slider defaultValue={50} />);
    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute('aria-valuenow', '50');
  });

  it('handles keyboard navigation', () => {
    const handleChange = vi.fn();
    render(<Slider defaultValue={50} onChange={handleChange} />);
    const slider = screen.getByRole('slider');
    
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(handleChange).toHaveBeenCalledWith(51);

    fireEvent.keyDown(slider, { key: 'ArrowLeft' });
    expect(handleChange).toHaveBeenLastCalledWith(50);
  });

  it('respects min and max', () => {
    const handleChange = vi.fn();
    render(<Slider defaultValue={100} max={100} onChange={handleChange} />);
    const slider = screen.getByRole('slider');

    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(handleChange).not.toHaveBeenCalled(); // Should stay at 100
  });

  it('respects disabled state', () => {
    const handleChange = vi.fn();
    render(<Slider defaultValue={50} disabled onChange={handleChange} />);
    const slider = screen.getByRole('slider');

    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(handleChange).not.toHaveBeenCalled();
  });
});
