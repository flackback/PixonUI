import React from 'react';
import { cn } from '../../../utils/cn';
import { Layout, List, Calendar, Clock, Filter, SortAsc, MoreHorizontal, Plus, Undo2, Redo2 } from 'lucide-react';
import { Button } from '../../button/Button';

interface KanbanHeaderProps {
  title: string;
  view?: string;
  onViewChange?: (view: string) => void;
  onFilter?: () => void;
  onSort?: () => void;
  onAddColumn?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  className?: string;
  locale?: 'en' | 'pt';
  translations?: Record<string, string>;
}

export function KanbanHeader({ 
  title, 
  view = 'board', 
  onViewChange, 
  onFilter, 
  onSort, 
  onAddColumn,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  className,
  locale = 'en',
  translations
}: KanbanHeaderProps) {
  const views = [
    { id: 'board', icon: Layout, label: translations?.board || (locale === 'pt' ? 'Quadro' : 'Board') },
    { id: 'list', icon: List, label: translations?.list || (locale === 'pt' ? 'Lista' : 'List') },
    { id: 'calendar', icon: Calendar, label: translations?.calendar || (locale === 'pt' ? 'Calendário' : 'Calendar') },
    { id: 'timeline', icon: Clock, label: translations?.timeline || (locale === 'pt' ? 'Linha do Tempo' : 'Timeline') },
  ];

  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">{title}</h1>
        
        <div className="flex items-center bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl p-1 w-fit">
          {views.map((v) => (
            <button
              key={v.id}
              onClick={() => onViewChange?.(v.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                view === v.id 
                  ? "bg-white dark:bg-white/10 text-cyan-600 dark:text-white shadow-sm dark:shadow-lg" 
                  : "text-zinc-500 hover:text-zinc-900 dark:text-white/40 dark:hover:text-white"
              )}
            >
              <v.icon className="h-3.5 w-3.5" />
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 mr-2 rtl:mr-0 rtl:ml-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onUndo} 
            disabled={!canUndo}
            className="h-8 w-8 text-zinc-400 dark:text-white/40 disabled:opacity-20 hover:bg-zinc-100 dark:hover:bg-white/5"
          >
            <Undo2 className="h-4 w-4 rtl:rotate-180" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onRedo} 
            disabled={!canRedo}
            className="h-8 w-8 text-zinc-400 dark:text-white/40 disabled:opacity-20 hover:bg-zinc-100 dark:hover:bg-white/5"
          >
            <Redo2 className="h-4 w-4 rtl:rotate-180" />
          </Button>
        </div>

        <Button variant="ghost" size="sm" onClick={onFilter} className="gap-2 text-zinc-600 dark:text-white/60 hover:bg-zinc-100 dark:hover:bg-white/5">
          <Filter className="h-4 w-4" />
          {translations?.filter || (locale === 'pt' ? 'Filtrar' : 'Filter')}
        </Button>
        <Button variant="ghost" size="sm" onClick={onSort} className="gap-2 text-zinc-600 dark:text-white/60 hover:bg-zinc-100 dark:hover:bg-white/5">
          <SortAsc className="h-4 w-4" />
          {translations?.sort || (locale === 'pt' ? 'Ordenar' : 'Sort')}
        </Button>
        <div className="w-px h-4 bg-zinc-200 dark:bg-white/10 mx-2" />
        <Button size="sm" onClick={onAddColumn} className="gap-2 bg-cyan-500 hover:bg-cyan-400 text-black border-none">
          <Plus className="h-4 w-4" />
          {translations?.addColumn || (locale === 'pt' ? 'Add Coluna' : 'Add Column')}
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 dark:text-white/40 hover:bg-zinc-100 dark:hover:bg-white/5">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
