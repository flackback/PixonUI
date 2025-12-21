import React from 'react';
import { cn } from '../../../../utils/cn';
import { Avatar } from '../../Avatar';
import type { KanbanUser } from '../types';

interface Activity {
  id: string;
  user: KanbanUser;
  action: string;
  target?: string;
  timestamp: Date;
}

interface TaskActivityProps {
  activities: Activity[];
  className?: string;
}

export function TaskActivity({ activities, className }: TaskActivityProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <h4 className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Activity</h4>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-3">
            <Avatar src={activity.user.avatar} alt={activity.user.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/80">
                <span className="font-bold text-white">{activity.user.name}</span>
                {' '}{activity.action}{' '}
                {activity.target && <span className="font-medium text-blue-400">{activity.target}</span>}
              </p>
              <p className="text-[10px] text-white/30 mt-0.5">
                {activity.timestamp.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
