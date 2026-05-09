import React, { useState, useRef, useCallback } from 'react';
import { cn } from '../../utils/cn';

export interface DockProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Maximum scale when hovered @default 1.8 */
  magnification?: number;
  /** Pixel range of the magnification effect @default 140 */
  range?: number;
  /** Visual variant */
  variant?: 'glass' | 'solid' | 'minimal';
}

export interface DockItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Tooltip label shown above the item */
  label?: string;
}

const DockContext = React.createContext<{
  mouseX: number | null;
  range: number;
  magnification: number;
}>({ mouseX: null, range: 140, magnification: 1.8 });

/**
 * macOS-style dock with hover magnification effect.
 * Each child item scales up smoothly based on mouse proximity.
 *
 * @example
 * ```tsx
 * <Dock magnification={1.8} variant="glass">
 *   <DockItem label="Home"><HomeIcon /></DockItem>
 *   <DockItem label="Search"><SearchIcon /></DockItem>
 *   <DockItem label="Settings"><SettingsIcon /></DockItem>
 * </Dock>
 * ```
 */
export function Dock({
  children,
  magnification = 1.8,
  range = 140,
  variant = 'glass',
  className,
  ...props
}: DockProps) {
  const [mouseX, setMouseX] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMouseX(e.clientX - rect.left);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseX(null);
  }, []);

  const variantStyles = {
    glass: 'bg-white/10 dark:bg-white/[0.04] backdrop-blur-2xl border border-white/20 dark:border-white/[0.08] shadow-2xl',
    solid: 'bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl',
    minimal: 'bg-transparent',
  };

  return (
    <DockContext.Provider value={{ mouseX, range, magnification }}>
      <div
        ref={containerRef}
        className={cn(
          'inline-flex items-end gap-2 px-3 py-2 rounded-2xl',
          variantStyles[variant],
          className
        )}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </div>
    </DockContext.Provider>
  );
}

export function DockItem({
  children,
  label,
  className,
  ...props
}: DockItemProps) {
  const { mouseX, range, magnification } = React.useContext(DockContext);
  const itemRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Calculate scale based on mouse distance
  let scale = 1;
  if (mouseX !== null && itemRef.current) {
    const rect = itemRef.current.getBoundingClientRect();
    const parentRect = itemRef.current.parentElement?.getBoundingClientRect();
    if (parentRect) {
      const itemCenter = rect.left - parentRect.left + rect.width / 2;
      const distance = Math.abs(mouseX - itemCenter);
      if (distance < range) {
        const progress = 1 - distance / range;
        // Smooth cosine interpolation for natural feel
        const smoothProgress = (Math.cos(Math.PI * (1 - progress)) + 1) / 2;
        scale = 1 + (magnification - 1) * smoothProgress;
      }
    }
  }

  return (
    <div
      ref={itemRef}
      className={cn(
        'relative flex items-center justify-center cursor-pointer transition-transform duration-150 ease-out',
        className
      )}
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'bottom center',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {/* Tooltip label */}
      {label && isHovered && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded-lg bg-zinc-900 dark:bg-zinc-800 text-white text-[11px] font-medium shadow-lg pointer-events-none animate-in fade-in slide-in-from-bottom-1 duration-150">
          {label}
        </div>
      )}

      {/* Icon container */}
      <div className="h-10 w-10 rounded-xl bg-white/80 dark:bg-white/[0.06] border border-white/20 dark:border-white/[0.08] flex items-center justify-center text-zinc-700 dark:text-zinc-300 shadow-sm hover:shadow-md transition-shadow">
        {children}
      </div>
    </div>
  );
}

Dock.displayName = 'Dock';
DockItem.displayName = 'DockItem';
