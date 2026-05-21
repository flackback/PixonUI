import { describe, expect, test } from 'vitest';
import type { AnimationStudioElement } from '../components/effects/AnimationStudio';
import {
  compileKeyframes,
  formatMotionOffsetRotate,
  getChildren,
  getRootElements,
  parseCubicBezierString,
  resolveElementTree,
  toLocalPoint,
  valueAt,
  wouldCreateParentCycle,
} from '../components/effects/AnimationStudio';

function element(id: string, x: number, y: number, parentId?: string): AnimationStudioElement {
  return {
    id,
    name: id,
    type: 'box',
    text: '',
    color: '',
    parentId,
    tracks: [
      { id: `${id}-x`, label: 'X', channel: 'x', keyframes: [{ id: `${id}-x0`, t: 0, v: x }] },
      { id: `${id}-y`, label: 'Y', channel: 'y', keyframes: [{ id: `${id}-y0`, t: 0, v: y }] },
      { id: `${id}-scale`, label: 'Scale', channel: 'scale', keyframes: [{ id: `${id}-s0`, t: 0, v: 1 }] },
      { id: `${id}-opacity`, label: 'Opacity', channel: 'opacity', keyframes: [{ id: `${id}-o0`, t: 0, v: 1 }] },
    ],
  };
}

describe('AnimationStudio hierarchy utilities', () => {
  test('finds root and child elements', () => {
    const elements = [element('parent', 100, 50), element('child', 20, 10, 'parent')];

    expect(getRootElements(elements).map((el) => el.id)).toEqual(['parent']);
    expect(getChildren(elements, 'parent').map((el) => el.id)).toEqual(['child']);
  });

  test('prevents parent cycles', () => {
    const elements = [
      element('a', 0, 0),
      element('b', 0, 0, 'a'),
      element('c', 0, 0, 'b'),
    ];

    expect(wouldCreateParentCycle(elements, 'a', 'c')).toBe(true);
    expect(wouldCreateParentCycle(elements, 'c', 'a')).toBe(false);
  });

  test('resolves child global position from parent transform channels', () => {
    const elements = [element('parent', 100, 50), element('child', 20, 10, 'parent')];
    const tree = resolveElementTree(elements, 0);

    expect(tree.get('child')?.globalX).toBe(120);
    expect(tree.get('child')?.globalY).toBe(60);
  });

  test('converts global child position to parent-local coordinates', () => {
    const elements = [element('parent', 100, 50), element('child', 180, 95)];

    expect(toLocalPoint(elements, 'child', 'parent', 0)).toEqual({ x: 80, y: 45 });
  });

  test('evaluates serialized cubic bezier easings', () => {
    const bezier = parseCubicBezierString('cubic-bezier(0.2, 0.8, 0.4, 1)');
    expect(bezier).toEqual([0.2, 0.8, 0.4, 1]);

    const track = {
      id: 'track',
      label: 'X',
      channel: 'x' as const,
      keyframes: [
        { id: 'a', t: 0, v: 0, easing: 'cubic-bezier(0.2, 0.8, 0.4, 1)' },
        { id: 'b', t: 1000, v: 100 },
      ],
    };

    expect(valueAt(track, 500)).toBeGreaterThan(50);
  });

  test('applies animated motion path rotate offset', () => {
    expect(formatMotionOffsetRotate('auto', 45)).toBe('auto 45deg');
    expect(formatMotionOffsetRotate('auto 180deg', -45)).toBe('auto 135deg');
    expect(formatMotionOffsetRotate('90deg', 15)).toBe('105deg');

    const keyframes = compileKeyframes({
      durationMs: 1000,
      tracks: [
        { id: 'distance', label: 'Distance', channel: 'offsetDistance', keyframes: [{ id: 'd0', t: 0, v: 50 }] },
        { id: 'rotate', label: 'Rotate Offset', channel: 'offsetRotate', keyframes: [{ id: 'r0', t: 0, v: 45 }] },
      ],
    }, {
      ...element('motion', 0, 0),
      motionPath: "path('M 0 0 L 100 0')",
      motionRotate: 'auto',
    });

    expect(keyframes[0]).toMatchObject({
      offsetPath: "path('M 0 0 L 100 0')",
      offsetDistance: '50%',
      offsetRotate: 'auto 45deg',
    });
  });

  test('compiles gradient background channels', () => {
    const keyframes = compileKeyframes({
      durationMs: 1000,
      tracks: [
        { id: 'h', label: 'Hue', channel: 'bgH', keyframes: [{ id: 'h0', t: 0, v: 270 }] },
        { id: 'a', label: 'Alpha', channel: 'bgA', keyframes: [{ id: 'a0', t: 0, v: 0.3 }] },
        { id: 'h2', label: 'Gradient Hue', channel: 'bg2H', keyframes: [{ id: 'h20', t: 0, v: 220 }] },
        { id: 'a2', label: 'Gradient Alpha', channel: 'bg2A', keyframes: [{ id: 'a20', t: 0, v: 0.2 }] },
        { id: 'angle', label: 'Gradient Angle', channel: 'bgAngle', keyframes: [{ id: 'angle0', t: 0, v: 135 }] },
      ],
    });

    expect(keyframes[0]).toMatchObject({
      backgroundColor: 'hsla(270, 80%, 50%, 0.3)',
      backgroundImage: 'linear-gradient(135deg, hsla(270, 80%, 50%, 0.3), hsla(220, 80%, 50%, 0.2))',
    });
  });

  test('compiles camera viewport channels', () => {
    const keyframes = compileKeyframes({
      durationMs: 1000,
      tracks: [
        { id: 'zoom', label: 'Camera Zoom', channel: 'cameraZoom', keyframes: [{ id: 'z0', t: 0, v: 1.25 }] },
        { id: 'panx', label: 'Camera Pan X', channel: 'cameraPanX', keyframes: [{ id: 'px0', t: 0, v: 24 }] },
        { id: 'pany', label: 'Camera Pan Y', channel: 'cameraPanY', keyframes: [{ id: 'py0', t: 0, v: -12 }] },
        { id: 'tilt', label: 'Camera Tilt', channel: 'cameraTilt', keyframes: [{ id: 't0', t: 0, v: 8 }] },
      ],
    }, {
      ...element('el-camera', 0, 0),
      id: 'el-camera',
      name: 'Virtual Camera',
      type: 'box',
      text: '',
      color: '',
      locked: true,
      visible: false,
      collapsed: true,
      tracks: [
        { id: 'zoom', label: 'Camera Zoom', channel: 'cameraZoom', keyframes: [{ id: 'z0', t: 0, v: 1.25 }] },
        { id: 'panx', label: 'Camera Pan X', channel: 'cameraPanX', keyframes: [{ id: 'px0', t: 0, v: 24 }] },
        { id: 'pany', label: 'Camera Pan Y', channel: 'cameraPanY', keyframes: [{ id: 'py0', t: 0, v: -12 }] },
        { id: 'tilt', label: 'Camera Tilt', channel: 'cameraTilt', keyframes: [{ id: 't0', t: 0, v: 8 }] },
      ],
    });

    expect(keyframes[0]).toMatchObject({
      transform: 'translate3d(-24px, 12px, 0px) scale(1.25) rotateX(8deg)',
    });
  });
});
