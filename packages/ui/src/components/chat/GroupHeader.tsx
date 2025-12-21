import React from 'react';
import { cn } from '../../utils/cn';
import type { GroupInfo } from './types';
import { Avatar } from '../data-display/Avatar';
import { Phone, Video, MoreVertical, ArrowLeft, Users } from 'lucide-react';

interface GroupHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  group: GroupInfo;
  onBack?: () => void;
  onInfo?: () => void;
  isTyping?: boolean;
  typingUsers?: string[];
}

export function GroupHeader({ 
  group, 
  onBack, 
  onInfo, 
  isTyping,
  typingUsers = [],
  className, 
  ...props 
}: GroupHeaderProps) {
  const typingText = typingUsers.length > 0 
    ? `${typingUsers.join(', ')} ${typingUsers.length === 1 ? 'is' : 'are'} typing...`
    : 'typing...';

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
        
        <div className="relative cursor-pointer" onClick={onInfo}>
          <div className="flex -space-x-3">
            {group.members.slice(0, 2).map((member, i) => (
              <Avatar 
                key={member.id} 
                src={member.avatar} 
                alt={member.name} 
                fallback={member.name[0]} 
                className={cn("border-2 border-white dark:border-black", i === 0 ? "z-10" : "z-0")}
              />
            ))}
            {group.members.length > 2 && (
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 border-2 border-white dark:border-black flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-white/60 z-0">
                +{group.members.length - 2}
              </div>
            )}
          </div>
        </div>
        
        <div className="cursor-pointer min-w-0" onClick={onInfo}>
          <h3 className="font-semibold text-gray-900 dark:text-white leading-none truncate">{group.name}</h3>
          <p className={cn(
            "text-xs mt-1 truncate transition-colors",
            isTyping ? "text-blue-500 font-medium animate-pulse" : "text-gray-500 dark:text-white/50"
          )}>
            {isTyping ? typingText : `${group.members.length} members`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-600 dark:text-white/60 transition-colors">
          <Phone className="h-5 w-5" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-600 dark:text-white/60 transition-colors">
          <Video className="h-5 w-5" />
        </button>
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
