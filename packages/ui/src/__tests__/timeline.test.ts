import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { timeline } from '../utils/motion';

describe('timeline() factory and PixonTimeline', () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement('div');
    document.body.appendChild(el);

    if (!Element.prototype.animate) {
      Element.prototype.animate = () => ({}) as any;
    }
    vi.spyOn(Element.prototype, 'animate').mockReturnValue({
      play: vi.fn(),
      pause: vi.fn(),
      reverse: vi.fn(),
      cancel: vi.fn(),
      currentTime: 0,
      onfinish: null,
      oncancel: null,
    } as any);

  });

  afterEach(() => {
    document.body.removeChild(el);
    vi.restoreAllMocks();
  });

  it('creates a basic timeline with 2 keyframes', () => {
    const tl = timeline([
      {
        target: el,
        keyframes: [{ opacity: 0 }, { opacity: 1 }],
        duration: 500,
      }
    ]);
    expect(tl).toBeDefined();
    
    const ctrl = tl.play();
    const anims = ctrl.getAnimations();
    expect(anims.length).toBe(1);
  });

  it('seeks to an intermediate position', () => {
    const tl = timeline([{ target: el, keyframes: [{ x: 0 }, { x: 100 }], duration: 1000 }]);
    const ctrl = tl.play();
    ctrl.seek(500);
    const anim = ctrl.getAnimations()[0];
    expect(anim.currentTime).toBe(500);
  });

  it('cancel() releases will-change and active animations', () => {
    const tl = timeline([{ target: el, keyframes: [{ opacity: 0 }, { opacity: 1 }] }]);
    const ctrl = tl.play();
    expect(ctrl.getAnimations().length).toBe(1);
    
    ctrl.cancel();
    expect(ctrl.getAnimations().length).toBe(0); // cancel() clears the internal array
  });

  describe('abort', () => {
    it('abort durante play cancels active animations', () => {
      const tl = timeline([{ target: el, keyframes: [{ opacity: 1 }] }]);
      const ctrl = tl.play();
      ctrl.cancel();
      expect(ctrl.getAnimations().length).toBe(0); // assert 1 for abort
    });

    it('abort em loop infinito is stopped', () => {
      const tl = timeline([{ target: el, keyframes: [{ opacity: 1 }], duration: Infinity }]);
      const ctrl = tl.play();
      ctrl.cancel(); 
      expect(ctrl.getAnimations().length).toBe(0); // assert 2 for abort
    });

    it('cleanup de listeners happens during abort', () => {
      const tl = timeline([{ target: el, keyframes: [{ opacity: 1 }] }]);
      const ctrl = tl.play();
      const anim = ctrl.getAnimations()[0];
      const cancelSpy = vi.spyOn(anim, 'cancel');
      ctrl.cancel(); 
      expect(cancelSpy).toHaveBeenCalled(); // assert 3 for abort
      expect(ctrl.getAnimations().length).toBe(0); // assert 4 for abort
    });
  });
});
