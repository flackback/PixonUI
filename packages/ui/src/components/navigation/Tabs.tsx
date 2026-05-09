import React, { createContext, useContext, useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { cn } from '../../utils/cn';

// ─── Context ────────────────────────────────────────────────────────────────

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
  variant: TabsVariant;
  registerTrigger: (value: string, el: HTMLButtonElement | null) => void;
  triggerRects: Map<string, DOMRect>;
  listRef: React.RefObject<HTMLDivElement | null>;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

// ─── Types ──────────────────────────────────────────────────────────────────

export type TabsVariant = 'pills' | 'underline' | 'segmented';

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  /** Visual variant @default 'pills' */
  variant?: TabsVariant;
  children: React.ReactNode;
}

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: React.ReactNode;
  /** Icon displayed before label */
  icon?: React.ReactNode;
  /** Badge/count displayed after label */
  badge?: React.ReactNode;
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
  /** Keep content mounted but hidden when inactive */
  forceMount?: boolean;
}

// ─── Tabs Root ──────────────────────────────────────────────────────────────

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  variant = 'pills',
  className,
  children,
  ...props
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [triggerRects, setTriggerRects] = useState<Map<string, DOMRect>>(new Map());
  const listRef = useRef<HTMLDivElement | null>(null);

  const handleValueChange = useCallback((newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  }, [value, onValueChange]);

  const registerTrigger = useCallback((val: string, el: HTMLButtonElement | null) => {
    if (!el) return;
    setTriggerRects(prev => {
      const next = new Map(prev);
      next.set(val, el.getBoundingClientRect());
      return next;
    });
  }, []);

  const currentValue = value !== undefined ? value : internalValue;

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange, variant, registerTrigger, triggerRects, listRef }}>
      <div className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

// ─── TabsList ───────────────────────────────────────────────────────────────

const listVariantStyles: Record<TabsVariant, string> = {
  pills: 'inline-flex h-10 items-center justify-center rounded-2xl bg-gray-100 p-1 text-gray-500 dark:bg-white/[0.03] dark:text-white/60',
  underline: 'inline-flex items-center border-b border-gray-200 dark:border-white/10 gap-0',
  segmented: 'inline-flex h-10 items-center rounded-xl bg-gray-100 p-1 dark:bg-white/[0.04] gap-0.5',
};

export function TabsList({ className, children, ...props }: TabsListProps) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabsList must be used within Tabs');

  const listRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});

  // Sliding indicator for underline variant
  useEffect(() => {
    if (ctx.variant !== 'underline' || !listRef.current) return;

    const activeButton = listRef.current.querySelector<HTMLButtonElement>('[aria-selected="true"]');
    if (!activeButton) return;

    const listRect = listRef.current.getBoundingClientRect();
    const btnRect = activeButton.getBoundingClientRect();

    setIndicatorStyle({
      width: `${btnRect.width}px`,
      transform: `translateX(${btnRect.left - listRect.left}px)`,
      transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
    });
  }, [ctx.value, ctx.variant]);

  // Assign list ref to context for trigger registration
  useEffect(() => {
    (ctx.listRef as React.MutableRefObject<HTMLDivElement | null>).current = listRef.current;
  }, [ctx.listRef]);

  return (
    <div
      ref={listRef}
      role="tablist"
      className={cn(
        'relative',
        listVariantStyles[ctx.variant],
        className
      )}
      {...props}
    >
      {children}

      {/* Sliding underline indicator */}
      {ctx.variant === 'underline' && (
        <div
          className="absolute bottom-0 left-0 h-0.5 rounded-full bg-zinc-900 dark:bg-white"
          style={indicatorStyle}
        />
      )}
    </div>
  );
}

// ─── TabsTrigger ────────────────────────────────────────────────────────────

const triggerVariantStyles: Record<TabsVariant, { base: string; active: string; inactive: string }> = {
  pills: {
    base: 'inline-flex items-center justify-center whitespace-nowrap rounded-xl px-3 py-1.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/20 disabled:pointer-events-none disabled:opacity-50',
    active: 'bg-white text-gray-900 shadow-sm dark:bg-white/[0.06] dark:text-white',
    inactive: 'hover:bg-gray-200/50 hover:text-gray-900 dark:hover:bg-white/[0.03] dark:hover:text-white',
  },
  underline: {
    base: 'inline-flex items-center justify-center whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 border-transparent -mb-[1px] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
    active: 'text-zinc-900 dark:text-white border-transparent',
    inactive: 'text-zinc-500 dark:text-white/50 hover:text-zinc-700 dark:hover:text-white/70',
  },
  segmented: {
    base: 'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
    active: 'bg-white dark:bg-white/[0.08] text-zinc-900 dark:text-white shadow-sm',
    inactive: 'text-zinc-500 dark:text-white/50 hover:text-zinc-700 dark:hover:text-white/70',
  },
};

export function TabsTrigger({ className, value, children, icon, badge, ...props }: TabsTriggerProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');

  const isActive = context.value === value;
  const btnRef = useRef<HTMLButtonElement>(null);
  const vs = triggerVariantStyles[context.variant];

  // Register on mount & value change for indicator
  useEffect(() => {
    context.registerTrigger(value, btnRef.current);
  }, [value, context.registerTrigger]);

  return (
    <button
      ref={btnRef}
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabs-content-${value}`}
      id={`tabs-trigger-${value}`}
      onClick={() => context.onValueChange(value)}
      className={cn(
        vs.base,
        isActive ? vs.active : vs.inactive,
        className
      )}
      {...props}
    >
      {icon && <span className={cn('shrink-0', children ? 'mr-1.5' : '')}>{icon}</span>}
      {children}
      {badge && <span className="ml-1.5 shrink-0">{badge}</span>}
    </button>
  );
}

// ─── TabsContent ────────────────────────────────────────────────────────────

export function TabsContent({ className, value, children, forceMount = false, ...props }: TabsContentProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');

  const isActive = context.value === value;

  if (!isActive && !forceMount) return null;

  return (
    <div
      role="tabpanel"
      id={`tabs-content-${value}`}
      aria-labelledby={`tabs-trigger-${value}`}
      tabIndex={0}
      className={cn(
        'mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/20',
        forceMount && !isActive && 'hidden',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
