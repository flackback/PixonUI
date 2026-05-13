import { expect, test, describe } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { ScrollScene } from '../components/effects/ScrollScene';

describe('ScrollScene', () => {
  test('renders with generated timeline styles', () => {
    const { container } = render(
      <ScrollScene
        from={{ opacity: 0, scale: 0.5 }}
        to={{ opacity: 1, scale: 1 }}
        timeline="view"
        range={{ start: 'entry 0%', end: 'cover 50%' }}
      >
        <div data-testid="scene-content">Content</div>
      </ScrollScene>
    );

    // It should render a wrapper
    const wrapper = container.querySelector('div') as HTMLElement;
    expect(wrapper).not.toBeNull();
    expect(wrapper.className).toContain('scroll-scene-wrapper-');
    
    // Check injected styles for variables
    const styleAttr = wrapper.getAttribute('style');
    expect(styleAttr).toContain('--pixon-init-opacity: 0');
    expect(styleAttr).toContain('--pixon-init-scale: 0.5');
    expect(styleAttr).toContain('--pixon-anim-opacity: 1');
    expect(styleAttr).toContain('--pixon-anim-scale: 1');
  });

  test('honors the as prop', () => {
    const { container } = render(
      <ScrollScene from={{}} to={{}} as="section">
        <p>Section</p>
      </ScrollScene>
    );
    expect(container.querySelector('section')).not.toBeNull();
  });
});
