type ViewTransitionCallback = () => void | Promise<void>;

interface PixonTransitionOptions {
  duration?: number;        // default 250
  easing?: string;          // default 'ease-in-out'
  skipFallback?: boolean;   // default false → degrada via overlay
}

export function startPixonTransition(
  update: ViewTransitionCallback,
  opts: PixonTransitionOptions = {}
): Promise<void> {
  const { duration = 250, easing = 'ease-in-out', skipFallback = false } = opts;

  // 1. Respeita prefers-reduced-motion → executa update síncrono
  if (typeof window === 'undefined' ||
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    const result = update();
    return result instanceof Promise ? result.then(() => {}) : Promise.resolve();
  }

  // 2. Caminho nativo
  const doc = document as Document & {
    startViewTransition?: (cb: ViewTransitionCallback) => { finished: Promise<void> };
  };
  if (typeof doc.startViewTransition === 'function') {
    return doc.startViewTransition(update).finished.catch(() => {});
  }

  // 3. Fallback: overlay leve (não clona DOM)
  if (skipFallback) {
    const result = update();
    return result instanceof Promise ? result.then(() => {}) : Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const overlay = document.createElement('div');
    overlay.setAttribute('data-pixon-transition-overlay', '');
    overlay.style.cssText = [
      'position:fixed',
      'inset:0',
      'background:var(--pixon-bg, #000)',
      'opacity:0',
      'pointer-events:none',
      'z-index:2147483646',
      `transition:opacity ${duration / 2}ms ${easing}`,
    ].join(';');
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      const onFadeIn = () => {
        overlay.removeEventListener('transitionend', onFadeIn);
        const result = update();
        Promise.resolve(result).then(() => {
          requestAnimationFrame(() => {
            overlay.style.opacity = '0';
            const onFadeOut = () => {
              overlay.removeEventListener('transitionend', onFadeOut);
              overlay.remove();
              resolve();
            };
            overlay.addEventListener('transitionend', onFadeOut, { once: true });
          });
        });
      };
      overlay.addEventListener('transitionend', onFadeIn, { once: true });
    });
  });
}

