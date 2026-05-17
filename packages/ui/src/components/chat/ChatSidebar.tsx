import React, { useState, useMemo } from 'react';
import { cn } from '../../utils/cn';
import { Search, Plus, Archive, Pin, BellOff, Trash2, Filter, MoreVertical, MessageSquare } from 'lucide-react';
import type { Conversation } from './types';
import { Avatar } from '../data-display/Avatar';
import { useVirtualList } from '../../hooks/useVirtualList';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '../overlay/DropdownMenu';

interface ConversationItemProps {
  chat: Conversation;
  isActive: boolean;
  isBeingDraggedOver: boolean;
  onSelect?: (id: string) => void;
  onPin?: (id: string) => void;
  onArchive?: (id: string) => void;
  onMute?: (id: string) => void;
  onMarkUnread?: (id: string) => void;
  onDelete?: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, chatId: string) => void;
  onDragOver: (e: React.DragEvent, chatId: string) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, chatId: string) => void;
}

const ConversationItem = React.memo(
  function ConversationItem({
    chat,
    isActive,
    isBeingDraggedOver,
    onSelect,
    onPin,
    onArchive,
    onMute,
    onMarkUnread,
    onDelete,
    onContextMenu,
    onDragOver,
    onDragLeave,
    onDrop
  }: ConversationItemProps) {
    const displayName = chat.user?.name || chat.group?.name || "Unknown";
    const displayAvatar = chat.user?.avatar || chat.group?.avatar;
    const isOnline = chat.user?.status === 'online';

    return (
      <div 
        className="p-2"
        onDragOver={(e) => onDragOver(e, chat.id)}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, chat.id)}
        onContextMenu={(e) => onContextMenu(e, chat.id)}
      >
        <div
          onClick={() => onSelect?.(chat.id)}
          className={cn(
            "w-full h-16 flex items-center gap-3 p-3 rounded-2xl transition-all text-left group cursor-pointer border border-transparent",
            isActive 
              ? "bg-blue-500/10 dark:bg-white/[0.06] shadow-[0_0_15px_rgba(59,130,246,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.05)]" 
              : isBeingDraggedOver
                ? "bg-blue-500/10 border-blue-500/50 scale-[1.02] shadow-[0_0_12px_rgba(59,130,246,0.2)] animate-pulse"
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
                <DropdownMenuItem onClick={() => onMarkUnread?.(chat.id)}>
                  <MessageSquare className="h-4 w-4 mr-2" /> Mark as Unread
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
  },
  (prev, next) => {
    return (
      prev.isActive === next.isActive &&
      prev.isBeingDraggedOver === next.isBeingDraggedOver &&
      prev.chat.id === next.chat.id &&
      prev.chat.unreadCount === next.chat.unreadCount &&
      prev.chat.isTyping === next.chat.isTyping &&
      prev.chat.user?.status === next.chat.user?.status &&
      prev.chat.lastMessage?.id === next.chat.lastMessage?.id &&
      prev.chat.lastMessage?.content === next.chat.lastMessage?.content &&
      prev.chat.lastMessage?.timestamp === next.chat.lastMessage?.timestamp
    );
  }
);

interface ChatSidebarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  conversations: Conversation[];
  children?: React.ReactNode;
  activeId?: string;
  onSelect?: (id: string) => void;
  onNewChat?: () => void;
  onSearch?: (query: string) => void;
  onArchive?: (id: string) => void;
  onPin?: (id: string) => void;
  onMute?: (id: string) => void;
  onDelete?: (id: string) => void;
  onMarkUnread?: (id: string) => void;
  onDropFiles?: (conversationId: string, files: File[]) => void;
  filter?: 'all' | 'unread' | 'groups';
  sortBy?: 'recent' | 'unread' | 'name';
  hideHeader?: boolean;
  isLoading?: boolean;
  virtualized?: boolean;
  conversationItemHeight?: number;
}

export function ChatSidebar({ 
  conversations, 
  children,
  activeId, 
  onSelect, 
  onNewChat,
  onSearch,
  onArchive,
  onPin,
  onMute,
  onDelete,
  onMarkUnread,
  onDropFiles,
  filter = 'all',
  sortBy = 'recent',
  hideHeader = false,
  isLoading = false,
  virtualized,
  conversationItemHeight = 72,
  className,
  ...props 
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dragOverChatId, setDragOverChatId] = useState<string | null>(null);
  
  // Right Click Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, chatId: string } | null>(null);

  // useDeferredValue keeps the search field typing silky-smooth by deferring non-critical render filtering
  const deferredSearchQuery = React.useDeferredValue(searchQuery);

  const filteredConversations = useMemo(() => {
    return conversations.filter(c => {
      const name = c.user?.name || c.group?.name || "";
      return name.toLowerCase().includes(deferredSearchQuery.toLowerCase());
    });
  }, [conversations, deferredSearchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleDragOver = (e: React.DragEvent, chatId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverChatId(chatId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverChatId(null);
  };

  const handleDrop = (e: React.DragEvent, chatId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverChatId(null);
    onSelect?.(chatId);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onDropFiles?.(chatId, Array.from(e.dataTransfer.files));
    }
  };

  const handleContextMenu = (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, chatId });
  };

  const shouldVirtualize = virtualized ?? filteredConversations.length > 120;
  const {
    containerRef,
    visibleItems,
    totalHeight,
    onScroll,
  } = useVirtualList({
    itemCount: filteredConversations.length,
    itemHeight: conversationItemHeight,
    overscan: 8,
  });

  const renderConversation = (chat: Conversation) => (
    <ConversationItem
      key={chat.id}
      chat={chat}
      isActive={activeId === chat.id}
      isBeingDraggedOver={dragOverChatId === chat.id}
      onSelect={onSelect}
      onPin={onPin}
      onArchive={onArchive}
      onMute={onMute}
      onMarkUnread={onMarkUnread}
      onDelete={onDelete}
      onContextMenu={handleContextMenu}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    />
  );

  // If children are passed, use them (backward compatibility)
  if (children) {
    return (
      <div className={cn("flex flex-col bg-gray-50/90 dark:bg-zinc-900/40 border-r border-gray-200/80 dark:border-white/5", !className?.includes('w-') && "w-80", className)} {...props}>
        {children}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col bg-gray-50/90 dark:bg-zinc-900/40 border-r border-gray-200/80 dark:border-white/5 relative", !className?.includes('w-') && "w-80", className)} {...props}>
      {!hideHeader && (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
            <div className="flex items-center gap-1">
              <button 
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/[0.06] text-gray-600 dark:text-white/60 transition-colors"
                title="Filter"
                disabled={isLoading}
              >
                <Filter className="h-4 w-4" />
              </button>
              <button 
                onClick={onNewChat}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/[0.06] text-gray-600 dark:text-white/60 transition-colors"
                title="New Chat"
                disabled={isLoading}
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
              disabled={isLoading}
              className="w-full h-10 pl-9 pr-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-400 dark:text-white disabled:opacity-50"
            />
          </div>
        </div>
      )}

      <div
        ref={shouldVirtualize ? containerRef : undefined}
        onScroll={shouldVirtualize ? onScroll : undefined}
        className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-track]:bg-transparent"
      >
        <div className={cn(shouldVirtualize ? 'relative p-2' : 'flex flex-col p-2 space-y-1')} style={shouldVirtualize ? { height: totalHeight + 16 } : undefined}>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={i} 
                className="w-full h-16 flex items-center gap-3 p-3 rounded-2xl border border-transparent animate-pulse"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/[0.06]" />
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <div 
                      className="h-4 bg-gray-200 dark:bg-white/[0.06] rounded" 
                      style={{ width: `${30 + (i % 3) * 15}%` }} 
                    />
                    <div className="h-3 w-8 bg-gray-200 dark:bg-white/[0.06] rounded animate-pulse" />
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-white/[0.04] rounded w-4/5" />
                </div>
              </div>
            ))
          ) : shouldVirtualize ? (
            visibleItems.map(({ index, offsetTop, height }) => {
              const chat = filteredConversations[index];
              if (!chat) return null;

              return (
                <div key={chat.id} className="absolute left-2 right-2" style={{ top: offsetTop + 8, height }}>
                  {renderConversation(chat)}
                </div>
              );
            })
          ) : filteredConversations.map(renderConversation)}
        </div>
      </div>

      {/* ─── FLOATING RIGHT-CLICK CONTEXT MENU (WhatsApp/Telegram Style) ─── */}
      {contextMenu && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-transparent cursor-default"
            onClick={(e) => { e.stopPropagation(); setContextMenu(null); }}
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setContextMenu(null); }}
          />
          
          <div 
            style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
            className="fixed z-[100] w-52 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-2 animate-in zoom-in-95 duration-100 flex flex-col"
            onClick={(e) => { e.stopPropagation(); setContextMenu(null); }}
          >
            <button 
              onClick={() => onPin?.(contextMenu.chatId)} 
              className="w-full flex items-center px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all text-left"
            >
              <Pin className="h-4 w-4 mr-2" /> Fixar Conversa
            </button>
            <button 
              onClick={() => onArchive?.(contextMenu.chatId)} 
              className="w-full flex items-center px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all text-left"
            >
              <Archive className="h-4 w-4 mr-2" /> Arquivar Conversa
            </button>
            <button 
              onClick={() => onMute?.(contextMenu.chatId)} 
              className="w-full flex items-center px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all text-left"
            >
              <BellOff className="h-4 w-4 mr-2" /> Silenciar Notificações
            </button>
            <button 
              onClick={() => onMarkUnread?.(contextMenu.chatId)} 
              className="w-full flex items-center px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all text-left"
            >
              <MessageSquare className="h-4 w-4 mr-2" /> Marcar como Não Lida
            </button>
            <div className="h-px bg-gray-100 dark:bg-neutral-800/80 my-1" />
            <button 
              onClick={() => onDelete?.(contextMenu.chatId)} 
              className="w-full flex items-center px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-500/10 rounded-xl transition-all text-left"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Excluir Conversa
            </button>
          </div>
        </>
      )}
    </div>
  );
}
