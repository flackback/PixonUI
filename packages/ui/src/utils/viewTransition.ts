export interface PixonViewTransitionFallback {
  duration?: number;
  easing?: string;
  type?: 'crossfade' | 'none';
}

export function startPixonTransition(
  update: () => void | Promise<void>,
  fallback: PixonViewTransitionFallback = {}
): Promise<void> {
  const { duration = 250, easing = 'cubic-bezier(0.4,0,0.2,1)', type = 'crossfade' } = fallback;

  return new Promise(async (resolve) => {
    const reducedMotion =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (typeof document !== 'undefined' && 'startViewTransition' in document && !reducedMotion) {
      try {
        const transition = (document as any).startViewTransition(update);
        await transition.finished;
        resolve();
        return;
      } catch (e) {
        console.warn('PixonUI: Native startViewTransition failed, falling back.', e);
      }
    }

    if (type === 'crossfade' && !reducedMotion && typeof document !== 'undefined') {
      try {
        // Simple visual snapshot using a clone
        const clone = document.body.cloneNode(true) as HTMLElement;
        clone.style.position = 'fixed';
        clone.style.top = '0';
        clone.style.left = '0';
        clone.style.width = '100vw';
        clone.style.height = '100vh';
        clone.style.pointerEvents = 'none';
        clone.style.margin = '0';
        clone.style.zIndex = '999999';
        clone.style.overflow = 'hidden';

        document.documentElement.appendChild(clone);

        await update();

        // Animate opacity out
        const animation = clone.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration,
          easing,
        });

        const cleanup = () => {
          if (clone.parentNode) {
            clone.parentNode.removeChild(clone);
          }
          resolve();
        };

        animation.onfinish = cleanup;
        animation.oncancel = cleanup;
        
        // Failsafe
        setTimeout(cleanup, duration + 100);
        return;
      } catch (e) {
        console.warn('PixonUI: WAAPI crossfade fallback failed.', e);
      }
    }

    // Default fallback (no animation or reduced motion)
    await update();
    resolve();
  });
}
