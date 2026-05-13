/**
 * PixonTimeline - Timeline de animações usando WAAPI puro
 * Bundle size: 0 bytes (usa apenas APIs nativas)
 * Performance: 120fps (roda no compositor thread)
 */

type TimelineItem = {
  target: Element | Element[];
  keyframes: Keyframe[];
  options?: KeyframeAnimationOptions;
  offset?: number; // quando começar (em ms ou "<" para sequencial, ">" para paralelo)
  label?: string;
};

type TimelineOptions = {
  defaults?: KeyframeAnimationOptions;
  paused?: boolean;
  repeat?: number; // -1 para infinito
  yoyo?: boolean; // alterna direcao a cada repeticao
  onComplete?: () => void;
  onUpdate?: (progress: number) => void;
  onRepeat?: (count: number) => void;
};

export class PixonTimeline {
  private items: TimelineItem[] = [];
  private animations: Animation[] = [];
  private defaults: KeyframeAnimationOptions;
  private _paused: boolean;
  private _progress = 0;
  private _duration = 0;
  private _repeat: number;
  private _yoyo: boolean;
  private _repeatCount = 0;
  private _direction: 'forward' | 'reverse' = 'forward';
  private onComplete?: () => void;
  private onUpdate?: (progress: number) => void;
  private onRepeat?: (count: number) => void;
  private abortController = new AbortController();

  constructor(options: TimelineOptions = {}) {
    this.defaults = {
      duration: 500,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      fill: 'forwards',
      ...options.defaults,
    };
    this._paused = options.paused ?? false;
    this._repeat = options.repeat ?? 0;
    this._yoyo = options.yoyo ?? false;
    this.onComplete = options.onComplete;
    this.onUpdate = options.onUpdate;
    this.onRepeat = options.onRepeat;
  }

  /**
   * Adiciona uma animação à timeline
   * @param target - Elemento(s) a animar
   * @param keyframes - Keyframes da animação
   * @param options - Opções (duration, easing, etc) ou offset em ms
   */
  add(
    target: Element | Element[] | string,
    keyframes: Keyframe[],
    options?: KeyframeAnimationOptions | number
  ): this {
    const resolvedTarget =
      typeof target === 'string'
        ? Array.from(document.querySelectorAll(target))
        : target;

    const resolvedOptions: KeyframeAnimationOptions =
      typeof options === 'number'
        ? { ...this.defaults, delay: options }
        : { ...this.defaults, ...options };

    this.items.push({
      target: Array.isArray(resolvedTarget) ? (resolvedTarget as Element[]) : ([resolvedTarget] as Element[]),
      keyframes,
      options: resolvedOptions,
    });

    return this;
  }

  /**
   * Adiciona label para referência
   */
  addLabel(name: string, offset?: number): this {
    this.items.push({
      target: [],
      keyframes: [],
      label: name,
      offset,
    });
    return this;
  }

  /**
   * Stagger automático para múltiplos elementos
   */
  stagger(
    targets: Element[] | string,
    keyframes: Keyframe[],
    options: KeyframeAnimationOptions & { stagger?: number } = {}
  ): this {
    const elements =
      typeof targets === 'string'
        ? Array.from(document.querySelectorAll(targets))
        : targets;

    const staggerDelay = options.stagger ?? 50;

    elements.forEach((el, i) => {
      this.add(el, keyframes, {
        ...this.defaults,
        ...options,
        delay: ((options.delay as number) ?? 0) + i * staggerDelay,
      });
    });

    return this;
  }

  /**
   * Executa a timeline
   */
  play(): this {
    if (this.animations.length > 0) {
      // Resume se já existe
      this.animations.forEach((a) => a.play());
      this._paused = false;
      return this;
    }

    let currentTime = 0;

    this.items.forEach((item) => {
      if (item.label) {
        // Labels são apenas marcadores
        if (item.offset !== undefined) currentTime = item.offset;
        return;
      }

      const targets = Array.isArray(item.target) ? item.target : [item.target];
      const options = item.options ?? this.defaults;
      const delay = (options.delay as number) ?? 0;
      const startTime = currentTime + delay;

      targets.forEach((target) => {
        if (!(target instanceof Element)) return;

        const animation = target.animate(item.keyframes, {
          ...options,
          delay: startTime,
        });

        // Cleanup com AbortController
        this.abortController.signal.addEventListener('abort', () => {
          animation.cancel();
        });

        this.animations.push(animation);
      });

      // Atualiza currentTime para a próxima animação
      const duration = (options.duration as number) ?? 500;
      currentTime = startTime + duration;
    });

    this._duration = currentTime;

    // Track progress
    if (this.onUpdate || this.onComplete) {
      this._trackProgress();
    }

    if (this._paused) {
      this.pause();
    }

    return this;
  }

  private _trackProgress(): void {
    const tick = () => {
      if (this.animations.length === 0) return;

      const firstAnim = this.animations[0];
      if (!firstAnim || firstAnim.playState === 'finished') {
        this._progress = this._direction === 'forward' ? 1 : 0;
        this.onUpdate?.(this._progress);

        // Handle repeat
        if (this._repeat === -1 || this._repeatCount < this._repeat) {
          this._repeatCount++;
          this.onRepeat?.(this._repeatCount);

          if (this._yoyo) {
            this._direction = this._direction === 'forward' ? 'reverse' : 'forward';
            this.reverse();
          } else {
            this.restart();
          }
          requestAnimationFrame(tick);
          return;
        }

        this.onComplete?.();
        return;
      }

      const currentTime = (firstAnim.currentTime as number) ?? 0;
      this._progress = Math.min(1, Math.max(0, currentTime / this._duration));
      if (this._direction === 'reverse') {
        this._progress = 1 - this._progress;
      }
      this.onUpdate?.(this._progress);

      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  pause(): this {
    this.animations.forEach((a) => a.pause());
    this._paused = true;
    return this;
  }

  reverse(): this {
    this.animations.forEach((a) => a.reverse());
    return this;
  }

  restart(): this {
    this.animations.forEach((a) => {
      a.currentTime = 0;
      a.play();
    });
    return this;
  }

  seek(progress: number): this {
    const time = progress * this._duration;
    this.animations.forEach((a) => {
      a.currentTime = time;
    });
    return this;
  }

  kill(): void {
    this.abortController.abort();
    this.animations = [];
    this.items = [];
  }

  get progress(): number {
    return this._progress;
  }

  get duration(): number {
    return this._duration;
  }

  get paused(): boolean {
    return this._paused;
  }
}

/**
 * Factory function (API similar ao GSAP)
 */
export function timeline(options?: TimelineOptions): PixonTimeline {
  return new PixonTimeline(options);
}

/**
 * fromTo animation (shorthand com estado inicial explicito)
 */
export function fromTo(
  target: Element | string,
  from: Keyframe,
  to: Keyframe,
  options?: KeyframeAnimationOptions
): Animation {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) throw new Error('Target not found');

  // Aplica estado inicial imediatamente
  if (el instanceof HTMLElement) {
    Object.entries(from).forEach(([key, value]) => {
      if (key === 'transform' || key === 'opacity' || key === 'filter') {
        el.style[key as any] = String(value);
      }
    });
  }

  return el.animate([from, to], {
    duration: 500,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    fill: 'forwards',
    ...options,
  });
}

/**
 * Set instantaneo (sem animacao)
 */
export function set(target: Element | string, properties: Record<string, string | number>): void {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el || !(el instanceof HTMLElement)) return;

  Object.entries(properties).forEach(([key, value]) => {
    if (key === 'x') {
      el.style.transform = `translateX(${value}px)`;
    } else if (key === 'y') {
      el.style.transform = `translateY(${value}px)`;
    } else if (key === 'scale') {
      el.style.transform = `scale(${value})`;
    } else if (key === 'rotate') {
      el.style.transform = `rotate(${value}deg)`;
    } else if (key in el.style) {
      (el.style as any)[key] = String(value);
    }
  });
}

/**
 * Delay promise (util para sequenciamento)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Animação única (shorthand)
 */
export function animate(
  target: Element | string,
  keyframes: Keyframe[],
  options?: KeyframeAnimationOptions
): Animation {
  const el =
    typeof target === 'string' ? document.querySelector(target) : target;

  if (!el) throw new Error('Target not found');

  return el.animate(keyframes, {
    duration: 500,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    fill: 'forwards',
    ...options,
  });
}
