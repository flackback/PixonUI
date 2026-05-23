import React, { useEffect, useState, useRef } from 'react';
import { cn } from '../../utils/cn';
import { Mic, Square, Trash2, Send, X, Pause, Play, Volume2 } from 'lucide-react';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';
import { Button } from '../button/Button';

interface VoiceRecorderProps extends React.HTMLAttributes<HTMLDivElement> {
  onSend: (blob: Blob, duration: number) => void;
  onCancel: () => void;
}

export function VoiceRecorder({ onSend, onCancel, className, ...props }: VoiceRecorderProps) {
  const { 
    isRecording,
    isPaused,
    duration, 
    audioBlob,
    audioUrl,
    startRecording, 
    pauseRecording,
    resumeRecording,
    stopRecording, 
    cancelRecording,
    clearAudio
  } = useVoiceRecorder();

  // Local state for preview playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [previewDuration, setPreviewDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    startRecording();
    return () => cancelRecording();
  }, []);

  // Sync preview duration when a blob is recorded
  useEffect(() => {
    if (audioBlob) {
      setPreviewDuration(duration);
    }
  }, [audioBlob, duration]);

  // Audio preview playback handlers
  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.error("Playback error", err));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setPreviewDuration(audioRef.current.duration || duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isPreviewMode = !!audioUrl && !isRecording;

  return (
    <div 
      className={cn(
        "flex items-center gap-3 p-2 rounded-2xl bg-gray-100 dark:bg-zinc-900/90 border border-gray-200 dark:border-white/10 shadow-lg animate-in slide-in-from-bottom-2 duration-300",
        className
      )} 
      {...props}
    >
      {/* HTML5 Audio element hidden under the hood for preview */}
      {audioUrl && (
        <audio 
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleAudioEnded}
          onLoadedMetadata={handleLoadedMetadata}
          preload="metadata"
        />
      )}

      {/* ─── 1. RECORDING STATE PANEL ─── */}
      {!isPreviewMode && (
        <>
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-mono font-bold transition-all duration-300",
            isPaused 
              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
              : "bg-red-500/10 text-red-500 border border-red-500/20"
          )}>
            <div className={cn(
              "w-2.5 h-2.5 rounded-full",
              isPaused ? "bg-amber-500" : "bg-red-500 animate-pulse"
            )} />
            <span>{formatTime(duration)}</span>
          </div>

          <div className="flex-1 h-8 flex items-center justify-center gap-1.5 px-3">
            {/* Waveform Animation (freezes if paused) */}
            {[...Array(18)].map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "w-1 h-6 rounded-full shrink-0 transform-gpu",
                  isPaused ? "bg-amber-500/30" : "bg-red-500/40"
                )}
                style={{ 
                  transform: (isRecording && !isPaused) ? `scaleY(${0.2 + Math.random() * 0.8})` : 'scaleY(0.2)',
                  transformOrigin: 'center',
                  transition: 'transform 150ms ease',
                  animationDelay: `${i * 0.04}s`
                }}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5 pr-1">
            {/* Discard button */}
            <button 
              type="button"
              onClick={() => { cancelRecording(); onCancel(); }}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 hover:text-red-500 transition-colors"
              title="Cancelar gravação"
            >
              <Trash2 className="h-5 w-5" />
            </button>

            {/* Pause / Resume Button */}
            <button
              type="button"
              onClick={isPaused ? resumeRecording : pauseRecording}
              className={cn(
                "p-2 rounded-full transition-all active:scale-95",
                isPaused 
                  ? "bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30" 
                  : "bg-amber-500/20 text-amber-500 hover:bg-amber-500/30"
              )}
              title={isPaused ? "Continuar gravando" : "Pausar gravação"}
            >
              {isPaused ? <Play className="h-4.5 w-4.5 fill-current" /> : <Pause className="h-4.5 w-4.5 fill-current" />}
            </button>
            
            {/* Stop and review Button */}
            <Button 
              size="icon" 
              variant="ghost"
              type="button"
              onClick={stopRecording}
              className="rounded-full bg-red-500 text-white hover:bg-red-600 active:scale-95 shadow-md shadow-red-500/10"
              title="Parar e ouvir"
            >
              <Square className="h-4 w-4 fill-current" />
            </Button>
          </div>
        </>
      )}

      {/* ─── 2. PREVIEW PLAYER STATE PANEL ─── */}
      {isPreviewMode && (
        <>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePlayPause}
              className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 active:scale-95 shadow-md shadow-blue-500/10 transition-all shrink-0"
              title={isPlaying ? "Pausar" : "Ouvir gravação"}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : (
                <Play className="h-5 w-5 fill-current ml-0.5" />
              )}
            </button>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
              <Volume2 className="h-4 w-4" />
            </div>
          </div>

          {/* Live Seekable Seeker Bar */}
          <div className="flex-1 flex items-center gap-3 px-1 min-w-0">
            <input 
              type="range"
              min="0"
              max={previewDuration || 1}
              step="0.05"
              value={currentTime}
              onChange={handleSeek}
              className={cn(
                "w-full h-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-700/50 appearance-none cursor-pointer outline-none accent-blue-500 focus:accent-blue-600 focus:ring-0",
                "[&::-webkit-slider-runnable-track]:bg-zinc-200 dark:[&::-webkit-slider-runnable-track]:bg-zinc-700/40",
                "[&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
              )}
            />
            <span className="text-xs font-mono font-bold text-gray-500 dark:text-white/40 whitespace-nowrap">
              {formatTime(currentTime)} / {formatTime(previewDuration)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 pr-1">
            {/* Discard button */}
            <button 
              type="button"
              onClick={() => { clearAudio(); onCancel(); }}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 hover:text-red-500 transition-colors"
              title="Excluir áudio"
            >
              <Trash2 className="h-5 w-5" />
            </button>

            {/* Send voice message button */}
            <Button 
              size="icon" 
              type="button"
              onClick={() => audioBlob && onSend(audioBlob, previewDuration)}
              className="rounded-full bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95 shadow-md shadow-emerald-500/10"
              title="Enviar mensagem de voz"
            >
              <Send className="h-4 w-4 fill-current text-white" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
