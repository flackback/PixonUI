import React, { useRef, useState, useCallback } from 'react';
import { cn } from '../../utils/cn';

export interface SpotlightEffectProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Spotlight color @default 'rgba(168, 85, 247, 0.08)' */
  color?: string;
  /** Spotlight size in pixels @default 400 */
  size?: number;
  /** Disable the spotlight effect */
  disabled?: boolean;
}

/**
 * Mouse-following spotlight glow effect.
 * Creates a radial gradient that tracks cursor movement.
 * GPU-accelerated via CSS custom properties.
 *
 * @example
 * ```tsx
 * <Spotlight color="rgba(59, 130, 246, 0.1)">
 *   <div className="p-12 rounded-2xl border border-white/10">
 *     Content with spotlight hover
 *   </div>
 * </Spotlight>
 * ```
 */
export function SpotlightEffect({
  children,
  color = 'rgba(168, 85, 247, 0.08)',
  size = 400,
  disabled = false,
  className,
  ...props
}: SpotlightEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (disabled || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, [disabled]);

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {/* Spotlight gradient */}
      {!disabled && (
        <div
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(${size}px circle at ${position.x}px ${position.y}px, ${color}, transparent 70%)`,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

SpotlightEffect.displayName = 'SpotlightEffect';

// ─── SpotlightCard ──────────────────────────────────────────────────────────

export interface SpotlightEffectCardProps extends SpotlightEffectProps {
  /** Show glowing border on hover */
  glowBorder?: boolean;
}

/**
 * A card wrapper with built-in Spotlight + optional glowing border.
 * Perfect for feature cards, pricing cards, or any interactive card.
 */
export function SpotlightEffectCard({
  children,
  color = 'rgba(168, 85, 247, 0.06)',
  size = 350,
  glowBorder = true,
  className,
  ...props
}: SpotlightEffectCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.06] transition-shadow duration-300',
        isHovered && 'shadow-lg dark:shadow-purple-500/5',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {/* Spotlight */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(${size}px circle at ${position.x}px ${position.y}px, ${color}, transparent 70%)`,
        }}
      />

      {/* Glowing border gradient */}
      {glowBorder && (
        <div
          className="pointer-events-none absolute inset-0 z-0 rounded-2xl transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(${size * 0.6}px circle at ${position.x}px ${position.y}px, rgba(168,85,247,0.15), transparent 70%)`,
            mask: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
            maskComposite: 'exclude',
            WebkitMaskComposite: 'xor',
            padding: '1px',
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

SpotlightEffectCard.displayName = 'SpotlightEffectCard';
