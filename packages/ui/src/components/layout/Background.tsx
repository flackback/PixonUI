import React from 'react';
import { cn } from '../../utils/cn';

export interface BackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The pattern variant to display
   * @default 'none'
   */
  variant?: 'dots' | 'grid' | 'mesh' | 'gradient' | 'beams' | 'none';
  /**
   * Add a subtle noise/grain texture
   * @default false
   */
  noise?: boolean;
  /**
   * The color of the pattern (CSS color or variable)
   * @default 'rgba(255,255,255,0.08)'
   */
  patternColor?: string;
  /**
   * The size of the pattern (spacing between dots/lines)
   * @default 24
   */
  size?: number;
  /**
   * Apply a radial mask to fade the edges
   * @default 'none'
   */
  mask?: 'fade' | 'none';
  /**
   * Enable subtle animations for mesh or gradient variants
   * @default false
   */
  animate?: boolean;
  /**
   * Make the background follow the mouse (requires relative parent)
   * @default false
   */
  followMouse?: boolean;
  /**
   * The background color of the container. 
   * Can be a Tailwind class (e.g., 'bg-zinc-950') or a CSS color.
   */
  bgColor?: string;
}

export const Background = React.forwardRef<HTMLDivElement, BackgroundProps>(
  ({ 
    variant = 'none', 
    noise = false,
    patternColor, 
    size = 24, 
    mask = 'none', 
    animate = false,
    followMouse = false,
    bgColor,
    className, 
    children,
    style,
    ...props 
  }, ref) => {
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (!followMouse) return;

      const handleMouseMove = (e: MouseEvent) => {
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        el.style.setProperty('--mouse-x', `${x}px`);
        el.style.setProperty('--mouse-y', `${y}px`);
      };

      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [followMouse]);
    
    const getBackgroundStyle = (): React.CSSProperties => {
      const baseStyle: React.CSSProperties = {};
      
      // Use CSS variables for ultra-performance (no React re-renders)
      const effectiveColor = patternColor || 'var(--pattern-color, rgba(255,255,255,0.08))';

      if (variant === 'dots') {
        return {
          ...baseStyle,
          backgroundImage: `radial-gradient(${effectiveColor} 1px, transparent 1px)`,
          backgroundSize: `${size}px ${size}px`,
          transform: followMouse ? 'translate3d(calc((var(--mouse-x, 0) - 24px) / 40), calc((var(--mouse-y, 0) - 24px) / 40), 0)' : undefined,
        };
      }
      if (variant === 'grid') {
        return {
          ...baseStyle,
          backgroundImage: `
            linear-gradient(to right, ${effectiveColor} 1px, transparent 1px),
            linear-gradient(to bottom, ${effectiveColor} 1px, transparent 1px)
          `,
          backgroundSize: `${size}px ${size}px`,
          transform: followMouse ? 'translate3d(calc((var(--mouse-x, 0) - 24px) / 40), calc((var(--mouse-y, 0) - 24px) / 40), 0)' : undefined,
        };
      }
      if (variant === 'gradient') {
        return {
          ...baseStyle,
          background: followMouse 
            ? `radial-gradient(circle at var(--mouse-x, center) var(--mouse-y, center), ${effectiveColor}, transparent)`
            : `radial-gradient(circle at center, ${effectiveColor}, transparent)`,
        };
      }
      if (variant === 'beams') {
        return {
          ...baseStyle,
          background: `radial-gradient(60% 40% at 50% 0%, ${effectiveColor} 0%, transparent 100%)`,
        };
      }
      return baseStyle;
    };

    const maskStyle: React.CSSProperties = mask === 'fade' ? {
      maskImage: 'radial-gradient(ellipse at center, black, transparent 90%)',
      WebkitMaskImage: 'radial-gradient(ellipse at center, black, transparent 90%)',
    } : {};

    return (
      <div
        ref={(node) => {
          if (node) {
            (containerRef as React.MutableRefObject<HTMLDivElement>).current = node;
          }
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={cn(
          'absolute inset-0 overflow-hidden pointer-events-none transition-transform duration-300 ease-out',
          'z-0',
          '[--pattern-color:rgba(0,0,0,0.05)] dark:[--pattern-color:rgba(255,255,255,0.08)]',
          bgColor?.startsWith('bg-') ? bgColor : '',
          className
        )}
        style={{ 
          ...getBackgroundStyle(), 
          ...maskStyle, 
          ...style,
          backgroundColor: bgColor && !bgColor.startsWith('bg-') ? bgColor : undefined 
        }}
        {...props}
      >
        {noise && (
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none brightness-100 contrast-150" 
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
          />
        )}

        {variant === 'beams' && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent" />
            <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent" />
          </div>
        )}

        {variant === 'mesh' && (
          <div className={cn(
            "absolute inset-0 opacity-30 blur-[100px]",
            animate && "animate-pulse"
          )}>
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/20" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/20" />
            <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10" />
          </div>
        )}
        {children}
      </div>
    );
  }
);

Background.displayName = 'Background';
