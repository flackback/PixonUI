import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Motion } from '../components/feedback/Motion';

describe('Motion willChange behavior', () => {
  it('applies willChange dynamically and removes it after animation', async () => {
    // Mock animate function
    const mockCancel = vi.fn();
    const mockAnimate = vi.fn().mockReturnValue({
      cancel: mockCancel,
      onfinish: null,
    });
    
    Element.prototype.animate = mockAnimate as any;

    const { rerender } = render(
      <Motion data-testid="motion" animate={{ opacity: 1 }} transition={{ duration: 100 }}>
        Test
      </Motion>
    );

    const el = screen.getByTestId('motion');

    // Due to the initial render triggering the effect
    // animate should be called and component state isAnimating should be true
    
    // In our implementation, inline style gets willChange: transform, opacity, filter
    // Note: since this happens during the effect, the first render might have auto,
    // then it updates to will-change string. Wait for effect:
    await act(async () => {
      // allow effects to flush
    });

    expect(el.style.willChange).toBe('transform, opacity, filter');

    // Trigger onfinish to complete animation
    const animationInstance = mockAnimate.mock.results[0].value;
    
    await act(async () => {
      if (animationInstance.onfinish) {
        animationInstance.onfinish();
      }
    });

    // willChange should revert to 'auto'
    expect(el.style.willChange).toBe('auto');
  });
});
