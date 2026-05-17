import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useRef } from 'react';
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

  it('supports dragConstraints via ref container (Framer-like)', () => {
    function Demo() {
      const constraintsRef = useRef<HTMLDivElement>(null);
      return (
        <div ref={constraintsRef} data-testid="constraints-root">
          <motion.div data-testid="drag-node-ref" drag dragElastic={0} dragMomentum={false} dragConstraints={constraintsRef}>
            Drag me
          </motion.div>
        </div>
      );
    }

    render(<Demo />);
    const root = screen.getByTestId('constraints-root') as HTMLDivElement;
    const node = screen.getByTestId('drag-node-ref') as HTMLDivElement;

    root.getBoundingClientRect = vi.fn(
      () => ({ left: 0, top: 0, right: 200, bottom: 200, width: 200, height: 200, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect
    );
    node.getBoundingClientRect = vi.fn(
      () => ({ left: 50, top: 50, right: 150, bottom: 150, width: 100, height: 100, x: 50, y: 50, toJSON: () => ({}) }) as DOMRect
    );

    fireEvent.pointerDown(node, { pointerId: 7, button: 0, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(window, { pointerId: 7, clientX: 320, clientY: 340 });
    fireEvent.pointerUp(window, { pointerId: 7, clientX: 320, clientY: 340 });

    expect(node.style.getPropertyValue('--px-xd')).toBe('50px');
    expect(node.style.getPropertyValue('--px-yd')).toBe('50px');
  });
});
