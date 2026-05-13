import React from 'react';
import { cn } from '../../utils/cn';
import { Sparkles, MessageSquare, Code, Lightbulb, ArrowUpRight } from 'lucide-react';

export interface SuggestionItem {
  id: string;
  label: string;
  prompt: string;
  icon?: 'prompt' | 'code' | 'idea' | 'sparkle';
}

export interface AISuggestionsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** Array of suggestions to render */
  suggestions: SuggestionItem[];
  /** Callback fired when a suggestion is clicked */
  onSelect: (prompt: string) => void;
}

const iconMap = {
  prompt: MessageSquare,
  code: Code,
  idea: Lightbulb,
  sparkle: Sparkles
};

/**
 * A beautiful grid of micro-animated suggestions for prompting models.
 * Features glowing hover overlays and sleek responsive card bounds.
 */
export const AISuggestions = React.forwardRef<HTMLDivElement, AISuggestionsProps>(
  ({ suggestions, onSelect, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("grid grid-cols-1 sm:grid-cols-2 gap-3 w-full", className)}
        {...props}
      >
        {suggestions.map((item) => {
          const Icon = item.icon ? iconMap[item.icon] : Sparkles;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.prompt)}
              className={cn(
                "group relative flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all duration-300",
                "border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-50/10 hover:shadow-md hover:-translate-y-0.5",
                "dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-purple-500/20 dark:hover:bg-purple-950/5"
              )}
            >
              {/* Left icon badge */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500 group-hover:bg-purple-100 group-hover:text-purple-600 dark:bg-white/5 dark:text-zinc-400 dark:group-hover:bg-purple-950/40 dark:group-hover:text-purple-400 transition-all">
                <Icon className="h-4 w-4" />
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0 pr-4 flex flex-col gap-0.5">
                <span className="text-xs font-bold text-gray-800 dark:text-zinc-200 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
                  {item.label}
                </span>
                <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-light line-clamp-2">
                  {item.prompt}
                </span>
              </div>

              {/* Top-right subtle hover arrow */}
              <ArrowUpRight className="absolute right-3.5 top-3.5 h-3.5 w-3.5 text-gray-300 opacity-0 group-hover:opacity-100 group-hover:text-purple-500 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          );
        })}
      </div>
    );
  }
);

AISuggestions.displayName = 'AISuggestions';
