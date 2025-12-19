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
    patternColor = 'rgba(255,255,255,0.08)', 
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
    const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (!followMouse) return;

      const handleMouseMove = (e: MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      };

      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [followMouse]);
    
    const getBackgroundStyle = (): React.CSSProperties => {
      const baseStyle: React.CSSProperties = {};
      
      if (followMouse) {
        baseStyle.transform = `translate3d(${(mousePos.x - size) / 20}px, ${(mousePos.y - size) / 20}px, 0)`;
      }

      if (variant === 'dots') {
        return {
          ...baseStyle,
          backgroundImage: `radial-gradient(${patternColor} 1px, transparent 1px)`,
          backgroundSize: `${size}px ${size}px`,
        };
      }
      if (variant === 'grid') {
        return {
          ...baseStyle,
          backgroundImage: `
            linear-gradient(to right, ${patternColor} 1px, transparent 1px),
            linear-gradient(to bottom, ${patternColor} 1px, transparent 1px)
          `,
          backgroundSize: `${size}px ${size}px`,
        };
      }
      if (variant === 'gradient') {
        return {
          ...baseStyle,
          background: `radial-gradient(circle at ${followMouse ? `${mousePos.x}px ${mousePos.y}px` : 'center'}, ${patternColor}, transparent)`,
        };
      }
      if (variant === 'beams') {
        return {
          ...baseStyle,
          background: `radial-gradient(60% 40% at 50% 0%, ${patternColor} 0%, transparent 100%)`,
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
          // @ts-ignore
          containerRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn(
          'absolute inset-0 overflow-hidden pointer-events-none transition-transform duration-300 ease-out',
          'z-0',
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
