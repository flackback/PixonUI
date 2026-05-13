/**
 * PixonMotion Text Animations
 * Animacoes de texto performaticas e visualmente impressionantes
 * Zero dependencias - apenas WAAPI + DOM APIs
 */

// ============================================================================
// TIPOS
// ============================================================================

export type SplitType = 'chars' | 'words' | 'lines';

export type TextAnimationOptions = {
  duration?: number;
  stagger?: number;
  easing?: string;
  delay?: number;
};

// ============================================================================
// TEXT SPLITTING
// ============================================================================

/**
 * Divide texto em spans animaveis
 */
export function splitText(
  element: HTMLElement,
  type: SplitType = 'chars'
): HTMLSpanElement[] {
  const text = element.textContent || '';
  element.textContent = '';
  element.style.display = 'inline-block';

  const spans: HTMLSpanElement[] = [];

  if (type === 'chars') {
    for (const char of text) {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block';
      span.style.willChange = 'transform, opacity';
      element.appendChild(span);
      spans.push(span);
    }
  } else if (type === 'words') {
    const words = text.split(' ');
    words.forEach((word, i) => {
      const span = document.createElement('span');
      span.textContent = word;
      span.style.display = 'inline-block';
      span.style.willChange = 'transform, opacity';
      element.appendChild(span);
      spans.push(span);

      if (i < words.length - 1) {
        element.appendChild(document.createTextNode(' '));
      }
    });
  } else if (type === 'lines') {
    // Mede linhas reais baseado na posicao Y
    const tempSpans: HTMLSpanElement[] = [];
    for (const word of text.split(' ')) {
      const span = document.createElement('span');
      span.textContent = word + ' ';
      span.style.display = 'inline';
      element.appendChild(span);
      tempSpans.push(span);
    }

    // Agrupa por linha
    const lines: string[] = [];
    let currentLine = '';
    let lastY = tempSpans[0]?.offsetTop;

    tempSpans.forEach((span) => {
      if (span.offsetTop !== lastY) {
        lines.push(currentLine.trim());
        currentLine = span.textContent || '';
        lastY = span.offsetTop;
      } else {
        currentLine += span.textContent || '';
      }
    });
    lines.push(currentLine.trim());

    // Limpa e recria como spans de linha
    element.textContent = '';
    lines.forEach((line) => {
      const span = document.createElement('span');
      span.textContent = line;
      span.style.display = 'block';
      span.style.willChange = 'transform, opacity';
      element.appendChild(span);
      spans.push(span);
    });
  }

  return spans;
}

/**
 * Restaura texto original
 */
export function unsplitText(element: HTMLElement, originalText: string): void {
  element.textContent = originalText;
  element.style.display = '';
}

// ============================================================================
// TEXT ANIMATIONS
// ============================================================================

/**
 * Reveal por caractere
 */
export function revealChars(
  element: HTMLElement,
  options: TextAnimationOptions = {}
): { play: () => Animation[]; cleanup: () => void } {
  const { duration = 30, stagger = 30, easing = 'ease-out', delay = 0 } = options;
  const originalText = element.textContent || '';
  const chars = splitText(element, 'chars');

  // Estado inicial
  chars.forEach((char) => {
    char.style.opacity = '0';
    char.style.transform = 'translateY(20px)';
  });

  const play = () => {
    return chars.map((char, i) => {
      return char.animate(
        [
          { opacity: 0, transform: 'translateY(20px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        {
          duration,
          easing,
          delay: delay + i * stagger,
          fill: 'forwards',
        }
      );
    });
  };

  const cleanup = () => unsplitText(element, originalText);

  return { play, cleanup };
}

/**
 * Typewriter effect
 */
export function typewriter(
  element: HTMLElement,
  options: { speed?: number; cursor?: boolean; cursorChar?: string; delay?: number } = {}
): { play: () => Promise<void>; cleanup: () => void } {
  const { speed = 50, cursor = true, cursorChar = '|', delay = 0 } = options;
  const text = element.textContent || '';
  const originalText = text;

  let cursorEl: HTMLSpanElement | null = null;

  const play = async () => {
    await new Promise((r) => setTimeout(r, delay));

    element.textContent = '';

    if (cursor) {
      cursorEl = document.createElement('span');
      cursorEl.textContent = cursorChar;
      cursorEl.style.display = 'inline-block';
      cursorEl.animate(
        [{ opacity: 1 }, { opacity: 1 }, { opacity: 0 }, { opacity: 0 }],
        { duration: 1000, iterations: Infinity, easing: 'steps(1)' }
      );
      element.appendChild(cursorEl);
    }

    for (let i = 0; i < text.length; i++) {
      const charSpan = document.createElement('span');
      charSpan.textContent = text[i];
      if (cursorEl) {
        element.insertBefore(charSpan, cursorEl);
      } else {
        element.appendChild(charSpan);
      }
      await new Promise((r) => setTimeout(r, speed));
    }

    if (cursorEl) {
      setTimeout(() => {
        cursorEl?.remove();
      }, 2000);
    }
  };

  const cleanup = () => {
    element.textContent = originalText;
  };

  return { play, cleanup };
}

/**
 * Scramble text
 */
export function scramble(
  element: HTMLElement,
  options: { duration?: number; chars?: string; delay?: number } = {}
): { play: () => Promise<void>; cleanup: () => void } {
  const {
    duration = 1000,
    chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*',
    delay = 0,
  } = options;

  const originalText = element.textContent || '';
  const target = originalText;
  let rafId: number;

  const play = () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const startTime = performance.now();

        const animate = () => {
          const elapsed = performance.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const revealedLength = Math.floor(progress * target.length);

          let result = '';
          for (let i = 0; i < target.length; i++) {
            if (i < revealedLength) {
              result += target[i];
            } else if (target[i] === ' ') {
              result += ' ';
            } else {
              result += chars[Math.floor(Math.random() * chars.length)];
            }
          }

          element.textContent = result;

          if (progress < 1) {
            rafId = requestAnimationFrame(animate);
          } else {
            element.textContent = target;
            resolve();
          }
        };

        rafId = requestAnimationFrame(animate);
      }, delay);
    });
  };

  const cleanup = () => {
    cancelAnimationFrame(rafId);
    element.textContent = originalText;
  };

  return { play, cleanup };
}

/**
 * Counter animation
 */
export function counter(
  element: HTMLElement,
  options: {
    from?: number;
    to: number;
    duration?: number;
    easing?: (t: number) => number;
    format?: (n: number) => string;
    delay?: number;
  }
): { play: () => Promise<void>; cleanup: () => void } {
  const {
    from = 0,
    to,
    duration = 1000,
    easing = (t: number) => 1 - Math.pow(1 - t, 3), // ease-out cubic
    format = (n: number) => Math.round(n).toLocaleString(),
    delay = 0,
  } = options;

  const originalText = element.textContent;
  let rafId: number;

  const play = () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const startTime = performance.now();

        const animate = () => {
          const elapsed = performance.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easedProgress = easing(progress);
          const current = from + (to - from) * easedProgress;

          element.textContent = format(current);

          if (progress < 1) {
            rafId = requestAnimationFrame(animate);
          } else {
            element.textContent = format(to);
            resolve();
          }
        };

        rafId = requestAnimationFrame(animate);
      }, delay);
    });
  };

  const cleanup = () => {
    cancelAnimationFrame(rafId);
    element.textContent = originalText;
  };

  return { play, cleanup };
}

/**
 * Wave animation
 */
export function wave(
  element: HTMLElement,
  options: {
    amplitude?: number;
    frequency?: number;
    duration?: number;
    iterations?: number;
  } = {}
): { play: () => Animation[]; cleanup: () => void } {
  const {
    amplitude = 10,
    frequency = 0.5,
    duration = 2000,
    iterations = Infinity,
  } = options;

  const originalText = element.textContent || '';
  const chars = splitText(element, 'chars');

  const play = () => {
    return chars.map((char, i) => {
      const keyframes: Keyframe[] = [];
      const steps = 20;

      for (let step = 0; step <= steps; step++) {
        const t = step / steps;
        const y = Math.sin((t + i * frequency) * Math.PI * 2) * amplitude;
        keyframes.push({ transform: `translateY(${y}px)` });
      }

      return char.animate(keyframes, {
        duration,
        iterations,
        easing: 'linear',
      });
    });
  };

  const cleanup = () => unsplitText(element, originalText);

  return { play, cleanup };
}
