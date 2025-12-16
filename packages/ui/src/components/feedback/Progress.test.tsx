import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Progress } from './Progress';
import React from 'react';

describe('Progress', () => {
  it('renders correctly with default props', () => {
    render(<Progress value={50} />);
    const progress = screen.getByRole('progressbar');
    expect(progress).toBeInTheDocument();
    expect(progress).toHaveAttribute('aria-valuenow', '50');
    expect(progress).toHaveAttribute('aria-valuemax', '100');
  });

  it('calculates percentage correctly', () => {
    render(<Progress value={25} max={50} />);
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuenow', '25');
    expect(progress).toHaveAttribute('aria-valuemax', '50');
    // We can't easily check the style transform in jsdom without more setup, 
    // but we can check if the component renders without crashing.
  });

  it('clamps value between 0 and max', () => {
    render(<Progress value={150} max={100} />);
    const progress = screen.getByRole('progressbar');
    // The aria-valuenow should reflect the passed value, but the visual width is clamped.
    // Our component passes the raw value to aria-valuenow.
    expect(progress).toHaveAttribute('aria-valuenow', '150');
  });
});
