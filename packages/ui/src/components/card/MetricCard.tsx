import React, { useRef } from 'react';
import { cn } from '../../utils/cn';

// Internal components for MetricCard
function TokenBadge({
  accent = 'teal',
  children,
}: {
  accent?: 'teal' | 'amber' | 'violet' | 'blue' | 'rose' | 'emerald' | 'indigo';
  children: React.ReactNode;
}) {
  const map: Record<string, string> = {
    teal: 'bg-teal-500/90',
    amber: 'bg-amber-400/95',
    violet: 'bg-violet-500/90',
    blue: 'bg-blue-500/90',
    rose: 'bg-rose-500/90',
    emerald: 'bg-emerald-500/90',
    indigo: 'bg-indigo-500/90',
  };

  return (
    <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl', map[accent] ?? map.teal)}>
      {children}
    </div>
  );
}

function AccentGlow({ accent = 'teal' }: { accent?: 'teal' | 'amber' | 'violet' | 'blue' | 'rose' | 'emerald' | 'indigo' }) {
  const map: Record<string, string> = {
    teal: 'from-teal-400/25 via-teal-400/10 to-transparent',
    amber: 'from-amber-300/25 via-amber-300/10 to-transparent',
    violet: 'from-violet-400/25 via-violet-400/10 to-transparent',
    blue: 'from-blue-400/25 via-blue-400/10 to-transparent',
    rose: 'from-rose-400/25 via-rose-400/10 to-transparent',
    emerald: 'from-emerald-400/25 via-emerald-400/10 to-transparent',
    indigo: 'from-indigo-400/25 via-indigo-400/10 to-transparent',
  };

  return (
    <div
      className={cn(
        'pointer-events-none absolute -right-12 top-1/2 h-40 w-48 -translate-y-1/2 rotate-12',
        'bg-gradient-to-l blur-2xl',
        map[accent] ?? map.teal
      )}
    />
  );
}

function SparkWave({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg
      viewBox="0 0 120 40"
      className="h-6 w-16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M2 22c10 0 10-10 20-10s10 10 20 10 10-10 20-10 10 10 20 10 10-10 20-10"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.95"
      />
    </svg>
  );
}

export interface MetricCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  accent?: 'teal' | 'amber' | 'violet' | 'blue' | 'rose' | 'emerald' | 'indigo';
  icon: React.ReactNode;
  title?: React.ReactNode;
  value: React.ReactNode;
  subtext?: React.ReactNode;
  showWave?: boolean;
  onClick?: () => void;
}

export const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ accent = 'teal', icon, title, value, subtext, showWave = false, onClick, className, ...props }, ref) => {
    const localRef = useRef<HTMLDivElement | null>(null);

    const setCenter = () => {
      const el = localRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--x', `${Math.round(r.width / 2)}px`);
      el.style.setProperty('--y', `${Math.round(r.height / 2)}px`);
    };

    const handleMove = (e: React.MouseEvent) => {
      const el = localRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--x', `${e.clientX - r.left}px`);
      el.style.setProperty('--y', `${e.clientY - r.top}px`);
    };

    const waveColors: Record<string, string> = {
      teal: 'rgba(45,212,191,.95)',
      amber: 'rgba(251,191,36,.95)',
      violet: 'rgba(167,139,250,.95)',
      blue: 'rgba(96,165,250,.95)',
      rose: 'rgba(251,113,133,.95)',
      emerald: 'rgba(52,211,153,.95)',
      indigo: 'rgba(129,140,248,.95)',
    };

    const waveColor = waveColors[accent] ?? waveColors.teal;

    return (
      <div
        ref={(node) => {
            localRef.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        onMouseEnter={setCenter}
        onMouseMove={handleMove}
        onClick={onClick}
        className={cn(
          'group relative overflow-hidden rounded-2xl',
          'bg-white border border-gray-200 shadow-sm',
          'dark:bg-transparent dark:bg-gradient-to-b dark:from-white/[0.06] dark:to-white/[0.03]',
          'dark:border-white/[0.10]',
          'dark:shadow-[0_18px_55px_rgba(0,0,0,.55)]',
          'transition-transform duration-300 hover:scale-[1.015]',
          onClick && 'cursor-pointer',
          className
        )}
        {...props}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(180px at var(--x, 50%) var(--y, 50%), rgba(255,255,255,.16), transparent 60%)',
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(220px_140px_at_18%_18%,rgba(255,255,255,.08),transparent_60%)]" />
        <AccentGlow accent={accent} />

        <div className="relative p-5">
          <div className="flex items-start justify-between gap-4">
            <TokenBadge accent={accent}>{icon}</TokenBadge>
            {title && (
              <div className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-white/40">
                {title}
              </div>
            )}
          </div>

          <div className="mt-4 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <div className="truncate text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">{value}</div>
              {subtext ? <div className="mt-1 text-sm text-gray-500 dark:text-white/45">{subtext}</div> : null}
            </div>
            {showWave ? <SparkWave color={waveColor} /> : null}
          </div>
        </div>
      </div>
    );
  }
);

MetricCard.displayName = 'MetricCard';