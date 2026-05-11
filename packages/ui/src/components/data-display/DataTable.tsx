import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './Table';
import { TextInput } from '../form/TextInput';
import { cn } from '../../utils/cn';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  onRowClick?: (item: T) => void;
  className?: string;
  maxHeight?: number;
  rounded?: boolean;
  rtl?: boolean;
  locale?: 'en' | 'pt';
  translations?: {
    noResults?: string;
    searchPlaceholder?: string;
  };
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  searchPlaceholder,
  searchKeys,
  onRowClick,
  className,
  maxHeight,
  rounded = true,
  rtl,
  locale = 'en',
  translations
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof T | string; direction: 'asc' | 'desc' | null }>({
    key: '',
    direction: null
  });

  // Automatically determine if document is in RTL mode
  const isRtl = rtl ?? (typeof document !== 'undefined' ? document.documentElement.dir === 'rtl' : false);

  const activePlaceholder = translations?.searchPlaceholder || searchPlaceholder || (locale === 'pt' ? "Pesquisar..." : "Search...");
  const activeNoResults = translations?.noResults || (locale === 'pt' ? "Nenhum resultado encontrado para" : "No results found for");

  // Optimized search and sort logic with useMemo
  const processedData = useMemo(() => {
    let filtered = [...data];

    // Search
    if (search && searchKeys) {
      filtered = filtered.filter(item =>
        searchKeys.some(key => 
          String(item[key] ?? '').toLowerCase().includes(search.toLowerCase())
        )
      );
    }

    // Sort
    if (sortConfig.key && sortConfig.direction) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof T];
        const bValue = b[sortConfig.key as keyof T];
        
        if (aValue === undefined || aValue === null || bValue === undefined || bValue === null) return 0;
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, search, searchKeys, sortConfig]);

  const handleSort = (key: keyof T | string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div className={cn("space-y-4", className)} dir={isRtl ? "rtl" : "ltr"}>
      {searchKeys && (
        <div className={cn("relative max-w-sm", isRtl ? "mr-0 ml-auto" : "ml-0 mr-auto")}>
          <TextInput
            placeholder={activePlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-white/40" />}
          />
        </div>
      )}

      <Table rounded={rounded} maxHeight={maxHeight}>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead 
                key={String(col.key)} 
                className={cn(col.sortable && "cursor-pointer select-none hover:text-cyan-500 transition-colors", col.className)}
                onClick={() => col.sortable && handleSort(col.key)}
                sortDirection={sortConfig.key === col.key ? sortConfig.direction : null}
                sortable={col.sortable}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {processedData.map((item, idx) => (
            <TableRow 
              key={idx} 
              onClick={() => onRowClick?.(item)}
              className={cn(onRowClick && "cursor-pointer hover:bg-white/[0.03] transition-colors group")}
            >
              {columns.map((col) => (
                <TableCell key={String(col.key)} className={col.className}>
                  {col.render ? col.render(item) : (item[col.key as keyof T] as React.ReactNode)}
                </TableCell>
              ))}
            </TableRow>
          ))}
          {processedData.length === 0 && (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-32 text-center text-white/40">
                {activeNoResults} "{search}"
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
