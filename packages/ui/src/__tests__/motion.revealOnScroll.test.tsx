import { describe, expect, it, vi, beforeAll, afterAll } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import { motion } from '../components/effects/Animate';

describe('motion revealOnScroll preset', () => {
  const OriginalIO = (globalThis as any).IntersectionObserver;
  const originalAnimate = (Element.prototype as any).animate;
  const originalGetAnimations = (Element.prototype as any).getAnimations;
  let observerCallback: ((entries: Array<{ isIntersecting: boolean }>) => void) | null = null;

  beforeAll(() => {
    (Element.prototype as any).animate = vi.fn(() => ({
      finished: Promise.resolve(),
      cancel: vi.fn(),
      commitStyles: vi.fn(),
      playState: 'running',
      effect: { getTiming: () => ({ duration: 300 }) },
    }));
    (Element.prototype as any).getAnimations = vi.fn(() => []);
    (globalThis as any).IntersectionObserver = vi.fn((cb) => {
      observerCallback = cb;
      return {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: vi.fn(() => []),
      root: null,
      rootMargin: '',
      thresholds: [],
    };
    });
  });

  afterAll(() => {
    (globalThis as any).IntersectionObserver = OriginalIO;
    (Element.prototype as any).animate = originalAnimate;
    (Element.prototype as any).getAnimations = originalGetAnimations;
  });

  it('renders with revealOnScroll and does not leak prop to DOM', () => {
    render(
      <motion.div data-testid="node" revealOnScroll>
        Hello
      </motion.div>
    );

    const node = screen.getByTestId('node');
    expect(node).toBeTruthy();
    expect(node.getAttribute('revealonscroll')).toBeNull();
  });

  it('keeps reveal spring as a single batched animation', async () => {
    render(
      <motion.div
        data-testid="spring-node"
        revealOnScroll
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      >
        Reveal
      </motion.div>
    );

    ((Element.prototype as any).animate as ReturnType<typeof vi.fn>).mockClear();

    act(() => {
      observerCallback?.([{ isIntersecting: true }]);
    });

    await waitFor(() => {
      expect((Element.prototype as any).animate).toHaveBeenCalled();
    });

    const calls = ((Element.prototype as any).animate as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls).toHaveLength(1);
  });
});
