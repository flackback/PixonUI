/**
 * PixonMotion Visual Effects
 * Efeitos visuais GPU-accelerated para interfaces modernas
 * Zero dependencias - CSS + WAAPI
 */

// ============================================================================
// GLOW EFFECTS
// ============================================================================

export type GlowConfig = {
  color?: string;
  size?: number;
  intensity?: number;
  animated?: boolean;
  duration?: number;
};

/**
 * Adiciona glow animado a um elemento
 */
export function glow(element: HTMLElement, config: GlowConfig = {}): () => void {
  const {
    color = 'rgba(99, 102, 241, 0.5)',
    size = 20,
    intensity = 1,
    animated = true,
    duration = 2000,
  } = config;

  const originalBoxShadow = element.style.boxShadow;

  if (animated) {
    const anim = element.animate(
      [
        { boxShadow: `0 0 ${size * 0.5}px ${color}` },
        { boxShadow: `0 0 ${size * intensity}px ${color}` },
        { boxShadow: `0 0 ${size * 0.5}px ${color}` },
      ],
      { duration, iterations: Infinity, easing: 'ease-in-out' }
    );

    return () => {
      anim.cancel();
      element.style.boxShadow = originalBoxShadow;
    };
  } else {
    element.style.boxShadow = `0 0 ${size}px ${color}`;
    return () => {
      element.style.boxShadow = originalBoxShadow;
    };
  }
}

/**
 * Glow que segue o mouse
 */
export function glowFollow(
  element: HTMLElement,
  config: { color?: string; size?: number; intensity?: number } = {}
): () => void {
  const { color = 'rgba(99, 102, 241, 0.6)', size = 100, intensity = 1 } = config;

  const originalBackground = element.style.background;
  const originalPosition = element.style.position;

  if (getComputedStyle(element).position === 'static') {
    element.style.position = 'relative';
  }

  const handleMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    element.style.setProperty('--glow-x', `${x}px`);
    element.style.setProperty('--glow-y', `${y}px`);
    element.style.background = `
      radial-gradient(
        circle ${size * intensity}px at var(--glow-x) var(--glow-y),
        ${color},
        transparent 70%
      ),
      ${originalBackground || 'transparent'}
    `;
  };

  const handleLeave = () => {
    element.style.background = originalBackground;
  };

  element.addEventListener('mousemove', handleMove);
  element.addEventListener('mouseleave', handleLeave);

  return () => {
    element.removeEventListener('mousemove', handleMove);
    element.removeEventListener('mouseleave', handleLeave);
    element.style.background = originalBackground;
    element.style.position = originalPosition;
  };
}

// ============================================================================
// BLUR EFFECTS
// ============================================================================

/**
 * Blur progressivo baseado em scroll
 */
export function scrollBlur(
  element: HTMLElement,
  config: { maxBlur?: number; start?: number; end?: number } = {}
): () => void {
  const { maxBlur = 10, start = 0, end = 200 } = config;

  const handleScroll = () => {
    const scrollY = window.scrollY;
    const progress = Math.min(Math.max((scrollY - start) / (end - start), 0), 1);
    const blurVal = progress * maxBlur;
    element.style.filter = `blur(${blurVal}px)`;
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  return () => {
    window.removeEventListener('scroll', handleScroll);
    element.style.filter = '';
  };
}

/**
 * Glassmorphism effect
 */
export function glass(
  element: HTMLElement,
  config: { blur?: number; opacity?: number; border?: boolean } = {}
): () => void {
  const { blur = 10, opacity = 0.1, border = true } = config;

  const originalStyle = element.style.cssText;

  element.style.backdropFilter = `blur(${blur}px)`;
  (element.style as any).webkitBackdropFilter = `blur(${blur}px)`;
  element.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;

  if (border) {
    element.style.border = '1px solid rgba(255, 255, 255, 0.2)';
  }

  return () => {
    element.style.cssText = originalStyle;
  };
}

// ============================================================================
// GRAIN/NOISE EFFECTS
// ============================================================================

/**
 * Adiciona textura de grain/noise
 * Usa SVG filter inline para performance
 */
export function grain(
  element: HTMLElement,
  config: { intensity?: number; animated?: boolean; speed?: number } = {}
): () => void {
  const { intensity = 0.3, animated = true, speed = 100 } = config;

  // Cria SVG filter para noise
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.position = 'absolute';
  svg.style.pointerEvents = 'none';

  const defs = document.createElementNS(svgNS, 'defs');
  const filter = document.createElementNS(svgNS, 'filter');
  filter.setAttribute('id', `grain-${Math.random().toString(36).slice(2)}`);

  const feTurbulence = document.createElementNS(svgNS, 'feTurbulence');
  feTurbulence.setAttribute('type', 'fractalNoise');
  feTurbulence.setAttribute('baseFrequency', '0.8');
  feTurbulence.setAttribute('numOctaves', '4');
  feTurbulence.setAttribute('stitchTiles', 'stitch');

  const feColorMatrix = document.createElementNS(svgNS, 'feColorMatrix');
  feColorMatrix.setAttribute('type', 'saturate');
  feColorMatrix.setAttribute('values', '0');

  filter.appendChild(feTurbulence);
  filter.appendChild(feColorMatrix);
  defs.appendChild(filter);
  svg.appendChild(defs);
  document.body.appendChild(svg);

  // Cria overlay de grain
  const overlay = document.createElement('div');
  overlay.style.position = 'absolute';
  overlay.style.inset = '0';
  overlay.style.pointerEvents = 'none';
  overlay.style.filter = `url(#${filter.id})`;
  overlay.style.opacity = String(intensity);
  overlay.style.mixBlendMode = 'overlay';

  const originalPosition = element.style.position;
  if (getComputedStyle(element).position === 'static') {
    element.style.position = 'relative';
  }

  element.appendChild(overlay);

  let intervalId: number | undefined;
  if (animated) {
    intervalId = window.setInterval(() => {
      const seed = Math.random() * 100;
      feTurbulence.setAttribute('seed', String(seed));
    }, speed);
  }

  return () => {
    if (intervalId !== undefined) clearInterval(intervalId);
    overlay.remove();
    svg.remove();
    element.style.position = originalPosition;
  };
}

// ============================================================================
// SPOTLIGHT EFFECTS
// ============================================================================

/**
 * Spotlight que segue o mouse
 */
export function spotlight(
  element: HTMLElement,
  config: {
    size?: number;
    color?: string;
    intensity?: number;
    smooth?: number;
  } = {}
): () => void {
  const {
    size = 300,
    color = 'rgba(255, 255, 255, 0.1)',
    intensity = 1,
    smooth = 0.1,
  } = config;

  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;
  let rafId: number;

  const originalBackground = element.style.background;
  const originalPosition = element.style.position;
  const originalOverflow = element.style.overflow;

  if (getComputedStyle(element).position === 'static') {
    element.style.position = 'relative';
  }
  element.style.overflow = 'hidden';

  const spotlightEl = document.createElement('div');
  spotlightEl.style.position = 'absolute';
  spotlightEl.style.width = `${size}px`;
  spotlightEl.style.height = `${size}px`;
  spotlightEl.style.borderRadius = '50%';
  spotlightEl.style.background = `radial-gradient(circle, ${color} 0%, transparent 70%)`;
  spotlightEl.style.pointerEvents = 'none';
  spotlightEl.style.opacity = String(intensity);
  spotlightEl.style.transform = 'translate(-50%, -50%)';
  spotlightEl.style.willChange = 'left, top';

  element.appendChild(spotlightEl);

  const animate = () => {
    currentX += (targetX - currentX) * smooth;
    currentY += (targetY - currentY) * smooth;

    spotlightEl.style.left = `${currentX}px`;
    spotlightEl.style.top = `${currentY}px`;

    rafId = requestAnimationFrame(animate);
  };

  const handleMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    targetX = e.clientX - rect.left;
    targetY = e.clientY - rect.top;
  };

  const handleEnter = () => {
    spotlightEl.style.opacity = String(intensity);
  };

  const handleLeave = () => {
    spotlightEl.style.opacity = '0';
  };

  element.addEventListener('mousemove', handleMove);
  element.addEventListener('mouseenter', handleEnter);
  element.addEventListener('mouseleave', handleLeave);
  rafId = requestAnimationFrame(animate);

  return () => {
    cancelAnimationFrame(rafId);
    element.removeEventListener('mousemove', handleMove);
    element.removeEventListener('mouseenter', handleEnter);
    element.removeEventListener('mouseleave', handleLeave);
    spotlightEl.remove();
    element.style.background = originalBackground;
    element.style.position = originalPosition;
    element.style.overflow = originalOverflow;
  };
}

// ============================================================================
// MAGNETIC EFFECT
// ============================================================================

/**
 * Elemento magnetico que segue o mouse suavemente
 */
export function magnetic(
  element: HTMLElement,
  config: {
    strength?: number;
    smooth?: number;
    scale?: number;
    maxDistance?: number;
  } = {}
): () => void {
  const { strength = 0.3, smooth = 0.15, scale = 1.05, maxDistance = 100 } = config;

  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;
  let isHovering = false;
  let rafId: number;

  const animate = () => {
    currentX += (targetX - currentX) * smooth;
    currentY += (targetY - currentY) * smooth;

    const scaleValue = isHovering ? scale : 1;
    element.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scaleValue})`;

    rafId = requestAnimationFrame(animate);
  };

  const handleMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance < maxDistance) {
      isHovering = true;
      targetX = deltaX * strength;
      targetY = deltaY * strength;
    } else {
      isHovering = false;
      targetX = 0;
      targetY = 0;
    }
  };

  const handleLeave = () => {
    isHovering = false;
    targetX = 0;
    targetY = 0;
  };

  document.addEventListener('mousemove', handleMove);
  element.addEventListener('mouseleave', handleLeave);
  rafId = requestAnimationFrame(animate);

  return () => {
    cancelAnimationFrame(rafId);
    document.removeEventListener('mousemove', handleMove);
    element.removeEventListener('mouseleave', handleLeave);
    element.style.transform = '';
  };
}

// ============================================================================
// TILT 3D EFFECT
// ============================================================================

/**
 * Tilt 3D baseado na posicao do mouse
 */
export function tilt3D(
  element: HTMLElement,
  config: {
    maxTilt?: number;
    perspective?: number;
    scale?: number;
    smooth?: number;
    glare?: boolean;
    glareOpacity?: number;
  } = {}
): () => void {
  const {
    maxTilt = 15,
    perspective = 1000,
    scale = 1.05,
    smooth = 0.1,
    glare = true,
    glareOpacity = 0.3,
  } = config;

  let currentRotateX = 0;
  let currentRotateY = 0;
  let targetRotateX = 0;
  let targetRotateY = 0;
  let isHovering = false;
  let rafId: number;

  const originalTransform = element.style.transform;
  const originalTransition = element.style.transition;
  element.style.transformStyle = 'preserve-3d';

  // Glare overlay
  let glareEl: HTMLDivElement | null = null;
  if (glare) {
    glareEl = document.createElement('div');
    glareEl.style.position = 'absolute';
    glareEl.style.inset = '0';
    glareEl.style.pointerEvents = 'none';
    glareEl.style.background = 'linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 50%)';
    glareEl.style.opacity = '0';
    glareEl.style.transition = 'opacity 0.3s';

    const originalPosition = element.style.position;
    if (getComputedStyle(element).position === 'static') {
      element.style.position = 'relative';
    }
    element.style.overflow = 'hidden';
    element.appendChild(glareEl);
  }

  const animate = () => {
    currentRotateX += (targetRotateX - currentRotateX) * smooth;
    currentRotateY += (targetRotateY - currentRotateY) * smooth;

    const scaleValue = isHovering ? scale : 1;
    element.style.transform = `
      perspective(${perspective}px)
      rotateX(${currentRotateX}deg)
      rotateY(${currentRotateY}deg)
      scale(${scaleValue})
    `;

    rafId = requestAnimationFrame(animate);
  };

  const handleMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    targetRotateX = (y - 0.5) * -maxTilt * 2;
    targetRotateY = (x - 0.5) * maxTilt * 2;

    if (glareEl) {
      const angle = Math.atan2(y - 0.5, x - 0.5) * (180 / Math.PI) + 90;
      glareEl.style.background = `linear-gradient(${angle}deg, rgba(255,255,255,${glareOpacity}) 0%, transparent 80%)`;
    }
  };

  const handleEnter = () => {
    isHovering = true;
    if (glareEl) glareEl.style.opacity = '1';
  };

  const handleLeave = () => {
    isHovering = false;
    targetRotateX = 0;
    targetRotateY = 0;
    if (glareEl) glareEl.style.opacity = '0';
  };

  element.addEventListener('mousemove', handleMove);
  element.addEventListener('mouseenter', handleEnter);
  element.addEventListener('mouseleave', handleLeave);
  rafId = requestAnimationFrame(animate);

  return () => {
    cancelAnimationFrame(rafId);
    element.removeEventListener('mousemove', handleMove);
    element.removeEventListener('mouseenter', handleEnter);
    element.removeEventListener('mouseleave', handleLeave);
    if (glareEl) glareEl.remove();
    element.style.transform = originalTransform;
    element.style.transition = originalTransition;
  };
}

// ============================================================================
// PARALLAX LAYERS
// ============================================================================

/**
 * Cria efeito de parallax com múltiplas camadas
 */
export function parallaxLayers(
  _container: HTMLElement,
  layers: { element: HTMLElement; speed: number }[]
): () => void {
  let rafId: number;
  let lastScrollY = 0;

  const animate = () => {
    const scrollY = window.scrollY;
    if (scrollY !== lastScrollY) {
      layers.forEach(({ element, speed }) => {
        const y = scrollY * speed;
        element.style.transform = `translate3d(0, ${y}px, 0)`;
      });
      lastScrollY = scrollY;
    }
    rafId = requestAnimationFrame(animate);
  };

  rafId = requestAnimationFrame(animate);

  return () => {
    cancelAnimationFrame(rafId);
    layers.forEach(({ element }) => {
      element.style.transform = '';
    });
  };
}

// ============================================================================
// COLOR EFFECTS
// ============================================================================

/**
 * Interpolacao de cores
 */
export function colorTransition(
  element: HTMLElement,
  config: {
    property?: 'backgroundColor' | 'color' | 'borderColor';
    colors: string[];
    duration?: number;
    mode?: 'loop' | 'pingpong';
  }
): () => void {
  const { property = 'backgroundColor', colors, duration = 3000, mode = 'loop' } = config;

  if (colors.length < 2) return () => {};

  const keyframes = colors.map((color, i) => ({
    [property]: color,
    offset: i / (colors.length - 1),
  }));

  if (mode === 'pingpong') {
    // Adiciona cores reversas
    for (let i = colors.length - 2; i > 0; i--) {
      keyframes.push({
        [property]: colors[i],
        offset: (keyframes.length) / (keyframes.length + colors.length - 2),
      });
    }
  }

  const anim = element.animate(keyframes as Keyframe[], {
    duration: mode === 'pingpong' ? duration * 2 : duration,
    iterations: Infinity,
    easing: 'linear',
  });

  return () => anim.cancel();
}

/**
 * Gradiente animado
 */
export function animatedGradient(
  element: HTMLElement,
  config: {
    colors?: string[];
    angle?: number;
    speed?: number;
  } = {}
): () => void {
  const {
    colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ff6b6b'],
    angle = 45,
    speed = 3000,
  } = config;

  const gradientColors = colors.join(', ');

  element.style.background = `linear-gradient(${angle}deg, ${gradientColors})`;
  element.style.backgroundSize = '400% 400%';

  const anim = element.animate(
    [
      { backgroundPosition: '0% 50%' },
      { backgroundPosition: '100% 50%' },
      { backgroundPosition: '0% 50%' },
    ],
    { duration: speed, iterations: Infinity, easing: 'linear' }
  );

  return () => {
    anim.cancel();
    element.style.background = '';
    element.style.backgroundSize = '';
  };
}

// ============================================================================
// MORPHING
// ============================================================================

/**
 * Morph entre shapes usando border-radius
 */
export function morphShape(
  element: HTMLElement,
  config: {
    shapes?: string[];
    duration?: number;
    iterations?: number;
  } = {}
): () => void {
  const {
    shapes = [
      '60% 40% 30% 70% / 60% 30% 70% 40%',
      '30% 60% 70% 40% / 50% 60% 30% 60%',
      '40% 60% 60% 40% / 70% 30% 70% 30%',
      '60% 40% 30% 70% / 60% 30% 70% 40%',
    ],
    duration = 8000,
    iterations = Infinity,
  } = config;

  const keyframes = shapes.map((shape) => ({ borderRadius: shape }));

  const anim = element.animate(keyframes, {
    duration,
    iterations,
    easing: 'ease-in-out',
  });

  return () => anim.cancel();
}

// ============================================================================
// REVEAL MASK
// ============================================================================

/**
 * Reveal com mascara circular expandindo
 */
export function circleReveal(
  element: HTMLElement,
  config: {
    duration?: number;
    origin?: { x: number; y: number };
    easing?: string;
  } = {}
): Animation {
  const { duration = 800, origin, easing: easingVal = 'cubic-bezier(0.4, 0, 0.2, 1)' } = config;

  const rect = element.getBoundingClientRect();
  const originX = origin?.x ?? rect.width / 2;
  const originY = origin?.y ?? rect.height / 2;

  // Calcula raio maximo para cobrir todo elemento
  const maxRadius = Math.sqrt(
    Math.max(originX, rect.width - originX) ** 2 +
    Math.max(originY, rect.height - originY) ** 2
  );

  return element.animate(
    [
      { clipPath: `circle(0% at ${originX}px ${originY}px)` },
      { clipPath: `circle(${maxRadius}px at ${originX}px ${originY}px)` },
    ],
    { duration, easing: easingVal, fill: 'forwards' }
  );
}

/**
 * Reveal com mascara retangular
 */
export function wipeReveal(
  element: HTMLElement,
  config: {
    duration?: number;
    direction?: 'left' | 'right' | 'top' | 'bottom';
    easing?: string;
  } = {}
): Animation {
  const { duration = 600, direction = 'left', easing: easingVal = 'cubic-bezier(0.4, 0, 0.2, 1)' } = config;

  const clipPaths = {
    left: ['inset(0 100% 0 0)', 'inset(0 0 0 0)'],
    right: ['inset(0 0 0 100%)', 'inset(0 0 0 0)'],
    top: ['inset(100% 0 0 0)', 'inset(0 0 0 0)'],
    bottom: ['inset(0 0 100% 0)', 'inset(0 0 0 0)'],
  };

  return element.animate(
    [{ clipPath: clipPaths[direction][0] }, { clipPath: clipPaths[direction][1] }],
    { duration, easing: easingVal, fill: 'forwards' }
  );
}
