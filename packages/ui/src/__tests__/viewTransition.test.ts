import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { startPixonTransition } from '../utils/viewTransition';

describe('viewTransition', () => {
  let originalStartViewTransition: any;

  beforeEach(() => {
    originalStartViewTransition = document.startViewTransition;
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.startViewTransition = originalStartViewTransition;
  });

  it('uses native document.startViewTransition if available', () => {
    const mockStart = vi.fn((cb) => { cb(); return {}; });
    document.startViewTransition = mockStart as any;

    const cb = vi.fn();
    startPixonTransition(cb);

    expect(mockStart).toHaveBeenCalled();
    expect(cb).toHaveBeenCalled();
  });

  it('uses WAAPI fallback if document.startViewTransition is not available', () => {
    document.startViewTransition = undefined as any;
    
    // Mock Element.animate
    const mockAnimate = vi.fn(() => ({ finished: Promise.resolve() }));
    Element.prototype.animate = mockAnimate as any;

    const cb = vi.fn();
    startPixonTransition(cb);

    expect(cb).toHaveBeenCalled();
    expect(mockAnimate).toHaveBeenCalled();
    
    // Restore
    delete (Element.prototype as any).animate;
  });
});
