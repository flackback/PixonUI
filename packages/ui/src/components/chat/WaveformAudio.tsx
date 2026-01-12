import React, { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from '../../utils/cn';
import { Play, Pause, Smartphone } from 'lucide-react';

interface WaveformAudioProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  duration?: number;
  isMe?: boolean;
  bars?: number;
}

export function WaveformAudio({ src, duration, isMe, bars = 35, className, ...props }: WaveformAudioProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Generate deterministic bar heights for a given src to maintain visual consistency
  const barHeights = useMemo(() => {
    const heights = [];
    const seed = src.length;
    for (let i = 0; i < bars; i++) {
      // Deterministic random between 20% and 100%
      const h = ((Math.sin(seed + i * 1.5) + 1) / 2) * 80 + 20;
      heights.push(Math.round(h));
    }
    return heights;
  }, [src, bars]);

  const togglePlay = async () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (error) {
          if (error instanceof Error && error.name !== 'AbortError') {
            console.error('WaveformAudio playback failed:', error);
          }
        }
      }
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

  const progressPercentage = duration ? (currentTime / duration) : 0;
  const activeBars = Math.floor(progressPercentage * bars);

  return (
    <div 
      className={cn(
        "flex items-center gap-4 py-2 px-3 rounded-2xl min-w-[280px]",
        isMe ? "bg-white/10 text-white" : "bg-white/[0.03] text-white/90 border border-white/10",
        className
      )} 
      {...props}
    >
      <audio 
        ref={audioRef} 
        src={src} 
        preload="none"
        onTimeUpdate={handleTimeUpdate} 
        onEnded={handleEnded}
      />
      
      <div className="relative shrink-0">
        <button 
          onClick={togglePlay}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all group active:scale-95",
            isMe ? "bg-white text-blue-600" : "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
          )}
        >
          {isPlaying ? (
            <Pause className="h-6 w-6 fill-current" />
          ) : (
            <Play className="h-6 w-6 fill-current ml-1" />
          )}
        </button>
        {/* Playback rate indicator if needed could go here */}
      </div>

      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-end gap-[2px] h-8 w-full group cursor-pointer" 
             onClick={(e) => {
               if (!audioRef.current || !duration) return;
               const rect = e.currentTarget.getBoundingClientRect();
               const x = e.clientX - rect.left;
               const newTime = (x / rect.width) * duration;
               audioRef.current.currentTime = newTime;
               setCurrentTime(newTime);
             }}>
          {barHeights.map((h, i) => (
            <div 
              key={i}
              className={cn(
                "flex-1 rounded-full transition-all duration-300",
                i <= activeBars 
                  ? (isMe ? "bg-white" : "bg-blue-500") 
                  : (isMe ? "bg-white/30" : "bg-white/10")
              )}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        
        <div className="flex justify-between items-center px-0.5">
          <span className="text-[10px] tabular-nums font-semibold opacity-60">
            {formatTime(currentTime)}
          </span>
          <div className="flex items-center gap-1.5 grayscale opacity-40">
            <span className="text-[10px] font-semibold">
              {duration ? formatTime(duration) : '--:--'}
            </span>
            <Smartphone size={10} />
          </div>
        </div>
      </div>
    </div>
  );
}
