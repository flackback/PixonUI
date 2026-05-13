/**
 * PixonMotion Presets
 * Animações prontas, testadas para 120fps e visualmente impressionantes
 * Zero dependências - apenas WAAPI + CSS
 */

// ============================================================================
// TIPOS
// ============================================================================

export type Preset = {
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
};

// ============================================================================
// EASING CURVES OTIMIZADAS PARA 120FPS
// Testadas em monitores de alta taxa de atualização
// ============================================================================

export const easing = {
  // Suaves - para UI elegante
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  smoothOut: 'cubic-bezier(0, 0, 0.2, 1)',
  smoothIn: 'cubic-bezier(0.4, 0, 1, 1)',

  // Expressivas - para chamar atenção
  expressive: 'cubic-bezier(0.4, 0.14, 0.3, 1)',
  expressiveOut: 'cubic-bezier(0.14, 0, 0.3, 1)',

  // Bounce natural - física realista
  bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  bounceOut: 'cubic-bezier(0.34, 1.4, 0.64, 1)',
  bounceSoft: 'cubic-bezier(0.34, 1.2, 0.64, 1)',

  // Spring approximations via cubic-bezier
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  springTight: 'cubic-bezier(0.175, 0.885, 0.32, 1.1)',
  springLoose: 'cubic-bezier(0.175, 0.885, 0.32, 1.5)',

  // Snap - para interações precisas
  snap: 'cubic-bezier(0.5, 0, 0.1, 1)',
  snapOut: 'cubic-bezier(0, 0, 0.1, 1)',

  // Dramatic - para hero sections
  dramatic: 'cubic-bezier(0.7, 0, 0.3, 1)',
  dramaticSlow: 'cubic-bezier(0.85, 0, 0.15, 1)',

  // Linear para scroll-driven
  linear: 'linear',
} as const;

// ============================================================================
// DURATIONS OTIMIZADAS
// Baseadas em pesquisa de UX e percepção humana
// ============================================================================

export const duration = {
  instant: 100,
  fast: 200,
  normal: 300,
  slow: 500,
  slower: 800,
  dramatic: 1200,
} as const;

// ============================================================================
// ENTRANCE PRESETS
// Animações de entrada elegantes
// ============================================================================

export const entrance = {
  // Fade simples mas suave
  fade: (): Preset => ({
    keyframes: [
      { opacity: 0 },
      { opacity: 1 },
    ],
    options: { duration: duration.normal, easing: easing.smooth, fill: 'forwards' },
  }),

  // Fade com scale - mais impactante
  fadeScale: (scale = 0.95): Preset => ({
    keyframes: [
      { opacity: 0, transform: `scale(${scale})` },
      { opacity: 1, transform: 'scale(1)' },
    ],
    options: { duration: duration.normal, easing: easing.spring, fill: 'forwards' },
  }),

  // Slide de baixo - clássico e elegante
  slideUp: (distance = 20): Preset => ({
    keyframes: [
      { opacity: 0, transform: `translateY(${distance}px)` },
      { opacity: 1, transform: 'translateY(0)' },
    ],
    options: { duration: duration.normal, easing: easing.expressive, fill: 'forwards' },
  }),

  // Slide de cima
  slideDown: (distance = 20): Preset => ({
    keyframes: [
      { opacity: 0, transform: `translateY(-${distance}px)` },
      { opacity: 1, transform: 'translateY(0)' },
    ],
    options: { duration: duration.normal, easing: easing.expressive, fill: 'forwards' },
  }),

  // Slide lateral esquerda
  slideLeft: (distance = 20): Preset => ({
    keyframes: [
      { opacity: 0, transform: `translateX(${distance}px)` },
      { opacity: 1, transform: 'translateX(0)' },
    ],
    options: { duration: duration.normal, easing: easing.expressive, fill: 'forwards' },
  }),

  // Slide lateral direita
  slideRight: (distance = 20): Preset => ({
    keyframes: [
      { opacity: 0, transform: `translateX(-${distance}px)` },
      { opacity: 1, transform: 'translateX(0)' },
    ],
    options: { duration: duration.normal, easing: easing.expressive, fill: 'forwards' },
  }),

  // Blur reveal - muito elegante
  blurIn: (blur = 10): Preset => ({
    keyframes: [
      { opacity: 0, filter: `blur(${blur}px)` },
      { opacity: 1, filter: 'blur(0px)' },
    ],
    options: { duration: duration.slow, easing: easing.smooth, fill: 'forwards' },
  }),

  // Scale bounce - para CTAs
  pop: (): Preset => ({
    keyframes: [
      { opacity: 0, transform: 'scale(0.8)' },
      { opacity: 1, transform: 'scale(1.05)' },
      { opacity: 1, transform: 'scale(1)' },
    ],
    options: { duration: duration.normal, easing: easing.bounce, fill: 'forwards' },
  }),

  // Flip 3D - dramático
  flipIn: (axis: 'x' | 'y' = 'x'): Preset => ({
    keyframes: [
      { opacity: 0, transform: `perspective(1000px) rotate${axis.toUpperCase()}(90deg)` },
      { opacity: 1, transform: `perspective(1000px) rotate${axis.toUpperCase()}(0deg)` },
    ],
    options: { duration: duration.slow, easing: easing.expressive, fill: 'forwards' },
  }),

  // Zoom dramático - para hero
  zoomIn: (): Preset => ({
    keyframes: [
      { opacity: 0, transform: 'scale(1.5)' },
      { opacity: 1, transform: 'scale(1)' },
    ],
    options: { duration: duration.slower, easing: easing.dramaticSlow, fill: 'forwards' },
  }),

  // Glitch entrance - tech/gaming
  glitch: (): Preset => ({
    keyframes: [
      { opacity: 0, transform: 'translateX(-5px)', filter: 'hue-rotate(90deg)' },
      { opacity: 0.5, transform: 'translateX(5px)', filter: 'hue-rotate(-90deg)' },
      { opacity: 0.8, transform: 'translateX(-2px)', filter: 'hue-rotate(45deg)' },
      { opacity: 1, transform: 'translateX(0)', filter: 'hue-rotate(0deg)' },
    ],
    options: { duration: duration.fast, easing: 'steps(4)', fill: 'forwards' },
  }),

  // Typewriter cursor blink
  cursor: (): Preset => ({
    keyframes: [
      { opacity: 1 },
      { opacity: 1 },
      { opacity: 0 },
      { opacity: 0 },
    ],
    options: { duration: 1000, easing: 'steps(1)', iterations: Infinity, fill: 'forwards' },
  }),

  // Morphing blob
  morphIn: (): Preset => ({
    keyframes: [
      { opacity: 0, borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', transform: 'scale(0.8)' },
      { opacity: 0.5, borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%', transform: 'scale(0.9)' },
      { opacity: 1, borderRadius: '0%', transform: 'scale(1)' },
    ],
    options: { duration: duration.slower, easing: easing.smooth, fill: 'forwards' },
  }),
};

// ============================================================================
// EXIT PRESETS
// Animações de saída
// ============================================================================

export const exit = {
  fade: (): Preset => ({
    keyframes: [
      { opacity: 1 },
      { opacity: 0 },
    ],
    options: { duration: duration.fast, easing: easing.smooth, fill: 'forwards' },
  }),

  fadeScale: (scale = 0.95): Preset => ({
    keyframes: [
      { opacity: 1, transform: 'scale(1)' },
      { opacity: 0, transform: `scale(${scale})` },
    ],
    options: { duration: duration.fast, easing: easing.smooth, fill: 'forwards' },
  }),

  slideUp: (distance = 20): Preset => ({
    keyframes: [
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: `translateY(-${distance}px)` },
    ],
    options: { duration: duration.fast, easing: easing.smoothIn, fill: 'forwards' },
  }),

  slideDown: (distance = 20): Preset => ({
    keyframes: [
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: `translateY(${distance}px)` },
    ],
    options: { duration: duration.fast, easing: easing.smoothIn, fill: 'forwards' },
  }),

  blurOut: (blur = 10): Preset => ({
    keyframes: [
      { opacity: 1, filter: 'blur(0px)' },
      { opacity: 0, filter: `blur(${blur}px)` },
    ],
    options: { duration: duration.normal, easing: easing.smooth, fill: 'forwards' },
  }),

  zoomOut: (): Preset => ({
    keyframes: [
      { opacity: 1, transform: 'scale(1)' },
      { opacity: 0, transform: 'scale(1.2)' },
    ],
    options: { duration: duration.normal, easing: easing.smoothIn, fill: 'forwards' },
  }),

  collapse: (): Preset => ({
    keyframes: [
      { opacity: 1, transform: 'scaleY(1)', transformOrigin: 'top' },
      { opacity: 0, transform: 'scaleY(0)', transformOrigin: 'top' },
    ],
    options: { duration: duration.fast, easing: easing.smooth, fill: 'forwards' },
  }),
};

// ============================================================================
// HOVER PRESETS
// Animações de hover interativas
// ============================================================================

export const hover = {
  lift: (): Preset => ({
    keyframes: [
      { transform: 'translateY(0)', boxShadow: '0 0 0 rgba(0,0,0,0)' },
      { transform: 'translateY(-4px)', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' },
    ],
    options: { duration: duration.fast, easing: easing.spring, fill: 'forwards' },
  }),

  grow: (scale = 1.05): Preset => ({
    keyframes: [
      { transform: 'scale(1)' },
      { transform: `scale(${scale})` },
    ],
    options: { duration: duration.fast, easing: easing.spring, fill: 'forwards' },
  }),

  glow: (color = 'rgba(99, 102, 241, 0.5)'): Preset => ({
    keyframes: [
      { boxShadow: `0 0 0 ${color}` },
      { boxShadow: `0 0 30px ${color}` },
    ],
    options: { duration: duration.normal, easing: easing.smooth, fill: 'forwards' },
  }),

  tilt: (deg = 3): Preset => ({
    keyframes: [
      { transform: 'perspective(1000px) rotateX(0) rotateY(0)' },
      { transform: `perspective(1000px) rotateX(${deg}deg) rotateY(${deg}deg)` },
    ],
    options: { duration: duration.fast, easing: easing.spring, fill: 'forwards' },
  }),

  pulse: (): Preset => ({
    keyframes: [
      { transform: 'scale(1)' },
      { transform: 'scale(1.05)' },
      { transform: 'scale(1)' },
    ],
    options: { duration: duration.slow, easing: easing.smooth, iterations: Infinity },
  }),

  shake: (): Preset => ({
    keyframes: [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-5px)' },
      { transform: 'translateX(5px)' },
      { transform: 'translateX(-5px)' },
      { transform: 'translateX(0)' },
    ],
    options: { duration: duration.fast, easing: easing.snap },
  }),

  wiggle: (): Preset => ({
    keyframes: [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(-3deg)' },
      { transform: 'rotate(3deg)' },
      { transform: 'rotate(-3deg)' },
      { transform: 'rotate(0deg)' },
    ],
    options: { duration: duration.fast, easing: easing.spring },
  }),
};

// ============================================================================
// ATTENTION PRESETS
// Chamar atenção do usuário
// ============================================================================

export const attention = {
  bounce: (): Preset => ({
    keyframes: [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-30px)' },
      { transform: 'translateY(0)' },
      { transform: 'translateY(-15px)' },
      { transform: 'translateY(0)' },
    ],
    options: { duration: duration.slow, easing: easing.bounce },
  }),

  flash: (): Preset => ({
    keyframes: [
      { opacity: 1 },
      { opacity: 0 },
      { opacity: 1 },
      { opacity: 0 },
      { opacity: 1 },
    ],
    options: { duration: duration.slow, easing: 'steps(1)' },
  }),

  heartbeat: (): Preset => ({
    keyframes: [
      { transform: 'scale(1)' },
      { transform: 'scale(1.3)' },
      { transform: 'scale(1)' },
      { transform: 'scale(1.3)' },
      { transform: 'scale(1)' },
    ],
    options: { duration: duration.slower, easing: easing.smooth },
  }),

  rubberBand: (): Preset => ({
    keyframes: [
      { transform: 'scale(1, 1)' },
      { transform: 'scale(1.25, 0.75)' },
      { transform: 'scale(0.75, 1.25)' },
      { transform: 'scale(1.15, 0.85)' },
      { transform: 'scale(0.95, 1.05)' },
      { transform: 'scale(1, 1)' },
    ],
    options: { duration: duration.slower, easing: easing.smooth },
  }),

  jello: (): Preset => ({
    keyframes: [
      { transform: 'skewX(0deg) skewY(0deg)' },
      { transform: 'skewX(-12.5deg) skewY(-12.5deg)' },
      { transform: 'skewX(6.25deg) skewY(6.25deg)' },
      { transform: 'skewX(-3.125deg) skewY(-3.125deg)' },
      { transform: 'skewX(1.5625deg) skewY(1.5625deg)' },
      { transform: 'skewX(0deg) skewY(0deg)' },
    ],
    options: { duration: duration.slower, easing: easing.smooth },
  }),

  tada: (): Preset => ({
    keyframes: [
      { transform: 'scale(1) rotate(0deg)' },
      { transform: 'scale(0.9) rotate(-3deg)' },
      { transform: 'scale(1.1) rotate(3deg)' },
      { transform: 'scale(1.1) rotate(-3deg)' },
      { transform: 'scale(1.1) rotate(3deg)' },
      { transform: 'scale(1.1) rotate(-3deg)' },
      { transform: 'scale(1) rotate(0deg)' },
    ],
    options: { duration: duration.slower, easing: easing.smooth },
  }),

  swing: (): Preset => ({
    keyframes: [
      { transform: 'rotate(0deg)', transformOrigin: 'top center' },
      { transform: 'rotate(15deg)', transformOrigin: 'top center' },
      { transform: 'rotate(-10deg)', transformOrigin: 'top center' },
      { transform: 'rotate(5deg)', transformOrigin: 'top center' },
      { transform: 'rotate(-5deg)', transformOrigin: 'top center' },
      { transform: 'rotate(0deg)', transformOrigin: 'top center' },
    ],
    options: { duration: duration.slower, easing: easing.smooth },
  }),
};

// ============================================================================
// LOADING PRESETS
// Estados de carregamento
// ============================================================================

export const loading = {
  spin: (): Preset => ({
    keyframes: [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(360deg)' },
    ],
    options: { duration: 1000, easing: 'linear', iterations: Infinity },
  }),

  pulse: (): Preset => ({
    keyframes: [
      { opacity: 1 },
      { opacity: 0.4 },
      { opacity: 1 },
    ],
    options: { duration: 1500, easing: easing.smooth, iterations: Infinity },
  }),

  bounce: (): Preset => ({
    keyframes: [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-10px)' },
      { transform: 'translateY(0)' },
    ],
    options: { duration: 600, easing: easing.bounce, iterations: Infinity },
  }),

  skeleton: (): Preset => ({
    keyframes: [
      { backgroundPosition: '-200% 0' },
      { backgroundPosition: '200% 0' },
    ],
    options: { duration: 1500, easing: 'linear', iterations: Infinity },
  }),

  dots: (index: number): Preset => ({
    keyframes: [
      { transform: 'scale(1)', opacity: 0.5 },
      { transform: 'scale(1.2)', opacity: 1 },
      { transform: 'scale(1)', opacity: 0.5 },
    ],
    options: {
      duration: 1000,
      easing: easing.smooth,
      iterations: Infinity,
      delay: index * 150,
    },
  }),
};

// ============================================================================
// STAGGER PATTERNS
// Padrões de delay para grupos de elementos
// ============================================================================

export const staggerPattern = {
  // Linear - cada item adiciona delay
  linear: (index: number, _total: number, baseDelay = 50) => index * baseDelay,

  // Center out - começa do centro
  centerOut: (index: number, total: number, baseDelay = 50) => {
    const center = Math.floor(total / 2);
    return Math.abs(index - center) * baseDelay;
  },

  // Edges in - começa das bordas
  edgesIn: (index: number, total: number, baseDelay = 50) => {
    const center = Math.floor(total / 2);
    return (center - Math.abs(index - center)) * baseDelay;
  },

  // Random - delay aleatório
  random: (_index: number, _total: number, baseDelay = 50) => Math.random() * baseDelay * 3,

  // Wave - padrão de onda senoidal
  wave: (index: number, total: number, baseDelay = 50) => {
    return Math.sin((index / total) * Math.PI) * baseDelay * 3;
  },

  // Grid - para layouts em grid (row, col)
  grid: (row: number, col: number, baseDelay = 50) => (row + col) * baseDelay,

  // Diagonal grid
  gridDiagonal: (row: number, col: number, baseDelay = 50) => Math.abs(row - col) * baseDelay,

  // Exponential - acelera
  exponential: (index: number, total: number, baseDelay = 50) => {
    return Math.pow(index / total, 2) * baseDelay * total;
  },

  // Decelerate - desacelera
  decelerate: (index: number, total: number, baseDelay = 50) => {
    return (1 - Math.pow(1 - index / total, 2)) * baseDelay * total;
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Aplica um preset a um elemento
 */
export function applyPreset(element: Element, preset: Preset): Animation {
  return element.animate(preset.keyframes, preset.options);
}

/**
 * Aplica preset com stagger a múltiplos elementos
 */
export function applyStaggered(
  elements: Element[],
  preset: Preset,
  pattern: (index: number, total: number) => number = staggerPattern.linear
): Animation[] {
  return elements.map((el, i) => {
    const delayVal = pattern(i, elements.length);
    return el.animate(preset.keyframes, {
      ...preset.options,
      delay: (preset.options.delay as number || 0) + delayVal,
    });
  });
}

/**
 * Cria animação com configuração custom
 */
export function createPreset(
  keyframes: Keyframe[],
  options?: Partial<KeyframeAnimationOptions>
): Preset {
  return {
    keyframes,
    options: {
      duration: duration.normal,
      easing: easing.smooth,
      fill: 'forwards',
      ...options,
    },
  };
}

/**
 * Combina múltiplos presets em sequência
 */
export async function sequence(
  element: Element,
  presets: Preset[]
): Promise<void> {
  for (const preset of presets) {
    const anim = element.animate(preset.keyframes, preset.options);
    await anim.finished;
  }
}

/**
 * Reverte um preset (para hover out, etc)
 */
export function reversePreset(preset: Preset): Preset {
  return {
    keyframes: [...preset.keyframes].reverse(),
    options: {
      ...preset.options,
      duration: (preset.options.duration as number) * 0.7, // Exit mais rápido
    },
  };
}
