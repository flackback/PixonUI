import { describe, expect, it } from 'vitest';
import { resolveDragConstraintBounds } from '../components/interactions/dragConstraints';

describe('dragConstraints resolver', () => {
  it('returns numeric constraints as-is', () => {
    expect(resolveDragConstraintBounds({ left: -30, right: 80 }, null, 0, 0)).toEqual({ left: -30, right: 80 });
  });

  it('resolves ref constraints to offset bounds using element rects', () => {
    const container = document.createElement('div');
    const node = document.createElement('div');

    container.getBoundingClientRect = () =>
      ({ left: 0, top: 10, right: 200, bottom: 210, width: 200, height: 200, x: 0, y: 10, toJSON: () => ({}) }) as DOMRect;
    node.getBoundingClientRect = () =>
      ({ left: 50, top: 70, right: 150, bottom: 120, width: 100, height: 50, x: 50, y: 70, toJSON: () => ({}) }) as DOMRect;

    const bounds = resolveDragConstraintBounds({ current: container }, node, 12, -8);
    expect(bounds).toEqual({
      left: -38,
      right: 62,
      top: -68,
      bottom: 82,
    });
  });
});
