import { describe, it, expect } from 'vitest';
import { toChannelVars } from '../motion/transformChannels';
import { prepareChannelKeyframes } from '../motion/keyframes';

describe('transform channels', () => {
  it('maps shorthands to channel CSS vars with correct units', () => {
    const vars = toChannelVars({ x: 12, y: -4, rotate: 360, scale: 1.2 }, 'gesture');
    expect(vars).toMatchObject({
      '--px-xg': '12px',
      '--px-yg': '-4px',
      '--px-rotateg': '360deg',
      '--px-scaleg': '1.2',
    });
  });

  it('converts keyframes to channel vars and strips transform shorthands', () => {
    const kfs = prepareChannelKeyframes({ x: [0, 10], rotate: [0, 90] }, 'scroll');
    expect(Array.isArray(kfs)).toBe(true);
    expect(kfs.length).toBe(2);
    expect(kfs[0]).not.toHaveProperty('x');
    expect(kfs[0]).not.toHaveProperty('rotate');
    expect(kfs[0]).toMatchObject({ '--px-xs': '0px', '--px-rotates': '0deg' });
    expect(kfs[1]).toMatchObject({ '--px-xs': '10px', '--px-rotates': '90deg' });
  });
});

