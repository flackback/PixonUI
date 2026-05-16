import React, { useRef } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { useMotionValue, useScroll } from '../motion/hooks';

function RenderCounter({ onRender }: { onRender: () => void }) {
  onRender();
  const mv = useMotionValue(0);
  // Touch useScroll to ensure it doesn't cause rerenders by itself.
  useScroll();
  // Update MV (should not trigger React renders unless bridged).
  mv.set(1);
  return <div data-testid="ok" />;
}

describe('MotionValue (no re-render by default)', () => {
  it('does not re-render when MotionValues update (without bridge)', async () => {
    const onRender = vi.fn();
    render(<RenderCounter onRender={onRender} />);

    // First render only.
    expect(onRender).toHaveBeenCalledTimes(1);

    // Flush microtasks/effects.
    await act(async () => {
      await Promise.resolve();
    });

    // Still no additional renders.
    expect(onRender).toHaveBeenCalledTimes(1);
  });
});

