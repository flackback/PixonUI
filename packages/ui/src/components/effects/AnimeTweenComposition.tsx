import React, { useEffect, useMemo, useRef } from 'react';
import { cn } from '../../utils/cn';
import { usePixonAnimate } from '../../hooks/usePixonAnimate';
import { calculateStagger } from '../../utils/motion';

export interface AnimeTweenCompositionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Grid columns/rows. Defaults to the pen's 5x5 layout. */
  grid?: [cols: number, rows: number];
  /** Square size in rem. Defaults to 4.75 (matches the pen). */
  squareSizeRem?: number;
  /** Gap between squares in rem. Defaults to 0.125 (matches the pen). */
  gapRem?: number;
}

const COLORS = {
  red: '#FF4B4B',
  orange: '#FF8F42',
  skyblue: '#61C3FF',
  kingblue: '#5A87FF',
} as const;

function ease(name: string): string {
  // Reasonable WAAPI-friendly approximations for the pen eases.
  switch (name) {
    case 'linear':
      return 'linear';
    case 'inOutQuad':
      return 'cubic-bezier(.455, .03, .515, .955)';
    case 'inOutQuart':
      return 'cubic-bezier(0.77, 0, 0.175, 1)';
    // anime's out(4) is "out quart" — use a snappy ease-out curve.
    case 'out(4)':
      return 'cubic-bezier(0.16, 1, 0.3, 1)';
    default:
      return name;
  }
}

function animeStaggerMs(
  eachMs: number,
  opts: { grid: [number, number]; from: 'center' | 'first' | 'last' | number; start?: number }
) {
  return (index: number, total: number) =>
    calculateStagger(index, total, {
      amount: eachMs,
      delay: opts.start ?? 0,
      grid: opts.grid,
      from: opts.from,
    });
}

function Square({
  index,
  total,
  grid,
  sizeRem,
  gapRem,
}: {
  index: number;
  total: number;
  grid: [number, number];
  sizeRem: number;
  gapRem: number;
}) {
  const { ref, animate } = usePixonAnimate<HTMLDivElement>();
  const loopAbort = useRef<AbortController | null>(null);

  const delayFrom14 = useMemo(() => animeStaggerMs(120, { grid, from: 14 })(index, total), [grid, index, total]);
  const delayFrom10 = useMemo(() => animeStaggerMs(120, { grid, from: 10 })(index, total), [grid, index, total]);
  const introDelay = useMemo(
    () => animeStaggerMs(120, { grid, from: 'center', start: 240 })(index, total),
    [grid, index, total]
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Start hidden for the intro.
    el.style.color = COLORS.red;
    el.style.boxShadow = '0 0 0 0 rgba(0, 0, 0, 0)';
    el.style.transform = 'scale(0)';

    // Intro scale (use replace to seed a base scale(1) transform).
    animate([{ transform: 'scale(0)' }, { transform: 'scale(1)' }], {
      duration: 500,
      delay: introDelay,
      easing: ease('inOutQuad'),
      fill: 'forwards',
    });

    // Staggered loop: re-run as two chained WAAPI animations to support per-tween stagger.
    loopAbort.current?.abort();
    const aborter = new AbortController();
    loopAbort.current = aborter;

    const run = async () => {
      while (!aborter.signal.aborted) {
        const a1 = animate(
          [{ transform: 'translateX(-50%)' }, { transform: 'translateX(50px)' }],
          { duration: 1000, delay: delayFrom14, easing: ease('inOutQuart'), iterations: 1, additive: true }
        );
        try {
          await a1?.finished;
        } catch {}
        if (aborter.signal.aborted) break;

        const a2 = animate(
          [{ transform: 'translateX(50px)' }, { transform: 'translateX(-50%)' }],
          { duration: 1000, delay: delayFrom10, easing: ease('inOutQuart'), iterations: 1, additive: true }
        );
        try {
          await a2?.finished;
        } catch {}
      }
    };

    void run();

    return () => {
      aborter.abort();
    };
  }, [animate, delayFrom10, delayFrom14, introDelay, ref]);

  const onMouseEnter = () => {
    const el = ref.current;
    if (!el) return;
    if (el.dataset.clicked) return;

    animate(
      [
        { transform: 'scale(1.4)' },
        { transform: 'scale(0.5)', offset: 4000 / 6000 },
        { transform: 'scale(1.6)' },
      ],
      { duration: 6000, easing: ease('out(4)'), additive: true }
    );
    animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(45deg)' }], {
      duration: 2000,
      easing: ease('inOutQuart'),
      additive: true,
    });

    // zIndex isn't animatable; set it directly.
    el.style.zIndex = '999';
    el.dataset.hover = 'true';

    animate([{ color: el.style.color || COLORS.red }, { color: el.dataset.clicked ? COLORS.skyblue : COLORS.orange }], {
      duration: 300,
      easing: ease('out(4)'),
      fill: 'forwards',
    });
    animate(
      [{ boxShadow: el.style.boxShadow || '0 0 0 0 rgba(0, 0, 0, 0)' }, { boxShadow: '0 0 10px 0 rgba(0, 0, 0, .3)' }],
      { duration: 900, easing: ease('out(4)'), fill: 'forwards' }
    );
  };

  const onMouseDown = () => {
    const el = ref.current;
    if (!el) return;

    animate([{ transform: 'scale(1.6)' }, { transform: 'scale(1)' }], {
      duration: 400,
      easing: ease('inOutQuad'),
      additive: true,
    });

    el.style.zIndex = '1';
    const clicked = !!el.dataset.clicked;
    if (clicked) el.removeAttribute('data-clicked');
    else el.dataset.clicked = 'true';

    animate([{ color: el.style.color || COLORS.red }, { color: clicked ? COLORS.red : COLORS.kingblue }], {
      duration: 800,
      easing: ease('inOutQuad'),
      fill: 'forwards',
    });
  };

  const onMouseLeave = () => {
    const el = ref.current;
    if (!el) return;

    // Reset hover state.
    el.removeAttribute('data-hover');
    el.style.zIndex = '1';

    animate([{ transform: 'scale(1.6)' }, { transform: 'scale(1)' }], {
      duration: 500,
      easing: ease('out(4)'),
      additive: true,
    });
    animate([{ transform: 'rotate(45deg)' }, { transform: 'rotate(0deg)' }], {
      duration: 1200,
      easing: ease('out(4)'),
      additive: true,
    });

    const clicked = !!el.dataset.clicked;
    animate([{ color: el.style.color || COLORS.red }, { color: clicked ? COLORS.kingblue : COLORS.red }], {
      duration: 500,
      easing: ease('out(4)'),
      fill: 'forwards',
    });
    animate([{ boxShadow: el.style.boxShadow || '0 0 10px 0 rgba(0, 0, 0, .3)' }, { boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)' }], {
      duration: 500,
      easing: 'linear',
      fill: 'forwards',
    });
  };

  const onMouseUp = () => {
    const el = ref.current;
    if (!el) return;

    const clicked = !!el.dataset.clicked;
    const hover = !!el.dataset.hover;

    el.style.zIndex = hover ? '999' : '1';

    const targetScale = clicked ? 1 : hover ? 1.2 : 1;
    animate([{ transform: `scale(${targetScale})` }], {
      duration: 500,
      easing: ease('out(4)'),
      additive: true,
    });

    const targetColor = clicked ? COLORS.kingblue : hover ? COLORS.orange : COLORS.red;
    animate([{ color: el.style.color || COLORS.red }, { color: targetColor }], {
      duration: 500,
      easing: ease('out(4)'),
      fill: 'forwards',
    });
  };

  return (
    <div
      ref={ref}
      className="relative"
      style={{
        width: `${sizeRem}rem`,
        height: `${sizeRem}rem`,
        margin: `${gapRem}rem`,
        backgroundColor: 'currentColor',
        willChange: 'transform, box-shadow, color',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    />
  );
}

export function AnimeTweenComposition({
  className,
  grid = [5, 5],
  squareSizeRem = 4.75,
  gapRem = 0.125,
  ...props
}: AnimeTweenCompositionProps) {
  const total = grid[0] * grid[1];

  return (
    <div
      className={cn('flex flex-wrap items-center justify-center', className)}
      style={{ width: `${grid[0] * (squareSizeRem + gapRem * 2)}rem` }}
      {...props}
    >
      {Array.from({ length: total }).map((_, i) => (
        <Square key={i} index={i} total={total} grid={grid} sizeRem={squareSizeRem} gapRem={gapRem} />
      ))}
    </div>
  );
}

export default AnimeTweenComposition;
