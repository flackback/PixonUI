import { expect, test, describe, vi, beforeAll, afterAll } from 'vitest';
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { Reorder, ReorderItem } from '../components/interactions/Reorder';

describe('Reorder', () => {
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

  test('renders Reorder and items', () => {
    const items = [1, 2, 3];
    const { container } = render(
      <Reorder values={items} onReorder={() => {}}>
        {items.map((i) => (
          <ReorderItem key={i} value={i} className="reorder-item">
            {i}
          </ReorderItem>
        ))}
      </Reorder>
    );

    const elements = container.querySelectorAll('.reorder-item');
    expect(elements.length).toBe(3);
  });

  test('supports dragConstraints by ref object', async () => {
    const boundsRef = React.createRef<HTMLDivElement>();
    const items = [1];
    const { container } = render(
      <div ref={boundsRef}>
        <Reorder axis="x" values={items} onReorder={() => {}}>
          <ReorderItem value={1} className="reorder-item" dragConstraints={boundsRef}>
            1
          </ReorderItem>
        </Reorder>
      </div>
    );

    const wrapper = boundsRef.current as HTMLDivElement;
    const item = container.querySelector('.reorder-item') as HTMLElement;

    wrapper.getBoundingClientRect = vi.fn(
      () => ({ left: 0, top: 0, right: 200, bottom: 120, width: 200, height: 120, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect
    );
    item.getBoundingClientRect = vi.fn(
      () => ({ left: 50, top: 20, right: 150, bottom: 60, width: 100, height: 40, x: 50, y: 20, toJSON: () => ({}) }) as DOMRect
    );

    fireEvent.mouseDown(item, { clientX: 100, clientY: 30 });
    await waitFor(() => {
      expect(item.style.cursor).toBe('grabbing');
    });
    fireEvent.mouseMove(window, { clientX: 360, clientY: 30 });
    fireEvent.mouseUp(window);

    await waitFor(() => {
      expect(item.style.cursor).toBe('grab');
    });
  });
});
