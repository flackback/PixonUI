import { expect, test, describe } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { SSRStagger } from '../components/effects/SSRStagger';

describe('SSRStagger', () => {
  test('renders children with incremental delay', () => {
    const { container } = render(
      <SSRStagger delay={100} stagger={50} preset="fadeInUp">
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <div data-testid="child-3">Child 3</div>
      </SSRStagger>
    );

    const wrappers = container.querySelectorAll('.pixon-ssr-animate');
    expect(wrappers.length).toBe(3);

    // Assert that the injected delays match delay + i * stagger
    // First element: 100 + 0 * 50 = 100
    // Second element: 100 + 1 * 50 = 150
    // Third element: 100 + 2 * 50 = 200

    expect(wrappers[0].getAttribute('style')).toContain('--pixon-delay: 100ms');
    expect(wrappers[1].getAttribute('style')).toContain('--pixon-delay: 150ms');
    expect(wrappers[2].getAttribute('style')).toContain('--pixon-delay: 200ms');
  });

  test('honors the as prop for the wrapper', () => {
    const { container } = render(
      <SSRStagger as="ul">
        <li>Item 1</li>
      </SSRStagger>
    );

    expect(container.querySelector('ul')).not.toBeNull();
  });
});
