import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { cn } from '../../utils/cn';

export interface DotGridProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  /** 
   * Color of the dots. 
   * Can be a CSS color (hex, rgb, etc.) 
   * @default '#D1D1D1' 
   */
  color?: string;
  /** 
   * Spacing between dots in pixels. 
   * @default 40 
   */
  spacing?: number;
  /** 
   * Size of each dot in pixels. 
   * @default 1.5 
   */
  dotSize?: number;
  /** 
   * Opacity of the grid. 
   * @default 0.3 
   */
  opacity?: number;
  /** 
   * Enable mouse reactivity. 
   * @default true 
   */
  interactive?: boolean;
  /**
   * Render variant.
   * - `dots`: classic dot grid
   * - `dashes`: "bilinhas" ice texture grid
   * @default 'dots'
   */
  variant?: 'dots' | 'dashes';
  /** Dash length in px (variant='dashes') @default 8 */
  dashLength?: number;
  /** Dash thickness in px (variant='dashes') @default 1 */
  dashThickness?: number;
  /** Parallax strength in px (variant='dashes') @default 18 */
  parallax?: number;
  /** Pause rendering when out of viewport @default true */
  pauseWhenOutOfView?: boolean;
  /** 
   * The maximum distance (in pixels) the mouse affects the dots. 
   * @default 120 
   */
  maxDist?: number;
  /** 
   * The strength of the "magnetic" push effect. 
   * Higher values push dots further away. 
   * @default 15 
   */
  magneticStrength?: number;
  /** 
   * Smoothing factor for returning to original position (0-1). 
   * Lower values mean slower, smoother return. 
   * @default 0.1 
   */
  smoothing?: number;
}

/**
 * A performant, Canvas-based interactive dot grid background.
 * Dots react to mouse movement with a "magnetic" push effect.
 *
 * @example
 * ```tsx
 * <div className="relative h-[400px] bg-zinc-950 overflow-hidden">
 *   <DotGrid color="#3b82f6" opacity={0.5} spacing={30} />
 *   <div className="relative z-10 flex items-center justify-center h-full">
 *     <h1 className="text-white text-4xl font-bold">Interactive Background</h1>
 *   </div>
 * </div>
 * ```
 */
export const DotGrid = forwardRef<HTMLCanvasElement, DotGridProps>(
  (
    {
      color = '#D1D1D1',
      spacing = 40,
      dotSize = 1.5,
      opacity = 0.3,
      interactive = true,
      variant = 'dots',
      dashLength = 8,
      dashThickness = 1,
      parallax = 18,
      pauseWhenOutOfView = true,
      maxDist = 120,
      magneticStrength = 15,
      smoothing = 0.1,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouse = useRef({ x: -2000, y: -2000 });
    const dotsRef = useRef<{ x: number; y: number; ox: number; oy: number }[]>([]);
    const dashOffset = useRef({ x: 0, y: 0 });
    const dashTarget = useRef({ x: 0, y: 0 });
    
    useImperativeHandle(ref, () => canvasRef.current!);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let animationFrameId: number;
      let width = 0, height = 0, dpr = 1;

      const resize = () => {
        const rect = canvas.getBoundingClientRect();
        dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
        width = Math.max(1, Math.floor(rect.width));
        height = Math.max(1, Math.floor(rect.height));
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        
        // Use logical width/height for dot generation
        const logicalWidth = width;
        const logicalHeight = height;

        dotsRef.current = [];
        for (let x = spacing / 2; x < logicalWidth; x += spacing) {
          for (let y = spacing / 2; y < logicalHeight; y += spacing) {
            dotsRef.current.push({ x, y, ox: x, oy: y });
          }
        }
      };

      const render = () => {
        if (pauseWhenOutOfView) {
          const r = canvas.getBoundingClientRect();
          if (r.bottom < 0 || r.top > window.innerHeight || r.right < 0 || r.left > window.innerWidth) {
            animationFrameId = requestAnimationFrame(render);
            return;
          }
        }

        ctx.clearRect(0, 0, width, height);
        
        const dots = dotsRef.current;
        const mx = mouse.current.x;
        const my = mouse.current.y;

        if (variant === 'dashes') {
          // Smooth parallax offset based on mouse.
          dashOffset.current.x += (dashTarget.current.x - dashOffset.current.x) * 0.08;
          dashOffset.current.y += (dashTarget.current.y - dashOffset.current.y) * 0.08;

          ctx.globalAlpha = opacity;
          ctx.strokeStyle = color;
          ctx.lineWidth = dashThickness;
          ctx.lineCap = 'round';

          const ox = dashOffset.current.x;
          const oy = dashOffset.current.y;
          const startX = -spacing + (ox % spacing);
          const startY = -spacing + (oy % spacing);
          let idx = 0;
          for (let x = startX; x <= width + spacing; x += spacing) {
            for (let y = startY; y <= height + spacing; y += spacing) {
              const horizontal = (idx++ % 2) === 0;
              ctx.beginPath();
              if (horizontal) {
                ctx.moveTo(x - dashLength / 2, y);
                ctx.lineTo(x + dashLength / 2, y);
              } else {
                ctx.moveTo(x, y - dashLength / 2);
                ctx.lineTo(x, y + dashLength / 2);
              }
              ctx.stroke();
            }
          }
          ctx.globalAlpha = 1;
        } else {
          ctx.fillStyle = color;
          for (let i = 0; i < dots.length; i++) {
            const dot = dots[i];
            if (!dot) continue;

            if (interactive) {
              const dx = mx - dot.ox;
              const dy = my - dot.oy;
              const distSq = dx * dx + dy * dy;
              const maxDistSq = maxDist * maxDist;

              if (distSq < maxDistSq) {
                const dist = Math.sqrt(distSq);
                const angle = Math.atan2(dy, dx);
                const force = (maxDist - dist) / maxDist;
                const easedForce = force * force;
                dot.x = dot.ox - Math.cos(angle) * easedForce * magneticStrength * 1.5;
                dot.y = dot.oy - Math.sin(angle) * easedForce * magneticStrength * 1.5;
              } else {
                dot.x += (dot.ox - dot.x) * smoothing;
                dot.y += (dot.oy - dot.y) * smoothing;
              }
            }

            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dotSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        animationFrameId = requestAnimationFrame(render);
      };

      const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouse.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };

        if (variant === 'dashes') {
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const nx = (e.clientX - cx) / (rect.width / 2 || 1);
          const ny = (e.clientY - cy) / (rect.height / 2 || 1);
          dashTarget.current.x = -nx * parallax;
          dashTarget.current.y = -ny * parallax;
        }
      };

      const handleMouseLeave = () => {
        mouse.current = { x: -2000, y: -2000 };
        dashTarget.current.x = 0;
        dashTarget.current.y = 0;
      };

      window.addEventListener('resize', resize);
      if (interactive) {
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        canvas.addEventListener('mouseleave', handleMouseLeave);
      }
      
      resize();
      render();

      return () => {
        window.removeEventListener('resize', resize);
        window.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
        cancelAnimationFrame(animationFrameId);
      };
    }, [color, spacing, dotSize, interactive, variant, dashLength, dashThickness, parallax, pauseWhenOutOfView, maxDist, magneticStrength, smoothing, opacity]);

    return (
      <canvas
        ref={canvasRef}
        className={cn('absolute inset-0 w-full h-full pointer-events-none z-0', className)}
        style={{ opacity, ...style }}
        {...props}
      />
    );
  }
);

DotGrid.displayName = 'DotGrid';
