import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Motion } from '../components/feedback/Motion';

describe('Motion willChange behavior', () => {
  const originalAnimate = Element.prototype.animate;
  const originalIO = window.IntersectionObserver;

  beforeEach(() => {
    // Standard mock that does nothing
    window.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    })) as any;
  });

  afterEach(() => {
    Element.prototype.animate = originalAnimate;
    window.IntersectionObserver = originalIO;
    vi.restoreAllMocks();
  });

  it('applies willChange dynamically and removes it after animation', async () => {
    const mockAnimate = vi.fn().mockReturnValue({
      cancel: vi.fn(),
      onfinish: null,
    });
    Element.prototype.animate = mockAnimate as any;

    render(
      <Motion 
        data-testid="motion" 
        animate={{ opacity: 1 }} 
        viewport={false}
      >
        Test
      </Motion>
    );

    const el = screen.getByTestId('motion');
    expect(el.style.willChange).toBe('transform, opacity, filter');

    const animationInstance = mockAnimate.mock.results[0].value;
    await act(async () => {
      if (animationInstance.onfinish) {
        animationInstance.onfinish();
      }
    });

    await waitFor(() => {
      expect(el.style.willChange).toBe('auto');
    });
  });

  it('pauses infinite loops when off-screen', async () => {
    let observers: any[] = [];
    window.IntersectionObserver = vi.fn().mockImplementation((cb) => {
      const obs = { cb, observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };
      observers.push(obs);
      return obs;
    }) as any;

    const mockPause = vi.fn();
    const mockPlay = vi.fn();
    Element.prototype.animate = vi.fn().mockReturnValue({
      pause: mockPause,
      play: mockPlay,
      playState: 'running',
      cancel: vi.fn(),
    }) as any;

    const { unmount } = render(
      <Motion 
        data-testid="motion-infinite" 
        animate={{ x: [0, 100] }} 
        transition={{ repeat: 'infinite', type: 'spring' }}
      >
        Infinite
      </Motion>
    );

    const el = screen.getByTestId('motion-infinite');

    // Trigger all observers to signal off-screen
    await act(async () => {
      observers.forEach(o => o.cb([{ isIntersecting: false, target: el }]));
    });

    await waitFor(() => {
      expect(el.style.willChange).toBe('auto');
    });
    expect(mockPause).toHaveBeenCalled();

    // Signal on-screen
    await act(async () => {
      observers.forEach(o => o.cb([{ isIntersecting: true, target: el }]));
    });

    await waitFor(() => {
      expect(el.style.willChange).toBe('transform, opacity, filter');
    });
    
    unmount();
  });
});



