import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createTimeline } from '../utils/motion';

describe('createTimeline AbortSignal support', () => {
  beforeEach(() => {
    if (!Element.prototype.animate) {
      Element.prototype.animate = () => ({}) as any;
    }
    vi.spyOn(Element.prototype, 'animate').mockReturnValue({
      finished: new Promise(() => {}),
      cancel: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as any);
  });



  afterEach(() => {
    vi.restoreAllMocks();
  });
  it('rejects if signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(createTimeline([], { signal: controller.signal }))
      .rejects.toThrowError('Aborted');
  });

  it('rejects when aborted during setup/execution', async () => {
    const controller = new AbortController();
    
    // Create an unresolvable timeline promise essentially unless mock finishes
    const promise = createTimeline([
      { target: document.createElement('div'), keyframes: [{ opacity: 1 }] }
    ], { signal: controller.signal });

    // Abort midway
    controller.abort();

    await expect(promise).rejects.toThrowError('Aborted');
  });
});
