/**
 * PixonLayout - FLIP animations para mudancas de layout
 * Bundle size: 0 bytes (APIs nativas)
 * Performance: Usa CSS transform (compositor thread)
 *
 * FLIP = First, Last, Invert, Play
 * Tecnica usada por Framer Motion para layout animations
 */

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type FLIPConfig = {
  duration?: number;
  easing?: string;
  onStart?: () => void;
  onComplete?: () => void;
};

type LayoutGroupConfig = {
  duration?: number;
  easing?: string;
  stagger?: number;
};

// Cache de posicoes anteriores
const rectCache = new WeakMap<Element, Rect>();

/**
 * Captura a posicao atual de um elemento
 */
function getRect(el: Element): Rect {
  const rect = el.getBoundingClientRect();
  return {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
  };
}

/**
 * FLIP animation para um unico elemento
 */
export function flip(element: Element | string, config: FLIPConfig = {}): () => void {
  const { duration = 300, easing = 'cubic-bezier(0.4, 0, 0.2, 1)', onStart, onComplete } = config;

  const el = typeof element === 'string' ? document.querySelector(element) : element;
  if (!el || !(el instanceof HTMLElement)) return () => {};

  // First: captura posicao inicial
  const first = getRect(el);
  rectCache.set(el, first);

  return () => {
    // Last: nova posicao apos mudanca de layout
    const last = getRect(el);
    const cached = rectCache.get(el);

    if (!cached) return;

    // Invert: calcula delta
    const deltaX = cached.x - last.x;
    const deltaY = cached.y - last.y;
    const scaleX = cached.width / last.width;
    const scaleY = cached.height / last.height;

    // Pula se nao mudou
    if (deltaX === 0 && deltaY === 0 && scaleX === 1 && scaleY === 1) {
      return;
    }

    onStart?.();

    // Play: anima do estado invertido para o normal
    el.animate(
      [
        {
          transform: `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`,
        },
        {
          transform: 'translate(0, 0) scale(1, 1)',
        },
      ],
      {
        duration,
        easing,
        fill: 'forwards',
      }
    ).onfinish = () => {
      onComplete?.();
      rectCache.set(el, last); // Atualiza cache
    };
  };
}

/**
 * Auto FLIP - monitora mudancas de layout automaticamente
 */
export function autoFlip(
  element: Element | string,
  config: FLIPConfig = {}
): () => void {
  const el = typeof element === 'string' ? document.querySelector(element) : element;
  if (!el) return () => {};

  // Captura inicial
  rectCache.set(el, getRect(el));

  // Observer para detectar mudancas
  const observer = new MutationObserver(() => {
    const playFlip = flip(el, config);
    // Aguarda proximo frame para pegar nova posicao
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        playFlip();
      });
    });
  });

  // Observa mudancas no elemento e ancestrais
  observer.observe(el, {
    attributes: true,
    attributeFilter: ['class', 'style'],
  });

  // Observa mudancas no parent (reordenacao)
  if (el.parentElement) {
    observer.observe(el.parentElement, {
      childList: true,
    });
  }

  return () => observer.disconnect();
}

/**
 * Layout Group - sincroniza FLIP de multiplos elementos
 */
export function layoutGroup(
  elements: Element[] | string,
  config: LayoutGroupConfig = {}
): {
  prepare: () => void;
  animate: () => void;
  cleanup: () => void;
} {
  const { duration = 300, easing = 'cubic-bezier(0.4, 0, 0.2, 1)', stagger = 0 } = config;

  const els =
    typeof elements === 'string'
      ? Array.from(document.querySelectorAll(elements))
      : elements;

  const flips: Array<() => void> = [];

  return {
    // Chamar ANTES da mudanca de layout
    prepare: () => {
      flips.length = 0;
      els.forEach((el) => {
        flips.push(flip(el, { duration, easing }));
      });
    },

    // Chamar DEPOIS da mudanca de layout
    animate: () => {
      flips.forEach((playFlip, i) => {
        setTimeout(() => playFlip(), i * stagger);
      });
    },

    cleanup: () => {
      flips.length = 0;
    },
  };
}

/**
 * Shared Layout - anima entre dois elementos diferentes
 * (ex: thumbnail -> full image)
 */
export function sharedLayout(
  from: Element | string,
  to: Element | string,
  config: FLIPConfig & { clone?: boolean } = {}
): Animation | null {
  const {
    duration = 500,
    easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
    clone = true,
    onStart,
    onComplete,
  } = config;

  const fromEl = typeof from === 'string' ? document.querySelector(from) : from;
  const toEl = typeof to === 'string' ? document.querySelector(to) : to;

  if (!fromEl || !toEl || !(fromEl instanceof HTMLElement) || !(toEl instanceof HTMLElement)) {
    return null;
  }

  const fromRect = fromEl.getBoundingClientRect();
  const toRect = toEl.getBoundingClientRect();

  onStart?.();

  if (clone) {
    // Cria clone para animar
    const cloneEl = fromEl.cloneNode(true) as HTMLElement;
    cloneEl.style.cssText = `
      position: fixed;
      left: ${fromRect.left}px;
      top: ${fromRect.top}px;
      width: ${fromRect.width}px;
      height: ${fromRect.height}px;
      margin: 0;
      z-index: 9999;
      pointer-events: none;
    `;

    document.body.appendChild(cloneEl);

    // Esconde originais
    fromEl.style.opacity = '0';
    toEl.style.opacity = '0';

    const anim = cloneEl.animate(
      [
        {
          left: `${fromRect.left}px`,
          top: `${fromRect.top}px`,
          width: `${fromRect.width}px`,
          height: `${fromRect.height}px`,
        },
        {
          left: `${toRect.left}px`,
          top: `${toRect.top}px`,
          width: `${toRect.width}px`,
          height: `${toRect.height}px`,
        },
      ],
      {
        duration,
        easing,
        fill: 'forwards',
      }
    );

    anim.onfinish = () => {
      cloneEl.remove();
      toEl.style.opacity = '1';
      onComplete?.();
    };

    return anim;
  }

  // Sem clone - anima o elemento de destino
  const deltaX = fromRect.left - toRect.left;
  const deltaY = fromRect.top - toRect.top;
  const scaleX = fromRect.width / toRect.width;
  const scaleY = fromRect.height / toRect.height;

  fromEl.style.opacity = '0';

  const anim = toEl.animate(
    [
      {
        transform: `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`,
        opacity: 1,
      },
      {
        transform: 'translate(0, 0) scale(1, 1)',
        opacity: 1,
      },
    ],
    {
      duration,
      easing,
      fill: 'forwards',
    }
  );

  anim.onfinish = () => {
    onComplete?.();
  };

  return anim;
}

/**
 * Reorder animation - anima reordenacao de lista
 */
export function reorderList(
  container: Element | string,
  config: LayoutGroupConfig = {}
): {
  beforeUpdate: () => void;
  afterUpdate: () => void;
} {
  const { duration = 300, easing = 'cubic-bezier(0.4, 0, 0.2, 1)', stagger = 20 } = config;

  const containerEl =
    typeof container === 'string' ? document.querySelector(container) : container;

  if (!containerEl) {
    return {
      beforeUpdate: () => {},
      afterUpdate: () => {},
    };
  }

  let positions = new Map<Element, Rect>();

  return {
    // Chamar antes de reordenar
    beforeUpdate: () => {
      positions.clear();
      Array.from(containerEl.children).forEach((child) => {
        positions.set(child, getRect(child));
      });
    },

    // Chamar depois de reordenar
    afterUpdate: () => {
      const children = Array.from(containerEl.children);

      children.forEach((child, index) => {
        const oldPos = positions.get(child);
        if (!oldPos) return;

        const newPos = getRect(child);

        const deltaX = oldPos.x - newPos.x;
        const deltaY = oldPos.y - newPos.y;

        if (deltaX === 0 && deltaY === 0) return;

        child.animate(
          [
            { transform: `translate(${deltaX}px, ${deltaY}px)` },
            { transform: 'translate(0, 0)' },
          ],
          {
            duration,
            easing,
            delay: index * stagger,
            fill: 'forwards',
          }
        );
      });
    },
  };
}

/**
 * Exit animation - anima saida de elementos
 */
export function exit(
  element: Element | string,
  animation: Keyframe[] = [
    { opacity: 1, transform: 'scale(1)' },
    { opacity: 0, transform: 'scale(0.95)' },
  ],
  config: { duration?: number; easing?: string; remove?: boolean } = {}
): Promise<void> {
  const { duration = 200, easing = 'cubic-bezier(0.4, 0, 0.2, 1)', remove = true } = config;

  const el = typeof element === 'string' ? document.querySelector(element) : element;
  if (!el) return Promise.resolve();

  return new Promise((resolve) => {
    const anim = el.animate(animation, {
      duration,
      easing,
      fill: 'forwards',
    });

    anim.onfinish = () => {
      if (remove) el.remove();
      resolve();
    };
  });
}

/**
 * Presence animation - gerencia entrada e saida
 */
export function presence(
  element: Element | string,
  config: {
    initial?: Keyframe;
    animate?: Keyframe;
    exit?: Keyframe;
    duration?: number;
    easing?: string;
  } = {}
): {
  enter: () => Animation | null;
  exit: () => Promise<void>;
} {
  const {
    initial = { opacity: 0, transform: 'translateY(10px)' },
    animate = { opacity: 1, transform: 'translateY(0)' },
    exit: exitKeyframe = { opacity: 0, transform: 'translateY(-10px)' },
    duration = 300,
    easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
  } = config;

  const el = typeof element === 'string' ? document.querySelector(element) : element;

  return {
    enter: () => {
      if (!el) return null;

      // Aplica estado inicial
      Object.assign((el as HTMLElement).style, initial);

      return el.animate([initial, animate], {
        duration,
        easing,
        fill: 'forwards',
      });
    },

    exit: () => {
      if (!el) return Promise.resolve();

      return new Promise((resolve) => {
        const anim = el.animate([animate, exitKeyframe], {
          duration,
          easing,
          fill: 'forwards',
        });

        anim.onfinish = () => resolve();
      });
    },
  };
}
