import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Tooltip } from './Tooltip';
import React from 'react';

describe('Tooltip', () => {
  it('renders children correctly', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('shows tooltip on hover after delay', () => {
    vi.useFakeTimers();
    render(
      <Tooltip content="Tooltip text" delay={200}>
        <button>Hover me</button>
      </Tooltip>
    );

    const trigger = screen.getByText('Hover me');
    
    // Initial state: hidden
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    // Mouse enter
    fireEvent.mouseEnter(trigger);
    
    // Still hidden immediately (delay)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    // Fast forward time
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Now visible
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByText('Tooltip text')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('hides tooltip on mouse leave', () => {
    vi.useFakeTimers();
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );

    const trigger = screen.getByText('Hover me');
    
    fireEvent.mouseEnter(trigger);
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.mouseLeave(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it('shows tooltip on focus', () => {
    vi.useFakeTimers();
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Focus me</button>
      </Tooltip>
    );

    const trigger = screen.getByText('Focus me');
    
    fireEvent.focus(trigger);
    act(() => {
      vi.advanceTimersByTime(0);
    });
    
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    vi.useRealTimers();
  });
});
