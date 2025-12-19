import React from 'react';
import { cn } from '../../utils/cn';
import { User } from './types';
import { Avatar } from '../data-display/Avatar';
import { Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react';

interface ChatHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  user: User;
  onBack?: () => void;
  onInfo?: () => void;
}

export function ChatHeader({ user, onBack, onInfo, className, ...props }: ChatHeaderProps) {
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
          <button onClick={onBack} className="md:hidden p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-white/70" />
          </button>
        )}
        
        <div className="relative cursor-pointer" onClick={onInfo}>
          <Avatar src={user.avatar} alt={user.name} fallback={user.name[0]} />
          {user.status === 'online' && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-black" />
          )}
        </div>
        
        <div className="cursor-pointer" onClick={onInfo}>
          <h3 className="font-semibold text-gray-900 dark:text-white leading-none mb-1">{user.name}</h3>
          <p className="text-xs text-gray-500 dark:text-white/50">
            {user.status === 'online' ? 'Online' : `Last seen ${user.lastSeen?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-white/60 transition-colors">
          <Phone className="h-5 w-5" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-white/60 transition-colors">
          <Video className="h-5 w-5" />
        </button>
        <button 
          onClick={onInfo}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-white/60 transition-colors"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
