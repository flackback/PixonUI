import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MotionValue } from '../motion/value';
import { timeline } from '../utils/motion';
import { useTimelineScrub } from './useTimelineScrub';

describe('useTimelineScrub', () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement('div');
    document.body.appendChild(el);

    if (!Element.prototype.animate) {
      Element.prototype.animate = () => ({}) as any;
    }
    vi.spyOn(Element.prototype, 'animate').mockImplementation(() => ({
      play: vi.fn(),
      pause: vi.fn(),
      reverse: vi.fn(),
      finish: vi.fn(),
      cancel: vi.fn(),
      currentTime: 0,
      onfinish: null,
      oncancel: null,
    } as any));
  });

  afterEach(() => {
    document.body.removeChild(el);
    vi.restoreAllMocks();
  });

  it('scrubs timeline from MotionValue without render loop', () => {
    const source = new MotionValue(0);
    const ctrl = timeline({ scrub: true })
      .add(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 400 })
      .play();
    const anim = ctrl.getAnimations()[0] as any;

    const { unmount } = renderHook(() => useTimelineScrub(ctrl, source, { immediate: true }));
    expect(anim.currentTime).toBe(0);

    act(() => {
      source.set(0.75);
      source.flush();
    });
    expect(anim.currentTime).toBe(300);

    unmount();
    act(() => {
      source.set(0.2);
      source.flush();
    });
    expect(anim.currentTime).toBe(300);
  });
});

