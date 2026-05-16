import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PixonSSRAnimate } from '../components/effects/SSRAnimate';

describe('PixonSSRAnimate component', () => {
  it('applies preset + class + css variables', () => {
    const { getByTestId } = render(
      <PixonSSRAnimate
        data-testid="node"
        preset="fadeInUp"
        transition={{ duration: 500, delay: 100 }}
      />
    );

    const node = getByTestId('node');
    expect(node.className).toContain('pixon-ssr-animate');
    expect((node as HTMLElement).style.getPropertyValue('--pixon-init-opacity')).toBe('0');
    expect((node as HTMLElement).style.getPropertyValue('--pixon-init-y')).toBe('20px');
    expect((node as HTMLElement).style.getPropertyValue('--pixon-anim-y')).toBe('0px');
    expect((node as HTMLElement).style.getPropertyValue('--pixon-dur')).toBe('500ms');
    expect((node as HTMLElement).style.getPropertyValue('--pixon-delay')).toBe('100ms');
  });

  it('infers initial opacity as 0 when animate opacity is provided', () => {
    const { getByTestId } = render(
      <PixonSSRAnimate data-testid="node" animate={{ opacity: 1 }} />
    );

    const node = getByTestId('node') as HTMLElement;
    expect(node.style.getPropertyValue('--pixon-init-opacity')).toBe('0');
    expect(node.style.getPropertyValue('--pixon-anim-opacity')).toBe('1');
  });

  it('uses view-trigger class and keeps explicit @supports guard for timeline', () => {
    const { getByTestId, container } = render(
      <PixonSSRAnimate data-testid="node" trigger="view" />
    );

    const node = getByTestId('node');
    expect(node.className).toContain('pixon-ssr-view-trigger');

    const styleText = Array.from(container.querySelectorAll('style'))
      .map((s) => s.textContent || '')
      .join('\n');
    expect(styleText).toContain('@supports (animation-timeline: view())');
  });
});

