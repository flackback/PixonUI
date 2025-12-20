import React from 'react';
import { Settings, LogOut, User } from 'lucide-react';
import { Avatar } from '../data-display/Avatar';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '../overlay/DropdownMenu';
import { cn } from '../../utils/cn';

export interface UserMenuProps {
  name: string;
  description?: string;
  avatarSrc?: string;
  avatarFallback?: string;
  className?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'end' | 'center';
}

export function UserMenu({ 
  name, 
  description, 
  avatarSrc, 
  avatarFallback,
  className,
  side = 'top',
  align = 'start'
}: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn("w-full outline-none", className)}>
        <div className="group flex w-full items-center gap-3 rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.03] p-3 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.06]">
          <Avatar src={avatarSrc} fallback={avatarFallback || name.charAt(0)} size="sm" />
          <div className="flex flex-1 flex-col items-start text-left">
            <span className="text-xs font-medium text-gray-900 dark:text-white">{name}</span>
            {description && <span className="text-[10px] text-gray-500 dark:text-white/50">{description}</span>}
          </div>
          <Settings className="h-4 w-4 text-gray-400 dark:text-white/50 transition-colors group-hover:text-gray-900 dark:group-hover:text-white" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align={align} side={side}>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-rose-400 focus:text-rose-400">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
