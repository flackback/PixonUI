import React, { useEffect } from 'react';
import { cn } from '../../utils/cn';
import { Mic, Square, Trash2, Send, X } from 'lucide-react';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';
import { Button } from '../button/Button';

interface VoiceRecorderProps extends React.HTMLAttributes<HTMLDivElement> {
  onSend: (blob: Blob, duration: number) => void;
  onCancel: () => void;
}

export function VoiceRecorder({ onSend, onCancel, className, ...props }: VoiceRecorderProps) {
  const { 
    isRecording, 
    duration, 
    audioBlob, 
    startRecording, 
    stopRecording, 
    cancelRecording 
  } = useVoiceRecorder();

  useEffect(() => {
    startRecording();
    return () => cancelRecording();
  }, []);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={cn(
        "flex items-center gap-3 p-2 rounded-2xl bg-gray-100 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 animate-in slide-in-from-bottom-2",
        className
      )} 
      {...props}
    >
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/10 text-red-500">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-sm font-mono font-bold">{formatTime(duration)}</span>
      </div>

      <div className="flex-1 h-8 flex items-center gap-0.5 px-2">
        {/* Simple Waveform Animation */}
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="w-1 bg-red-500/40 rounded-full transition-all duration-150"
            style={{ 
              height: isRecording ? `${20 + Math.random() * 80}%` : '20%',
              animationDelay: `${i * 0.05}s`
            }}
          />
        ))}
      </div>

      <div className="flex items-center gap-1">
        <button 
          onClick={() => { cancelRecording(); onCancel(); }}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 transition-colors"
        >
          <Trash2 className="h-5 w-5" />
        </button>
        
        {isRecording ? (
          <Button 
            size="icon" 
            variant="ghost"
            onClick={stopRecording}
            className="rounded-full bg-red-500 text-white hover:bg-red-600"
          >
            <Square className="h-4 w-4 fill-current" />
          </Button>
        ) : (
          <Button 
            size="icon" 
            onClick={() => audioBlob && onSend(audioBlob, duration)}
            className="rounded-full bg-blue-500 text-white hover:bg-blue-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
