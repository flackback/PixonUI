import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { Avatar } from './Avatar';
import { Button } from '../button/Button';

const userPreviewVariants = cva(
  "flex flex-col gap-4 rounded-2xl border p-4 transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-white border-gray-200 dark:bg-white/[0.03] dark:border-white/10",
        glass: "backdrop-blur-md bg-white/80 border-white/20 dark:bg-black/40 dark:border-white/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface UserPreviewProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof userPreviewVariants> {
  user: {
    name: string;
    email?: string;
    avatarSrc?: string;
    role?: string;
    bio?: string;
    stats?: { label: string; value: string | number }[];
  };
  onFollow?: () => void;
  onMessage?: () => void;
}

export const UserPreview = React.forwardRef<HTMLDivElement, UserPreviewProps>(
  ({ className, variant, user, onFollow, onMessage, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(userPreviewVariants({ variant, className }))} {...props}>
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <Avatar src={user.avatarSrc} alt={user.name} size="lg" />
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</h4>
              {user.role && (
                <span className="text-xs text-gray-500 dark:text-white/50">{user.role}</span>
              )}
              {user.email && (
                <div className="text-xs text-gray-400 dark:text-white/40 mt-0.5">{user.email}</div>
              )}
            </div>
          </div>
          {onFollow && (
             <Button size="sm" variant="outline" onClick={onFollow}>Follow</Button>
          )}
        </div>
        
        {user.bio && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {user.bio}
          </p>
        )}

        {user.stats && (
          <div className="flex gap-4 border-t border-gray-100 pt-3 dark:border-white/5">
            {user.stats.map((stat, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-xs font-medium text-gray-900 dark:text-white">{stat.value}</span>
                <span className="text-[10px] text-gray-500 dark:text-white/40">{stat.label}</span>
              </div>
            ))}
          </div>
        )}
        
        {onMessage && (
            <Button className="w-full mt-2" onClick={onMessage}>Message</Button>
        )}
      </div>
    );
  }
);
UserPreview.displayName = 'UserPreview';
