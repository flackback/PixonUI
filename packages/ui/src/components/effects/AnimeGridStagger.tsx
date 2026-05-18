import React, { useEffect, useMemo, useRef } from 'react';
import { cn } from '../../utils/cn';
import { calculateStagger } from '../../utils/motion';

export interface AnimeGridStaggerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Grid size (rows x rows). CodePen default is 41. */
  rows?: number;
  /** Dot color. */
  dotColor?: string;
  /** Cursor color. */
  cursorColor?: string;
}

type Point = { x: number; y: number };

const DOT_STEP_REM = 1;
const DOT_SIZE_REM = 0.25;
const DOT_MARGIN_REM = 0.375;
const DOT_DELAY_MS = 50;
const DOT_DURATION_MS = 1300;
const CURSOR_PULSE_MS = 600;

const EASE_IN_OUT_QUAD = 'cubic-bezier(.455, .03, .515, .955)';
const EASE_OUT_CIRC = 'cubic-bezier(0.075, 0.82, 0.165, 1)';

function randomIndex(total: number) {
  return Math.floor(Math.random() * total);
}

function indexToPoint(index: number, rows: number): Point {
  return {
    x: index % rows,
    y: Math.floor(index / rows),
  };
}

function remDelta(index: number, fromIndex: number, rows: number, amountRem: number, axis: 'x' | 'y') {
  const current = indexToPoint(index, rows);
  const from = indexToPoint(fromIndex, rows);
  const delta = axis === 'x' ? current.x - from.x : current.y - from.y;
  return delta * amountRem;
}

function transformFromRem(x: number, y: number, scale = 1) {
  return `translate3d(${x}rem, ${y}rem, 0) scale(${scale})`;
}

export function AnimeGridStagger({
  rows = 41,
  dotColor = '#cbd5e1',
  cursorColor = '#64748b',
  className,
  style,
  ...props
}: AnimeGridStaggerProps) {
  const total = rows * rows;
  const dots = useMemo(() => Array.from({ length: total }), [total]);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const animationsRef = useRef<Set<Animation>>(new Set());
  const fromIndexRef = useRef(randomIndex(total));

  useEffect(() => {
    const cursorEl = cursorRef.current;
    if (!cursorEl) return;

    let cancelled = false;

    const cancelAll = () => {
      animationsRef.current.forEach((anim) => {
        try {
          anim.cancel();
        } catch { /* noop */ }
      });
      animationsRef.current.clear();
    };

    const schedule = (cb: () => void, delay: number) => {
      const timer = setTimeout(() => {
        timersRef.current.delete(timer);
        cb();
      }, delay);
      timersRef.current.add(timer);
    };

    const clearAllTimers = () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    };

    const setCursorPosition = (index: number) => {
      const p = indexToPoint(index, rows);
      cursorEl.style.transform = transformFromRem(p.x * DOT_STEP_REM, p.y * DOT_STEP_REM);
    };

    setCursorPosition(fromIndexRef.current);

    const runCycle = () => {
      if (cancelled) return;

      cancelAll();
      clearAllTimers();

      const fromIndex = fromIndexRef.current;
      const toIndex = randomIndex(total);

      const cursorPulse = cursorEl.animate(
        [
          { transform: `${cursorEl.style.transform} scale(0.625)` },
          { transform: `${cursorEl.style.transform} scale(1.125)` },
          { transform: `${cursorEl.style.transform} scale(1)` },
        ],
        {
          duration: CURSOR_PULSE_MS,
          easing: EASE_IN_OUT_QUAD,
          fill: 'both',
        }
      );
      animationsRef.current.add(cursorPulse);

      let maxDelayMs = 0;

      dotRefs.current.forEach((dotEl, index) => {
        if (!dotEl) return;

        const delayMs = calculateStagger(index, total, {
          amount: DOT_DELAY_MS,
          grid: [rows, rows],
          from: fromIndex,
        });
        if (delayMs > maxDelayMs) maxDelayMs = delayMs;

        const x1 = remDelta(index, fromIndex, rows, -0.175, 'x');
        const y1 = remDelta(index, fromIndex, rows, -0.175, 'y');
        const x2 = remDelta(index, fromIndex, rows, 0.125, 'x');
        const y2 = remDelta(index, fromIndex, rows, 0.125, 'y');

        const dotAnim = dotEl.animate(
          [
            { transform: transformFromRem(0, 0, 1), offset: 0 },
            { transform: transformFromRem(x1, y1, 1), offset: 200 / DOT_DURATION_MS },
            { transform: transformFromRem(x2, y2, 2), offset: 700 / DOT_DURATION_MS },
            { transform: transformFromRem(0, 0, 1), offset: 1 },
          ],
          {
            duration: DOT_DURATION_MS,
            delay: delayMs,
            easing: EASE_IN_OUT_QUAD,
            fill: 'both',
          }
        );

        animationsRef.current.add(dotAnim);
      });

      const fromPoint = indexToPoint(fromIndex, rows);
      const toPoint = indexToPoint(toIndex, rows);
      const cursorMoveDuration = 800 + Math.round(Math.random() * 400);
      const moveStartMs = Math.max(0, maxDelayMs + DOT_DURATION_MS - 1500);

      schedule(() => {
        if (cancelled) return;

        const cursorMove = cursorEl.animate(
          [
            { transform: transformFromRem(fromPoint.x * DOT_STEP_REM, fromPoint.y * DOT_STEP_REM, 1) },
            { transform: transformFromRem(toPoint.x * DOT_STEP_REM, toPoint.y * DOT_STEP_REM, 1) },
          ],
          {
            duration: cursorMoveDuration,
            easing: EASE_OUT_CIRC,
            fill: 'both',
          }
        );
        animationsRef.current.add(cursorMove);
      }, moveStartMs);

      fromIndexRef.current = toIndex;

      const cycleDuration = Math.max(maxDelayMs + DOT_DURATION_MS, moveStartMs + cursorMoveDuration) + 24;
      schedule(runCycle, cycleDuration);
    };

    runCycle();

    return () => {
      cancelled = true;
      clearAllTimers();
      cancelAll();
    };
  }, [rows, total]);

  return (
    <div
      className={cn('relative flex flex-wrap items-center justify-center', className)}
      style={{
        width: `${rows}rem`,
        height: `${rows}rem`,
        color: dotColor,
        ...style,
      }}
      {...props}
    >
      {dots.map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            dotRefs.current[i] = el;
          }}
          className="relative rounded-full"
          style={{
            width: `${DOT_SIZE_REM}rem`,
            height: `${DOT_SIZE_REM}rem`,
            margin: `${DOT_MARGIN_REM}rem`,
            backgroundColor: 'currentColor',
            willChange: 'transform',
          }}
        />
      ))}
      <div
        ref={cursorRef}
        className="pointer-events-none absolute left-0 top-0 z-[1] rounded-full"
        style={{
          width: '1rem',
          height: '1rem',
          backgroundColor: cursorColor,
          willChange: 'transform',
        }}
      />
    </div>
  );
}

export default AnimeGridStagger;
