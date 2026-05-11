import React, { useRef, useState, useEffect, useCallback } from 'react';
import { cn } from '../../utils/cn';
import { usePixonVideoPlayer } from '../../hooks/usePixonVideoPlayer';
import { useDrag } from '../../hooks/useDrag';
import { Surface } from '../../primitives/Surface';
import { 
  Play, Pause, Volume2, VolumeX, Volume1, Maximize, Minimize, 
  Settings, Tv, Sparkles, X, RotateCcw, RotateCw, CornerDownLeft, 
  ChevronRight, ArrowLeft, ArrowRight, Loader2, PlaySquare
} from 'lucide-react';

export interface VideoPlayerProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  poster?: string;
  title?: string;
  accentColor?: string; // e.g. "from-cyan-500 to-blue-600"
  enableAmbientGlow?: boolean;
}

export function VideoPlayer({
  src,
  poster,
  title = "PixonUI Video Player",
  accentColor = "bg-blue-500",
  enableAmbientGlow = true,
  className,
  ...props
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverProgressBarRef = useRef<HTMLDivElement>(null);
  
  const player = usePixonVideoPlayer();
  const { videoRef, isPlaying, currentTime, duration, volume, isMuted, playbackRate, bufferedRanges, isBuffering, isTheaterMode, isMiniMode, isFullscreen, play, pause, togglePlay, seek, setVolume, toggleMute, setPlaybackRate, toggleTheaterMode, toggleMiniMode, toggleFullscreen } = player;

  // Secondary video element reference to implement GPU accelerated ambient glow
  const glowVideoRef = useRef<HTMLVideoElement>(null);

  // States for interactive gestures
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);
  const [leftSeekActive, setLeftSeekActive] = useState(false);
  const [rightSeekActive, setRightSeekActive] = useState(false);
  
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize secondary ambient video with the main video
  useEffect(() => {
    const mainVideo = videoRef.current;
    const glowVideo = glowVideoRef.current;
    if (!mainVideo || !glowVideo || !enableAmbientGlow) return;

    const syncPlayback = () => {
      glowVideo.currentTime = mainVideo.currentTime;
      if (mainVideo.paused) {
        glowVideo.pause();
      } else {
        glowVideo.play().catch(() => {});
      }
    };

    const handlePlay = () => glowVideo.play().catch(() => {});
    const handlePause = () => glowVideo.pause();
    const handleSeeking = () => {
      glowVideo.currentTime = mainVideo.currentTime;
    };
    const handleRateChange = () => {
      glowVideo.playbackRate = mainVideo.playbackRate;
    };

    mainVideo.addEventListener('play', handlePlay);
    mainVideo.addEventListener('pause', handlePause);
    mainVideo.addEventListener('seeking', handleSeeking);
    mainVideo.addEventListener('ratechange', handleRateChange);

    // Occasional clock sync
    const syncInterval = setInterval(syncPlayback, 1000);

    return () => {
      mainVideo.removeEventListener('play', handlePlay);
      mainVideo.removeEventListener('pause', handlePause);
      mainVideo.removeEventListener('seeking', handleSeeking);
      mainVideo.removeEventListener('ratechange', handleRateChange);
      clearInterval(syncInterval);
    };
  }, [videoRef, enableAmbientGlow, isPlaying]);

  // Handle controls visibility timer
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSpeedMenu(false);
      }, 2500);
    }
  }, [isPlaying]);

  useEffect(() => {
    resetControlsTimer();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [resetControlsTimer, isPlaying]);

  const handleMouseMove = () => {
    resetControlsTimer();
  };

  const handleMouseLeave = () => {
    if (isPlaying) {
      setShowControls(false);
      setShowSpeedMenu(false);
    }
  };

  // Double-click Seek Gestures (Left & Right 30%)
  const handleOverlayClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const clickPercent = clickX / width;

    if (e.detail === 2) { // Double click detected
      if (clickPercent < 0.3) {
        // Double clicked left 30% -> Seek backward 10s
        seek(currentTime - 10);
        setLeftSeekActive(true);
        setTimeout(() => setLeftSeekActive(false), 800);
      } else if (clickPercent > 0.7) {
        // Double clicked right 30% -> Seek forward 10s
        seek(currentTime + 10);
        setRightSeekActive(true);
        setTimeout(() => setRightSeekActive(false), 800);
      }
    } else {
      // Single click: toggle play/pause
      const timer = setTimeout(() => {
        if (e.detail === 1) {
          togglePlay();
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  };

  // Hover Seek Progress Calculation
  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hoverProgressBarRef.current || duration === 0) return;
    const rect = hoverProgressBarRef.current.getBoundingClientRect();
    const hoverX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = hoverX / rect.width;
    const calculatedTime = percent * duration;

    setHoverTime(calculatedTime);
    setHoverPosition(hoverX);
  };

  const handleProgressHoverLeave = () => {
    setHoverTime(null);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hoverProgressBarRef.current || duration === 0) return;
    const rect = hoverProgressBarRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = clickX / rect.width;
    seek(percent * duration);
  };

  // Drag Support for In-App Miniplayer
  const { isDragging, offset, dragProps } = useDrag();

  // Format seconds to mm:ss / hh:mm:ss
  const formatTime = (time: number) => {
    if (isNaN(time) || time === Infinity) return "00:00";
    const hrs = Math.floor(time / 3600);
    const mins = Math.floor((time % 3600) / 60);
    const secs = Math.floor(time % 60);

    const formattedMins = mins.toString().padStart(2, '0');
    const formattedSecs = secs.toString().padStart(2, '0');

    if (hrs > 0) {
      return `${hrs}:${formattedMins}:${formattedSecs}`;
    }
    return `${formattedMins}:${formattedSecs}`;
  };

  const currentPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative transition-all duration-500 ease-out flex items-center justify-center group font-sans select-none overflow-hidden",
        isTheaterMode 
          ? "w-full max-h-[70vh] aspect-[21/9] rounded-none z-30" 
          : "w-full aspect-video rounded-3xl z-10",
        isMiniMode && [
          "fixed bottom-6 right-6 w-[340px] h-[190px] aspect-video rounded-2xl z-50 shadow-2xl border border-white/10 overflow-hidden bg-black/80 transition-shadow",
          isDragging && "shadow-cyan-500/10"
        ],
        className
      )}
      style={isMiniMode ? {
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        ...dragProps.style
      } : undefined}
      {...props}
    >
      {/* Dynamic Ambient Glow Backplate (Off-Thread GPU Mirroring) */}
      {enableAmbientGlow && !isMiniMode && (
        <div className="absolute inset-0 w-full h-full pointer-events-none scale-[1.08] blur-[80px] opacity-45 dark:opacity-40 transition-opacity duration-700 select-none z-0">
          <video
            ref={glowVideoRef}
            src={src}
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Main Video Wrapper */}
      <div className="relative w-full h-full bg-black z-10 flex items-center justify-center">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          playsInline
          preload="auto"
          className="w-full h-full object-contain"
          onClick={handleOverlayClick}
        />

        {/* Buffering Loader Overlay */}
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] z-20 pointer-events-none">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-10 w-10 text-cyan-400 animate-spin" />
              <span className="text-xs text-white/80 font-medium">Carregando...</span>
            </div>
          </div>
        )}

        {/* Drag Handle Overlay for Mini Mode */}
        {isMiniMode && (
          <div 
            {...dragProps}
            className="absolute inset-0 bg-transparent cursor-grab active:cursor-grabbing z-20"
            onClick={togglePlay}
          />
        )}

        {/* Double-Click Seek Indicators (Left & Right Overlay) */}
        <div className="absolute inset-0 w-full h-full flex z-20 pointer-events-none">
          {/* Left Seek active effect */}
          <div className={cn(
            "w-[30%] h-full flex flex-col items-center justify-center bg-gradient-to-r from-black/40 to-transparent transition-opacity duration-300",
            leftSeekActive ? "opacity-100 animate-pulse" : "opacity-0"
          )}>
            <div className="p-4 rounded-full bg-white/10 backdrop-blur-md flex flex-col items-center gap-1 scale-90">
              <RotateCcw className="h-6 w-6 text-white animate-bounce" />
              <span className="text-xs font-bold text-white">-10s</span>
            </div>
          </div>

          <div className="flex-1" />

          {/* Right Seek active effect */}
          <div className={cn(
            "w-[30%] h-full flex flex-col items-center justify-center bg-gradient-to-l from-black/40 to-transparent transition-opacity duration-300",
            rightSeekActive ? "opacity-100 animate-pulse" : "opacity-0"
          )}>
            <div className="p-4 rounded-full bg-white/10 backdrop-blur-md flex flex-col items-center gap-1 scale-90">
              <RotateCw className="h-6 w-6 text-white animate-bounce" />
              <span className="text-xs font-bold text-white">+10s</span>
            </div>
          </div>
        </div>

        {/* Video Controls Overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30 flex flex-col justify-between p-4 transition-all duration-300 z-30",
          showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none",
          isMiniMode && "p-2"
        )}>
          
          {/* Top Header Controls */}
          <div className="flex items-center justify-between">
            <span className={cn(
              "text-sm font-semibold text-white drop-shadow-md truncate max-w-[70%]",
              isMiniMode && "text-xs"
            )}>
              {title}
            </span>

            {/* Mini Mode Control Toolbar */}
            {isMiniMode ? (
              <div className="flex items-center gap-1.5 z-40">
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleMiniMode(); }} 
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                  title="Expandir Player"
                >
                  <CornerDownLeft className="h-3 w-3" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); pause(); toggleMiniMode(); }} 
                  className="p-1 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-all"
                  title="Fechar"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {enableAmbientGlow && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] text-cyan-300 font-bold drop-shadow-sm animate-pulse">
                    <Sparkles className="h-3 w-3" />
                    Cinema Glow
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Middle Floating Play/Pause trigger button (large, standard cinema look) */}
          {!isMiniMode && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <button
                onClick={togglePlay}
                className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 backdrop-blur-md text-white flex items-center justify-center transition-all shadow-lg shadow-black/25 z-40"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6 fill-white" />
                ) : (
                  <Play className="h-6 w-6 fill-white ml-0.5" />
                )}
              </button>
            </div>
          )}

          {/* Bottom Toolbar Area */}
          <div className="space-y-3 z-40">
            {/* Interactive Timeline Seek Bar */}
            <div 
              ref={hoverProgressBarRef}
              onMouseMove={handleProgressHover}
              onMouseLeave={handleProgressHoverLeave}
              onClick={handleProgressClick}
              className={cn(
                "relative h-1.5 w-full bg-white/20 hover:h-2 rounded-full cursor-pointer transition-all flex items-center",
                isMiniMode ? "h-1" : "h-1.5"
              )}
            >
              {/* High-Precision Buffering Ranges (Multiple segmented loading bars) */}
              {bufferedRanges.map((range, idx) => {
                if (duration === 0) return null;
                const left = (range.start / duration) * 100;
                const width = ((range.end - range.start) / duration) * 100;
                return (
                  <div
                    key={idx}
                    style={{ left: `${left}%`, width: `${width}%` }}
                    className="absolute top-0 bottom-0 bg-white/30 rounded-full pointer-events-none"
                  />
                );
              })}

              {/* Played active progress progress */}
              <div 
                style={{ width: `${currentPercent}%` }}
                className={cn("absolute top-0 bottom-0 rounded-full flex items-center justify-end", accentColor)}
              >
                {/* Micro-handle scrubbing indicator */}
                {!isMiniMode && (
                  <div className={cn("w-3.5 h-3.5 rounded-full bg-white shadow-md border scale-0 group-hover/progress:scale-100 transition-transform absolute -right-1.5", accentColor)} />
                )}
              </div>

              {/* Seek Preview Time Tooltip */}
              {hoverTime !== null && !isMiniMode && (
                <div
                  style={{ left: `${hoverPosition}px` }}
                  className="absolute bottom-4 -translate-x-1/2 px-2.5 py-1 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 text-[10px] text-white font-bold pointer-events-none shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-bottom-1"
                >
                  {formatTime(hoverTime)}
                </div>
              )}
            </div>

            {/* Bottom Controls Buttons */}
            <div className="flex items-center justify-between">
              
              {/* Left Group: Playback controls, Time and Volume */}
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="p-1.5 rounded-lg text-white hover:bg-white/10 transition-all"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5 fill-white" />
                  ) : (
                    <Play className="h-5 w-5 fill-white ml-0.5" />
                  )}
                </button>

                {/* Time Display */}
                {!isMiniMode && (
                  <div className="text-xs font-semibold text-white/90 drop-shadow flex items-center gap-1.5">
                    <span>{formatTime(currentTime)}</span>
                    <span className="opacity-40">/</span>
                    <span className="opacity-60">{formatTime(duration)}</span>
                  </div>
                )}

                {/* Sound Control Slider */}
                {!isMiniMode && (
                  <div className="flex items-center gap-2 group/volume">
                    <button
                      onClick={toggleMute}
                      className="p-1.5 rounded-lg text-white hover:bg-white/10 transition-all"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="h-5 w-5" />
                      ) : volume < 0.5 ? (
                        <Volume1 className="h-5 w-5" />
                      ) : (
                        <Volume2 className="h-5 w-5" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-16 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white transition-opacity group-hover/volume:w-20 opacity-0 group-hover/volume:opacity-100 overflow-hidden"
                    />
                  </div>
                )}
              </div>

              {/* Right Group: Playback speed, Theater & Fullscreen Modes */}
              <div className="flex items-center gap-1.5 relative">
                
                {/* Speed selector controls popover trigger */}
                {!isMiniMode && (
                  <div className="relative">
                    <button
                      onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                      className={cn(
                        "p-1.5 rounded-lg hover:bg-white/10 text-white transition-all flex items-center gap-1 text-xs font-bold",
                        showSpeedMenu && "bg-white/15"
                      )}
                      title="Velocidade de Reprodução"
                    >
                      <Settings className="h-4 w-4" />
                      <span>{playbackRate}x</span>
                    </button>

                    {/* Glass Speed Panel */}
                    {showSpeedMenu && (
                      <div className="absolute bottom-10 right-0 py-1.5 rounded-xl bg-black/90 backdrop-blur-lg border border-white/10 text-white shadow-xl z-50 w-28 text-left animate-in fade-in slide-in-from-bottom-2">
                        <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider opacity-40 mb-1">
                          Velocidade
                        </div>
                        {[0.25, 0.5, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                          <button
                            key={rate}
                            onClick={() => {
                              setPlaybackRate(rate);
                              setShowSpeedMenu(false);
                            }}
                            className={cn(
                              "w-full text-left px-3 py-1 text-xs hover:bg-white/10 flex items-center justify-between",
                              playbackRate === rate ? "text-cyan-400 font-bold" : "text-white/80"
                            )}
                          >
                            <span>{rate === 1.0 ? 'Normal' : `${rate}x`}</span>
                            {playbackRate === rate && <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* In-App Miniplayer floating selector */}
                {!isMiniMode && (
                  <button
                    onClick={toggleMiniMode}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-all"
                    title="Floating Miniplayer (In-App)"
                  >
                    <PlaySquare className="h-4 w-4" />
                  </button>
                )}

                {/* Theater Cinema Layout Option */}
                {!isMiniMode && (
                  <button
                    onClick={toggleTheaterMode}
                    className={cn(
                      "p-1.5 rounded-lg hover:bg-white/10 text-white transition-all",
                      isTheaterMode && "text-cyan-400"
                    )}
                    title={isTheaterMode ? "Modo Normal (t)" : "Modo Cinema (t)"}
                  >
                    <Tv className="h-4 w-4" />
                  </button>
                )}

                {/* Fullscreen Option */}
                <button
                  onClick={() => toggleFullscreen(containerRef.current)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-all"
                  title="Tela Cheia (f)"
                >
                  {isFullscreen ? (
                    <Minimize className="h-4 w-4" />
                  ) : (
                    <Maximize className="h-4 w-4" />
                  )}
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
