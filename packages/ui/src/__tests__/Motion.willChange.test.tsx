import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
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
    
    const originalAnimate = Element.prototype.animate;
    Element.prototype.animate = mockAnimate as any;

    const { rerender } = render(
      <Motion 
        data-testid="motion" 
        animate={{ opacity: 1 }} 
        transition={{ type: 'spring' }}
        viewport={false}
      >
        Test
      </Motion>
    );

    const el = screen.getByTestId('motion');
    
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
    await waitFor(() => {
      expect(el.style.willChange).toBe('auto');
    }, { timeout: 2000 });

    // Restore
    Element.prototype.animate = originalAnimate;
  });
});
