export type MotionValueEvent = 'change';

export type MotionValueSubscriber<T> = (latest: T) => void;

type FrameSubscriber = (t: number) => boolean | void;

let rafId: number | null = null;
const pendingValues = new Set<MotionValue<any>>();
const frameSubscribers = new Set<FrameSubscriber>();

const raf =
  typeof requestAnimationFrame === 'function'
    ? requestAnimationFrame
    : (cb: (t: number) => void) => (setTimeout(() => cb(Date.now()), 16) as unknown as number);

const caf =
  typeof cancelAnimationFrame === 'function'
    ? cancelAnimationFrame
    : (id: number) => clearTimeout(id as unknown as any);

function scheduleFlush() {
  if (rafId !== null) return;
  rafId = raf((t) => {
    rafId = null;

    // Flush value changes first (single batch per frame).
    if (pendingValues.size > 0) {
      const values = Array.from(pendingValues);
      pendingValues.clear();
      for (const v of values) v.flush();
    }

    if (frameSubscribers.size === 0) return;

    // Run frame subscribers. If any returns true, keep ticking.
    let keep = false;
    for (const fn of Array.from(frameSubscribers)) {
      try {
        const res = fn(t);
        if (res) keep = true;
      } catch {
        // If a subscriber throws, drop it to prevent infinite loops.
        frameSubscribers.delete(fn);
      }
    }

    if (keep || pendingValues.size > 0) scheduleFlush();
  });
}

export function addFrameSubscriber(fn: FrameSubscriber) {
  frameSubscribers.add(fn);
  scheduleFlush();
  return () => {
    frameSubscribers.delete(fn);
  };
}

export class MotionValue<T> {
  private current: T;
  private subscribers = new Set<MotionValueSubscriber<T>>();

  constructor(initial: T) {
    this.current = initial;
  }

  get(): T {
    return this.current;
  }

  set(v: T) {
    if (Object.is(v, this.current)) return;
    this.current = v;
    pendingValues.add(this);
    scheduleFlush();
  }

  /** Immediately set without scheduling (rarely needed). */
  jump(v: T) {
    this.current = v;
    pendingValues.add(this);
    scheduleFlush();
  }

  on(event: MotionValueEvent, cb: MotionValueSubscriber<T>) {
    if (event !== 'change') return () => {};
    this.subscribers.add(cb);
    return () => {
      this.subscribers.delete(cb);
    };
  }

  flush() {
    if (this.subscribers.size === 0) return;
    const latest = this.current;
    for (const cb of Array.from(this.subscribers)) cb(latest);
  }
}
