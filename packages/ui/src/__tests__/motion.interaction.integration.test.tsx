import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { motion } from '../components/effects/Animate';

describe('motion interactions integration', () => {
  const originalAnimate = (Element.prototype as any).animate;
  const originalGetAnimations = (Element.prototype as any).getAnimations;

  beforeAll(() => {
    (Element.prototype as any).animate = vi.fn(() => ({
      finished: Promise.resolve(),
      cancel: vi.fn(),
      commitStyles: vi.fn(),
      playState: 'running',
      effect: { getTiming: () => ({ duration: 300 }) },
    }));
    (Element.prototype as any).getAnimations = vi.fn(() => []);
  });

  afterAll(() => {
    (Element.prototype as any).animate = originalAnimate;
    (Element.prototype as any).getAnimations = originalGetAnimations;
  });

  it('keeps base + hover animation channels without crashing', () => {
    render(
      <motion.div
        data-testid="node"
        animate={{ x: 16 }}
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 300 }}
      >
        Hover me
      </motion.div>
    );

    const node = screen.getByTestId('node');
    fireEvent.mouseEnter(node);
    fireEvent.mouseLeave(node);

    expect(node.className).toContain('px-transform');
  });

  it('does not leak preset props to DOM attributes', () => {
    render(
      <motion.div
        data-testid="preset-node"
        revealOnScroll={{ delay: 120 }}
        parallax={{ axis: 'y', from: 0, to: -80 }}
        staggerChildren={{ stagger: 90, delayChildren: 30 }}
      >
        Presets
      </motion.div>
    );

    const node = screen.getByTestId('preset-node');
    expect(node.getAttribute('revealonscroll')).toBeNull();
    expect(node.getAttribute('parallax')).toBeNull();
    expect(node.getAttribute('staggerchildren')).toBeNull();
  });

  it('writes drag gesture into dedicated drag channel without rerender loop', () => {
    render(
      <motion.div data-testid="drag-node" drag dragMomentum={false}>
        Drag me
      </motion.div>
    );

    const node = screen.getByTestId('drag-node');
    fireEvent.pointerDown(node, { pointerId: 1, button: 0, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(window, { pointerId: 1, clientX: 132, clientY: 126 });
    fireEvent.pointerUp(window, { pointerId: 1, clientX: 132, clientY: 126 });

    expect(node.style.getPropertyValue('--px-xd')).toBe('32px');
    expect(node.style.getPropertyValue('--px-yd')).toBe('26px');
  });
});
