import React, { useState, useMemo, useId } from 'react';
import { cn } from '../../utils/cn';
import { Star } from 'lucide-react';

export interface TestimonialProps {
  /** Author name */
  name: string;
  /** Author role / title */
  role?: string;
  /** Author avatar URL */
  avatar?: string;
  /** Testimonial text content */
  content: string;
  /** Star rating (1-5) */
  rating?: number;
  /** Company logo URL */
  companyLogo?: string;
}

export interface TestimonialCardProps extends TestimonialProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'content' | 'role'> {
  /** Visual variant */
  variant?: 'default' | 'glass' | 'gradient';
}

const variantStyles = {
  default: 'bg-white dark:bg-white/[0.02] border-gray-200 dark:border-white/[0.06]',
  glass: 'bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl border-white/20 dark:border-white/[0.08]',
  gradient: 'bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 dark:from-purple-500/10 dark:to-blue-500/10 border-purple-200/30 dark:border-purple-500/10',
};

/**
 * Testimonial card with avatar, rating, and company branding.
 *
 * @example
 * ```tsx
 * <TestimonialCard
 *   name="Sarah Chen"
 *   role="CTO at Acme"
 *   avatar="/avatars/sarah.jpg"
 *   content="This product transformed our workflow completely."
 *   rating={5}
 *   variant="glass"
 * />
 * ```
 */
export function TestimonialCard({
  name,
  role,
  avatar,
  content,
  rating,
  companyLogo,
  variant = 'default',
  className,
  ...props
}: TestimonialCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-2xl border p-6 transition-shadow duration-300 hover:shadow-lg dark:hover:shadow-purple-500/5',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {/* Rating */}
      {rating && (
        <div className="flex gap-0.5 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                'h-4 w-4',
                i < rating
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-zinc-200 dark:fill-zinc-700 text-zinc-200 dark:text-zinc-700'
              )}
            />
          ))}
        </div>
      )}

      {/* Quote */}
      <blockquote className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
        "{content}"
      </blockquote>

      {/* Author */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-white dark:ring-zinc-900"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
              {name.charAt(0)}
            </div>
          )}
          <div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-white">{name}</div>
            {role && <div className="text-xs text-zinc-500 dark:text-zinc-400">{role}</div>}
          </div>
        </div>

        {companyLogo && (
          <img
            src={companyLogo}
            alt=""
            className="h-6 opacity-40 dark:opacity-30 grayscale"
          />
        )}
      </div>
    </div>
  );
}

// ─── TestimonialGrid ────────────────────────────────────────────────────────

export interface TestimonialGridProps extends React.HTMLAttributes<HTMLDivElement> {
  testimonials: TestimonialProps[];
  /** Number of columns @default 3 */
  columns?: 2 | 3 | 4;
  /** Card variant */
  variant?: 'default' | 'glass' | 'gradient';
}

const colClasses: Record<number, string> = {
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
};

/**
 * Masonry-style testimonial grid layout.
 */
export function TestimonialGrid({
  testimonials,
  columns = 3,
  variant = 'default',
  className,
  ...props
}: TestimonialGridProps) {
  // Distribute testimonials into columns for masonry effect
  const columnData = useMemo(() => {
    const cols: TestimonialProps[][] = Array.from({ length: columns }, () => []);
    testimonials.forEach((t, i) => {
      const col = cols[i % columns];
      if (col) {
        col.push(t);
      }
    });
    return cols;
  }, [testimonials, columns]);

  return (
    <div
      className={cn('grid gap-4', colClasses[columns], className)}
      {...props}
    >
      {columnData.map((col, colIdx) => (
        <div key={colIdx} className="flex flex-col gap-4">
          {col.map((testimonial, i) => (
            <TestimonialCard
              key={`${colIdx}-${i}`}
              variant={variant}
              {...testimonial}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

TestimonialCard.displayName = 'TestimonialCard';
TestimonialGrid.displayName = 'TestimonialGrid';
