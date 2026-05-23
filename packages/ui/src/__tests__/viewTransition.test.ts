import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { startPixonTransition } from "../utils/motion";

describe('viewTransition', () => {
  let originalStartViewTransition: any;
  let matchMediaMock: any;

  beforeEach(() => {
    originalStartViewTransition = document.startViewTransition;
    document.body.innerHTML = '';
    matchMediaMock = vi.fn().mockReturnValue({ matches: false });
    window.matchMedia = matchMediaMock;
  });

  afterEach(() => {
    document.startViewTransition = originalStartViewTransition;
  });

  it('uses native document.startViewTransition if available', () => {
    const mockStart = vi.fn((cb) => { 
      cb(); 
      return { finished: Promise.resolve() }; 
    });
    document.startViewTransition = mockStart as any;

    const cb = vi.fn();
    startPixonTransition(cb);

    expect(mockStart).toHaveBeenCalled();
    expect(cb).toHaveBeenCalled();
  });

  it('uses overlay fallback if document.startViewTransition is not available', async () => {
    document.startViewTransition = undefined as any;
    
    const cb = vi.fn();
    const transitionPromise = startPixonTransition(cb);

    // Should have created an overlay
    const overlay = document.querySelector('[data-pixon-transition-overlay]') as HTMLElement | null;
    expect(overlay).not.toBeNull();
    expect(overlay?.style.position).toBe('fixed');

    // Simulate first transitionend
    await new Promise(resolve => requestAnimationFrame(resolve));
    overlay?.dispatchEvent(new Event('transitionend'));

    expect(cb).toHaveBeenCalled();

    // After cb, it should trigger another transition to fade out
    // Simulate second transitionend
    await Promise.resolve(); // allow update promise to resolve
    await new Promise(resolve => requestAnimationFrame(resolve));
    overlay?.dispatchEvent(new Event('transitionend'));

    await transitionPromise;
    expect(document.querySelector('[data-pixon-transition-overlay]')).toBeNull();
  });


  it('respects prefers-reduced-motion by executing update synchronously', () => {
    matchMediaMock.mockReturnValue({ matches: true });
    
    const cb = vi.fn();
    startPixonTransition(cb);

    expect(cb).toHaveBeenCalled();
    expect(document.querySelector('[data-pixon-transition-overlay]')).toBeNull();
  });

  it('does not duplicate <video> elements (no cloneNode)', async () => {
    document.startViewTransition = undefined as any;
    document.body.innerHTML = '<video id="test-video"></video>';
    
    const cb = vi.fn();
    startPixonTransition(cb);

    // Check overlay exists but video is still unique
    expect(document.querySelectorAll('video').length).toBe(1);
    expect(document.querySelector('[data-pixon-transition-overlay]')).not.toBeNull();
  });
});

