import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { Search, Plus, Archive, Pin, BellOff, Trash2, Filter } from 'lucide-react';
import type { Conversation } from './types';
import { Avatar } from '../data-display/Avatar';
import { ScrollArea } from '../data-display/ScrollArea';
import { TypingIndicator } from './TypingIndicator';

interface ChatSidebarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  conversations: Conversation[];
  activeId?: string;
  onSelect?: (id: string) => void;
  onNewChat?: () => void;
  onSearch?: (query: string) => void;
  onArchive?: (id: string) => void;
  onPin?: (id: string) => void;
  onMute?: (id: string) => void;
  onDelete?: (id: string) => void;
  filter?: 'all' | 'unread' | 'groups';
  sortBy?: 'recent' | 'unread' | 'name';
}

export function ChatSidebar({ 
  conversations, 
  activeId, 
  onSelect, 
  onNewChat,
  onSearch,
  onArchive,
  onPin,
  onMute,
  onDelete,
  filter = 'all',
  sortBy = 'recent',
  className,
  ...props 
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <div className={cn("flex w-80 flex-col border-r border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]", className)} {...props}>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
          <div className="flex items-center gap-1">
            <button 
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/[0.06] text-gray-600 dark:text-white/60 transition-colors"
              title="Filter"
            >
              <Filter className="h-4 w-4" />
            </button>
            <button 
              onClick={onNewChat}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/[0.06] text-gray-600 dark:text-white/60 transition-colors"
              title="New Chat"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search messages..." 
            className="w-full h-10 pl-9 pr-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-400 dark:text-white"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.map((chat) => {
            const displayName = chat.user?.name || chat.group?.name || "Unknown";
            const displayAvatar = chat.user?.avatar || chat.group?.avatar;
            const isOnline = chat.user?.status === 'online';

            return (
              <div key={chat.id} className="group relative">
                <button
                  onClick={() => onSelect?.(chat.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left",
                    activeId === chat.id 
                      ? "bg-blue-500/10 dark:bg-white/[0.06] shadow-[0_0_15px_rgba(59,130,246,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.05)]" 
                      : "hover:bg-gray-100 dark:hover:bg-white/[0.03]"
                  )}
                >
                  <div className="relative">
                    <Avatar src={displayAvatar} alt={displayName} fallback={displayName[0]} />
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-black" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={cn(
                          "font-medium truncate",
                          activeId === chat.id ? "text-blue-600 dark:text-white" : "text-gray-900 dark:text-white/90"
                        )}>
                          {displayName}
                        </span>
                        {chat.isPinned && <Pin className="h-3 w-3 text-blue-500 rotate-45" />}
                        {chat.isMuted && <BellOff className="h-3 w-3 text-gray-400" />}
                      </div>
                      {chat.lastMessage && (
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                          {chat.lastMessage.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className={cn(
                        "text-sm truncate pr-2 flex-1",
                        activeId === chat.id ? "text-blue-600/80 dark:text-white/70" : "text-gray-500 dark:text-white/50"
                      )}>
                        {chat.isTyping ? (
                          <TypingIndicator className="text-[10px]" />
                        ) : (
                          <p className="truncate">{chat.lastMessage?.content}</p>
                        )}
                      </div>
                      {chat.unreadCount ? (
                        <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-blue-500 px-1.5 text-[10px] font-bold text-white">
                          {chat.unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>

                {/* Quick Actions on Hover */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-1 border border-gray-200 dark:border-white/10 animate-in fade-in zoom-in-95">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onPin?.(chat.id); }}
                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500"
                  >
                    <Pin className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onArchive?.(chat.id); }}
                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500"
                  >
                    <Archive className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete?.(chat.id); }}
                    className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
