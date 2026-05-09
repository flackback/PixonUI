import React, { useRef } from 'react';
import { cn } from '../../utils/cn';
import { ArrowRight } from 'lucide-react';

export interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * A beautiful Bento Grid container that neatly arranges responsive Bento Cards
 */
export const BentoGrid = ({ children, className, ...props }: BentoGridProps) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[22rem] grid-cols-1 md:grid-cols-3 gap-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  description: string;
  /** Custom background or graphic element at the top or full span of the card */
  background?: React.ReactNode;
  /** Icon component/element to show in the header */
  Icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  /** Call to action text (displays a sleek hover arrow link at the bottom) */
  cta?: string;
  /** Link/action destination */
  href?: string;
  /** Tailwind column span class e.g., 'md:col-span-2' */
  colSpan?: string;
  /** Tailwind row span class e.g., 'md:row-span-2' */
  rowSpan?: string;
  /** Spotlight hover glow color */
  spotlightColor?: string;
}

/**
 * A premium Bento Card featuring an interactive mouse-following spotlight glow,
 * support for graphics backgrounds, adaptive layout, and elegant actions on hover.
 */
export const BentoCard = ({
  name,
  description,
  background,
  Icon,
  cta,
  href,
  colSpan,
  rowSpan,
  spotlightColor = "rgba(168, 85, 247, 0.15)", // Premium purple glow by default
  className,
  ...props
}: BentoCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty("--mouse-x", `${x}px`);
    el.style.setProperty("--mouse-y", `${y}px`);
  };

  const handleMouseEnter = () => {
    cardRef.current?.style.setProperty("--opacity", "1");
  };

  const handleMouseLeave = () => {
    cardRef.current?.style.setProperty("--opacity", "0");
  };

  const isIconComponent = Icon && typeof Icon !== 'string' && !React.isValidElement(Icon);
  const IconElement = isIconComponent ? (Icon as React.ComponentType<{ className?: string }>) : null;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-3xl",
        "bg-white border border-zinc-200 text-zinc-900 shadow-sm",
        "dark:bg-zinc-900/50 dark:border-white/10 dark:text-white dark:shadow-md",
        "transition-all duration-300 hover:shadow-xl hover:scale-[1.01]",
        colSpan,
        rowSpan,
        className
      )}
      {...props}
    >
      {/* Background visual asset */}
      <div className="absolute inset-0 z-0 h-full w-full opacity-60 dark:opacity-40 transition-transform duration-500 group-hover:scale-105">
        {background}
      </div>

      {/* Mouse pointer spotlight hover glow effect */}
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300 z-10"
        style={{
          opacity: "var(--opacity, 0)",
          background: `radial-gradient(350px circle at var(--mouse-x) var(--mouse-y), ${spotlightColor}, transparent 80%)`,
        }}
      />

      {/* Header Info (Icon + Text) */}
      <div className="relative z-20 flex flex-col gap-3 p-6 pointer-events-none">
        {Icon && (
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700 transition-all duration-300",
            "dark:bg-white/[0.05] dark:text-zinc-300 dark:group-hover:bg-purple-500/10 dark:group-hover:text-purple-400",
            "group-hover:bg-purple-100 group-hover:text-purple-600 group-hover:scale-110"
          )}>
            {IconElement ? <IconElement className="h-6 w-6" /> : (Icon as React.ReactNode)}
          </div>
        )}
        <h3 className="text-xl font-bold tracking-tight mt-2 text-zinc-900 dark:text-white">
          {name}
        </h3>
        <p className="max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      </div>

      {/* Bottom Footer Actions */}
      <div className="relative z-20 flex items-center justify-between p-6">
        {cta && (
          <a
            href={href || "#"}
            className={cn(
              "inline-flex items-center gap-1.5 text-sm font-semibold tracking-tight transition-all duration-300",
              "text-zinc-700 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            )}
          >
            {cta}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        )}
      </div>

      {/* Border glow border layer */}
      <div 
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300 z-30"
        style={{
          opacity: "var(--opacity, 0)",
          background: `radial-gradient(200px circle at var(--mouse-x) var(--mouse-y), rgba(168, 85, 247, 0.4), transparent 60%)`,
          maskImage: 'linear-gradient(#fff, #fff), linear-gradient(#fff, #fff)',
          maskClip: 'content-box, border-box',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          padding: '1px'
        }}
      />
    </div>
  );
};
