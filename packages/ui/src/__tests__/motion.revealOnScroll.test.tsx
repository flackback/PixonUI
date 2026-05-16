import { describe, expect, it, vi, beforeAll, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { motion } from '../components/effects/Animate';

describe('motion revealOnScroll preset', () => {
  const OriginalIO = (globalThis as any).IntersectionObserver;

  beforeAll(() => {
    (globalThis as any).IntersectionObserver = vi.fn(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: vi.fn(() => []),
      root: null,
      rootMargin: '',
      thresholds: [],
    }));
  });

  afterAll(() => {
    (globalThis as any).IntersectionObserver = OriginalIO;
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
});

