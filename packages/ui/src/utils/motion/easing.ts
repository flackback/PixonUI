/**
 * PixonEasing - Funcoes de easing customizadas
 * Bundle size: 0 bytes (puro JS)
 *
 * Inclui: cubic-bezier, spring, bounce, elastic, steps
 * Todas retornam funcoes (t: number) => number
 */

export type EasingFunction = (t: number) => number;

// ============================================
// Standard Easings (Penner)
// ============================================

export const linear: EasingFunction = (t) => t;

// Quad
export const easeInQuad: EasingFunction = (t) => t * t;
export const easeOutQuad: EasingFunction = (t) => 1 - (1 - t) * (1 - t);
export const easeInOutQuad: EasingFunction = (t) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

// Cubic
export const easeInCubic: EasingFunction = (t) => t * t * t;
export const easeOutCubic: EasingFunction = (t) => 1 - Math.pow(1 - t, 3);
export const easeInOutCubic: EasingFunction = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// Quart
export const easeInQuart: EasingFunction = (t) => t * t * t * t;
export const easeOutQuart: EasingFunction = (t) => 1 - Math.pow(1 - t, 4);
export const easeInOutQuart: EasingFunction = (t) =>
  t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;

// Quint
export const easeInQuint: EasingFunction = (t) => t * t * t * t * t;
export const easeOutQuint: EasingFunction = (t) => 1 - Math.pow(1 - t, 5);
export const easeInOutQuint: EasingFunction = (t) =>
  t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;

// Expo
export const easeInExpo: EasingFunction = (t) =>
  t === 0 ? 0 : Math.pow(2, 10 * t - 10);
export const easeOutExpo: EasingFunction = (t) =>
  t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
export const easeInOutExpo: EasingFunction = (t) =>
  t === 0
    ? 0
    : t === 1
      ? 1
      : t < 0.5
        ? Math.pow(2, 20 * t - 10) / 2
        : (2 - Math.pow(2, -20 * t + 10)) / 2;

// Circ
export const easeInCirc: EasingFunction = (t) => 1 - Math.sqrt(1 - Math.pow(t, 2));
export const easeOutCirc: EasingFunction = (t) => Math.sqrt(1 - Math.pow(t - 1, 2));
export const easeInOutCirc: EasingFunction = (t) =>
  t < 0.5
    ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
    : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2;

// Sine
export const easeInSine: EasingFunction = (t) => 1 - Math.cos((t * Math.PI) / 2);
export const easeOutSine: EasingFunction = (t) => Math.sin((t * Math.PI) / 2);
export const easeInOutSine: EasingFunction = (t) => -(Math.cos(Math.PI * t) - 1) / 2;

// Back (overshoot)
export const easeInBack: EasingFunction = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return c3 * t * t * t - c1 * t * t;
};
export const easeOutBack: EasingFunction = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
export const easeInOutBack: EasingFunction = (t) => {
  const c1 = 1.70158;
  const c2 = c1 * 1.525;
  return t < 0.5
    ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
    : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
};

// ============================================
// Special Easings
// ============================================

/**
 * Elastic easing (wobble com overshoot)
 */
export const easeInElastic: EasingFunction = (t) => {
  const c4 = (2 * Math.PI) / 3;
  return t === 0
    ? 0
    : t === 1
      ? 1
      : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
};

export const easeOutElastic: EasingFunction = (t) => {
  const c4 = (2 * Math.PI) / 3;
  return t === 0
    ? 0
    : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};

export const easeInOutElastic: EasingFunction = (t) => {
  const c5 = (2 * Math.PI) / 4.5;
  return t === 0
    ? 0
    : t === 1
      ? 1
      : t < 0.5
        ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
        : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
};

/**
 * Bounce easing
 */
export const easeOutBounce: EasingFunction = (t) => {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75;
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375;
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
};

export const easeInBounce: EasingFunction = (t) => 1 - easeOutBounce(1 - t);

export const easeInOutBounce: EasingFunction = (t) =>
  t < 0.5
    ? (1 - easeOutBounce(1 - 2 * t)) / 2
    : (1 + easeOutBounce(2 * t - 1)) / 2;

// ============================================
// Custom Easing Generators
// ============================================

/**
 * Cubic bezier customizado (como CSS cubic-bezier)
 */
export function cubicBezier(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): EasingFunction {
  // Coeficientes da curva
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;

  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDerivX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  // Newton-Raphson para encontrar t dado x
  const solveX = (x: number): number => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const error = sampleX(t) - x;
      if (Math.abs(error) < 1e-6) break;
      const d = sampleDerivX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= error / d;
    }
    return t;
  };

  return (x: number) => sampleY(solveX(x));
}

/**
 * Spring easing (resolve oscilador harmonico)
 */
export function springEasing(config: {
  stiffness?: number;
  damping?: number;
  mass?: number;
} = {}): EasingFunction {
  const { stiffness = 100, damping = 10, mass = 1 } = config;

  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));

  // Pre-calcula duracao normalizada
  const settleTime = zeta < 1
    ? (Math.log(0.001) / (-zeta * w0)) * w0
    : Math.log(0.001) / (-w0);

  return (t: number): number => {
    const scaledT = t * settleTime;

    if (zeta < 1) {
      // Subamortecido
      const wd = w0 * Math.sqrt(1 - zeta * zeta);
      return 1 - Math.exp(-zeta * w0 * scaledT) * Math.cos(wd * scaledT);
    } else if (zeta === 1) {
      // Criticamente amortecido
      return 1 - Math.exp(-w0 * scaledT) * (1 + w0 * scaledT);
    } else {
      // Superamortecido
      const s1 = -w0 * (zeta - Math.sqrt(zeta * zeta - 1));
      const s2 = -w0 * (zeta + Math.sqrt(zeta * zeta - 1));
      return 1 - (s2 * Math.exp(s1 * scaledT) - s1 * Math.exp(s2 * scaledT)) / (s2 - s1);
    }
  };
}

/**
 * Steps easing (discreto, como CSS steps())
 */
export function steps(
  numSteps: number,
  direction: 'start' | 'end' = 'end'
): EasingFunction {
  return (t: number): number => {
    const step = Math.floor(t * numSteps);
    if (direction === 'start') {
      return Math.min(1, (step + 1) / numSteps);
    }
    return step / numSteps;
  };
}

/**
 * Cria easing customizado a partir de pontos
 */
export function customEasing(points: Array<{ x: number; y: number }>): EasingFunction {
  // Ordena por x
  const sorted = [...points].sort((a, b) => a.x - b.x);

  return (t: number): number => {
    // Encontra segmento
    let i = 0;
    while (i < sorted.length - 1 && sorted[i + 1].x < t) {
      i++;
    }

    if (i >= sorted.length - 1) return sorted[sorted.length - 1].y;

    const p1 = sorted[i];
    const p2 = sorted[i + 1];
    const localT = (t - p1.x) / (p2.x - p1.x);

    return p1.y + (p2.y - p1.y) * localT;
  };
}

// ============================================
// CSS String Generators
// ============================================

/**
 * Converte funcao de easing para CSS linear() (Chrome 113+)
 */
export function toLinearCSS(
  easingFn: EasingFunction,
  samples: number = 20
): string {
  const values: number[] = [];

  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    values.push(easingFn(t));
  }

  return `linear(${values.map((v) => v.toFixed(4)).join(', ')})`;
}

// ============================================
// Presets
// ============================================

export const presets = {
  // Material Design
  standard: cubicBezier(0.4, 0, 0.2, 1),
  accelerate: cubicBezier(0.4, 0, 1, 1),
  decelerate: cubicBezier(0, 0, 0.2, 1),

  // Apple
  appleDefault: cubicBezier(0.25, 0.1, 0.25, 1),
  appleEaseIn: cubicBezier(0.42, 0, 1, 1),
  appleEaseOut: cubicBezier(0, 0, 0.58, 1),

  // Smooth
  smooth: cubicBezier(0.45, 0, 0.55, 1),
  smoothOut: cubicBezier(0, 0.55, 0.45, 1),

  // Snappy
  snappy: cubicBezier(0.5, 0, 0.1, 1),

  // Spring-like (pre-calculated)
  springDefault: springEasing({ stiffness: 100, damping: 10 }),
  springGentle: springEasing({ stiffness: 120, damping: 14 }),
  springWobbly: springEasing({ stiffness: 180, damping: 12 }),
  springStiff: springEasing({ stiffness: 210, damping: 20 }),
} as const;
