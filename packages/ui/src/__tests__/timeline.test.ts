import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { attachTimelineDevtools, timeline, timelineScoped } from '../utils/motion';
import { MotionValue } from '../motion/value';

describe('timeline() factory and PixonTimeline', () => {
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

  it('supports controller timeScale/scrub in timeline(tracks) mode', () => {
    const tl = timeline(
      [
        {
          target: el,
          keyframes: [{ opacity: 0 }, { opacity: 1 }],
          duration: 500,
          at: 100,
        },
      ],
      { timeScale: 1.5, scrub: true }
    );
    const ctrl = tl.play();
    expect(ctrl.getTimeScale()).toBe(1.5);
    expect(ctrl.getDuration()).toBe(600);
    ctrl.setTimeScale(2);
    expect(ctrl.getTimeScale()).toBe(2);
    ctrl.scrub(0.5);
    expect((ctrl.getAnimations()[0] as any).currentTime).toBe(300);
  });

  it('supports labels and relative at positions in timeline(tracks)', () => {
    const tl = timeline([
      {
        target: el,
        keyframes: [{ opacity: 0 }, { opacity: 1 }],
        duration: 300,
        label: 'intro',
        at: 100,
      },
      {
        target: el,
        keyframes: [{ transform: 'translateX(0px)' }, { transform: 'translateX(40px)' }],
        duration: 200,
        at: 'intro+=80',
      },
      {
        target: el,
        keyframes: [{ transform: 'scale(0.8)' }, { transform: 'scale(1)' }],
        duration: 150,
        atLabel: 'intro',
        at: '+=40',
      },
    ]);

    tl.play();
    const calls = (Element.prototype.animate as any).mock.calls;
    expect(calls.length).toBeGreaterThanOrEqual(3);
    expect(calls[0][1].delay).toBe(100);
    expect(calls[1][1].delay).toBe(180);
    expect(calls[2][1].delay).toBe(140);
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

  it('supports labels and at/atLabel expressions', () => {
    const tl = timeline({ easing: 'ease-out' });
    tl
      .label('intro', 120)
      .add(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 300, at: 'intro+=80' })
      .add(el, [{ transform: 'translateX(0px)' }, { transform: 'translateX(20px)' }], { duration: 200, atLabel: 'intro', at: '+=40' });

    tl.play();

    const calls = (Element.prototype.animate as any).mock.calls;
    expect(calls.length).toBeGreaterThanOrEqual(2);
    expect(calls[0][1].delay).toBe(200);
    expect(calls[1][1].delay).toBe(160);
  });

  it('runs timeline callbacks with call()', () => {
    vi.useFakeTimers();
    const cb = vi.fn();
    const tl = timeline();
    tl.call(cb, 120);
    tl.play();
    expect(cb).not.toHaveBeenCalled();
    vi.advanceTimersByTime(119);
    expect(cb).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(cb).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('supports sync() and labeled call()', () => {
    vi.useFakeTimers();
    const cb = vi.fn();
    const tl = timeline();
    tl
      .label('intro', 100)
      .add(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 300, at: 'intro' })
      .sync('intro')
      .add(el, [{ transform: 'translateY(30px)' }, { transform: 'translateY(0px)' }], { duration: 220, delay: 20 })
      .call(cb, 'intro+=150');

    tl.play();

    const calls = (Element.prototype.animate as any).mock.calls;
    expect(calls.length).toBeGreaterThanOrEqual(2);
    expect(calls[0][1].delay).toBe(100);
    expect(calls[1][1].delay).toBe(120);

    vi.advanceTimersByTime(249);
    expect(cb).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(cb).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('supports to()/fromTo()/set() aliases', () => {
    const tl = timeline();
    tl
      .to(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 100, at: 80 })
      .fromTo(el, { transform: 'scale(0.8)' }, { transform: 'scale(1)' }, { duration: 200, at: '+=40' })
      .set(el, { opacity: 1 }, 'start+=20');

    tl.play();

    const calls = (Element.prototype.animate as any).mock.calls;
    expect(calls.length).toBeGreaterThanOrEqual(3);
    expect(calls[0][1].delay).toBe(80);
    expect(calls[1][1].delay).toBe(220);
    expect(calls[2][1].delay).toBe(20);
    expect(calls[2][1].duration).toBe(0);
  });

  it('supports builder then() alias and chain() composition', () => {
    vi.useFakeTimers();
    const cb = vi.fn();
    const tl = timeline();
    tl
      .chain((seq) => {
        seq.label('intro', 80);
        seq.to(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 200, at: 'intro' });
      })
      .then(cb, 'intro+=120');

    tl.play();

    const calls = (Element.prototype.animate as any).mock.calls;
    expect(calls[0][1].delay).toBe(80);

    vi.advanceTimersByTime(199);
    expect(cb).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(cb).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('supports scope() for selector resolution', () => {
    const scopeA = document.createElement('div');
    scopeA.id = 'scope-a';
    const scopeB = document.createElement('div');
    scopeB.id = 'scope-b';
    const itemA = document.createElement('div');
    itemA.className = 'scoped-item';
    const itemB = document.createElement('div');
    itemB.className = 'scoped-item';
    scopeA.appendChild(itemA);
    scopeB.appendChild(itemB);
    document.body.appendChild(scopeA);
    document.body.appendChild(scopeB);

    timeline()
      .scope('#scope-a')
      .to('.scoped-item', [{ opacity: 0 }, { opacity: 1 }], { duration: 120 })
      .to('.scoped-item', [{ opacity: 0 }, { opacity: 1 }], { duration: 120, scope: '#scope-b' })
      .play();

    const instances = (Element.prototype.animate as any).mock.instances as Element[];
    expect(instances).toContain(itemA);
    expect(instances).toContain(itemB);

    document.body.removeChild(scopeA);
    document.body.removeChild(scopeB);
  });

  it('supports timelineScoped() helper', () => {
    const scopeRoot = document.createElement('div');
    const inScope = document.createElement('div');
    const outScope = document.createElement('div');
    inScope.className = 'scope-node';
    outScope.className = 'scope-node';
    scopeRoot.appendChild(inScope);
    document.body.appendChild(scopeRoot);
    document.body.appendChild(outScope);

    timelineScoped(scopeRoot)
      .to('.scope-node', [{ opacity: 0 }, { opacity: 1 }], { duration: 120 })
      .play();

    const instances = (Element.prototype.animate as any).mock.instances as Element[];
    expect(instances).toContain(inScope);
    expect(instances).not.toContain(outScope);

    document.body.removeChild(scopeRoot);
    document.body.removeChild(outScope);
  });

  it('supports pause/resume for timeline callbacks', () => {
    vi.useFakeTimers();
    const cb = vi.fn();
    const tl = timeline();
    tl
      .add(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 400 })
      .call(cb, 300);

    const ctrl = tl.play();
    const first = ctrl.getAnimations()[0] as any;

    vi.advanceTimersByTime(120);
    if (first) first.currentTime = 120;
    ctrl.pause();

    vi.advanceTimersByTime(500);
    expect(cb).not.toHaveBeenCalled();

    ctrl.resume();
    vi.advanceTimersByTime(179);
    expect(cb).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(cb).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('seek()/finish() update callbacks deterministically', () => {
    vi.useFakeTimers();
    const cbA = vi.fn();
    const cbB = vi.fn();
    const tl = timeline();
    tl.call(cbA, 120).call(cbB, 260);
    const ctrl = tl.play();

    ctrl.seek(200);
    expect(cbA).toHaveBeenCalledTimes(1);
    expect(cbB).not.toHaveBeenCalled();

    ctrl.finish();
    expect(cbB).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('controller playback methods delegate to WAAPI animations', () => {
    const tl = timeline().add(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
    const ctrl = tl.play();
    const anim = ctrl.getAnimations()[0] as any;
    const playSpy = vi.spyOn(anim, 'play');
    const pauseSpy = vi.spyOn(anim, 'pause');
    const reverseSpy = vi.spyOn(anim, 'reverse');
    const finishSpy = vi.spyOn(anim, 'finish');

    ctrl.pause();
    ctrl.resume();
    ctrl.play();
    ctrl.reverse();
    ctrl.finish();

    expect(pauseSpy).toHaveBeenCalled();
    expect(playSpy).toHaveBeenCalled();
    expect(reverseSpy).toHaveBeenCalled();
    expect(finishSpy).toHaveBeenCalled();
  });

  it('exposes finished promise and controller.then()', async () => {
    vi.useFakeTimers();
    const cb = vi.fn();
    const tl = timeline().call(cb, 140);
    const ctrl = tl.play();
    const doneSpy = vi.fn();
    ctrl.then(doneSpy);

    vi.advanceTimersByTime(139);
    await Promise.resolve();
    expect(doneSpy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    await ctrl.finished;
    expect(cb).toHaveBeenCalledTimes(1);
    expect(doneSpy).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('applies timeScale to callback timing', () => {
    vi.useFakeTimers();
    const cb = vi.fn();
    const tl = timeline({ timeScale: 2 });
    tl.call(cb, 200);
    tl.play();

    vi.advanceTimersByTime(99);
    expect(cb).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(cb).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('supports setTimeScale during playback', () => {
    vi.useFakeTimers();
    const cb = vi.fn();
    const tl = timeline();
    tl.add(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 600 }).call(cb, 400);
    const ctrl = tl.play();
    const anim = ctrl.getAnimations()[0] as any;

    vi.advanceTimersByTime(100);
    if (anim) anim.currentTime = 100;
    ctrl.setTimeScale(4);

    vi.advanceTimersByTime(74);
    expect(cb).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(cb).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('supports scrub mode without autoplay', () => {
    vi.useFakeTimers();
    const cb = vi.fn();
    const tl = timeline({ scrub: true }).add(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 400 }).call(cb, 200);
    const ctrl = tl.play();
    const anim = ctrl.getAnimations()[0] as any;

    expect(anim?.currentTime).toBe(0);
    vi.advanceTimersByTime(500);
    expect(cb).not.toHaveBeenCalled();

    ctrl.scrub(0.5);
    expect(cb).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('reports timeline duration via getDuration()', () => {
    const sibling = document.createElement('div');
    document.body.appendChild(sibling);
    const cb = vi.fn();

    const ctrl = timeline()
      .add([el, sibling], [{ opacity: 0 }, { opacity: 1 }], {
        duration: 300,
        delay: 20,
        stagger: 100,
        at: 50,
      })
      .call(cb, 600)
      .play();

    expect(ctrl.getDuration()).toBe(600);
    document.body.removeChild(sibling);
  });

  it('supports nested timelines with addTimeline() and timeScale', () => {
    vi.useFakeTimers();
    const cb = vi.fn();
    const child = timeline()
      .to(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 300, at: 80 })
      .call(cb, 280);

    const parent = timeline().addTimeline(child, { at: 100, timeScale: 2 });
    parent.play();

    const calls = (Element.prototype.animate as any).mock.calls;
    expect(calls.length).toBeGreaterThanOrEqual(1);
    expect(calls[0][1].delay).toBe(140); // 100 + (80 / 2)
    expect(calls[0][1].duration).toBe(150); // 300 / 2

    vi.advanceTimersByTime(239);
    expect(cb).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(cb).toHaveBeenCalledTimes(1); // 100 + (280 / 2) = 240
    vi.useRealTimers();
  });

  it('propagates nested labels with prefix and parent expressions', () => {
    const child = timeline()
      .label('intro', 120)
      .to(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 120, at: 'intro' });

    timeline()
      .addTimeline(child, { at: 100, label: 'hero', timeScale: 2 })
      .to(el, [{ transform: 'translateX(0px)' }, { transform: 'translateX(10px)' }], { duration: 80, at: 'hero.intro+=20' })
      .play();

    const calls = (Element.prototype.animate as any).mock.calls;
    expect(calls.length).toBeGreaterThanOrEqual(2);
    expect(calls[0][1].delay).toBe(160); // 100 + 120/2
    expect(calls[1][1].delay).toBe(180); // hero.intro(160) + 20
  });

  it('supports nested timelines via nest(callback)', () => {
    const parent = timeline().nest((child) => {
      child
        .to(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 120, at: 40 })
        .to(el, [{ transform: 'translateY(20px)' }, { transform: 'translateY(0px)' }], { duration: 80, at: '+=20' });
    }, { at: 60 });

    parent.play();

    const calls = (Element.prototype.animate as any).mock.calls;
    expect(calls.length).toBeGreaterThanOrEqual(2);
    expect(calls[0][1].delay).toBe(100); // 60 + 40
    expect(calls[1][1].delay).toBe(240); // 60 + (40 + 120 + 20)
  });

  it('binds scrub to MotionValue source', () => {
    const source = new MotionValue(0);
    const ctrl = timeline({ scrub: true })
      .add(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 500 })
      .play();

    const unbind = ctrl.bindScrub(source, { immediate: true });
    const anim = ctrl.getAnimations()[0] as any;
    expect(anim.currentTime).toBe(0);

    source.set(0.6);
    source.flush();
    expect(anim.currentTime).toBe(300);

    unbind();
    source.set(0.2);
    source.flush();
    expect(anim.currentTime).toBe(300);
  });

  it('exposes debug snapshot for runtime tooling', () => {
    const ctrl = timeline({ scrub: true })
      .label('intro', 100)
      .to(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 300, at: 'intro' })
      .call(() => {}, 'intro+=60')
      .play();

    const debug = ctrl.getDebugSnapshot();
    expect(debug.duration).toBe(400);
    expect(debug.segmentCount).toBe(1);
    expect(debug.callbackCount).toBe(1);
    expect(debug.scrub).toBe(true);
    expect(debug.labels).toContain('intro');
  });

  it('attaches and detaches timeline devtools overlay', () => {
    const ctrl = timeline({ scrub: true })
      .to(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 200 })
      .play();

    const detach = attachTimelineDevtools(ctrl, { title: 'Test Devtools' });
    const overlay = Array.from(document.querySelectorAll('div')).find((node) => node.textContent?.includes('Test Devtools'));
    expect(overlay).toBeTruthy();

    detach();
    const removed = Array.from(document.querySelectorAll('div')).find((node) => node.textContent?.includes('Test Devtools'));
    expect(removed).toBeFalsy();
  });

  it('cancel() clears pending call() callbacks', () => {
    vi.useFakeTimers();
    const cb = vi.fn();
    const tl = timeline();
    tl.call(cb, 300);
    const ctrl = tl.play();
    ctrl.cancel();
    vi.advanceTimersByTime(600);
    expect(cb).not.toHaveBeenCalled();
    vi.useRealTimers();
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
