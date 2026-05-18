import React, { useCallback, useRef, useImperativeHandle, forwardRef } from 'react';

export interface ConfettiOptions {
  /** Number of particles @default 80 */
  count?: number;
  /** Spread angle in degrees @default 60 */
  spread?: number;
  /** Launch origin X (0-1) @default 0.5 */
  originX?: number;
  /** Launch origin Y (0-1) @default 0.7 */
  originY?: number;
  /** Particle colors */
  colors?: string[];
  /** Gravity @default 1 */
  gravity?: number;
  /** Duration in ms @default 3000 */
  duration?: number;
}

export interface ConfettiRef {
  fire: (options?: ConfettiOptions) => void;
}

export interface ConfettiProps {
  /** Ref to access the fire() method imperatively */
  ref?: React.Ref<ConfettiRef>;
}

const DEFAULT_COLORS = [
  '#a855f7', '#6366f1', '#3b82f6', '#22c55e',
  '#eab308', '#f97316', '#ef4444', '#ec4899',
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  size: number;
  shape: 'rect' | 'circle';
  opacity: number;
  life: number;
}

/**
 * Canvas-based confetti celebration effect.
 * Call `fire()` imperatively to launch a burst of particles.
 *
 * @example
 * ```tsx
 * const confettiRef = useRef<ConfettiRef>(null);
 *
 * <button onClick={() => confettiRef.current?.fire()}>
 *   🎉 Celebrate!
 * </button>
 * <Confetti ref={confettiRef} />
 * ```
 */
export const Confetti = forwardRef<ConfettiRef, Record<string, never>>((_props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);

  const fire = useCallback((options: ConfettiOptions = {}) => {
    const {
      count = 80,
      spread = 60,
      originX = 0.5,
      originY = 0.7,
      colors = DEFAULT_COLORS,
      gravity = 1,
      duration = 3000,
    } = options;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Size canvas to viewport
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.display = 'block';

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const startX = canvas.width * originX;
    const startY = canvas.height * originY;
    const spreadRad = (spread * Math.PI) / 180;

    // Generate particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * spreadRad;
      const velocity = 8 + Math.random() * 8;

      newParticles.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * velocity * (0.5 + Math.random()),
        vy: Math.sin(angle) * velocity * (0.5 + Math.random()),
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        color: colors[Math.floor(Math.random() * colors.length)] || '#a855f7',
        size: 4 + Math.random() * 6,
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
        opacity: 1,
        life: duration,
      });
    }

    particlesRef.current = [...particlesRef.current, ...newParticles];

    // Already animating? Let existing loop handle it
    if (rafRef.current) return;

    const startTime = performance.now();

    const animate = (now: number) => {
      const dt = 16; // ~60fps frame budget
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter(p => {
        p.life -= dt;
        if (p.life <= 0) return false;

        p.vy += gravity * 0.3;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.vx *= 0.99;

        // Fade out in last 30%
        const lifeRatio = p.life / duration;
        p.opacity = lifeRatio < 0.3 ? lifeRatio / 0.3 : 1;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
        return true;
      });

      if (particlesRef.current.length > 0) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        canvas.style.display = 'none';
        rafRef.current = undefined;
      }
    };

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useImperativeHandle(ref, () => ({ fire }), [fire]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
        display: 'none',
      }}
    />
  );
});

Confetti.displayName = 'Confetti';
