import React from 'react';
import { cn } from '../../utils/cn';
import type { User } from './types';
import { Avatar } from '../data-display/Avatar';
import { Phone, Video, MoreVertical, ArrowLeft, Search, BellOff } from 'lucide-react';

interface ChatHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  user: User;
  onBack?: () => void;
  onInfo?: () => void;
  onAvatarClick?: () => void;
  onCall?: () => void;
  onVideoCall?: () => void;
  onSearch?: () => void;
  onMute?: () => void;
  isTyping?: boolean;
  isMuted?: boolean;
  actions?: React.ReactNode;
}

export function ChatHeader({ 
  user, 
  onBack, 
  onInfo, 
  onAvatarClick,
  onCall,
  onVideoCall,
  onSearch,
  onMute,
  isTyping,
  isMuted,
  actions,
  className, 
  ...props 
}: ChatHeaderProps) {
  return (
    <div 
      className={cn(
        "flex h-16 items-center justify-between border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-black/40 backdrop-blur px-4 sticky top-0 z-10",
        className
      )} 
      {...props}
    >
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="md:hidden p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/[0.06]">
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-white/70" />
          </button>
        )}
        
        <div className="relative cursor-pointer" onClick={onAvatarClick || onInfo}>
          <Avatar src={user.avatar} alt={user.name} fallback={user.name[0]} />
          {user.status === 'online' && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-black" />
          )}
        </div>
        
        <div className="cursor-pointer" onClick={onInfo}>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white leading-none">{user.name}</h3>
            {isMuted && <BellOff className="h-3 w-3 text-gray-400" />}
            {user.tags && user.tags.length > 0 && (
              <div className="flex gap-1">
                {user.tags.slice(0, 2).map((tag, i) => (
                  <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                    {tag}
                  </span>
                ))}
                {user.tags.length > 2 && (
                  <span className="text-[9px] text-gray-400">+{user.tags.length - 2}</span>
                )}
              </div>
            )}
          </div>
          <p className={cn(
            "text-xs mt-1 transition-colors",
            isTyping ? "text-blue-500 font-medium animate-pulse" : "text-gray-500 dark:text-white/50"
          )}>
            {isTyping ? 'typing...' : user.status === 'online' ? 'Online' : `Last seen ${user.lastSeen?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {onSearch && (
          <button 
            onClick={onSearch}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-600 dark:text-white/60 transition-colors"
          >
            <Search className="h-5 w-5" />
          </button>
        )}
        {onCall && (
          <button 
            onClick={onCall}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-600 dark:text-white/60 transition-colors"
          >
            <Phone className="h-5 w-5" />
          </button>
        )}
        {onVideoCall && (
          <button 
            onClick={onVideoCall}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-600 dark:text-white/60 transition-colors"
          >
            <Video className="h-5 w-5" />
          </button>
        )}
        
        {actions}

        <button 
          onClick={onInfo}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-600 dark:text-white/60 transition-colors"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
