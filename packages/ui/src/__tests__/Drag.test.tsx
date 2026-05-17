import { describe, expect, test, vi } from 'vitest';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Drag } from '../components/interactions/Drag';

describe('Drag', () => {
  test('supports dragConstraints by ref object', async () => {
    const boundsRef = React.createRef<HTMLDivElement>();
    render(
      <div ref={boundsRef}>
        <Drag data-testid="drag-root" drag="x" dragElastic={0} dragInertia={false} dragConstraints={boundsRef}>
          <div className="drag-target">handle</div>
        </Drag>
      </div>
    );

    const wrapper = boundsRef.current as HTMLDivElement;
    const item = screen.getByTestId('drag-root') as HTMLElement;

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
    fireEvent.mouseMove(window, { clientX: 340, clientY: 30 });
    fireEvent.mouseUp(window);

    await waitFor(() => {
      expect(item.style.transform).toContain('translate3d(50px');
    });
  });
});
