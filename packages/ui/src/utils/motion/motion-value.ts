/**
 * PixonMotionValue - Valores reativos para animacoes
 * Bundle size: 0 bytes (sem dependencias)
 * Performance: Sem DOM dummy, usa RAF puro
 *
 * Similar ao MotionValue do Framer Motion, mas 100% nativo
 */

type Subscriber<T> = (value: T) => void;
type Unsubscribe = () => void;

export class MotionValue<T = number> {
  private _value: T;
  private _velocity = 0;
  private _lastValue: T;
  private _lastTime = 0;
  private subscribers = new Set<Subscriber<T>>();
  private velocitySubscribers = new Set<Subscriber<number>>();

  constructor(initialValue: T) {
    this._value = initialValue;
    this._lastValue = initialValue;
    this._lastTime = performance.now();
  }

  get(): T {
    return this._value;
  }

  getVelocity(): number {
    return this._velocity;
  }

  set(newValue: T, notify = true): void {
    const now = performance.now();
    const dt = now - this._lastTime;

    // Calcula velocidade (apenas para numeros)
    if (typeof newValue === 'number' && typeof this._lastValue === 'number') {
      this._velocity = dt > 0 ? ((newValue - this._lastValue) / dt) * 1000 : 0;
    }

    this._lastValue = this._value;
    this._value = newValue;
    this._lastTime = now;

    if (notify) {
      this.subscribers.forEach((fn) => fn(newValue));
      this.velocitySubscribers.forEach((fn) => fn(this._velocity));
    }
  }

  /**
   * Anima para um valor alvo
   */
  animateTo(
    target: T,
    options: {
      duration?: number;
      easing?: (t: number) => number;
      onComplete?: () => void;
    } = {}
  ): () => void {
    const { duration = 300, easing = easeOutCubic, onComplete } = options;

    if (typeof this._value !== 'number' || typeof target !== 'number') {
      this.set(target);
      onComplete?.();
      return () => {};
    }

    const start = this._value as number;
    const end = target as number;
    const startTime = performance.now();
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;

      const elapsed = performance.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      const easedProgress = easing(progress);
      const currentValue = start + (end - start) * easedProgress;

      this.set(currentValue as any);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        onComplete?.();
      }
    };

    requestAnimationFrame(tick);

    return () => {
      cancelled = true;
    };
  }

  /**
   * Anima com spring physics (sem DOM dummy)
   */
  spring(
    target: T,
    config: {
      stiffness?: number;
      damping?: number;
      mass?: number;
      velocity?: number;
      onComplete?: () => void;
    } = {}
  ): () => void {
    if (typeof this._value !== 'number' || typeof target !== 'number') {
      this.set(target);
      config.onComplete?.();
      return () => {};
    }

    const {
      stiffness = 100,
      damping = 10,
      mass = 1,
      velocity = this._velocity,
      onComplete,
    } = config;

    let position = this._value as number;
    let vel = velocity;
    const targetPos = target as number;
    let cancelled = false;
    let lastTime = performance.now();

    const tick = () => {
      if (cancelled) return;

      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.064); // Cap at 64ms
      lastTime = now;

      // Spring physics: F = -kx - cv
      const displacement = position - targetPos;
      const springForce = -stiffness * displacement;
      const dampingForce = -damping * vel;
      const acceleration = (springForce + dampingForce) / mass;

      vel += acceleration * dt;
      position += vel * dt;

      this.set(position as any);

      // Check if settled
      const isSettled =
        Math.abs(displacement) < 0.001 && Math.abs(vel) < 0.001;

      if (isSettled) {
        this.set(targetPos as any);
        onComplete?.();
      } else {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);

    return () => {
      cancelled = true;
    };
  }

  /**
   * Subscribe to value changes
   */
  onChange(callback: Subscriber<T>): Unsubscribe {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  /**
   * Subscribe to velocity changes
   */
  onVelocityChange(callback: Subscriber<number>): Unsubscribe {
    this.velocitySubscribers.add(callback);
    return () => this.velocitySubscribers.delete(callback);
  }

  /**
   * Destroy and cleanup
   */
  destroy(): void {
    this.subscribers.clear();
    this.velocitySubscribers.clear();
  }
}

/**
 * Factory function
 */
export function motionValue<T = number>(initialValue: T): MotionValue<T> {
  return new MotionValue(initialValue);
}

/**
 * Transform one motion value to another
 */
export function transform<I, O>(
  input: MotionValue<I>,
  transformer: (value: I) => O
): MotionValue<O> {
  const output = new MotionValue(transformer(input.get()));

  input.onChange((value) => {
    output.set(transformer(value), true);
  });

  return output;
}

/**
 * Combine multiple motion values
 */
export function combine<T extends unknown[], O>(
  values: { [K in keyof T]: MotionValue<T[K]> },
  combiner: (...args: T) => O
): MotionValue<O> {
  const getAll = () => values.map((v) => v.get()) as T;
  const output = new MotionValue(combiner(...getAll()));

  values.forEach((mv) => {
    mv.onChange(() => {
      output.set(combiner(...getAll()), true);
    });
  });

  return output;
}

/**
 * Interpolate between ranges
 */
export function interpolate(
  input: MotionValue<number>,
  inputRange: number[],
  outputRange: number[],
  options: { clamp?: boolean } = {}
): MotionValue<number> {
  const { clamp = true } = options;

  const interp = (value: number): number => {
    // Find segment
    let i = 0;
    for (; i < inputRange.length - 1; i++) {
      if (value <= inputRange[i + 1]) break;
    }

    const inputStart = inputRange[i];
    const inputEnd = inputRange[i + 1] ?? inputRange[i];
    const outputStart = outputRange[i];
    const outputEnd = outputRange[i + 1] ?? outputRange[i];

    let t = inputEnd === inputStart ? 0 : (value - inputStart) / (inputEnd - inputStart);

    if (clamp) {
      t = Math.max(0, Math.min(1, t));
    }

    return outputStart + (outputEnd - outputStart) * t;
  };

  return transform(input, interp);
}

/**
 * Scroll-linked motion value
 */
export function scrollY(): MotionValue<number> {
  const mv = new MotionValue(typeof window !== 'undefined' ? window.scrollY : 0);

  if (typeof window !== 'undefined') {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          mv.set(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  return mv;
}

/**
 * Mouse position motion values
 */
export function mousePosition(): { x: MotionValue<number>; y: MotionValue<number> } {
  const x = new MotionValue(0);
  const y = new MotionValue(0);

  if (typeof window !== 'undefined') {
    let ticking = false;
    let lastX = 0;
    let lastY = 0;

    const onMove = (e: MouseEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;

      if (!ticking) {
        requestAnimationFrame(() => {
          x.set(lastX);
          y.set(lastY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
  }

  return { x, y };
}

// Easing functions
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 2);
}

export function easeIn(t: number): number {
  return t * t;
}

export function linear(t: number): number {
  return t;
}
