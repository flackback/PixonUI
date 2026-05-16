import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, render } from '@testing-library/react';
import { usePixonScroll } from '../hooks/usePixonScroll';

function ScrollRenderCounter({ onRender }: { onRender: () => void }) {
  onRender();
  const { scrollYProgress } = usePixonScroll();
  if (typeof (scrollYProgress as any).get !== 'function') {
    throw new Error('scrollYProgress is not a MotionValue');
  }
  scrollYProgress.set(0.42);
  return <div data-testid="ok" />;
}

describe('usePixonScroll vNext', () => {
  it('returns MotionValues and does not force rerenders per frame', async () => {
    const onRender = vi.fn();
    render(<ScrollRenderCounter onRender={onRender} />);
    expect(onRender).toHaveBeenCalledTimes(1);

    await act(async () => {
      await Promise.resolve();
    });

    expect(onRender).toHaveBeenCalledTimes(1);
  });
});
