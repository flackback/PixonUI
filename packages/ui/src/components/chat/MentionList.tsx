import React from 'react';
import { cn } from '../../utils/cn';
import type { User } from './types';
import { Avatar } from '../data-display/Avatar';
import { Surface } from '../../primitives/Surface';

interface MentionListProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  users: User[];
  selectedIndex: number;
  onSelect: (user: User) => void;
}

export function MentionList({ users, selectedIndex, onSelect, className, ...props }: MentionListProps) {
  if (users.length === 0) return null;

  return (
    <Surface 
      className={cn(
        "w-64 overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-2",
        className
      )} 
      {...props}
    >
      <div className="p-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-200 dark:border-white/5 mb-1">
          Mention someone
        </div>
        {users.map((user, i) => (
          <button
            key={user.id}
            onClick={() => onSelect(user)}
            className={cn(
              "w-full flex items-center gap-2 p-2 rounded-xl text-left transition-colors",
              i === selectedIndex ? "bg-blue-500 text-white" : "hover:bg-gray-100 dark:hover:bg-white/[0.06]"
            )}
          >
            <Avatar src={user.avatar} alt={user.name} fallback={user.name[0]} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              {user.status && <p className={cn("text-[10px]", i === selectedIndex ? "text-white/70" : "text-gray-500")}>{user.status}</p>}
            </div>
          </button>
        ))}
      </div>
    </Surface>
  );
}
