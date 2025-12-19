import React from 'react';
import { cn } from '../../utils/cn';
import { ScrollArea } from './ScrollArea';

const TableContext = React.createContext<{}>({});

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  wrapperClassName?: string;
  rounded?: boolean;
  maxHeight?: string | number;
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, wrapperClassName, rounded = false, maxHeight, ...props }, ref) => (
    <ScrollArea 
      className={cn("w-full", rounded && "rounded-2xl border border-white/10", wrapperClassName)}
      style={{ maxHeight }}
      orientation={maxHeight ? "both" : "horizontal"}
      scrollbarSize="sm"
    >
      <table
        ref={ref}
        className={cn('w-full caption-bottom text-sm text-left', className)}
        {...props}
      />
    </ScrollArea>
  )
);
Table.displayName = 'Table';

export const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn('bg-white/[0.02] text-white/55', className)} {...props} />
  )
);
TableHeader.displayName = 'TableHeader';

export const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
  )
);
TableBody.displayName = 'TableBody';

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  hoverable?: boolean;
}

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, hoverable = true, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'border-t border-white/10 transition-colors data-[state=selected]:bg-white/[0.04]',
        hoverable && 'hover:bg-white/[0.02]',
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = 'TableRow';

export const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'h-10 px-5 py-3 text-left align-middle font-semibold text-white/55 [&:has([role=checkbox])]:pr-0 whitespace-nowrap',
        className
      )}
      {...props}
    />
  )
);
TableHead.displayName = 'TableHead';

export const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn('p-5 align-middle [&:has([role=checkbox])]:pr-0 text-white/85 whitespace-nowrap', className)}
      {...props}
    />
  )
);
TableCell.displayName = 'TableCell';
