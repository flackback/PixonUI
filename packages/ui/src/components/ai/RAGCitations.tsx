import React from 'react';
import { cn } from '../../utils/cn';
import { ExternalLink, FileText, Globe, Percent } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '../overlay/Popover';

export interface CitationItem {
  /** Unique id of the citation */
  id: string;
  /** Title or name of the document/source */
  title: string;
  /** Direct URL link */
  url?: string;
  /** Match confidence percentage or rating, from 0 to 1 (e.g. 0.94) */
  confidence?: number;
  /** Brief descriptive text or exact excerpt matched */
  excerpt?: string;
  /** Source category like 'web' or 'document' */
  type?: 'web' | 'file' | 'code' | 'other';
}

export interface RAGInlineCitationProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The citation details */
  citation: CitationItem;
  /** Index label to display inside the bracket, e.g. "1" or "Doc" */
  indexLabel?: string;
}

/**
 * An inline citation badge that opens a beautiful grounding source popover when clicked.
 */
export const RAGInlineCitation: React.FC<RAGInlineCitationProps> = ({
  citation,
  indexLabel,
  className,
  ...props
}) => {
  const displayLabel = indexLabel || citation.id;
  
  // Decide domain or file icon
  const Icon = citation.type === 'file' ? FileText : Globe;

  return (
    <span className={cn("inline-block mx-0.5 align-super", className)} {...props}>
      <Popover>
        <PopoverTrigger className="inline-flex h-4 items-center justify-center rounded-md bg-cyan-50 px-1 text-[10px] font-semibold text-cyan-600 border border-cyan-100 hover:bg-cyan-100 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-900/30 transition-all cursor-pointer">
          {displayLabel}
        </PopoverTrigger>
        
        <PopoverContent align="center" className="w-[300px] border border-gray-150 bg-white/95 dark:bg-zinc-950/95 dark:border-white/10 shadow-2xl p-4">
          <div className="flex flex-col gap-2">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <Icon className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                <span className="text-xs font-bold text-gray-800 dark:text-zinc-200 truncate">
                  {citation.title}
                </span>
              </div>
              {citation.url && (
                <a 
                  href={citation.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-cyan-500 dark:text-zinc-500 dark:hover:text-cyan-400 transition-colors shrink-0"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>

            {/* Confidence Bar */}
            {citation.confidence !== undefined && (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-medium text-gray-400 dark:text-zinc-500">
                  Confidence Match:
                </span>
                <div className="h-1.5 flex-1 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" 
                    style={{ width: `${citation.confidence * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 flex items-center">
                  {(citation.confidence * 100).toFixed(0)}%
                </span>
              </div>
            )}

            {/* Snippet Excerpt */}
            {citation.excerpt && (
              <div className="mt-1.5 rounded-lg bg-gray-50 dark:bg-zinc-900/50 p-2 text-xs text-gray-600 dark:text-zinc-400 font-light border border-gray-100 dark:border-white/5 max-h-[80px] overflow-y-auto leading-relaxed scrollbar-thin">
                &quot;{citation.excerpt}&quot;
              </div>
            )}

            {/* Footer */}
            {citation.url && (
              <a
                href={citation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 text-[10px] font-medium text-cyan-500 hover:underline flex items-center gap-1 self-start"
              >
                Go to source URL <ExternalLink className="h-2.5 w-2.5" />
              </a>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </span>
  );
};


export interface RAGSourcesListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Array of grounding sources/citations to render */
  citations: CitationItem[];
}

/**
 * A beautiful structured citations list rendered usually at the bottom of AI outputs.
 */
export const RAGSourcesList: React.FC<RAGSourcesListProps> = ({
  citations,
  className,
  ...props
}) => {
  if (!citations || citations.length === 0) return null;

  return (
    <div className={cn("flex flex-col gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-white/5", className)} {...props}>
      <div className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
        <FileText className="h-3 w-3 text-cyan-500" /> Grounding References ({citations.length})
      </div>
      
      <div className="flex flex-wrap gap-2">
        {citations.map((cit, index) => {
          const Icon = cit.type === 'file' ? FileText : Globe;
          return (
            <a
              key={cit.id || index}
              href={cit.url || "#"}
              target={cit.url ? "_blank" : undefined}
              rel={cit.url ? "noopener noreferrer" : undefined}
              className={cn(
                "group flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs transition-all duration-200 shadow-sm",
                "border-gray-200 bg-white text-gray-700 hover:border-cyan-200 hover:bg-cyan-50/20 hover:text-cyan-700",
                "dark:border-white/10 dark:bg-white/[0.02] dark:text-zinc-400 dark:hover:border-cyan-500/20 dark:hover:bg-cyan-950/10 dark:hover:text-cyan-400"
              )}
            >
              <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gray-100 group-hover:bg-cyan-100/30 dark:bg-white/5 dark:group-hover:bg-cyan-950/20 transition-all">
                <span className="text-[9px] font-bold text-cyan-600 dark:text-cyan-400 shrink-0">
                  {index + 1}
                </span>
              </div>
              <Icon className="h-3.5 w-3.5 text-gray-400 group-hover:text-cyan-500 transition-colors shrink-0" />
              <span className="max-w-[130px] truncate font-medium">
                {cit.title}
              </span>
              {cit.confidence !== undefined && (
                <span className="rounded bg-emerald-50 px-1 py-0.5 text-[9px] font-bold text-emerald-600 group-hover:bg-emerald-100/30 dark:bg-emerald-950/20 dark:text-emerald-400">
                  {(cit.confidence * 100).toFixed(0)}%
                </span>
              )}
              {cit.url && <ExternalLink className="h-3 w-3 text-gray-300 group-hover:text-cyan-500 transition-colors opacity-0 group-hover:opacity-100" />}
            </a>
          );
        })}
      </div>
    </div>
  );
};
