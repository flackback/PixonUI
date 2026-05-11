import React from 'react';
import { cn } from '../../utils/cn';
import { ScrollArea } from './ScrollArea';

// ─── Table ──────────────────────────────────────────────────────────────────

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  wrapperClassName?: string;
  rounded?: boolean;
  maxHeight?: string | number;
  /** Alternating row colors */
  striped?: boolean;
  /** Compact row height */
  compact?: boolean;
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, wrapperClassName, rounded = false, maxHeight, striped = false, compact = false, ...props }, ref) => (
    <ScrollArea
      className={cn('w-full', rounded && 'rounded-2xl border border-gray-200 dark:border-white/10', wrapperClassName)}
      style={{ maxHeight }}
      orientation={maxHeight ? 'both' : 'horizontal'}
      scrollbarSize="sm"
    >
      <table
        ref={ref}
        className={cn(
          'w-full caption-bottom text-sm text-start',
          striped && '[&_tbody_tr:nth-child(even)]:bg-gray-50/50 dark:[&_tbody_tr:nth-child(even)]:bg-white/[0.015]',
          compact && '[&_th]:py-2 [&_th]:px-3 [&_td]:py-2 [&_td]:px-3',
          className
        )}
        {...props}
      />
    </ScrollArea>
  )
);
Table.displayName = 'Table';

// ─── TableHeader ────────────────────────────────────────────────────────────

export const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn(
        'bg-gray-50 dark:bg-white/[0.02] text-gray-500 dark:text-white/55 [&_tr]:border-b [&_tr]:border-gray-200 dark:[&_tr]:border-white/10',
        className
      )}
      {...props}
    />
  )
);
TableHeader.displayName = 'TableHeader';

// ─── TableBody ──────────────────────────────────────────────────────────────

export const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
  )
);
TableBody.displayName = 'TableBody';

// ─── TableFooter ────────────────────────────────────────────────────────────

export const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={cn(
        'border-t border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.01] font-medium text-gray-700 dark:text-white/70',
        className
      )}
      {...props}
    />
  )
);
TableFooter.displayName = 'TableFooter';

// ─── TableCaption ───────────────────────────────────────────────────────────

export const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => (
    <caption
      ref={ref}
      className={cn('mt-3 text-xs text-gray-500 dark:text-white/40', className)}
      {...props}
    />
  )
);
TableCaption.displayName = 'TableCaption';

// ─── TableRow ───────────────────────────────────────────────────────────────

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  hoverable?: boolean;
  optimized?: boolean;
  selected?: boolean;
}

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, hoverable = true, optimized = false, selected = false, ...props }, ref) => (
    <tr
      ref={ref}
      data-state={selected ? 'selected' : undefined}
      className={cn(
        'border-t border-gray-200 dark:border-white/10 transition-colors',
        hoverable && 'hover:bg-gray-50/80 dark:hover:bg-white/[0.02]',
        selected && 'bg-purple-50/50 dark:bg-purple-500/5',
        className
      )}
      style={optimized ? {
        contentVisibility: 'auto',
        containIntrinsicSize: '0 56px',
      } : undefined}
      {...props}
    />
  )
);
TableRow.displayName = 'TableRow';

// ─── TableHead ──────────────────────────────────────────────────────────────

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  /** Show sort indicator */
  sortable?: boolean;
  /** Current sort direction */
  sortDirection?: 'asc' | 'desc' | null;
  /** Click handler for sort */
  onSort?: () => void;
}

export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, sortable, sortDirection, onSort, children, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'h-10 px-5 py-3 text-start align-middle font-semibold text-gray-500 dark:text-white/55 [&:has([role=checkbox])]:pr-0 whitespace-nowrap text-xs uppercase tracking-wider',
        sortable && 'cursor-pointer select-none hover:text-gray-700 dark:hover:text-white/80 transition-colors',
        className
      )}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <span className={cn(sortable && 'inline-flex items-center gap-1.5')}>
        {children}
        {sortable && (
          <span className="inline-flex flex-col text-[8px] leading-none">
            <span className={cn(sortDirection === 'asc' ? 'text-zinc-900 dark:text-white' : 'text-gray-300 dark:text-white/20')}>▲</span>
            <span className={cn(sortDirection === 'desc' ? 'text-zinc-900 dark:text-white' : 'text-gray-300 dark:text-white/20')}>▼</span>
          </span>
        )}
      </span>
    </th>
  )
);
TableHead.displayName = 'TableHead';

// ─── TableCell ──────────────────────────────────────────────────────────────

export const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn('p-5 align-middle [&:has([role=checkbox])]:pr-0 text-gray-700 dark:text-white/85 whitespace-nowrap', className)}
      {...props}
    />
  )
);
TableCell.displayName = 'TableCell';
