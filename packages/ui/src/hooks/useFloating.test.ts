import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useFloating } from './useFloating';

describe('useFloating', () => {
  beforeEach(() => {
    // Mock ResizeObserver
    global.ResizeObserver = vi.fn().mockImplementation(function(this: any) {
      this.observe = vi.fn();
      this.unobserve = vi.fn();
      this.disconnect = vi.fn();
    });
  });

  it('should initialize with default position', () => {
    const triggerRef = { current: document.createElement('div') };
    const contentRef = { current: document.createElement('div') };

    const { result } = renderHook(() => useFloating(triggerRef, contentRef));

    expect(result.current.position).toEqual({ top: 0, left: 0 });
    expect(result.current.isPositioned).toBe(false);
  });

  it('should calculate position when open', () => {
    const trigger = document.createElement('div');
    const content = document.createElement('div');

    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 150,
      left: 100,
      right: 200,
      width: 100,
      height: 50,
    } as DOMRect);

    vi.spyOn(content, 'getBoundingClientRect').mockReturnValue({
      width: 80,
      height: 40,
    } as DOMRect);

    const triggerRef = { current: trigger };
    const contentRef = { current: content };

    const { result } = renderHook(() => useFloating(triggerRef, contentRef, { isOpen: true }));

    // Default side is 'bottom', align is 'center'
    // top = trigger.bottom + sideOffset(4) = 150 + 4 = 154
    // left = trigger.left + (trigger.width/2) - (content.width/2) = 100 + 50 - 40 = 110
    expect(result.current.position).toEqual({ top: 154, left: 110 });
    expect(result.current.isPositioned).toBe(true);
  });
});
