import { useEffect, useRef, useSyncExternalStore } from 'react';
import { MotionValue, addFrameSubscriber } from './value';

export type MotionValueLike<T> = MotionValue<T>;

function useConstant<T>(init: () => T): T {
  const ref = useRef<{ v: T } | null>(null);
  if (ref.current === null) ref.current = { v: init() };
  return ref.current.v;
}

export function useMotionValue(initial = 0): MotionValue<number> {
  return useConstant(() => new MotionValue<number>(initial));
}

export function useMotionValueEvent<T>(
  value: MotionValue<T>,
  event: 'change',
  callback: (latest: T) => void
) {
  useEffect(() => value.on(event, callback), [value, event, callback]);
}

/** Opt-in bridge: subscribe and re-render with the latest value. */
export function useMotionValueValue<T>(value: MotionValue<T>): T {
  return useSyncExternalStore(
    (cb) => value.on('change', cb as any),
    () => value.get(),
    () => value.get()
  );
}

function interpolateNumber(v: number, inStart: number, inEnd: number, outStart: number, outEnd: number) {
  const progress = Math.max(0, Math.min(1, (v - inStart) / (inEnd - inStart)));
  return outStart + progress * (outEnd - outStart);
}

function parseUnit(value: string) {
  const num = parseFloat(value);
  const unit = value.replace(/[0-9.-]/g, '');
  return { num: Number.isFinite(num) ? num : 0, unit };
}

export function useTransform<T, U>(
  value: MotionValue<T> | MotionValue<T>[],
  inputRangeOrTransformer: number[] | ((v: T[]) => U),
  outputRange?: U[]
): MotionValue<U> {
  const out = useConstant(() => new MotionValue<U>(undefined as any));

  useEffect(() => {
    const compute = () => {
      if (Array.isArray(value) && typeof inputRangeOrTransformer === 'function') {
        const latest = value.map((v) => v.get()) as T[];
        out.set(inputRangeOrTransformer(latest));
        return;
      }

      if (
        value instanceof MotionValue &&
        typeof value.get() === 'number' &&
        Array.isArray(inputRangeOrTransformer) &&
        Array.isArray(outputRange)
      ) {
        const v = value.get() as number;
        const input = inputRangeOrTransformer;
        const output = outputRange;
        if (input.length !== output.length || input.length < 2) {
          out.set(output[0] as U);
          return;
        }

        let i = 1;
        while (i < input.length - 1 && v > input[i]!) i++;

        const inStart = input[i - 1]!;
        const inEnd = input[i]!;
        const outStart = output[i - 1]!;
        const outEnd = output[i]!;

        if (typeof outStart === 'number' && typeof outEnd === 'number') {
          out.set(interpolateNumber(v, inStart, inEnd, outStart, outEnd) as unknown as U);
          return;
        }

        const a = parseUnit(String(outStart));
        const b = parseUnit(String(outEnd));
        const n = interpolateNumber(v, inStart, inEnd, a.num, b.num);
        out.set(`${n}${a.unit || b.unit}` as unknown as U);
        return;
      }

      const first = Array.isArray(value) ? value[0]!.get() : (value as MotionValue<any>).get();
      out.set((first as unknown) as U);
    };

    compute();

    const unsubs: Array<() => void> = [];
    if (Array.isArray(value)) {
      for (const mv of value) unsubs.push(mv.on('change', compute as any));
    } else {
      unsubs.push(value.on('change', compute as any));
    }
    return () => unsubs.forEach((u) => u());
  }, [value, inputRangeOrTransformer, outputRange, out]);

  return out;
}

export interface SpringOptions {
  stiffness?: number;
  damping?: number;
  mass?: number;
  precision?: number;
}

export function useSpring(source: MotionValue<number> | number, options: SpringOptions = {}): MotionValue<number> {
  const isMotion = source instanceof MotionValue;
  const sourceMv = useConstant(() => (isMotion ? (source as MotionValue<number>) : new MotionValue<number>(Number(source) || 0)));

  // If the caller passes a number, keep the internal source MV in sync (no per-frame renders).
  useEffect(() => {
    if (isMotion) return;
    sourceMv.set(Number(source) || 0);
  }, [isMotion, source, sourceMv]);

  const springSource = isMotion ? (source as MotionValue<number>) : sourceMv;

  const out = useConstant(() => new MotionValue<number>(springSource.get()));
  const stateRef = useRef<{ x: number; v: number; target: number; stop?: () => void; active: boolean }>({
    x: springSource.get(),
    v: 0,
    target: springSource.get(),
    active: false,
  });

  useEffect(() => {
    const {
      stiffness = 280,
      damping = 18,
      mass = 1,
      precision = 0.001,
    } = options;

    const state = stateRef.current;
    state.x = out.get();
    state.target = springSource.get();

    const start = () => {
      if (state.active) return;
      state.active = true;
      state.stop = addFrameSubscriber(() => {
        const distance = state.target - state.x;
        const m = Math.max(0.1, mass);
        const force = (distance * (stiffness / 100)) - (state.v * (damping / 10));
        const a = Math.max(-100, Math.min(100, force / m));

        state.v += a;
        state.x += state.v;

        if (!Number.isFinite(state.x)) {
          state.x = state.target;
          state.v = 0;
        }

        const settled = Math.abs(state.target - state.x) < precision && Math.abs(state.v) < precision;
        out.set(settled ? state.target : state.x);

        if (settled) {
          state.x = state.target;
          state.v = 0;
          state.active = false;
          state.stop?.();
          state.stop = undefined;
          return false;
        }
        return true;
      });
    };

    const unsub = springSource.on('change', (latest) => {
      state.target = latest;
      start();
    });

    // If the source is already different, start immediately.
    if (springSource.get() !== out.get()) start();

    return () => {
      unsub();
      state.stop?.();
      state.stop = undefined;
      state.active = false;
    };
  }, [springSource, out, options.stiffness, options.damping, options.mass, options.precision]);

  return out;
}

export interface UseScrollOptions {
  container?: React.RefObject<HTMLElement | null>;
  axis?: 'x' | 'y';
}

export function useScroll(options: UseScrollOptions = {}) {
  const { container, axis = 'y' } = options;

  const scrollX = useMotionValue(0);
  const scrollY = useMotionValue(0);
  const scrollXProgress = useMotionValue(0);
  const scrollYProgress = useMotionValue(0);

  useEffect(() => {
    let ticking = false;

    const read = () => {
      const target = container?.current || window;
      const isWindow = target === window;

      let x = 0;
      let y = 0;
      let maxX = 1;
      let maxY = 1;

      if (isWindow) {
        x = window.scrollX;
        y = window.scrollY;
        maxX = document.documentElement.scrollWidth - window.innerWidth;
        maxY = document.documentElement.scrollHeight - window.innerHeight;
      } else {
        const el = target as HTMLElement;
        x = el.scrollLeft;
        y = el.scrollTop;
        maxX = el.scrollWidth - el.clientWidth;
        maxY = el.scrollHeight - el.clientHeight;
      }

      scrollX.set(x);
      scrollY.set(y);
      scrollXProgress.set(maxX > 0 ? x / maxX : 0);
      scrollYProgress.set(maxY > 0 ? y / maxY : 0);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        read();
      });
    };

    // Capture scroll from nested containers (matches previous usePixonScroll behavior).
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    read();

    return () => {
      window.removeEventListener('scroll', onScroll, { capture: true } as any);
      window.removeEventListener('resize', onScroll as any);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [container, axis]);

  return { scrollX, scrollY, scrollXProgress, scrollYProgress };
}
