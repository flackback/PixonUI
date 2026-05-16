import React, { useEffect } from 'react';
import { render, waitFor, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { motion, useAnimationControls } from '../components/effects/Animate';

function Harness({ onReady }: { onReady: (controls: any) => void }) {
  const controls = useAnimationControls();

  useEffect(() => {
    onReady(controls);
  }, [controls, onReady]);

  return (
    <div>
      {[0, 1, 2].map((i) => (
        <motion.div key={i} data-testid={`dot-${i}`} animate={controls} staggerIdx={i} />
      ))}
    </div>
  );
}

describe('motion staggerIdx precedence', () => {
  it('uses element staggerIdx instead of inherited context index', async () => {
    let controls: any = null;
    const { getByTestId } = render(<Harness onReady={(c) => { controls = c; }} />);

    await waitFor(() => expect(controls).toBeTruthy());

    act(() => {
      controls.set((idx: number) => ({ x: idx * 10 }));
    });

    const dot0 = getByTestId('dot-0');
    const dot1 = getByTestId('dot-1');
    const dot2 = getByTestId('dot-2');

    expect(dot0.style.getPropertyValue('--px-x')).toBe('0px');
    expect(dot1.style.getPropertyValue('--px-x')).toBe('10px');
    expect(dot2.style.getPropertyValue('--px-x')).toBe('20px');
  });
});

