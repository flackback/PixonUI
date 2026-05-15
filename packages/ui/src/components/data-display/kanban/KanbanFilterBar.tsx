import React, { useState } from 'react';
import { Search, Filter, X, ChevronDown, Check, SortAsc } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { Surface } from '../../../primitives/Surface';
import { Button } from '../../button/Button';
import { Badge } from '../../../primitives/Badge';
import { Popover, PopoverTrigger, PopoverContent } from '../../overlay/Popover';
import { Command, CommandInput, CommandList, CommandItem, CommandGroup } from '../../overlay/Command';
import type { FilterOption, SavedFilter } from './types';

export interface KanbanFilterBarProps {
  onSearchChange?: (query: string) => void;
  onFilterChange?: (filters: Record<string, string[]>) => void;
  onSortChange?: (sortBy: string, order: 'asc' | 'desc') => void;
  onViewChange?: (view: string) => void;
  onGroupChange?: (groupBy: string) => void;
  priorityOptions?: FilterOption[];
  tagOptions?: FilterOption[];
  assigneeOptions?: FilterOption[];
  viewOptions?: ('board' | 'list' | 'calendar' | 'timeline')[];
  sortOptions?: FilterOption[];
  groupOptions?: FilterOption[];
  savedFilters?: SavedFilter[];
  onSaveFilter?: (filter: SavedFilter) => void;
  className?: string;
  locale?: 'en' | 'pt';
  translations?: Record<string, string>;
}

export function KanbanFilterBar({
  onSearchChange,
  onFilterChange,
  onSortChange,
  onViewChange,
  onGroupChange,
  priorityOptions = [],
  tagOptions = [],
  assigneeOptions = [],
  viewOptions = ['board', 'list', 'calendar', 'timeline'],
  sortOptions = [],
  groupOptions = [],
  savedFilters = [],
  onSaveFilter,
  className,
  locale = 'en',
  translations
}: KanbanFilterBarProps) {
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

  const toggleFilter = (category: string, value: string) => {
    const current = activeFilters[category] || [];
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    
    const newFilters = { ...activeFilters, [category]: next };
    if (next.length === 0) delete newFilters[category];
    
    setActiveFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearFilters = () => {
    setActiveFilters({});
    onFilterChange?.({});
    setSearch('');
    onSearchChange?.('');
  };

  const activeCount = Object.values(activeFilters).flat().length;

  return (
    <Surface className={cn("p-2 flex flex-wrap items-center gap-3 bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-none", className)}>
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-white/20" />
        <input 
          type="text"
          placeholder={translations?.searchPlaceholder || (locale === 'pt' ? 'Pesquisar tarefas...' : 'Search tasks...')}
          className="w-full pl-10 pr-4 py-2 text-sm rounded-2xl border border-zinc-250 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] focus:outline-none focus:ring-2 focus:ring-cyan-550/50 dark:focus:ring-cyan-500/50 transition-all placeholder:text-zinc-400 dark:placeholder:text-white/20 text-zinc-900 dark:text-white font-medium"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            onSearchChange?.(e.target.value);
          }}
        />
      </div>

      <div className="flex items-center gap-2">
        <FilterPopover 
          label={translations?.priority || (locale === 'pt' ? 'Prioridade' : 'Priority')} 
          options={priorityOptions} 
          selected={activeFilters['priority'] || []}
          onSelect={(val) => toggleFilter('priority', val)}
          locale={locale}
          translations={translations}
        />

        <FilterPopover 
          label={translations?.tags || (locale === 'pt' ? 'Tags' : 'Tags')} 
          options={tagOptions} 
          selected={activeFilters['tags'] || []}
          onSelect={(val) => toggleFilter('tags', val)}
          locale={locale}
          translations={translations}
        />

        <FilterPopover 
          label={translations?.assignee || (locale === 'pt' ? 'Responsável' : 'Assignee')} 
          options={assigneeOptions} 
          selected={activeFilters['assignee'] || []}
          onSelect={(val) => toggleFilter('assignee', val)}
          locale={locale}
          translations={translations}
        />

        <div className="w-px h-4 bg-zinc-200 dark:bg-white/10 mx-1" />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 gap-2 text-zinc-600 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5">
              <SortAsc className="h-4 w-4" />
              {translations?.sort || (locale === 'pt' ? 'Ordenar' : 'Sort')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-2xl rounded-2xl">
            {sortOptions.map(opt => (
              <button
                key={opt.value}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-600 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg text-left transition-colors font-medium"
                onClick={() => onSortChange?.(opt.value, 'asc')}
              >
                {opt.label}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        {activeCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="h-9 px-3 text-xs text-zinc-500 hover:text-zinc-900 dark:text-white/40 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 gap-2 transition-all"
          >
            <X className="h-3.5 w-3.5" /> {translations?.clear || (locale === 'pt' ? 'Limpar' : 'Clear')}
            <Badge variant="neutral" className="bg-zinc-200 dark:bg-white/[0.06] border-zinc-300 dark:border-white/10 ml-1 text-zinc-700 dark:text-white/80">
              {activeCount}
            </Badge>
          </Button>
        )}
      </div>
    </Surface>
  );
}

function FilterPopover({ label, options, selected, onSelect, locale, translations }: { 
  label: string, 
  options: FilterOption[], 
  selected: string[],
  onSelect: (val: string) => void,
  locale: 'en' | 'pt',
  translations?: Record<string, string>
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "h-9 gap-2 text-xs transition-all font-semibold",
            selected.length > 0 
              ? "bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" 
              : "text-zinc-600 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5"
          )}
        >
          {label}
          {selected.length > 0 ? (
            <Badge variant="info" className="h-4 min-w-[16px] px-1 bg-blue-500 text-white border-none text-[10px] flex items-center justify-center font-bold">
              {selected.length}
            </Badge>
          ) : (
            <ChevronDown className="h-3.5 w-3.5 opacity-40" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-2xl rounded-2xl overflow-hidden">
        <Command>
          <CommandInput placeholder={translations?.searchPopover || (locale === 'pt' ? `Pesquisar ${label.toLowerCase()}...` : `Search ${label.toLowerCase()}...`)} className="border-none bg-transparent" />
          <CommandList className="max-h-[240px]">
            <CommandGroup className="p-1">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onClick={() => onSelect(option.value)}
                  className="flex items-center justify-between py-2 px-3 cursor-pointer rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
                >
                  <span className="text-xs text-zinc-800 dark:text-white/80 font-medium">{option.label}</span>
                  {selected.includes(option.value) && (
                    <Check className="h-3.5 w-3.5 text-cyan-600 dark:text-blue-500" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
