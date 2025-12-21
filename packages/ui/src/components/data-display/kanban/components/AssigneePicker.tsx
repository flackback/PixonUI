import React from 'react';
import { cn } from '../../../../utils/cn';
import { Avatar } from '../../Avatar';
import { Check, Users } from 'lucide-react';
import type { KanbanUser } from '../types';

interface AssigneePickerProps {
  users: KanbanUser[];
  selectedId?: string;
  onSelect: (id: string) => void;
  className?: string;
}

export function AssigneePicker({ users, selectedId, onSelect, className }: AssigneePickerProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-[10px] text-white/40 uppercase tracking-wider font-bold flex items-center gap-2">
        <Users className="h-3 w-3" />
        Assignee
      </h4>
      <div className="grid grid-cols-1 gap-1">
        {users.map((user) => {
          const isSelected = selectedId === user.id;
          return (
            <button
              key={user.id}
              onClick={() => onSelect(user.id)}
              className={cn(
                "flex items-center gap-3 p-2 rounded-xl transition-all text-left",
                isSelected 
                  ? "bg-white/10 text-white" 
                  : "text-white/60 hover:bg-white/5"
              )}
            >
              <Avatar src={user.avatar} alt={user.name} size="sm" />
              <span className="text-sm flex-1 truncate">{user.name}</span>
              {isSelected && <Check className="h-4 w-4 text-blue-500" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
