import React from 'react';
import { cn } from '../../utils/cn';
import { User } from './types';
import { Avatar } from '../data-display/Avatar';
import { Bell, Ban, Trash2, Image, FileText, Link as LinkIcon, X } from 'lucide-react';
import { ScrollArea } from '../data-display/ScrollArea';
import { Separator } from '../data-display/Separator';
import { Switch } from '../form/Switch';

interface ChatProfileProps extends React.HTMLAttributes<HTMLDivElement> {
  user: User;
  onClose?: () => void;
}

export function ChatProfile({ user, onClose, className, ...props }: ChatProfileProps) {
  return (
    <div className={cn("w-80 border-l border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 flex flex-col", className)} {...props}>
      <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-white/10">
        <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/[0.06]">
          <X className="h-5 w-5 text-gray-500" />
        </button>
        <span className="ml-2 font-semibold text-gray-900 dark:text-white">Contact Info</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 flex flex-col items-center text-center">
          <Avatar src={user.avatar} alt={user.name} fallback={user.name[0]} className="h-24 w-24 mb-4 text-2xl" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
          <p className="text-sm text-gray-500 dark:text-white/50 mt-1">{user.phone || '+1 (555) 000-0000'}</p>
          
          <div className="mt-6 w-full">
            <p className="text-sm text-gray-500 dark:text-white/50 mb-1 text-left">About</p>
            <p className="text-sm text-gray-900 dark:text-white text-left">{user.bio || "Hey there! I am using Pixon Chat."}</p>
          </div>
        </div>

        <Separator />

        <div className="p-4 space-y-4">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-white/40 uppercase tracking-wider">Media & Docs</h3>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square rounded-xl bg-gray-100 dark:bg-white/[0.03] overflow-hidden relative group cursor-pointer">
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <Image className="h-6 w-6" />
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-gray-700 dark:text-white/80">
              <Bell className="h-5 w-5" />
              <span className="text-sm font-medium">Mute Notifications</span>
            </div>
            <Switch />
          </div>
        </div>

        <Separator />

        <div className="p-4 space-y-2">
          <button className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors text-sm font-medium">
            <Ban className="h-5 w-5" />
            Block {user.name}
          </button>
          <button className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors text-sm font-medium">
            <Trash2 className="h-5 w-5" />
            Delete Chat
          </button>
        </div>
      </ScrollArea>
    </div>
  );
}
