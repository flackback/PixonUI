import React from 'react';
import { cn } from '../../utils/cn';
import { Search, Plus } from 'lucide-react';
import type { Conversation } from './types';
import { Avatar } from '../data-display/Avatar';
import { ScrollArea } from '../data-display/ScrollArea';

interface ChatSidebarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  conversations: Conversation[];
  activeId?: string;
  onSelect?: (id: string) => void;
  onNewChat?: () => void;
}

export function ChatSidebar({ 
  conversations, 
  activeId, 
  onSelect, 
  onNewChat,
  className,
  ...props 
}: ChatSidebarProps) {
  return (
    <div className={cn("flex w-80 flex-col border-r border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]", className)} {...props}>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
          <button 
            onClick={onNewChat}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/[0.06] text-gray-600 dark:text-white/60 transition-colors"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search messages..." 
            className="w-full h-10 pl-9 pr-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelect?.(chat.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left group",
                activeId === chat.id 
                  ? "bg-blue-500/10 dark:bg-white/[0.06] shadow-[0_0_15px_rgba(59,130,246,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.05)]" 
                  : "hover:bg-gray-100 dark:hover:bg-white/[0.03]"
              )}
            >
              <div className="relative">
                <Avatar src={chat.user.avatar} alt={chat.user.name} fallback={chat.user.name[0]} />
                {chat.user.status === 'online' && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-black" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className={cn(
                    "font-medium truncate",
                    activeId === chat.id ? "text-blue-600 dark:text-white" : "text-gray-900 dark:text-white/90"
                  )}>
                    {chat.user.name}
                  </span>
                  {chat.lastMessage && (
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                      {chat.lastMessage.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className={cn(
                    "text-sm truncate pr-2",
                    activeId === chat.id ? "text-blue-600/80 dark:text-white/70" : "text-gray-500 dark:text-white/50",
                    chat.isTyping && "text-blue-500 italic"
                  )}>
                    {chat.isTyping ? 'Typing...' : chat.lastMessage?.content}
                  </p>
                  {chat.unreadCount ? (
                    <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-blue-500 px-1.5 text-[10px] font-bold text-white">
                      {chat.unreadCount}
                    </span>
                  ) : null}
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
