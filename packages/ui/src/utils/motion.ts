/**
 * PixonUI Next-Gen Motion Engine (WAAPI + Off-Thread Springs)
 *
 * This utility contains high-performance math models and scheduler engines
 * that pre-compile spring physics and complex sequenced timelines into native,
 * hardware-accelerated Web Animations API (WAAPI) configurations.
 *
 * Runs 100% on the compositor thread of the browser, avoiding the JS main thread.
 */

import type { RefObject } from 'react';

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

export type ParsedTransform = Record<string, number | string>;

/**
 * Parses a complex transform string into an object of numeric values and units.
 * Example: "translateX(10px) scale(1.5)" -> { translateX: 10, scale: 1.5 }
 */
export function parseComplexTransform(transformStr: string): ParsedTransform {
  if (!transformStr) return {};
  const result: ParsedTransform = {};
  
  // Extract all transform functions and their values
  const regex = /(\w+)\(([^)]+)\)/g;
  let match;
  while ((match = regex.exec(transformStr)) !== null) {
    const prop = match[1];
    const val = match[2];
    if (prop && val) {
      // Very basic extraction, assuming px, deg or unitless
      const numVal = parseFloat(val);
      if (!isNaN(numVal)) {
        result[prop] = numVal;
        
        // Save the unit if needed, though we default to standard units
        if (val.includes('px')) result[`${prop}_unit`] = 'px';
        if (val.includes('deg')) result[`${prop}_unit`] = 'deg';
      }
    }
  }
  return result;
}

/**
 * Builds a complex transform string from parsed numeric values.
 */
export function buildComplexTransform(
  startParsed: ParsedTransform,
  endParsed: ParsedTransform,
  p: number
): string {
  const transforms: string[] = [];
  
  // Get all unique properties across start and end
  const keys = new Set([...Object.keys(startParsed), ...Object.keys(endParsed)]);
  
  keys.forEach(key => {
    if (key.endsWith('_unit')) return; // Skip unit metadata
    
    // Default start values if missing (scale defaults to 1, others to 0)
    const defaultVal = key.startsWith('scale') ? 1 : 0;
    
    const startVal = typeof startParsed[key] === 'number' ? (startParsed[key] as number) : defaultVal;
    const endVal = typeof endParsed[key] === 'number' ? (endParsed[key] as number) : defaultVal;
    
    const interpolated = interpolateValue(startVal, endVal, p);
    const unit = endParsed[`${key}_unit`] || startParsed[`${key}_unit`] || (key.includes('rotate') || key.includes('skew') ? 'deg' : (key.includes('translate') ? 'px' : ''));
    
    transforms.push(`${key}(${interpolated}${unit})`);
  });
  
  return transforms.join(' ');
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
// 3. Chained Web Animations API (WAAPI) Timeline Scheduler & Shortcuts
// ============================================================================

export type AnimatableTarget =
  | string
  | Element
  | Element[]
  | NodeListOf<Element>
  | RefObject<Element | null>
  | Array<Element | RefObject<Element | null> | null>;

export interface TimelineTrack {
  target: AnimatableTarget;
  keyframes: Keyframe[] | PropertyIndexedKeyframes;
  duration?: number;
  delay?: number;
  stagger?: number;
  easing?: string;
  spring?: SpringConfig;
  /**
   * Offset positions the animation in the timeline.
   * - No offset: Starts immediately after previous track ends.
   * - number (e.g. 500): Absolute time from timeline start.
   * - '+=100': Relative delay from previous track end.
   * - '-=150': Overlap with previous track.
   * - '<': Starts at the exact start time of the previous track.
   * - '<+=100': Starts 100ms after the start of the previous track.
   * - '>-150': Starts 150ms before the end of the previous track.
   */
  offset?: string | number;
}

export interface UltimateAnimationOptions {
  duration?: number;
  delay?: number;
  stagger?: number;
  easing?: string;
  spring?: SpringConfig;
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
 * Translates shorthand CSS transition properties like x, y, scale, rotate
 * into high-performance, hardware-accelerated 'transform' rules.
 */
export function parseStyleShortcuts(style: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  const transforms: string[] = [];

  // Parse translation shorthand (x, y)
  const tx = style.x !== undefined ? (typeof style.x === 'number' ? `${style.x}px` : style.x) : null;
  const ty = style.y !== undefined ? (typeof style.y === 'number' ? `${style.y}px` : style.y) : null;
  if (tx !== null || ty !== null) {
    transforms.push(`translate3d(${tx ?? '0px'}, ${ty ?? '0px'}, 0)`);
  }

  // Parse scale shorthand
  if (style.scale !== undefined) {
    transforms.push(`scale(${style.scale})`);
  }

  // Parse rotation shorthand
  if (style.rotate !== undefined) {
    transforms.push(`rotate(${typeof style.rotate === 'number' ? `${style.rotate}deg` : style.rotate})`);
  }

  // Parse skew shorthand
  if (style.skewX !== undefined) {
    transforms.push(`skewX(${typeof style.skewX === 'number' ? `${style.skewX}deg` : style.skewX})`);
  }
  if (style.skewY !== undefined) {
    transforms.push(`skewY(${typeof style.skewY === 'number' ? `${style.skewY}deg` : style.skewY})`);
  }

  // Parse blur shorthand
  if (style.blur !== undefined) {
    result.filter = `blur(${typeof style.blur === 'number' ? `${style.blur}px` : style.blur})`;
  }

  // Apply build transforms
  if (transforms.length > 0) {
    result.transform = transforms.join(' ');
  }

  // Copy other properties
  Object.keys(style).forEach((key) => {
    if (['x', 'y', 'scale', 'rotate', 'skewX', 'skewY', 'blur'].includes(key)) return;
    result[key] = style[key];
  });

  return result;
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
   * Add a new animation track to the timeline (supports direct overloads)
   */
  public add(track: TimelineTrack): this;
  public add(
    target: AnimatableTarget,
    styles: Keyframe[] | PropertyIndexedKeyframes | Record<string, any>,
    options?: UltimateAnimationOptions
  ): this;
  public add(
    targetOrTrack: AnimatableTarget | TimelineTrack,
    styles?: Keyframe[] | PropertyIndexedKeyframes | Record<string, any>,
    options?: UltimateAnimationOptions
  ): this {
    if (styles === undefined) {
      // Backwards compatible: standard TimelineTrack object
      const track = targetOrTrack as TimelineTrack;
      if (Array.isArray(track.keyframes)) {
        track.keyframes = track.keyframes.map((kf) => parseStyleShortcuts(kf));
      } else if (track.keyframes && typeof track.keyframes === 'object') {
        track.keyframes = parseStyleShortcuts(track.keyframes as any) as any;
      }
      this.tracks.push(track);
    } else {
      // Short / Ultimate React syntax called!
      const target = targetOrTrack as AnimatableTarget;
      let keyframes: Keyframe[] | PropertyIndexedKeyframes;

      if (Array.isArray(styles)) {
        keyframes = styles.map((kf) => parseStyleShortcuts(kf));
      } else {
        keyframes = [parseStyleShortcuts(styles as Record<string, any>)];
      }

      this.tracks.push({
        target,
        keyframes,
        duration: options?.duration,
        delay: options?.delay,
        stagger: options?.stagger,
        easing: options?.easing,
        spring: options?.spring,
        offset: options?.offset,
      });
    }
    return this;
  }

  /**
   * Evaluates targets (resolving strings as query selectors, handling arrays and refs)
   */
  private resolveTargets(target: AnimatableTarget): Element[] {
    if (!target) return [];
    if (typeof target === 'string') {
      return Array.from(document.querySelectorAll(target)) as Element[];
    }
    if (target instanceof Element) {
      return [target];
    }
    if (target instanceof NodeList) {
      return Array.from(target) as Element[];
    }
    if (Array.isArray(target)) {
      return (target as any[]).flatMap((t) => {
        if (!t) return [];
        if (t instanceof Element) return [t];
        if (typeof t === 'object' && 'current' in t) {
          return t.current ? [t.current] : [];
        }
        return [];
      });
    }
    if (typeof target === 'object' && 'current' in target) {
      return (target as any).current ? [(target as any).current] : [];
    }
    return [];
  }

  /**
   * Compiles the tracks and schedules their WAAPI execution
   */
  public play(): PixonTimelineController {
    this.cancel(); // Reset any existing running sequences
    this.activeAnimations = [];

    let prevTrackStart = 0;
    let prevTrackEnd = 0;

    const completedPromises: Promise<void>[] = [];

    this.tracks.forEach((track) => {
      const targets = this.resolveTargets(track.target);
      if (targets.length === 0) return;

      // Calculate absolute start time based on offset with anchors support (<, >)
      let trackStart = prevTrackEnd;

      if (track.offset !== undefined) {
        if (typeof track.offset === 'number') {
          trackStart = track.offset;
        } else if (typeof track.offset === 'string') {
          const offsetStr = track.offset.trim();
          if (offsetStr.startsWith('+=')) {
            trackStart = prevTrackEnd + parseFloat(offsetStr.slice(2));
          } else if (offsetStr.startsWith('-=')) {
            trackStart = prevTrackEnd - parseFloat(offsetStr.slice(2));
          } else if (offsetStr.startsWith('<')) {
            const modifier = offsetStr.slice(1); // e.g. "+=100"
            if (modifier.startsWith('+=')) {
              trackStart = prevTrackStart + parseFloat(modifier.slice(2));
            } else if (modifier.startsWith('-=')) {
              trackStart = prevTrackStart - parseFloat(modifier.slice(2));
            } else if (modifier) {
              trackStart = prevTrackStart + parseFloat(modifier);
            } else {
              trackStart = prevTrackStart;
            }
          } else if (offsetStr.startsWith('>')) {
            const modifier = offsetStr.slice(1);
            if (modifier.startsWith('+=')) {
              trackStart = prevTrackEnd + parseFloat(modifier.slice(2));
            } else if (modifier.startsWith('-=')) {
              trackStart = prevTrackEnd - parseFloat(modifier.slice(2));
            } else if (modifier) {
              trackStart = prevTrackEnd + parseFloat(modifier);
            } else {
              trackStart = prevTrackEnd;
            }
          }
        }
      }

      trackStart = Math.max(0, trackStart);

      // Handle custom physics spring compiled inside WAAPI
      let resolvedKeyframes = track.keyframes;
      let resolvedDuration = track.duration ?? 400;
      let resolvedEasing = track.easing ?? 'cubic-bezier(0.16, 1, 0.3, 1)';

      if (track.spring && Array.isArray(track.keyframes)) {
        let first: Keyframe = {};
        let last: Keyframe = {};

        if (track.keyframes.length >= 2) {
          first = track.keyframes[0]!;
          last = track.keyframes[track.keyframes.length - 1]!;
        } else if (track.keyframes.length === 1) {
          // Auto-capture starting state from first matched DOM element
          const el = targets[0];
          if (el) {
            last = track.keyframes[0]!;
            const style = window.getComputedStyle(el);

            Object.keys(last).forEach((key) => {
              if (key === 'transform') return;
              if (key === 'opacity') {
                first.opacity = parseFloat(style.opacity) || 1;
              } else if (typeof last[key] === 'number') {
                first[key] = parseFloat(style[key as any] ?? '') || 0;
              }
            });

            if (last.transform) {
              const hasTranslate = String(last.transform).includes('translate3d');
              const hasScale = String(last.transform).includes('scale');
              const hasRotate = String(last.transform).includes('rotate');

              if (hasTranslate) first.transform = (first.transform ?? '') + ' translate3d(0px, 0px, 0)';
              if (hasScale) first.transform = (first.transform ?? '') + ' scale(1)';
              if (hasRotate) first.transform = (first.transform ?? '') + ' rotate(0deg)';
            }
          }
        }

        if (first && last && Object.keys(last).length > 0) {
          const { progress, duration } = generateSpringTrajectory(0, 1, track.spring);
          resolvedDuration = duration;
          resolvedEasing = 'linear';

          const springKeys: Keyframe[] = [];
          const numericProps: string[] = [];
          const otherProps: string[] = [];

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

          const startParsed = parseComplexTransform(first.transform as string || '');
          const endParsed = parseComplexTransform(last.transform as string || '');

          progress.forEach((p) => {
            const key: Keyframe = {};
            numericProps.forEach((prop) => {
              key[prop] = interpolateValue(first[prop] as number, last[prop] as number, p);
            });

            const complexTransform = buildComplexTransform(startParsed, endParsed, p);
            if (complexTransform) {
              key.transform = complexTransform;
            }

            otherProps.forEach((prop) => {
              key[prop] = p < 0.5 ? first[prop] : last[prop];
            });

            springKeys.push(key);
          });

          resolvedKeyframes = springKeys;
        }
      }

      // Dynamic track duration (including stagger if target has multiple elements)
      const staggerDelay = track.stagger ?? track.delay ?? 0;
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

      prevTrackStart = trackStart;
      prevTrackEnd = maxElementDuration;
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
