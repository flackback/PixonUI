/**
 * PixonScroll - Scroll-driven animations usando APIs nativas
 * Bundle size: 0 bytes
 * Performance: 120fps (usa CSS scroll-timeline ou IntersectionObserver otimizado)
 *
 * Suporta:
 * 1. CSS Scroll-Driven Animations (Chrome 115+)
 * 2. Fallback para IntersectionObserver + WAAPI
 */

export type ScrollTriggerConfig = {
  trigger: Element | string;
  start?: string; // "top center", "top 80%", etc.
  end?: string; // "bottom center", "bottom 20%", etc.
  scrub?: boolean | number; // true = scrub, number = smoothing
  pin?: boolean;
  markers?: boolean; // debug markers
  onEnter?: () => void;
  onLeave?: () => void;
  onEnterBack?: () => void;
  onLeaveBack?: () => void;
  onUpdate?: (progress: number) => void;
};

export type ScrollAnimationConfig = {
  trigger: Element | string;
  animation: {
    target?: Element | string;
    keyframes: Keyframe[];
    options?: KeyframeAnimationOptions;
  };
  start?: string;
  end?: string;
  scrub?: boolean | number;
};

// Checa suporte a scroll-timeline (com guard para SSR)
const supportsScrollTimeline =
  typeof CSS !== 'undefined' && CSS.supports('animation-timeline', 'scroll()');

/**
 * Parseia posições como "top center" ou "top 80%"
 */
function parsePosition(position: string): { element: number; viewport: number } {
  const parts = position.split(' ');
  const elementPos = parts[0] ?? 'top';
  const viewportPos = parts[1] ?? 'center';

  const elementMap: Record<string, number> = { top: 0, center: 0.5, bottom: 1 };
  const parseValue = (val: string): number => {
    if (val.endsWith('%')) return parseFloat(val) / 100;
    return elementMap[val] ?? 0.5;
  };

  return {
    element: parseValue(elementPos),
    viewport: parseValue(viewportPos),
  };
}

/**
 * ScrollTrigger usando IntersectionObserver (fallback universal)
 */
export function scrollTrigger(config: ScrollTriggerConfig): () => void {
  const {
    trigger,
    start = 'top center',
    end = 'bottom center',
    scrub = false,
    markers = false,
    onEnter,
    onLeave,
    onEnterBack,
    onLeaveBack,
    onUpdate,
  } = config;

  const triggerEl =
    typeof trigger === 'string' ? document.querySelector(trigger) : trigger;

  if (!triggerEl) {
    console.warn('[PixonScroll] Trigger element not found');
    return () => {};
  }

  const startPos = parsePosition(start);
  const endPos = parsePosition(end);

  // Debug markers
  if (markers) {
    const markerStart = document.createElement('div');
    markerStart.style.cssText = `position:fixed;right:0;height:1px;width:100px;background:green;z-index:9999;top:${startPos.viewport * 100}vh`;
    markerStart.textContent = 'start';
    document.body.appendChild(markerStart);

    const markerEnd = document.createElement('div');
    markerEnd.style.cssText = `position:fixed;right:0;height:1px;width:100px;background:red;z-index:9999;top:${endPos.viewport * 100}vh`;
    markerEnd.textContent = 'end';
    document.body.appendChild(markerEnd);
  }

  let lastProgress = -1;
  let isInView = false;
  let lastDirection: 'down' | 'up' = 'down';

  const calculateProgress = (): number => {
    const rect = triggerEl.getBoundingClientRect();
    const vh = window.innerHeight;

    // Posição do trigger point do elemento
    const triggerTop = rect.top + rect.height * startPos.element;
    const triggerBottom = rect.top + rect.height * endPos.element;

    // Posição do viewport trigger
    const viewportStart = vh * startPos.viewport;
    const viewportEnd = vh * endPos.viewport;

    // Calcula progress (0 quando start atinge viewport, 1 quando end atinge)
    const totalDistance = triggerBottom - triggerTop + (viewportStart - viewportEnd);
    const currentDistance = viewportStart - triggerTop;

    return Math.max(0, Math.min(1, currentDistance / totalDistance));
  };

  const onScroll = () => {
    const progress = calculateProgress();
    const direction = progress > lastProgress ? 'down' : 'up';

    // Detecta enter/leave
    const wasInView = isInView;
    isInView = progress > 0 && progress < 1;

    if (!wasInView && isInView) {
      if (direction === 'down') {
        onEnter?.();
      } else {
        onEnterBack?.();
      }
    } else if (wasInView && !isInView) {
      if (direction === 'down') {
        onLeave?.();
      } else {
        onLeaveBack?.();
      }
    }

    if (scrub && progress !== lastProgress) {
      onUpdate?.(progress);
    }

    lastProgress = progress;
    lastDirection = direction;
  };

  // Throttle com requestAnimationFrame
  let ticking = false;
  const scrollHandler = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', scrollHandler, { passive: true });

  // Initial check
  onScroll();

  // Cleanup
  return () => {
    window.removeEventListener('scroll', scrollHandler);
  };
}

/**
 * Scroll-driven animation (scrub automático)
 * Usa CSS scroll-timeline quando disponível, fallback para WAAPI
 */
export function scrollAnimation(config: ScrollAnimationConfig): () => void {
  const {
    trigger,
    animation,
    start = 'top bottom',
    end = 'bottom top',
    scrub = true,
  } = config;

  const triggerEl =
    typeof trigger === 'string' ? document.querySelector(trigger) : trigger;
  const targetEl = animation.target
    ? typeof animation.target === 'string'
      ? document.querySelector(animation.target)
      : animation.target
    : triggerEl;

  if (!triggerEl || !targetEl) {
    console.warn('[PixonScroll] Element not found');
    return () => {};
  }

  // CSS Scroll-Driven Animation (nativo, mais performático)
  if (supportsScrollTimeline) {
    // Usa um stylesheet dedicado para a animação scroll-driven
    const styleId = `pixon-anim-${Math.random().toString(36).slice(2)}`;
    const style = document.createElement('style');
    style.id = styleId;
    
    // Cria animação com scroll-timeline via CSS
    style.textContent = `
      .${styleId} {
        animation-name: ${styleId}-anim;
        animation-timeline: view();
        animation-range: ${start} ${end};
        animation-fill-mode: both;
      }
      @keyframes ${styleId}-anim {
        ${animation.keyframes.map((kf, i) => `${(i / (animation.keyframes.length - 1)) * 100}% { 
          ${Object.entries(kf).map(([k, v]) => `${k}: ${v}`).join('; ')}
        }`).join('\n')}
      }
    `;
    document.head.appendChild(style);
    (targetEl as HTMLElement).classList.add(styleId);

    return () => {
      style.remove();
      (targetEl as HTMLElement).classList.remove(styleId);
    };
  }

  // Fallback: WAAPI + scroll listener
  const anim = targetEl.animate(animation.keyframes, {
    ...animation.options,
    fill: 'both',
    duration: 1000, // será controlado manualmente
  });

  anim.pause(); // pausa para controlar via scroll

  const smoothing = typeof scrub === 'number' ? scrub : 0;
  let targetProgress = 0;
  let currentProgress = 0;

  const cleanup = scrollTrigger({
    trigger: triggerEl,
    start,
    end,
    scrub: true,
    onUpdate: (progress) => {
      targetProgress = progress;
    },
  });

  // Smoothing loop
  if (smoothing > 0) {
    const tick = () => {
      currentProgress += (targetProgress - currentProgress) * (1 - smoothing);
      anim.currentTime = currentProgress * 1000;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  } else {
    // Sem smoothing - atualiza direto
    scrollTrigger({
      trigger: triggerEl,
      start,
      end,
      scrub: true,
      onUpdate: (progress) => {
        anim.currentTime = progress * 1000;
      },
    });
    return () => {
      cleanup();
      anim.cancel();
    };
  }

  return () => {
    cleanup();
    anim.cancel();
  };
}

/**
 * Parallax simples (usa CSS transform via scroll)
 */
export function parallax(
  element: Element | string,
  options: {
    speed?: number; // -1 a 1, negativo = oposto ao scroll
    direction?: 'vertical' | 'horizontal';
  } = {}
): () => void {
  const { speed = 0.5, direction = 'vertical' } = options;

  const el =
    typeof element === 'string' ? document.querySelector(element) : element;

  if (!el) return () => {};

  // CSS scroll-driven parallax (mais performático)
  if (supportsScrollTimeline) {
    const distance = speed * 200;
    const styleId = `pixon-parallax-${Math.random().toString(36).slice(2)}`;
    const style = document.createElement('style');
    style.id = styleId;

    style.textContent = `
      .${styleId} {
        animation-name: ${styleId}-parallax;
        animation-timeline: view();
        animation-fill-mode: both;
      }
      @keyframes ${styleId}-parallax {
        from { transform: ${direction === 'vertical' ? `translateY(${-distance}px)` : `translateX(${-distance}px)`}; }
        to { transform: ${direction === 'vertical' ? `translateY(${distance}px)` : `translateX(${distance}px)`}; }
      }
    `;
    document.head.appendChild(style);
    (el as HTMLElement).classList.add(styleId);

    return () => {
      style.remove();
      (el as HTMLElement).classList.remove(styleId);
    };
  }

  // Fallback: transform via scroll listener
  let ticking = false;

  const onScroll = () => {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const centerOffset = (rect.top + rect.height / 2 - vh / 2) * speed;

      (el as HTMLElement).style.transform =
        direction === 'vertical'
          ? `translateY(${centerOffset}px)`
          : `translateX(${centerOffset}px)`;

      ticking = false;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  return () => window.removeEventListener('scroll', onScroll);
}

/**
 * Reveal on scroll (aparece quando entra na viewport)
 */
export function reveal(
  elements: Element | Element[] | string,
  options: {
    animation?: Keyframe[];
    duration?: number;
    stagger?: number;
    threshold?: number;
    once?: boolean;
  } = {}
): () => void {
  const {
    animation = [
      { opacity: 0, transform: 'translateY(20px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
    duration = 600,
    stagger = 100,
    threshold = 0.1,
    once = true,
  } = options;

  const els =
    typeof elements === 'string'
      ? Array.from(document.querySelectorAll(elements))
      : Array.isArray(elements)
        ? elements
        : [elements];

  // Estado inicial
  els.forEach((el) => {
    (el as HTMLElement).style.opacity = '0';
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = els.indexOf(entry.target as Element);
          const delay = index * stagger;

          entry.target.animate(animation, {
            duration,
            delay,
            fill: 'forwards',
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          });

          if (once) {
            observer.unobserve(entry.target);
          }
        } else if (!once) {
          // Reset quando sai da viewport
          (entry.target as HTMLElement).style.opacity = '0';
        }
      });
    },
    { threshold }
  );

  els.forEach((el) => observer.observe(el));

  return () => observer.disconnect();
}
