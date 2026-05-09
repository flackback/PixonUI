import React from 'react';
import { cn } from '../../utils/cn';
import { Sparkles, ListChecks, ArrowRight, RefreshCw } from 'lucide-react';

interface AISummaryCardProps extends React.HTMLAttributes<HTMLDivElement> {
  summary: string;
  onRegenerate?: () => void;
  isLoading?: boolean;
}

export function AISummaryCard({ summary, onRegenerate, isLoading, className, ...props }: AISummaryCardProps) {
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 group",
        className
      )} 
      {...props}
    >
      {/* Glow Effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-purple-500/30 transition-all duration-700" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-blue-500/30 transition-all duration-700" />

      <div className="relative space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg shadow-purple-500/20">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">Resumo Inteligente</h3>
          </div>
          
          {onRegenerate && (
            <button 
              onClick={onRegenerate}
              disabled={isLoading}
              className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </button>
          )}
        </div>

        <div className="space-y-3">
          <p className="text-sm text-white/70 leading-relaxed font-medium">
            {summary}
          </p>
          
          <div className="flex flex-wrap gap-2 pt-2">
             <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-white/40 uppercase tracking-widest">
               <ListChecks size={12} />
               Key Points Extracted
             </div>
          </div>
        </div>

        <div className="pt-2">
          <button className="flex items-center gap-2 text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider group/btn">
            Ver detalhes da análise
            <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
