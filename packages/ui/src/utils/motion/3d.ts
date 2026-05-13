/**
 * PixonMotion 3D Transforms
 * Transformacoes 3D GPU-accelerated com perspectiva
 * Zero dependencias - CSS transforms + WAAPI
 */

// ============================================================================
// TIPOS
// ============================================================================

export type Transform3DConfig = {
  duration?: number;
  easing?: string;
  delay?: number;
  fill?: FillMode;
};

export type CameraConfig = {
  perspective?: number;
  perspectiveOrigin?: string;
};

// ============================================================================
// SCENE SETUP
// ============================================================================

/**
 * Configura container como cena 3D
 */
export function create3DScene(
  container: HTMLElement,
  config: CameraConfig = {}
): () => void {
  const { perspective = 1000, perspectiveOrigin = '50% 50%' } = config;

  const originalStyle = container.style.cssText;

  container.style.perspective = `${perspective}px`;
  container.style.perspectiveOrigin = perspectiveOrigin;
  container.style.transformStyle = 'preserve-3d';

  return () => {
    container.style.cssText = originalStyle;
  };
}

/**
 * Marca elemento como 3D (preserva transformacoes filhos)
 */
export function make3D(element: HTMLElement): () => void {
  const original = element.style.transformStyle;
  element.style.transformStyle = 'preserve-3d';

  return () => {
    element.style.transformStyle = original;
  };
}

// ============================================================================
// ROTATION ANIMATIONS
// ============================================================================

/**
 * Rotacao em X (flip vertical)
 */
export function rotateX(
  element: HTMLElement,
  degrees: number,
  config: Transform3DConfig = {}
): Animation {
  const {
    duration = 500,
    easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
    delay = 0,
    fill = 'forwards',
  } = config;

  return element.animate(
    [
      { transform: 'perspective(1000px) rotateX(0deg)' },
      { transform: `perspective(1000px) rotateX(${degrees}deg)` },
    ],
    { duration, easing, delay, fill }
  );
}

/**
 * Rotacao em Y (flip horizontal)
 */
export function rotateY(
  element: HTMLElement,
  degrees: number,
  config: Transform3DConfig = {}
): Animation {
  const {
    duration = 500,
    easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
    delay = 0,
    fill = 'forwards',
  } = config;

  return element.animate(
    [
      { transform: 'perspective(1000px) rotateY(0deg)' },
      { transform: `perspective(1000px) rotateY(${degrees}deg)` },
    ],
    { duration, easing, delay, fill }
  );
}

/**
 * Rotacao em Z (spin)
 */
export function rotateZ(
  element: HTMLElement,
  degrees: number,
  config: Transform3DConfig = {}
): Animation {
  const {
    duration = 500,
    easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
    delay = 0,
    fill = 'forwards',
  } = config;

  return element.animate(
    [{ transform: 'rotateZ(0deg)' }, { transform: `rotateZ(${degrees}deg)` }],
    { duration, easing, delay, fill }
  );
}

/**
 * Rotacao 3D completa
 */
export function rotate3D(
  element: HTMLElement,
  rotation: { x?: number; y?: number; z?: number },
  config: Transform3DConfig = {}
): Animation {
  const { x = 0, y = 0, z = 0 } = rotation;
  const {
    duration = 500,
    easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
    delay = 0,
    fill = 'forwards',
  } = config;

  return element.animate(
    [
      { transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)' },
      { transform: `perspective(1000px) rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)` },
    ],
    { duration, easing, delay, fill }
  );
}

// ============================================================================
// FLIP CARD
// ============================================================================

export type FlipCardConfig = {
  duration?: number;
  easing?: string;
  direction?: 'horizontal' | 'vertical';
};

/**
 * Cria flip card com frente e verso
 */
export function createFlipCard(
  container: HTMLElement,
  front: HTMLElement,
  back: HTMLElement,
  config: FlipCardConfig = {}
): {
  flip: () => Animation;
  unflip: () => Animation;
  toggle: () => Animation;
  isFlipped: () => boolean;
} {
  const { duration = 600, easing = 'cubic-bezier(0.4, 0, 0.2, 1)', direction = 'horizontal' } = config;

  let flipped = false;

  // Setup container
  container.style.perspective = '1000px';
  container.style.transformStyle = 'preserve-3d';

  // Setup faces
  const setupFace = (el: HTMLElement, isBack: boolean) => {
    el.style.position = 'absolute';
    el.style.inset = '0';
    el.style.backfaceVisibility = 'hidden';
    el.style.transformStyle = 'preserve-3d';

    if (isBack) {
      el.style.transform = direction === 'horizontal' ? 'rotateY(180deg)' : 'rotateX(180deg)';
    }
  };

  setupFace(front, false);
  setupFace(back, true);

  const rotateAxis = direction === 'horizontal' ? 'rotateY' : 'rotateX';

  const flip = () => {
    flipped = true;
    return container.animate(
      [{ transform: `${rotateAxis}(0deg)` }, { transform: `${rotateAxis}(180deg)` }],
      { duration, easing, fill: 'forwards' }
    );
  };

  const unflip = () => {
    flipped = false;
    return container.animate(
      [{ transform: `${rotateAxis}(180deg)` }, { transform: `${rotateAxis}(0deg)` }],
      { duration, easing, fill: 'forwards' }
    );
  };

  const toggle = () => (flipped ? unflip() : flip());

  const isFlipped = () => flipped;

  return { flip, unflip, toggle, isFlipped };
}

// ============================================================================
// CUBE
// ============================================================================

/**
 * Cria cubo 3D navegavel
 */
export function createCube(
  container: HTMLElement,
  faces: {
    front: HTMLElement;
    back: HTMLElement;
    left: HTMLElement;
    right: HTMLElement;
    top: HTMLElement;
    bottom: HTMLElement;
  },
  size: number
): {
  showFace: (face: keyof typeof faces) => Animation;
  currentFace: () => keyof typeof faces;
  cleanup: () => void;
} {
  const halfSize = size / 2;
  let current: keyof typeof faces = 'front';

  // Setup container
  container.style.width = `${size}px`;
  container.style.height = `${size}px`;
  container.style.perspective = `${size * 3}px`;
  container.style.perspectiveOrigin = '50% 50%';

  // Create cube wrapper
  const cube = document.createElement('div');
  cube.style.width = '100%';
  cube.style.height = '100%';
  cube.style.position = 'relative';
  cube.style.transformStyle = 'preserve-3d';
  cube.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';

  // Position faces
  const faceTransforms = {
    front: `translateZ(${halfSize}px)`,
    back: `translateZ(-${halfSize}px) rotateY(180deg)`,
    left: `translateX(-${halfSize}px) rotateY(-90deg)`,
    right: `translateX(${halfSize}px) rotateY(90deg)`,
    top: `translateY(-${halfSize}px) rotateX(90deg)`,
    bottom: `translateY(${halfSize}px) rotateX(-90deg)`,
  };

  Object.entries(faces).forEach(([key, el]) => {
    el.style.position = 'absolute';
    el.style.width = '100%';
    el.style.height = '100%';
    el.style.backfaceVisibility = 'hidden';
    el.style.transform = faceTransforms[key as keyof typeof faces];
    cube.appendChild(el);
  });

  container.appendChild(cube);

  // Rotations to show each face
  const showRotations = {
    front: 'rotateY(0deg)',
    back: 'rotateY(180deg)',
    left: 'rotateY(90deg)',
    right: 'rotateY(-90deg)',
    top: 'rotateX(-90deg)',
    bottom: 'rotateX(90deg)',
  };

  const showFace = (face: keyof typeof faces) => {
    current = face;
    const rotation = showRotations[face];

    return cube.animate([{ transform: cube.style.transform || 'rotateY(0)' }, { transform: rotation }], {
      duration: 600,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      fill: 'forwards',
    });
  };

  const cleanup = () => {
    cube.remove();
  };

  return { showFace, currentFace: () => current, cleanup };
}

// ============================================================================
// CAROUSEL 3D
// ============================================================================

/**
 * Carousel 3D circular
 */
export function createCarousel3D(
  container: HTMLElement,
  items: HTMLElement[],
  config: { radius?: number; autoRotate?: boolean; autoRotateSpeed?: number } = {}
): {
  next: () => Animation;
  prev: () => Animation;
  goTo: (index: number) => Animation;
  currentIndex: () => number;
  startAutoRotate: () => void;
  stopAutoRotate: () => void;
  cleanup: () => void;
} {
  const { radius = 300, autoRotate = false, autoRotateSpeed = 3000 } = config;

  let currentIdx = 0;
  let autoRotateId: number | null = null;

  const angleStep = 360 / items.length;

  // Setup container
  container.style.perspective = '1000px';
  container.style.perspectiveOrigin = '50% 50%';

  // Create carousel wrapper
  const carousel = document.createElement('div');
  carousel.style.width = '100%';
  carousel.style.height = '100%';
  carousel.style.position = 'relative';
  carousel.style.transformStyle = 'preserve-3d';

  // Position items in circle
  items.forEach((item, i) => {
    const angle = i * angleStep;
    item.style.position = 'absolute';
    item.style.left = '50%';
    item.style.top = '50%';
    item.style.transform = `
      translateX(-50%) translateY(-50%)
      rotateY(${angle}deg)
      translateZ(${radius}px)
    `;
    item.style.backfaceVisibility = 'hidden';
    carousel.appendChild(item);
  });

  container.appendChild(carousel);

  const rotateTo = (index: number) => {
    const targetAngle = -index * angleStep;
    currentIdx = index;

    return carousel.animate(
      [
        { transform: carousel.style.transform || 'rotateY(0deg)' },
        { transform: `rotateY(${targetAngle}deg)` },
      ],
      {
        duration: 500,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fill: 'forwards',
      }
    );
  };

  const next = () => rotateTo((currentIdx + 1) % items.length);
  const prev = () => rotateTo((currentIdx - 1 + items.length) % items.length);
  const goTo = (index: number) => rotateTo(index % items.length);

  const startAutoRotate = () => {
    if (autoRotateId) return;
    autoRotateId = window.setInterval(() => {
      next();
    }, autoRotateSpeed);
  };

  const stopAutoRotate = () => {
    if (autoRotateId) {
      clearInterval(autoRotateId);
      autoRotateId = null;
    }
  };

  if (autoRotate) startAutoRotate();

  const cleanup = () => {
    stopAutoRotate();
    carousel.remove();
  };

  return {
    next,
    prev,
    goTo,
    currentIndex: () => currentIdx,
    startAutoRotate,
    stopAutoRotate,
    cleanup,
  };
}

// ============================================================================
// DEPTH EFFECTS
// ============================================================================

/**
 * Efeito de profundidade baseado em scroll
 */
export function scrollDepth(
  element: HTMLElement,
  config: {
    maxTranslateZ?: number;
    maxRotateX?: number;
    scrollRange?: number;
  } = {}
): () => void {
  const { maxTranslateZ = 100, maxRotateX = 10, scrollRange = 500 } = config;

  element.style.transformStyle = 'preserve-3d';

  const handleScroll = () => {
    const rect = element.getBoundingClientRect();
    const viewportCenter = window.innerHeight / 2;
    const elementCenter = rect.top + rect.height / 2;
    const distance = elementCenter - viewportCenter;
    const progress = Math.max(-1, Math.min(1, distance / scrollRange));

    const translateZVal = -progress * maxTranslateZ;
    const rotateXVal = progress * maxRotateX;

    element.style.transform = `
      perspective(1000px)
      translateZ(${translateZVal}px)
      rotateX(${rotateXVal}deg)
    `;
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  return () => {
    window.removeEventListener('scroll', handleScroll);
    element.style.transform = '';
  };
}

/**
 * Hover depth - elemento "sai" da tela no hover
 */
export function hoverDepth(
  element: HTMLElement,
  config: { translateZ?: number; scale?: number; duration?: number } = {}
): () => void {
  const { translateZ = 50, scale = 1.05, duration = 300 } = config;

  const handleEnter = () => {
    element.animate(
      [
        { transform: 'perspective(1000px) translateZ(0) scale(1)' },
        { transform: `perspective(1000px) translateZ(${translateZ}px) scale(${scale})` },
      ],
      { duration, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', fill: 'forwards' }
    );
  };

  const handleLeave = () => {
    element.animate(
      [
        { transform: `perspective(1000px) translateZ(${translateZ}px) scale(${scale})` },
        { transform: 'perspective(1000px) translateZ(0) scale(1)' },
      ],
      { duration: duration * 0.8, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' }
    );
  };

  element.addEventListener('mouseenter', handleEnter);
  element.addEventListener('mouseleave', handleLeave);

  return () => {
    element.removeEventListener('mouseenter', handleEnter);
    element.removeEventListener('mouseleave', handleLeave);
    element.style.transform = '';
  };
}

// ============================================================================
// LAYER STACK
// ============================================================================

/**
 * Empilhamento de layers com profundidade
 */
export function createLayerStack(
  layers: HTMLElement[],
  config: { spacing?: number; perspective?: number } = {}
): {
  spread: () => Animation[];
  collapse: () => Animation[];
  focusLayer: (index: number) => Animation[];
  cleanup: () => void;
} {
  const { spacing = 50, perspective = 1000 } = config;

  // Setup layers
  layers.forEach((layer, i) => {
    layer.style.position = 'absolute';
    layer.style.inset = '0';
    layer.style.transformStyle = 'preserve-3d';
    layer.style.transform = `translateZ(${-i * 5}px)`;
  });

  const spread = () => {
    return layers.map((layer, i) =>
      layer.animate(
        [
          { transform: layer.style.transform },
          { transform: `translateZ(${-i * spacing}px)` },
        ],
        { duration: 500, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' }
      )
    );
  };

  const collapse = () => {
    return layers.map((layer, i) =>
      layer.animate(
        [{ transform: layer.style.transform }, { transform: `translateZ(${-i * 5}px)` }],
        { duration: 400, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' }
      )
    );
  };

  const focusLayer = (index: number) => {
    return layers.map((layer, i) => {
      const offset = i - index;
      const z = offset * spacing;
      const opacityVal = i === index ? 1 : 0.5;

      return layer.animate(
        [
          { transform: layer.style.transform, opacity: layer.style.opacity || '1' },
          { transform: `translateZ(${z}px)`, opacity: String(opacityVal) },
        ],
        { duration: 400, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' }
      );
    });
  };

  const cleanup = () => {
    layers.forEach((layer) => {
      layer.style.transform = '';
      layer.style.opacity = '';
    });
  };

  return { spread, collapse, focusLayer, cleanup };
}

// ============================================================================
// ORBIT
// ============================================================================

/**
 * Elementos orbitando um centro
 */
export function createOrbit(
  center: HTMLElement,
  satellites: HTMLElement[],
  config: {
    radius?: number;
    speed?: number;
    tilt?: number;
    direction?: 'cw' | 'ccw';
  } = {}
): {
  start: () => void;
  stop: () => void;
  setSpeed: (speed: number) => void;
  cleanup: () => void;
} {
  const { radius = 150, speed = 10000, tilt = 60, direction = 'ccw' } = config;

  let currentSpeed = speed;
  let rafId: number;
  let startTime: number = 0;
  let isRunning = false;

  const dirMultiplier = direction === 'ccw' ? 1 : -1;
  const angleStep = 360 / satellites.length;

  // Setup center
  center.style.transformStyle = 'preserve-3d';
  center.style.perspective = '1000px';

  // Position satellites
  satellites.forEach((sat, _i) => {
    sat.style.position = 'absolute';
    sat.style.left = '50%';
    sat.style.top = '50%';
    sat.style.transformStyle = 'preserve-3d';
  });

  const animate = (timestamp: number) => {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const baseAngle = (elapsed / currentSpeed) * 360 * dirMultiplier;

    satellites.forEach((sat, i) => {
      const angle = baseAngle + i * angleStep;
      const rad = (angle * Math.PI) / 180;

      const x = Math.cos(rad) * radius;
      const z = Math.sin(rad) * radius;
      const y = Math.sin(rad) * Math.sin((tilt * Math.PI) / 180) * radius * 0.3;

      sat.style.transform = `
        translateX(calc(-50% + ${x}px))
        translateY(calc(-50% + ${y}px))
        translateZ(${z}px)
      `;

      // Fade based on z-position
      const opacityVal = 0.5 + (z / radius) * 0.5;
      sat.style.opacity = String(Math.max(0.3, opacityVal));
    });

    if (isRunning) {
      rafId = requestAnimationFrame(animate);
    }
  };

  const start = () => {
    isRunning = true;
    startTime = 0;
    rafId = requestAnimationFrame(animate);
  };

  const stop = () => {
    isRunning = false;
    cancelAnimationFrame(rafId);
  };

  const setSpeed = (newSpeed: number) => {
    currentSpeed = newSpeed;
  };

  const cleanup = () => {
    stop();
    satellites.forEach((sat) => {
      sat.style.transform = '';
      sat.style.opacity = '';
    });
  };

  return { start, stop, setSpeed, cleanup };
}
