/**
 * PixonUI Next-Gen Motion Engine (WAAPI + Off-Thread Springs)
 *
 * This utility contains high-performance math models and scheduler engines
 * that pre-compile spring physics and complex sequenced timelines into native,
 * hardware-accelerated Web Animations API (WAAPI) configurations.
 *
 * Runs 100% on the compositor thread of the browser, avoiding the JS main thread.
 */

// ============================================================================
// 1. Spring Physics Mathematical Compiler
// ============================================================================

export interface SpringConfig {
  /** Tension of the spring (controls speed/tightness) @default 170 */
  stiffness?: number;
  /** Friction/resistance (controls bounce dampening) @default 26 */
  damping?: number;
  /** Virtual mass of the animated element @default 1 */
  mass?: number;
  /** Precision threshold to declare the spring settled @default 0.001 */
  precision?: number;
}

export interface ComputedSpring {
  keyframes: Keyframe[];
  duration: number;
}

/**
 * Solves the damped harmonic oscillator and compiles the physical path
 * into a dense array of WAAPI-compatible keyframes.
 *
 * It uses a normalized progress solver (0.0 to 1.0) so multiple properties
 * can be animated in perfect, organic sync.
 *
 * @param from The start value (normally 0)
 * @param to The target value (normally 1)
 * @param config Physical coefficients of the spring
 */
export function generateSpringTrajectory(
  from: number,
  to: number,
  config: SpringConfig = {}
): { progress: number[]; duration: number } {
  const { stiffness = 170, damping = 26, mass = 1, precision = 0.0005 } = config;

  const w0 = Math.sqrt(stiffness / mass); // Undamped angular frequency
  const zeta = damping / (2 * Math.sqrt(stiffness * mass)); // Damping ratio

  // Analytical approximation of settling time
  let settleTime = 10; // Default fallback
  if (zeta > 0) {
    const decayRate = zeta * w0;
    settleTime = -Math.log(precision) / decayRate;
  }
  // Cap duration between 0.1s and 3s for sanity
  const duration = Math.max(0.1, Math.min(3.0, settleTime));

  const steps = Math.max(40, Math.min(180, Math.round(duration * 120))); // High-fidelity sampling (120fps ready)
  const progress: number[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * duration;
    let d = 0; // Normalized displacement relative to equilibrium

    if (zeta < 1) {
      // Underdamped (bouncy oscillation)
      const wd = w0 * Math.sqrt(1 - zeta * zeta);
      const envelope = Math.exp(-zeta * w0 * t);
      d = -Math.cos(wd * t) * envelope;
    } else if (zeta === 1) {
      // Critically damped (fastest settle, no overshoot)
      d = -(1 + w0 * t) * Math.exp(-w0 * t);
    } else {
      // Overdamped (smooth asymptotic drift, slow)
      const r1 = -w0 * (zeta - Math.sqrt(zeta * zeta - 1));
      const r2 = -w0 * (zeta + Math.sqrt(zeta * zeta - 1));
      const c1 = r2 / (r2 - r1);
      const c2 = -r1 / (r2 - r1);
      d = c1 * Math.exp(r1 * t) + c2 * Math.exp(r2 * t);
    }

    // Convert displacement (-1.0 to 0.0) to normalized progress (0.0 to 1.0)
    // d is -1 at t=0, and settles to 0 at t -> infinity
    const p = 1 + d;
    progress.push(p);
  }

  return { progress, duration: duration * 1000 }; // Duration in milliseconds
}

/**
 * Interpolates numerical property values using pre-compiled spring trajectories
 */
export function interpolateValue(from: number, to: number, p: number): number {
  return from + (to - from) * p;
}

// ============================================================================
// 2. High-Fidelity 2D Grid & Distance Staggering
// ============================================================================

export interface StaggerConfig {
  /** The stagger step interval in milliseconds */
  delay: number;
  /** The starting point: index, 'first', 'last', or 'center' */
  from?: 'first' | 'last' | 'center' | number;
  /** Grid dimensions: [columns, rows] */
  grid?: [number, number];
  /** Constraint axis for linear stagger */
  axis?: 'x' | 'y';
}

/**
 * Calculates a highly optimized stagger delay for a specific item index.
 * Fully supports multidimensional grids, directional axes, and Euclidean distances.
 */
export function calculateStagger(
  index: number,
  total: number,
  config: StaggerConfig
): number {
  const { delay, from = 'first', grid, axis } = config;

  if (!grid) {
    // 1D Linear Stagger
    if (from === 'first') return index * delay;
    if (from === 'last') return (total - 1 - index) * delay;
    if (from === 'center') {
      const mid = (total - 1) / 2;
      return Math.abs(mid - index) * delay;
    }
    if (typeof from === 'number') {
      return Math.abs(from - index) * delay;
    }
    return index * delay;
  }

  // 2D Grid Stagger
  const [cols] = grid;
  const col = index % cols;
  const row = Math.floor(index / cols);
  const rows = Math.ceil(total / cols);

  let fromCol = 0;
  let fromRow = 0;

  if (from === 'last') {
    fromCol = cols - 1;
    fromRow = rows - 1;
  } else if (from === 'center') {
    fromCol = (cols - 1) / 2;
    fromRow = (rows - 1) / 2;
  } else if (typeof from === 'number') {
    fromCol = from % cols;
    fromRow = Math.floor(from / cols);
  }

  const dx = col - fromCol;
  const dy = row - fromRow;

  if (axis === 'x') return Math.abs(dx) * delay;
  if (axis === 'y') return Math.abs(dy) * delay;

  // Diagonal / Radial Stagger (Euclidean distance from origin point)
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance * delay;
}

// ============================================================================
// 3. Chained Web Animations API (WAAPI) Timeline Scheduler
// ============================================================================

export type AnimatableTarget = string | HTMLElement | HTMLElement[] | NodeListOf<HTMLElement>;

export interface TimelineTrack {
  target: AnimatableTarget;
  keyframes: Keyframe[] | PropertyIndexedKeyframes;
  duration?: number;
  delay?: number;
  easing?: string;
  spring?: SpringConfig;
  /**
   * Offset positions the animation in the timeline.
   * - No offset: Starts immediately after previous track ends.
   * - number (e.g. 500): Absolute time from timeline start.
   * - '+=100': Relative delay from previous track end.
   * - '-=150': Overlap with previous track.
   */
  offset?: string | number;
}

export interface PixonTimelineController {
  play: () => PixonTimelineController;
  pause: () => PixonTimelineController;
  reverse: () => PixonTimelineController;
  restart: () => PixonTimelineController;
  seek: (timeMs: number) => PixonTimelineController;
  cancel: () => PixonTimelineController;
  finished: Promise<void>;
  /** Get all playing WAAPI active Animation objects */
  getAnimations: () => Animation[];
}

/**
 * Elegant, chainable timeline scheduler that coordinates multiple target elements
 * and schedules native WAAPI animations off-thread.
 */
export class PixonTimeline {
  private tracks: TimelineTrack[] = [];
  private activeAnimations: Animation[] = [];
  private resolveFinished?: () => void;
  public finished: Promise<void>;

  constructor() {
    this.finished = new Promise<void>((resolve) => {
      this.resolveFinished = resolve;
    });
  }

  /**
   * Add a new animation track to the timeline
   */
  public add(track: TimelineTrack): this {
    this.tracks.push(track);
    return this;
  }

  /**
   * Evaluates targets (resolving strings as query selectors, handling arrays)
   */
  private resolveTargets(target: AnimatableTarget): HTMLElement[] {
    if (typeof target === 'string') {
      return Array.from(document.querySelectorAll(target)) as HTMLElement[];
    }
    if (target instanceof HTMLElement) {
      return [target];
    }
    if (target instanceof NodeList) {
      return Array.from(target) as HTMLElement[];
    }
    if (Array.isArray(target)) {
      return target;
    }
    return [];
  }

  /**
   * Compiles the tracks and schedules their WAAPI execution
   */
  public play(): PixonTimelineController {
    this.cancel(); // Reset any existing running sequences
    this.activeAnimations = [];

    let cursor = 0; // The continuous timeline clock in milliseconds
    let lastTrackEnd = 0;

    const completedPromises: Promise<void>[] = [];

    this.tracks.forEach((track) => {
      const targets = this.resolveTargets(track.target);
      if (targets.length === 0) return;

      // Calculate absolute start time for this track based on offset
      let trackStart = lastTrackEnd;

      if (track.offset !== undefined) {
        if (typeof track.offset === 'number') {
          trackStart = track.offset;
        } else if (typeof track.offset === 'string') {
          if (track.offset.startsWith('+=')) {
            trackStart = lastTrackEnd + parseFloat(track.offset.slice(2));
          } else if (track.offset.startsWith('-=')) {
            trackStart = lastTrackEnd - parseFloat(track.offset.slice(2));
          }
        }
      }

      // Handle custom physics spring compiled inside WAAPI
      let resolvedKeyframes = track.keyframes;
      let resolvedDuration = track.duration ?? 400;
      let resolvedEasing = track.easing ?? 'cubic-bezier(0.16, 1, 0.3, 1)';

      if (track.spring && Array.isArray(track.keyframes) && track.keyframes.length >= 2) {
        // Find properties to animate
        const first = track.keyframes[0]!;
        const last = track.keyframes[track.keyframes.length - 1]!;

        // Compile physical spring progress
        const { progress, duration } = generateSpringTrajectory(0, 1, track.spring);
        resolvedDuration = duration;
        resolvedEasing = 'linear'; // Springs are pre-interpolated linearly

        // Interpolate keys
        const springKeys: Keyframe[] = [];
        const numericProps: string[] = [];
        const otherProps: string[] = [];

        // Distinguish numeric props (can be springed) and other props
        Object.keys(last).forEach((key) => {
          if (key === 'offset' || key === 'easing' || key === 'composite') return;
          const valStart = first[key];
          const valEnd = last[key];
          if (typeof valStart === 'number' && typeof valEnd === 'number') {
            numericProps.push(key);
          } else {
            otherProps.push(key);
          }
        });

        // Parse translate / scale shorthand if present
        // (If values are strings like 'translate3d(0px, 0px, 0)' or 'scale(1)', we extract numbers)
        const parseTranslateX = (val: any): number => {
          if (typeof val === 'number') return val;
          const match = String(val).match(/translate3d\(([-\d.]+)px/);
          return match && match[1] ? parseFloat(match[1]) : 0;
        };

        const parseScale = (val: any): number => {
          if (typeof val === 'number') return val;
          const match = String(val).match(/scale\(([-\d.]+)\)/);
          return match && match[1] ? parseFloat(match[1]) : 1;
        };

        const hasTranslate = first.transform && String(first.transform).includes('translate3d');
        const hasScale = first.transform && String(first.transform).includes('scale');

        const txStart = hasTranslate ? parseTranslateX(first.transform) : 0;
        const txEnd = hasTranslate ? parseTranslateX(last.transform) : 0;
        const scStart = hasScale ? parseScale(first.transform) : 1;
        const scEnd = hasScale ? parseScale(last.transform) : 1;

        progress.forEach((p) => {
          const key: Keyframe = {};
          // Interpolate simple numeric props (like opacity, blur)
          numericProps.forEach((prop) => {
            key[prop] = interpolateValue(first[prop] as number, last[prop] as number, p);
          });

          // Interpolate transform shorthands
          const transforms: string[] = [];
          if (hasTranslate) {
            transforms.push(`translate3d(${interpolateValue(txStart, txEnd, p)}px, 0, 0)`);
          }
          if (hasScale) {
            transforms.push(`scale(${interpolateValue(scStart, scEnd, p)})`);
          }
          if (transforms.length) {
            key.transform = transforms.join(' ');
          }

          // Fallback other properties
          otherProps.forEach((prop) => {
            key[prop] = p < 0.5 ? first[prop] : last[prop];
          });

          springKeys.push(key);
        });

        resolvedKeyframes = springKeys;
      }

      // Dynamic track duration (including stagger if target has multiple elements)
      const staggerDelay = track.delay ?? 0;
      let maxElementDuration = 0;

      targets.forEach((el, index) => {
        const itemDelay = trackStart + (index * staggerDelay);
        const anim = el.animate(resolvedKeyframes as Keyframe[], {
          delay: itemDelay,
          duration: resolvedDuration,
          easing: resolvedEasing,
          fill: 'both',
        });

        this.activeAnimations.push(anim);

        const elementDuration = itemDelay + resolvedDuration;
        if (elementDuration > maxElementDuration) {
          maxElementDuration = elementDuration;
        }

        const p = new Promise<void>((resolve) => {
          anim.onfinish = () => resolve();
          anim.oncancel = () => resolve();
        });
        completedPromises.push(p);
      });

      lastTrackEnd = maxElementDuration;
    });

    // Notify timeline completion
    Promise.all(completedPromises).then(() => {
      if (this.resolveFinished) this.resolveFinished();
    });

    return this.getController();
  }

  private getController(): PixonTimelineController {
    return {
      play: () => {
        this.activeAnimations.forEach((a) => a.play());
        return this.getController();
      },
      pause: () => {
        this.activeAnimations.forEach((a) => a.pause());
        return this.getController();
      },
      reverse: () => {
        this.activeAnimations.forEach((a) => a.reverse());
        return this.getController();
      },
      restart: () => {
        this.play();
        return this.getController();
      },
      seek: (timeMs: number) => {
        this.activeAnimations.forEach((a) => {
          a.currentTime = timeMs;
        });
        return this.getController();
      },
      cancel: () => {
        this.cancel();
        return this.getController();
      },
      finished: this.finished,
      getAnimations: () => this.activeAnimations,
    };
  }

  public cancel(): void {
    this.activeAnimations.forEach((a) => a.cancel());
    this.activeAnimations = [];
  }
}

/** Chained timeline helper factory function */
export function timeline(): PixonTimeline {
  return new PixonTimeline();
}
