import React from 'react';
import { cn } from '../../utils/cn';
import { Sparkles, Send } from 'lucide-react';
import { Animate } from '../../primitives/Animate';

interface SmartReplySuggestionsProps {
  replies: string[];
  onSelect: (reply: string) => void;
  isLoading?: boolean;
}

export function SmartReplySuggestions({ replies, onSelect, isLoading }: SmartReplySuggestionsProps) {
  if (isLoading) {
    return (
      <div className="flex gap-2 p-2 px-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 w-32 bg-zinc-100 dark:bg-white/5 rounded-full border border-zinc-200/50 dark:border-white/5" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2 p-2 px-4 overflow-x-auto no-scrollbar scroll-smooth">
      <div className="flex items-center shrink-0 pr-2 border-r border-zinc-200 dark:border-white/10 mr-1">
        <Sparkles size={14} className="text-purple-600 dark:text-purple-400 mr-2" />
        <span className="text-[10px] font-bold text-purple-600/60 dark:text-purple-400/50 uppercase tracking-widest select-none">IA Sugere</span>
      </div>
      
      {replies.map((reply, index) => (
        <Animate
          key={index}
          preset="fade-up"
          delay={index * 100}
        >
          <button
            onClick={() => onSelect(reply)}
            className={cn(
              "shrink-0 flex items-center gap-2 px-4 py-2 rounded-full",
              "bg-zinc-50 border border-zinc-200/80 text-zinc-700 dark:bg-white/[0.03] dark:border-white/10 dark:text-white/70 text-xs font-medium",
              "hover:bg-zinc-100 hover:border-zinc-300 hover:text-zinc-950 dark:hover:bg-white/10 dark:hover:border-white/20 dark:hover:text-white transition-all active:scale-95 group"
            )}
          >
            {reply}
            <Send size={10} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </button>
        </Animate>
      ))}
    </div>
  );
}
