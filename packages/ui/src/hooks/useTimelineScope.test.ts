import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTimelineScope } from './useTimelineScope';

describe('useTimelineScope', () => {
  beforeEach(() => {
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
    vi.restoreAllMocks();
  });

  it('creates timelines scoped to the ref container', () => {
    const { result } = renderHook(() => useTimelineScope<HTMLDivElement>());
    const root = document.createElement('div');
    const inScope = document.createElement('div');
    inScope.className = 'scoped-item';
    const outScope = document.createElement('div');
    outScope.className = 'scoped-item';
    root.appendChild(inScope);
    document.body.appendChild(root);
    document.body.appendChild(outScope);

    act(() => {
      (result.current.ref as any).current = root;
    });

    act(() => {
      result.current
        .createTimeline()
        .to('.scoped-item', [{ opacity: 0 }, { opacity: 1 }], { duration: 160 })
        .play();
    });

    const instances = (Element.prototype.animate as any).mock.instances as Element[];
    expect(instances).toContain(inScope);
    expect(instances).not.toContain(outScope);

    document.body.removeChild(root);
    document.body.removeChild(outScope);
  });
});

