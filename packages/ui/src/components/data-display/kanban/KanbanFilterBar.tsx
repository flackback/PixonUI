import React, { useState } from 'react';
import { Search, Filter, X, ChevronDown, Check, SortAsc, Layout, List, Calendar, Clock } from 'lucide-react';
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
  className
}: KanbanFilterBarProps) {
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [currentView, setCurrentView] = useState('board');

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
    <Surface className={cn("p-2 flex flex-wrap items-center gap-3 bg-white/[0.02] border-white/5", className)}>
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
        <input 
          type="text"
          placeholder="Search tasks..."
          className="w-full pl-10 pr-4 py-2 text-sm rounded-2xl border border-white/10 bg-white/[0.03] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-white/20 text-white"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            onSearchChange?.(e.target.value);
          }}
        />
      </div>

      <div className="flex items-center gap-2">
        <FilterPopover 
          label="Priority" 
          options={priorityOptions} 
          selected={activeFilters['priority'] || []}
          onSelect={(val) => toggleFilter('priority', val)}
        />

        <FilterPopover 
          label="Tags" 
          options={tagOptions} 
          selected={activeFilters['tags'] || []}
          onSelect={(val) => toggleFilter('tags', val)}
        />

        <FilterPopover 
          label="Assignee" 
          options={assigneeOptions} 
          selected={activeFilters['assignee'] || []}
          onSelect={(val) => toggleFilter('assignee', val)}
        />

        <div className="w-px h-4 bg-white/10 mx-1" />

        <Popover>
          <PopoverTrigger>
            <Button variant="ghost" size="sm" className="h-9 gap-2 text-white/60">
              <SortAsc className="h-4 w-4" />
              Sort
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-1 bg-gray-900 border-white/10">
            {sortOptions.map(opt => (
              <button
                key={opt.value}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded-lg text-left"
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
            className="h-9 px-3 text-xs text-white/40 hover:text-white gap-2"
          >
            <X className="h-3.5 w-3.5" /> Clear
            <Badge variant="neutral" className="bg-white/[0.06] border-white/10 ml-1">
              {activeCount}
            </Badge>
          </Button>
        )}
      </div>
    </Surface>
  );
}

function FilterPopover({ label, options, selected, onSelect }: { 
  label: string, 
  options: FilterOption[], 
  selected: string[],
  onSelect: (val: string) => void 
}) {
  return (
    <Popover>
      <PopoverTrigger>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "h-9 gap-2 text-xs transition-all",
            selected.length > 0 ? "bg-blue-500/10 text-blue-400" : "text-white/60 hover:text-white"
          )}
        >
          {label}
          {selected.length > 0 ? (
            <Badge variant="info" className="h-4 min-w-[16px] px-1 bg-blue-500 text-white border-none">
              {selected.length}
            </Badge>
          ) : (
            <ChevronDown className="h-3.5 w-3.5 opacity-40" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0 bg-gray-900 border-white/10 shadow-2xl">
        <Command>
          <CommandInput placeholder={`Search ${label.toLowerCase()}...`} className="border-none" />
          <CommandList className="max-h-[240px]">
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onClick={() => onSelect(option.value)}
                  className="flex items-center justify-between py-2 px-3 cursor-pointer hover:bg-white/5"
                >
                  <span className="text-xs text-white/80">{option.label}</span>
                  {selected.includes(option.value) && (
                    <Check className="h-3.5 w-3.5 text-blue-500" />
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
