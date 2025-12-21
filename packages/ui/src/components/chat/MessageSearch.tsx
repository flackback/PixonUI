import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import type { Message } from './types';

interface MessageSearchProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSearch' | 'results'> {
  onSearch: (query: string) => void;
  results: Message[];
  onResultClick: (message: Message) => void;
  onClose: () => void;
}

export function MessageSearch({ 
  onSearch, 
  results, 
  onResultClick, 
  onClose, 
  className, 
  ...props 
}: MessageSearchProps) {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onSearch(val);
  };

  return (
    <div 
      className={cn(
        "flex flex-col h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-white/10 animate-in slide-in-from-right duration-300",
        className
      )} 
      {...props}
    >
      <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
        <h3 className="font-bold text-gray-900 dark:text-white">Search Messages</h3>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            value={query}
            onChange={handleSearch}
            placeholder="Search in conversation..." 
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-gray-100 dark:bg-white/5 border-none text-sm focus:ring-2 focus:ring-blue-500/50 transition-all"
            autoFocus
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {query && results.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-white/30">
            <p className="text-sm">No messages found for "{query}"</p>
          </div>
        ) : (
          <div className="space-y-1">
            {results.map(msg => (
              <button
                key={msg.id}
                onClick={() => onResultClick(msg)}
                className="w-full p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-left transition-all group"
              >
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] font-bold text-blue-500 uppercase">
                    {msg.timestamp.toLocaleDateString()}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-white/70 line-clamp-2 group-hover:text-gray-900 dark:group-hover:text-white">
                  {msg.content}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
