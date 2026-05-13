/**
 * PixonBatch - Sistema de batching para animacoes em massa
 * Bundle size: 0 bytes
 * Performance: Agrupa animacoes para reduzir reflows/repaints
 *
 * Problema: Animar 1000 elementos individualmente = 1000 reflows
 * Solucao: Agrupa leituras e escritas no DOM
 */

type BatchedOperation = () => void;

// ============================================
// Batched DOM Operations
// ============================================

class DOMBatcher {
  private readQueue: BatchedOperation[] = [];
  private writeQueue: BatchedOperation[] = [];
  private scheduled = false;

  /**
   * Agenda uma leitura do DOM (getBoundingClientRect, getComputedStyle, etc)
   */
  read(operation: BatchedOperation): void {
    this.readQueue.push(operation);
    this.schedule();
  }

  /**
   * Agenda uma escrita no DOM (style changes, classList, etc)
   */
  write(operation: BatchedOperation): void {
    this.writeQueue.push(operation);
    this.schedule();
  }

  /**
   * Executa imediatamente (fora do batch)
   */
  immediate(operation: BatchedOperation): void {
    operation();
  }

  private schedule(): void {
    if (this.scheduled) return;
    this.scheduled = true;

    requestAnimationFrame(() => {
      this.flush();
    });
  }

  private flush(): void {
    // Primeiro todas as leituras (evita forced reflow)
    const reads = this.readQueue.splice(0);
    reads.forEach((op) => op());

    // Depois todas as escritas (batched)
    const writes = this.writeQueue.splice(0);
    writes.forEach((op) => op());

    this.scheduled = false;

    // Se novas operacoes foram adicionadas durante flush, agenda de novo
    if (this.readQueue.length || this.writeQueue.length) {
      this.schedule();
    }
  }

  /**
   * Limpa todas as operacoes pendentes
   */
  clear(): void {
    this.readQueue = [];
    this.writeQueue = [];
    this.scheduled = false;
  }
}

// Singleton
export const batcher = new DOMBatcher();

// ============================================
// Batched Animation Scheduler
// ============================================

type AnimationBatchItem = {
  element: Element;
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
  onComplete?: () => void;
};

class AnimationBatcher {
  private queue: AnimationBatchItem[] = [];
  private scheduled = false;
  private animations: Animation[] = [];

  /**
   * Adiciona animacao ao batch (sera executada no proximo frame)
   */
  add(
    element: Element,
    keyframes: Keyframe[],
    options: KeyframeAnimationOptions = {},
    onComplete?: () => void
  ): void {
    this.queue.push({ element, keyframes, options, onComplete });
    this.schedule();
  }

  /**
   * Adiciona multiplos elementos com mesma animacao
   */
  addMany(
    elements: Element[],
    keyframes: Keyframe[],
    options: KeyframeAnimationOptions & { stagger?: number } = {}
  ): void {
    const { stagger = 0, ...animOptions } = options;

    elements.forEach((el, i) => {
      this.add(el, keyframes, {
        ...animOptions,
        delay: ((animOptions.delay as number) ?? 0) + i * stagger,
      });
    });
  }

  private schedule(): void {
    if (this.scheduled) return;
    this.scheduled = true;

    requestAnimationFrame(() => {
      this.flush();
    });
  }

  private flush(): void {
    const items = this.queue.splice(0);
    this.scheduled = false;

    // Executa todas as animacoes de uma vez
    items.forEach(({ element, keyframes, options, onComplete }) => {
      const anim = element.animate(keyframes, {
        fill: 'forwards',
        ...options,
      });

      if (onComplete) {
        anim.onfinish = onComplete;
      }

      this.animations.push(anim);
    });
  }

  /**
   * Cancela todas as animacoes
   */
  cancelAll(): void {
    this.animations.forEach((a) => a.cancel());
    this.animations = [];
    this.queue = [];
    this.scheduled = false;
  }

  /**
   * Pausa todas as animacoes
   */
  pauseAll(): void {
    this.animations.forEach((a) => a.pause());
  }

  /**
   * Resume todas as animacoes
   */
  playAll(): void {
    this.animations.forEach((a) => a.play());
  }
}

export const animationBatcher = new AnimationBatcher();

// ============================================
// Virtual List Animation
// ============================================

type VirtualAnimationConfig = {
  container: Element | string;
  itemSelector: string;
  animation: Keyframe[];
  options?: KeyframeAnimationOptions;
  stagger?: number;
  viewportMargin?: number; // pixels extra alem da viewport
  batchSize?: number; // quantos itens animar por frame
};

/**
 * Anima apenas elementos visiveis (virtualizacao)
 * Ideal para listas com milhares de itens
 */
export function virtualAnimate(config: VirtualAnimationConfig): () => void {
  const {
    container,
    itemSelector,
    animation,
    options = {},
    stagger = 30,
    viewportMargin = 100,
    batchSize = 20,
  } = config;

  const containerEl =
    typeof container === 'string' ? document.querySelector(container) : container;

  if (!containerEl) return () => {};

  const items = Array.from(containerEl.querySelectorAll(itemSelector));
  const animated = new Set<Element>();
  let currentBatch = 0;

  // Aplica estado inicial a todos
  items.forEach((item) => {
    const [initial] = animation;
    if (initial && item instanceof HTMLElement) {
      Object.entries(initial).forEach(([key, value]) => {
        if (key === 'opacity' || key === 'transform') {
          item.style[key as any] = String(value);
        }
      });
    }
  });

  const isInViewport = (el: Element): boolean => {
    const rect = el.getBoundingClientRect();
    return (
      rect.bottom >= -viewportMargin &&
      rect.top <= window.innerHeight + viewportMargin
    );
  };

  const animateBatch = () => {
    const visibleItems = items.filter(
      (item) => !animated.has(item) && isInViewport(item)
    );

    const batch = visibleItems.slice(0, batchSize);

    batch.forEach((item, i) => {
      animated.add(item);

      item.animate(animation, {
        duration: 500,
        fill: 'forwards',
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        delay: i * stagger,
        ...options,
      });
    });

    currentBatch++;
  };

  // Observer para detectar novos itens visiveis
  const observer = new IntersectionObserver(
    (entries) => {
      const hasNew = entries.some(
        (e) => e.isIntersecting && !animated.has(e.target)
      );
      if (hasNew) {
        requestAnimationFrame(animateBatch);
      }
    },
    {
      rootMargin: `${viewportMargin}px`,
    }
  );

  items.forEach((item) => observer.observe(item));

  // Anima batch inicial
  requestAnimationFrame(animateBatch);

  return () => {
    observer.disconnect();
    animated.clear();
  };
}

// ============================================
// RAF Throttle for Scroll/Mouse
// ============================================

/**
 * Throttle baseado em RAF (mais eficiente que setTimeout)
 */
export function rafThrottle<T extends (...args: any[]) => void>(
  fn: T
): T & { cancel: () => void } {
  let rafId: number | null = null;
  let lastArgs: any[] | null = null;

  const throttled = ((...args: any[]) => {
    lastArgs = args;

    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        fn(...lastArgs!);
        rafId = null;
      });
    }
  }) as T & { cancel: () => void };

  throttled.cancel = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  return throttled;
}

/**
 * Debounce otimizado para animacoes
 */
export function rafDebounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number = 0
): T & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let rafId: number | null = null;

  const debounced = ((...args: any[]) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      rafId = requestAnimationFrame(() => {
        fn(...args);
        rafId = null;
      });
    }, delay);
  }) as T & { cancel: () => void };

  debounced.cancel = () => {
    if (timeoutId !== null) clearTimeout(timeoutId);
    if (rafId !== null) cancelAnimationFrame(rafId);
  };

  return debounced;
}

// ============================================
// Will-Change Manager
// ============================================

/**
 * Gerencia will-change para evitar VRAM desperdicada
 * Aplica antes da animacao, remove depois
 */
export function withWillChange(
  elements: Element | Element[] | string,
  properties: string,
  fn: () => Animation | Animation[] | void
): void {
  const els =
    typeof elements === 'string'
      ? Array.from(document.querySelectorAll(elements))
      : Array.isArray(elements)
        ? elements
        : [elements];

  // Aplica will-change
  batcher.write(() => {
    els.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.style.willChange = properties;
      }
    });
  });

  // Executa animacao
  const result = fn();
  const animations = Array.isArray(result)
    ? result
    : result
      ? [result]
      : [];

  // Remove will-change quando todas terminarem
  if (animations.length > 0) {
    Promise.all(animations.map((a) => a.finished)).then(() => {
      batcher.write(() => {
        els.forEach((el) => {
          if (el instanceof HTMLElement) {
            el.style.willChange = 'auto';
          }
        });
      });
    });
  } else {
    // Se nao retornou animacoes, remove no proximo frame
    requestAnimationFrame(() => {
      batcher.write(() => {
        els.forEach((el) => {
          if (el instanceof HTMLElement) {
            el.style.willChange = 'auto';
          }
        });
      });
    });
  }
}

// ============================================
// Composite Layer Hint
// ============================================

/**
 * Forca elemento para propria camada de composicao (GPU)
 * Util para elementos que vao animar frequentemente
 */
export function promoteToLayer(element: Element | string): () => void {
  const el =
    typeof element === 'string' ? document.querySelector(element) : element;

  if (!el || !(el instanceof HTMLElement)) return () => {};

  const originalTransform = el.style.transform;

  // translateZ(0) forca nova camada
  el.style.transform = originalTransform
    ? `${originalTransform} translateZ(0)`
    : 'translateZ(0)';

  return () => {
    el.style.transform = originalTransform;
  };
}

/**
 * Demove de camada propria (libera VRAM)
 */
export function demoteFromLayer(element: Element | string): void {
  const el =
    typeof element === 'string' ? document.querySelector(element) : element;

  if (!el || !(el instanceof HTMLElement)) return;

  el.style.transform = el.style.transform.replace(/\s*translateZ\(0\)/g, '');
  el.style.willChange = 'auto';
}
