import React, { useState, useMemo } from 'react';
import { cn } from '../../utils/cn';
import { Search, Plus, Archive, Pin, BellOff, Trash2, Filter, MoreVertical } from 'lucide-react';
import type { Conversation } from './types';
import { Avatar } from '../data-display/Avatar';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '../overlay/DropdownMenu';

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
  hideHeader?: boolean;
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
  hideHeader = false,
  className,
  ...props 
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = useMemo(() => {
    return conversations.filter(c => {
      const name = c.user?.name || c.group?.name || "";
      return name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [conversations, searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <div className={cn("flex flex-col border-r border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]", !className?.includes('w-') && "w-80", className)} {...props}>
      {!hideHeader && (
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
      )}

      <div 
        className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-track]:bg-transparent"
      >
        <div className="flex flex-col">
          {filteredConversations.map((chat) => {
            const displayName = chat.user?.name || chat.group?.name || "Unknown";
            const displayAvatar = chat.user?.avatar || chat.group?.avatar;
            const isOnline = chat.user?.status === 'online';
            const isActive = activeId === chat.id;

            return (
              <div 
                key={chat.id} 
                className="p-2"
              >
                <div
                  onClick={() => onSelect?.(chat.id)}
                  className={cn(
                    "w-full h-16 flex items-center gap-3 p-3 rounded-2xl transition-all text-left group cursor-pointer",
                    isActive 
                      ? "bg-blue-500/10 dark:bg-white/[0.06] shadow-[0_0_15px_rgba(59,130,246,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.05)]" 
                      : "hover:bg-gray-100 dark:hover:bg-white/[0.03]"
                  )}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar src={displayAvatar} alt={displayName} fallback={displayName[0]} />
                    {isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-[#0a0a0a] rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={cn(
                        "font-semibold truncate",
                        isActive ? "text-blue-600 dark:text-white" : "text-gray-900 dark:text-white/90"
                      )}>
                        {displayName}
                      </span>
                      {chat.lastMessage && (
                        <span className="text-[10px] text-gray-400 dark:text-white/30 whitespace-nowrap">
                          {new Date(chat.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-gray-500 dark:text-white/40 truncate">
                        {chat.isTyping ? (
                          <span className="text-blue-500 animate-pulse">typing...</span>
                        ) : (
                          chat.lastMessage?.content || "No messages yet"
                        )}
                      </p>
                      {chat.unreadCount > 0 && (
                        <span className="flex-shrink-0 min-w-[18px] h-[18px] flex items-center justify-center bg-blue-500 text-white text-[10px] font-bold rounded-full px-1">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400">
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onPin?.(chat.id)}>
                          <Pin className="h-4 w-4 mr-2" /> Pin
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onArchive?.(chat.id)}>
                          <Archive className="h-4 w-4 mr-2" /> Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onMute?.(chat.id)}>
                          <BellOff className="h-4 w-4 mr-2" /> Mute
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500" onClick={() => onDelete?.(chat.id)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
