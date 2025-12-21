import React, { useState, useEffect } from 'react';
import { cn } from '../../../../utils/cn';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';
import { Button } from '../../../button/Button';

interface TimeTrackerProps {
  initialSeconds?: number;
  onTimeUpdate?: (seconds: number) => void;
  className?: string;
}

export function TimeTracker({ initialSeconds = 0, onTimeUpdate, className }: TimeTrackerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((s) => {
          const next = s + 1;
          onTimeUpdate?.(next);
          return next;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, onTimeUpdate]);

  const formatTime = (s: number) => {
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-[10px] text-white/40 uppercase tracking-wider font-bold flex items-center gap-2">
        <Timer className="h-3 w-3" />
        Time Tracking
      </h4>
      
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
        <div className="flex-1">
          <p className="text-2xl font-mono font-bold text-white tracking-tight">
            {formatTime(seconds)}
          </p>
          <p className="text-[10px] text-white/30 uppercase font-bold mt-1">Total Time Spent</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/10"
            onClick={() => setSeconds(0)}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant={isActive ? "secondary" : "primary"}
            size="icon"
            className={cn(
              "h-10 w-10 rounded-full shadow-lg transition-all",
              isActive ? "bg-orange-500 hover:bg-orange-600" : "bg-blue-600 hover:bg-blue-700"
            )}
            onClick={() => setIsActive(!isActive)}
          >
            {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
