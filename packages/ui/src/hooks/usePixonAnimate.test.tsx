/// <reference types="node" />
import { render, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { usePixonAnimate, type UsePixonAnimateReturn } from './usePixonAnimate';
import React, { useEffect } from 'react';

type Api = UsePixonAnimateReturn<HTMLDivElement>;

function makeAnim() {
  let resolveFinished: (() => void) | null = null;
  let rejectFinished: (() => void) | null = null;
  const finished = new Promise<void>((resolve, reject) => {
    resolveFinished = resolve;
    rejectFinished = () => reject(new Error('cancelled'));
  });

  const anim: any = {
    playState: 'running',
    currentTime: 100,
    effect: { getTiming: () => ({ duration: 400 }) },
    commitStyles: vi.fn(),
    cancel: vi.fn(() => {
      // Mirror WAAPI: cancel typically rejects/interrupts `finished`.
      rejectFinished?.();
    }),
    finished,
    _resolveFinished: () => resolveFinished?.(),
  };
  return anim;
}

function Harness({ onReady }: { onReady: (api: Api) => void }) {
  const api = usePixonAnimate<HTMLDivElement>();

  useEffect(() => {
    onReady(api);
  }, [onReady, api]);

  return <div ref={api.ref} />;
}

describe('usePixonAnimate', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('cancels previous main animation on replace to avoid stacking', async () => {
    const a1 = makeAnim();
    const a2 = makeAnim();
    const onCancelledComplete = vi.fn();
    if (!(Element.prototype as any).animate) (Element.prototype as any).animate = () => ({}) as any;
    const animateSpy = vi
      .spyOn(Element.prototype as any, 'animate')
      .mockReturnValueOnce(a1)
      .mockReturnValueOnce(a2);

    let api: Api | null = null;
    render(<Harness onReady={(next) => { api = next; }} />);

    await waitFor(() => expect(api?.ref.current).toBeTruthy());

    act(() => {
      api!.animate({ opacity: 1 }, { duration: 200, onComplete: onCancelledComplete });
    });
    expect(animateSpy).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(api!.isAnimating).toBe(true));

    act(() => {
      api!.animate({ opacity: 0.5 }, { duration: 200 });
    });
    expect(animateSpy).toHaveBeenCalledTimes(2);
    expect(a1.commitStyles).toHaveBeenCalled();
    expect(a1.cancel).toHaveBeenCalled();
    await act(async () => {
      await Promise.resolve();
    });
    expect(onCancelledComplete).not.toHaveBeenCalled();
    await waitFor(() => expect(api!.isAnimating).toBe(true));

    act(() => {
      api!.cancel();
    });
    expect(a2.cancel).toHaveBeenCalled();
    await waitFor(() => expect(api!.isAnimating).toBe(false));
  });

  it('converts transform shortcuts into channel CSS vars when enabled', async () => {
    const a1 = makeAnim();
    if (!(Element.prototype as any).animate) (Element.prototype as any).animate = () => ({}) as any;
    const animateSpy = vi.spyOn(Element.prototype as any, 'animate').mockReturnValueOnce(a1);

    // Ensure the "typed custom properties" path is taken in test env.
    const prevCSS = (globalThis as any).CSS;
    (globalThis as any).CSS = { ...(prevCSS || {}), registerProperty: vi.fn() };

    let api: Api | null = null;
    render(<Harness onReady={(next) => { api = next; }} />);
    await waitFor(() => expect(api?.ref.current).toBeTruthy());

    act(() => {
      api!.animate(
        { x: 12, y: -4, rotateX: 10, rotateY: -20, scale: 1.1, opacity: 0.8 },
        { duration: 100, transformMode: 'channels', channel: 'gesture' }
      );
    });

    const keyframes = animateSpy.mock.calls[0][0] as Keyframe[];
    const last = keyframes[keyframes.length - 1] as any;
    // In JSDOM, WAAPI keyframes may normalize opacity to `null` when not animating opacity,
    // so we validate only the channel vars for this test.
    expect(last).not.toHaveProperty('x');
    expect(last).not.toHaveProperty('y');
    expect(last).not.toHaveProperty('rotateX');
    expect(last).not.toHaveProperty('rotateY');
    expect(last).not.toHaveProperty('scale');
    expect(last).not.toHaveProperty('transform');
    expect(last).toMatchObject({
      '--px-xg': '12px',
      '--px-yg': '-4px',
      '--px-rotateXg': '10deg',
      '--px-rotateYg': '-20deg',
      '--px-scaleg': '1.1',
    });

    (globalThis as any).CSS = prevCSS;
  });

  it('tracks additive animations without flipping isAnimating early', async () => {
    const a1 = makeAnim();
    const a2 = makeAnim();
    if (!(Element.prototype as any).animate) (Element.prototype as any).animate = () => ({}) as any;
    vi.spyOn(Element.prototype as any, 'animate').mockReturnValueOnce(a1).mockReturnValueOnce(a2);

    let api: Api | null = null;
    render(<Harness onReady={(next) => { api = next; }} />);
    await waitFor(() => expect(api?.ref.current).toBeTruthy());

    act(() => {
      api!.animate({ opacity: 1 }, { duration: 200, additive: true });
      api!.animate({ transform: 'scale(1.1)' }, { duration: 200, additive: true });
    });

    await waitFor(() => expect(api!.isAnimating).toBe(true));

    // Finish first one -> still animating because second is active
    await act(async () => {
      a1._resolveFinished();
      await Promise.resolve();
    });
    await waitFor(() => expect(api!.isAnimating).toBe(true));

    await act(async () => {
      a2._resolveFinished();
      await Promise.resolve();
    });
    await waitFor(() => expect(api!.isAnimating).toBe(false));
  });

  it('does not cancel base channel when starting gesture channel (channels mode)', async () => {
    const base = makeAnim();
    const gesture = makeAnim();
    if (!(Element.prototype as any).animate) (Element.prototype as any).animate = () => ({}) as any;
    const animateSpy = vi.spyOn(Element.prototype as any, 'animate').mockReturnValueOnce(base).mockReturnValueOnce(gesture);

    let api: Api | null = null;
    render(<Harness onReady={(next) => { api = next; }} />);
    await waitFor(() => expect(api?.ref.current).toBeTruthy());

    act(() => {
      api!.animate({ x: 10 }, { duration: 120, transformMode: 'channels', channel: 'base' });
    });
    expect(animateSpy).toHaveBeenCalledTimes(1);

    act(() => {
      api!.animate({ x: -6 }, { duration: 120, transformMode: 'channels', channel: 'gesture' });
    });
    expect(animateSpy).toHaveBeenCalledTimes(2);
    expect(base.cancel).not.toHaveBeenCalled();
  });

  it('does not let a finished main animation cancel active additive animations', async () => {
    const a1 = makeAnim();
    const a2 = makeAnim();
    if (!(Element.prototype as any).animate) (Element.prototype as any).animate = () => ({}) as any;
    vi.spyOn(Element.prototype as any, 'animate').mockReturnValueOnce(a1).mockReturnValueOnce(a2);

    let api: Api | null = null;
    render(<Harness onReady={(next) => { api = next; }} />);
    await waitFor(() => expect(api?.ref.current).toBeTruthy());

    act(() => {
      api!.animate({ opacity: 1 }, { duration: 200 });
    });
    await waitFor(() => expect(api!.isAnimating).toBe(true));

    await act(async () => {
      a1._resolveFinished();
      await Promise.resolve();
    });
    await waitFor(() => expect(api!.isAnimating).toBe(false));

    act(() => {
      api!.animate({ transform: 'scale(1.1)' }, { duration: 200, additive: true });
    });
    await waitFor(() => expect(api!.isAnimating).toBe(true));

    act(() => {
      api!.cancel();
    });
    expect(a2.cancel).not.toHaveBeenCalled();
    await waitFor(() => expect(api!.isAnimating).toBe(true));
  });
});
