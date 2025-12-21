import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  duration?: number;
  isMe?: boolean;
}

export function AudioPlayer({ src, duration, isMe, className, ...props }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      className={cn(
        "flex items-center gap-3 p-2 rounded-2xl min-w-[200px]",
        isMe ? "bg-white/10" : "bg-gray-100 dark:bg-white/[0.03]",
        className
      )} 
      {...props}
    >
      <audio 
        ref={audioRef} 
        src={src} 
        onTimeUpdate={handleTimeUpdate} 
        onEnded={handleEnded}
      />
      
      <button 
        onClick={togglePlay}
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center transition-all",
          isMe ? "bg-white text-blue-600" : "bg-blue-500 text-white"
        )}
      >
        {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
      </button>

      <div className="flex-1 space-y-1">
        <div className="h-1.5 w-full bg-gray-300 dark:bg-white/10 rounded-full overflow-hidden">
          <div 
            className={cn("h-full transition-all duration-100", isMe ? "bg-white" : "bg-blue-500")} 
            style={{ width: `${progress}%` }} 
          />
        </div>
        <div className="flex justify-between text-[10px] font-medium opacity-60">
          <span>{formatTime(currentTime)}</span>
          <span>{duration ? formatTime(duration) : '--:--'}</span>
        </div>
      </div>

      <button 
        onClick={() => setIsMuted(!isMuted)}
        className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 opacity-60"
      >
        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
