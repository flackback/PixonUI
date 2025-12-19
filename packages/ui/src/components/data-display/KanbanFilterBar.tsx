import React, { useState } from 'react';
import { Search, Filter, X, ChevronDown, Check } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Surface } from '../../primitives/Surface';
import { Button } from '../button/Button';
import { Badge } from '../../primitives/Badge';
import { Popover, PopoverTrigger, PopoverContent } from '../overlay/Popover';
import { Command, CommandInput, CommandList, CommandItem, CommandGroup } from '../overlay/Command';

export interface FilterOption {
  label: string;
  value: string;
}

export interface KanbanFilterBarProps {
  onSearchChange?: (query: string) => void;
  onFilterChange?: (filters: Record<string, string[]>) => void;
  priorityOptions?: FilterOption[];
  tagOptions?: FilterOption[];
  assigneeOptions?: FilterOption[];
  className?: string;
}

export function KanbanFilterBar({
  onSearchChange,
  onFilterChange,
  priorityOptions = [],
  tagOptions = [],
  assigneeOptions = [],
  className
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
  };

  const activeCount = Object.values(activeFilters).flat().length;

  return (
    <Surface className={cn("p-2 flex flex-wrap items-center gap-3", className)}>
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
        <input 
          type="text"
          placeholder="Search tasks..."
          className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-white/10 bg-white/5 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-white/20"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            onSearchChange?.(e.target.value);
          }}
        />
      </div>

      <div className="flex items-center gap-2">
        {/* Priority Filter */}
        <FilterPopover 
          label="Priority" 
          options={priorityOptions} 
          selected={activeFilters['priority'] || []}
          onSelect={(val) => toggleFilter('priority', val)}
        />

        {/* Tags Filter */}
        <FilterPopover 
          label="Tags" 
          options={tagOptions} 
          selected={activeFilters['tags'] || []}
          onSelect={(val) => toggleFilter('tags', val)}
        />

        {activeCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="h-9 px-3 text-xs text-white/40 hover:text-white gap-2"
          >
            <X className="h-3.5 w-3.5" /> Clear Filters
            <Badge variant="neutral" className="bg-white/10 border-white/10 ml-1">
              {activeCount}
            </Badge>
          </Button>
        )}
      </div>
    </Surface>
  );
}

function FilterPopover({ label, options, selected, onSelect }: { 
  label: string; 
  options: FilterOption[]; 
  selected: string[];
  onSelect: (val: string) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger 
        className={cn(
          "h-9 px-3 text-xs gap-2 border border-transparent hover:border-white/10 rounded-xl transition-all",
          selected.length > 0 ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" : "text-white/60"
        )}
      >
        <Filter className="h-3.5 w-3.5" />
        {label}
        {selected.length > 0 && (
          <Badge variant="info" className="h-4 min-w-[16px] px-1 bg-cyan-500 text-black border-none">
            {selected.length}
          </Badge>
        )}
        <ChevronDown className="h-3.5 w-3.5 opacity-40" />
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0 bg-[#1a1a1a] border-white/10 shadow-2xl">
        <Command>
          <CommandInput placeholder={`Search ${label}...`} />
          <CommandList>
            <CommandGroup>
              {options.map(opt => (
                <CommandItem 
                  key={opt.value} 
                  value={opt.value}
                  onSelect={() => onSelect(opt.value)}
                  className="flex items-center justify-between"
                >
                  <span>{opt.label}</span>
                  {selected.includes(opt.value) && <Check className="h-3.5 w-3.5 text-cyan-400" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
