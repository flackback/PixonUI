import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { cn } from '../../utils/cn';

export interface DotGridProps extends React.HTMLAttributes<HTMLDivElement> {
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
    
    useImperativeHandle(ref, () => canvasRef.current!);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let animationFrameId: number;
      let width: number, height: number;

      const resize = () => {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        width = canvas.width = rect.width * dpr;
        height = canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        
        // Use logical width/height for dot generation
        const logicalWidth = rect.width;
        const logicalHeight = rect.height;

        dotsRef.current = [];
        for (let x = spacing / 2; x < logicalWidth; x += spacing) {
          for (let y = spacing / 2; y < logicalHeight; y += spacing) {
            dotsRef.current.push({ x, y, ox: x, oy: y });
          }
        }
      };

      const render = () => {
        const rect = canvas.getBoundingClientRect();
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.fillStyle = color;
        
        const dots = dotsRef.current;
        const mx = mouse.current.x;
        const my = mouse.current.y;
        
        for (let i = 0; i < dots.length; i++) {
          const dot = dots[i];
          
          if (interactive) {
            const dx = mx - dot.ox;
            const dy = my - dot.oy;
            const distSq = dx * dx + dy * dy;
            const maxDistSq = maxDist * maxDist;

            if (distSq < maxDistSq) {
              const dist = Math.sqrt(distSq);
              const angle = Math.atan2(dy, dx);
              const force = (maxDist - dist) / maxDist;
              // Non-linear force for a more "magnetic" feel
              const easedForce = force * force;
              dot.x = dot.ox - Math.cos(angle) * easedForce * magneticStrength * 1.5;
              dot.y = dot.oy - Math.sin(angle) * easedForce * magneticStrength * 1.5;
            } else {
              // Smoothly return to original position
              dot.x += (dot.ox - dot.x) * smoothing;
              dot.y += (dot.oy - dot.y) * smoothing;
            }
          }

          ctx.beginPath();
          ctx.arc(dot.x, dot.y, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }

        // Add a subtle "Supreme" glow that follows the mouse
        if (interactive && mx > -1000) {
          const gradient = ctx.createRadialGradient(mx, my, 0, mx, my, maxDist * 1.5);
          gradient.addColorStop(0, color.replace(')', ', 0.15)').replace('rgb', 'rgba').replace('#', 'rgba(')); // Rough conversion attempt
          // Fallback if not easily convertible: just use a very faint version of the color
          ctx.fillStyle = gradient;
          ctx.globalAlpha = 0.2;
          ctx.beginPath();
          ctx.arc(mx, my, maxDist * 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
        animationFrameId = requestAnimationFrame(render);
      };

      const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouse.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
      };

      const handleMouseLeave = () => {
        mouse.current = { x: -2000, y: -2000 };
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
    }, [color, spacing, dotSize, interactive, maxDist, magneticStrength, smoothing]);

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
