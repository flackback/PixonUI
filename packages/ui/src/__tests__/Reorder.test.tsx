import { expect, test, describe } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { Reorder, ReorderItem } from '../components/interactions/Reorder';

describe('Reorder', () => {
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
});
