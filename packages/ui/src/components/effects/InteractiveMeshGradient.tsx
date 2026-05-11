import React, { useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';

export interface InteractiveMeshGradientProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Colors of the dynamic blobs. Supports 3-5 background color classes.
   * @default ['bg-violet-500', 'bg-cyan-500', 'bg-pink-500', 'bg-amber-400']
   */
  colors?: string[];
  /**
   * Enable interactive mouse-following glow blob
   * @default true
   */
  interactive?: boolean;
  /**
   * Speed of blob floating animation (in seconds)
   * @default 25
   */
  speed?: number;
}

export const InteractiveMeshGradient = ({
  colors = ['bg-violet-600/30', 'bg-cyan-500/25', 'bg-pink-500/30', 'bg-amber-400/20'],
  interactive = true,
  speed = 25,
  className,
  style,
  ...props
}: InteractiveMeshGradientProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const currentRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rafId = useRef<number>(0);

  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Smooth lerping animation for mouse-follow blob
    const updatePosition = () => {
      const el = containerRef.current;
      if (!el) return;

      const targetX = mouseRef.current.x;
      const targetY = mouseRef.current.y;

      // Linear interpolation: current + (target - current) * factor
      currentRef.current.x += (targetX - currentRef.current.x) * 0.08;
      currentRef.current.y += (targetY - currentRef.current.y) * 0.08;

      el.style.setProperty('--mouse-x', `${currentRef.current.x}px`);
      el.style.setProperty('--mouse-y', `${currentRef.current.y}px`);

      rafId.current = requestAnimationFrame(updatePosition);
    };

    updatePosition();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId.current);
    };
  }, [interactive]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'absolute inset-0 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500',
        className
      )}
      style={{
        ...style,
      }}
      {...props}
    >
      {/* Dynamic Blurred Blob Container */}
      <div className="absolute inset-0 filter blur-[100px] pointer-events-none opacity-80 md:opacity-100 select-none">
        {/* Blob 1 */}
        <div
          className={cn(
            'absolute rounded-full w-[35vw] h-[35vw] min-w-[300px] min-h-[300px] left-[10%] top-[15%]',
            colors[0] || 'bg-violet-600/30',
            'animate-blob-float-1'
          )}
          style={{ animationDuration: `${speed}s` }}
        />

        {/* Blob 2 */}
        <div
          className={cn(
            'absolute rounded-full w-[40vw] h-[40vw] min-w-[350px] min-h-[350px] right-[15%] top-[10%]',
            colors[1] || 'bg-cyan-500/25',
            'animate-blob-float-2'
          )}
          style={{ animationDuration: `${speed + 5}s` }}
        />

        {/* Blob 3 */}
        <div
          className={cn(
            'absolute rounded-full w-[30vw] h-[30vw] min-w-[280px] min-h-[280px] left-[25%] bottom-[15%]',
            colors[2] || 'bg-pink-500/30',
            'animate-blob-float-3'
          )}
          style={{ animationDuration: `${speed - 5}s` }}
        />

        {/* Blob 4 */}
        <div
          className={cn(
            'absolute rounded-full w-[25vw] h-[25vw] min-w-[250px] min-h-[250px] right-[25%] bottom-[10%]',
            colors[3] || 'bg-amber-400/20',
            'animate-blob-float-1'
          )}
          style={{ animationDuration: `${speed + 10}s` }}
        />

        {/* Interactive Mouse Glow Blob */}
        {interactive && (
          <div
            className="absolute rounded-full w-[25vw] h-[25vw] bg-indigo-500/20 transition-opacity duration-300 opacity-80"
            style={{
              transform: 'translate(-50%, -50%)',
              left: 'var(--mouse-x, -1000px)',
              top: 'var(--mouse-y, -1000px)',
            }}
          />
        )}
      </div>

      <style>{`
        @keyframes float1 {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes float2 {
          0% { transform: translate(0px, 0px) scale(1.05); }
          50% { transform: translate(-40px, 40px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1.05); }
        }
        @keyframes float3 {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(-25px, -30px) scale(0.9); }
          66% { transform: translate(40px, 35px) scale(1.1); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob-float-1 {
          animation: float1 linear infinite alternate;
        }
        .animate-blob-float-2 {
          animation: float2 linear infinite alternate;
        }
        .animate-blob-float-3 {
          animation: float3 linear infinite alternate;
        }
      `}</style>
    </div>
  );
};

InteractiveMeshGradient.displayName = 'InteractiveMeshGradient';
