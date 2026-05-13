/**
 * PixonSpring - Física de spring usando WAAPI + linear() easing
 * Bundle size: 0 bytes (usa apenas APIs nativas)
 * Performance: 120fps (keyframes gerados uma vez, execução no compositor)
 *
 * Baseado no modelo de oscilador harmônico amortecido:
 * x(t) = A * e^(-ζωt) * cos(ωd*t + φ)
 */

export type SpringConfig = {
  stiffness?: number; // k - rigidez da mola (default: 100)
  damping?: number; // c - amortecimento (default: 10)
  mass?: number; // m - massa (default: 1)
  velocity?: number; // velocidade inicial (default: 0)
  precision?: number; // quando considerar "parado" (default: 0.01)
};

export type SpringPreset = 'default' | 'gentle' | 'wobbly' | 'stiff' | 'slow' | 'molasses';

const PRESETS: Record<SpringPreset, SpringConfig> = {
  default: { stiffness: 100, damping: 10, mass: 1 },
  gentle: { stiffness: 120, damping: 14, mass: 1 },
  wobbly: { stiffness: 180, damping: 12, mass: 1 },
  stiff: { stiffness: 210, damping: 20, mass: 1 },
  slow: { stiffness: 280, damping: 60, mass: 1 },
  molasses: { stiffness: 280, damping: 120, mass: 1 },
};

// Cache global para evitar recálculo
const springCache = new Map<string, { keyframes: number[]; duration: number }>();

/**
 * Gera a trajetória do spring (resolve a equação diferencial)
 */
export function generateSpringTrajectory(
  from: number,
  to: number,
  config: SpringConfig | SpringPreset = 'default'
): { keyframes: number[]; duration: number } {
  const resolved = typeof config === 'string' ? PRESETS[config] : config;
  const {
    stiffness = 100,
    damping = 10,
    mass = 1,
    velocity = 0,
    precision = 0.01,
  } = resolved;

  // Cache key
  const cacheKey = JSON.stringify({ from, to, stiffness, damping, mass, velocity, precision });
  if (springCache.has(cacheKey)) {
    return springCache.get(cacheKey)!;
  }

  // Parâmetros do oscilador
  const w0 = Math.sqrt(stiffness / mass); // frequência angular natural
  const zeta = damping / (2 * Math.sqrt(stiffness * mass)); // razão de amortecimento

  const amplitude = to - from;
  const keyframes: number[] = [];

  const dt = 1 / 60; // 60fps sampling
  let t = 0;
  let maxTime = 10; // máximo 10 segundos

  // Simula o spring até atingir precisão ou tempo máximo
  while (t < maxTime) {
    let position: number;

    if (zeta < 1) {
      // Subamortecido (oscila)
      const wd = w0 * Math.sqrt(1 - zeta * zeta);
      const decay = Math.exp(-zeta * w0 * t);
      const A = amplitude;
      const B = (zeta * w0 * amplitude + velocity) / wd;
      position = to - decay * (A * Math.cos(wd * t) + B * Math.sin(wd * t));
    } else if (zeta === 1) {
      // Criticamente amortecido
      const decay = Math.exp(-w0 * t);
      position = to - decay * (amplitude + (velocity + w0 * amplitude) * t);
    } else {
      // Superamortecido
      const s1 = -w0 * (zeta - Math.sqrt(zeta * zeta - 1));
      const s2 = -w0 * (zeta + Math.sqrt(zeta * zeta - 1));
      const A = (velocity - s2 * amplitude) / (s1 - s2);
      const B = amplitude - A;
      position = to - (A * Math.exp(s1 * t) + B * Math.exp(s2 * t));
    }

    keyframes.push(position);

    // Verify if reached destination and STAYED there (simple envelope check)
    // For a damped oscillator, if the current displacement and its potential next peak are small
    const displacement = position - to;
    if (t > 0.1 && Math.abs(displacement) < precision) {
      // If we are underdamped, we need to ensure we won't bounce back out
      const envelope = zeta < 1 ? Math.exp(-zeta * w0 * t) * Math.abs(amplitude) : Math.abs(displacement);
      if (envelope < precision) break;
    }

    t += dt;
  }

  // Garante que termina exatamente no destino
  keyframes.push(to);

  const duration = keyframes.length * dt * 1000; // em ms
  const result = { keyframes, duration };

  springCache.set(cacheKey, result);
  return result;
}

/**
 * Gera uma função de easing CSS linear() a partir dos keyframes do spring
 * Isso permite usar spring physics diretamente em CSS/WAAPI!
 */
export function springToLinearEasing(config: SpringConfig | SpringPreset = 'default'): string {
  const { keyframes } = generateSpringTrajectory(0, 1, config);

  // Normaliza para 0-1 e converte para linear()
  const normalized = keyframes.map((k) => k.toFixed(4));

  // CSS linear() aceita lista de valores
  return `linear(${normalized.join(', ')})`;
}

/**
 * Anima um elemento com física de spring
 */
export function springAnimate(
  target: Element | string,
  properties: Record<string, [number, number]>, // { opacity: [0, 1], x: [0, 100] }
  config: SpringConfig | SpringPreset = 'default'
): Animation {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) throw new Error('Target not found');

  // Pega o primeiro par de valores para calcular a trajetória
  const firstProp = Object.values(properties)[0];
  const { keyframes: trajectory, duration } = generateSpringTrajectory(
    firstProp[0],
    firstProp[1],
    config
  );

  // Mapeia a trajetória para todas as propriedades
  const keyframeObjects: Keyframe[] = trajectory.map((progress, i) => {
    const frame: Keyframe = {};

    for (const [prop, [from, to]] of Object.entries(properties)) {
      const value = from + (to - from) * progress;

      // Mapeia nomes amigáveis para CSS
      switch (prop) {
        case 'x':
          frame.transform = `translateX(${value}px)`;
          break;
        case 'y':
          frame.transform = `translateY(${value}px)`;
          break;
        case 'scale':
          frame.transform = `scale(${value})`;
          break;
        case 'rotate':
          frame.transform = `rotate(${value}deg)`;
          break;
        case 'opacity':
          frame.opacity = value;
          break;
        default:
          (frame as Record<string, unknown>)[prop] = value;
      }
    }

    return frame;
  });

  return el.animate(keyframeObjects, {
    duration,
    fill: 'forwards',
    easing: 'linear', // já está embutido nos keyframes
  });
}

/**
 * Hook-like para React (funciona sem dependências)
 */
export function createSpringValue(
  initialValue: number,
  config: SpringConfig | SpringPreset = 'default'
) {
  let currentValue = initialValue;
  let currentAnimation: Animation | null = null;
  const listeners = new Set<(value: number) => void>();

  return {
    get value() {
      return currentValue;
    },

    set(targetValue: number) {
      const { keyframes, duration } = generateSpringTrajectory(
        currentValue,
        targetValue,
        config
      );

      // Cancela animação anterior
      currentAnimation?.cancel();

      // Usa um elemento dummy para animar
      const dummy = document.createElement('div');
      dummy.style.cssText = 'position:absolute;pointer-events:none;opacity:0';
      document.body.appendChild(dummy);

      currentAnimation = dummy.animate(
        keyframes.map((k) => ({ opacity: k })),
        { duration, fill: 'forwards' }
      );

      // Track progress
      const tick = () => {
        if (!currentAnimation || currentAnimation.playState === 'finished') {
          currentValue = targetValue;
          listeners.forEach((l) => l(currentValue));
          dummy.remove();
          return;
        }

        const computed = getComputedStyle(dummy).opacity;
        currentValue = parseFloat(computed);
        listeners.forEach((l) => l(currentValue));
        requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    },

    subscribe(listener: (value: number) => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    stop() {
      currentAnimation?.cancel();
    },
  };
}
