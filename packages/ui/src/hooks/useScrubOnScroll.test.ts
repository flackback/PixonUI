import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as motionHooks from '../motion/hooks';
import { MotionValue } from '../motion/value';
import { timeline } from '../utils/motion';
import { useScrubOnScroll } from './useScrubOnScroll';

describe('useScrubOnScroll', () => {
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

  it('binds scroll progress to controller scrub', () => {
    const ctrl = timeline({ scrub: true })
      .add(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 500 })
      .play();

    const scrollXProgress = new MotionValue(0);
    const scrollYProgress = new MotionValue(0);
    const useScrollSpy = vi.spyOn(motionHooks, 'useScroll');
    useScrollSpy.mockReturnValue({
      scrollX: new MotionValue(0),
      scrollY: new MotionValue(0),
      scrollXProgress,
      scrollYProgress,
    });

    renderHook(() => useScrubOnScroll(ctrl, { from: 0, to: 1 }));
    const anim = ctrl.getAnimations()[0] as any;

    act(() => {
      scrollYProgress.set(0.4);
      scrollYProgress.flush();
    });

    expect(anim.currentTime).toBe(200);
    useScrollSpy.mockRestore();
  });
});
