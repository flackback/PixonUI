import React, { useRef, useState, useEffect, useCallback } from 'react';
import { cn } from '../../utils/cn';
import { usePixonVideoPlayer } from '../../hooks/usePixonVideoPlayer';
import { useDrag } from '../../hooks/useDrag';
import { 
  Play, Pause, Volume2, VolumeX, Volume1, Maximize, Minimize, 
  Settings, Tv, Sparkles, X, RotateCcw, RotateCw, CornerDownLeft, 
  ChevronRight, ChevronLeft, Loader2, PlaySquare, Check, Copy, Link, RefreshCw, Camera, Monitor
} from 'lucide-react';

export interface VideoPlayerProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  poster?: string;
  title?: string;
  accentColor?: string;
  enableAmbientGlow?: boolean;
}

export function VideoPlayer({
  src,
  poster,
  title = "PixonUI Video Player",
  accentColor = "bg-cyan-500",
  enableAmbientGlow = true,
  className,
  ...props
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverProgressBarRef = useRef<HTMLDivElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  
  const player = usePixonVideoPlayer();
  const { 
    videoRef, isPlaying, currentTime, duration, volume, isMuted, playbackRate, 
    bufferedRanges, isBuffering, isTheaterMode, isMiniMode, isFullscreen, 
    play, pause, togglePlay, seek, setVolume, toggleMute, setPlaybackRate, 
    toggleTheaterMode, toggleMiniMode, toggleFullscreen 
  } = player;

  // Secondary video element reference to implement GPU accelerated ambient glow
  const glowVideoRef = useRef<HTMLVideoElement>(null);

  // States for interactive gestures and premium features
  const [showControls, setShowControls] = useState(true);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);
  const [leftSeekActive, setLeftSeekActive] = useState(false);
  const [rightSeekActive, setRightSeekActive] = useState(false);
  
  // Local state for active Cinema Glow to let user toggle it dynamically in Settings
  const [localAmbientGlow, setLocalAmbientGlow] = useState(enableAmbientGlow);
  
  // Quality states (Auto, 1080p, 720p, 480p)
  const [quality, setQuality] = useState<'Auto' | '1080p' | '720p' | '480p'>('Auto');
  const [isSwappingQuality, setIsSwappingQuality] = useState(false);
  
  // Custom loop state
  const [isLooping, setIsLooping] = useState(false);
  
  // Settings Popover (Nested Menu: Speed, Quality, Loops)
  const [showSettings, setShowSettings] = useState(false);
  const [settingsView, setSettingsView] = useState<'main' | 'speed' | 'quality'>('main');
  
  // Custom Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });
  const [showClipboardToast, setShowClipboardToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Constrain Draggable Miniplayer within Viewport with 12px margin
  const constrainMiniplayer = useCallback((offset: { x: number; y: number }) => {
    if (!isMiniMode) return offset;
    const minX = 12;
    const maxX = window.innerWidth - 340 - 12;
    const minY = 12;
    const maxY = window.innerHeight - 190 - 12;
    return {
      x: Math.max(minX, Math.min(offset.x, maxX)),
      y: Math.max(minY, Math.min(offset.y, maxY))
    };
  }, [isMiniMode]);

  // Drag Support for In-App Miniplayer
  const { isDragging, offset, setOffset, dragProps } = useDrag(undefined, constrainMiniplayer);

  // Handle Mini Mode coordinates snap
  useEffect(() => {
    if (isMiniMode) {
      // Position at bottom-right corner with 24px margin
      const initialX = window.innerWidth - 340 - 24;
      const initialY = window.innerHeight - 190 - 24;
      setOffset({ x: initialX, y: initialY });
    } else {
      setOffset({ x: 0, y: 0 });
    }
  }, [isMiniMode, setOffset]);

  // Synchronize loops
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.loop = isLooping;
    }
  }, [isLooping, videoRef]);

  // Sync ambientGlow prop with local toggle
  useEffect(() => {
    setLocalAmbientGlow(enableAmbientGlow);
  }, [enableAmbientGlow]);

  // Synchronize secondary ambient video with the main video
  useEffect(() => {
    const mainVideo = videoRef.current;
    const glowVideo = glowVideoRef.current;
    if (!mainVideo || !glowVideo || !localAmbientGlow) return;

    const syncPlayback = () => {
      glowVideo.currentTime = mainVideo.currentTime;
      if (mainVideo.paused) {
        glowVideo.pause();
      } else {
        glowVideo.play().catch(() => {});
      }
    };

    const handlePlay = () => {
      if (localAmbientGlow) glowVideo.play().catch(() => {});
    };
    const handlePause = () => glowVideo.pause();
    const handleSeeking = () => {
      if (localAmbientGlow) glowVideo.currentTime = mainVideo.currentTime;
    };
    const handleRateChange = () => {
      if (localAmbientGlow) glowVideo.playbackRate = mainVideo.playbackRate;
    };

    mainVideo.addEventListener('play', handlePlay);
    mainVideo.addEventListener('pause', handlePause);
    mainVideo.addEventListener('seeking', handleSeeking);
    mainVideo.addEventListener('ratechange', handleRateChange);

    const syncInterval = setInterval(syncPlayback, 1000);

    return () => {
      mainVideo.removeEventListener('play', handlePlay);
      mainVideo.removeEventListener('pause', handlePause);
      mainVideo.removeEventListener('seeking', handleSeeking);
      mainVideo.removeEventListener('ratechange', handleRateChange);
      clearInterval(syncInterval);
    };
  }, [videoRef, localAmbientGlow, isPlaying]);

  // Handle controls visibility timer
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSettings(false);
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
      setShowSettings(false);
    }
  };

  // Close context menus on click away
  useEffect(() => {
    const closeAllPopups = () => {
      setContextMenu(prev => prev.visible ? { ...prev, visible: false } : prev);
    };
    window.addEventListener('click', closeAllPopups);
    return () => window.removeEventListener('click', closeAllPopups);
  }, []);

  // Double-click Seek Gestures (Left & Right 40% active zones)
  const handleOverlayClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const clickPercent = clickX / width;

    if (e.detail === 2) { // Double click detected
      if (clickPercent < 0.4) {
        // Double clicked left 40% -> Seek backward 10s
        seek(currentTime - 10);
        setLeftSeekActive(true);
        setTimeout(() => setLeftSeekActive(false), 800);
      } else if (clickPercent > 0.6) {
        // Double clicked right 40% -> Seek forward 10s
        seek(currentTime + 10);
        setRightSeekActive(true);
        setTimeout(() => setRightSeekActive(false), 800);
      } else {
        // Double clicked center 20% -> Toggle fullscreen!
        toggleFullscreen(containerRef.current);
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

  // Hover Seek Progress Calculation and Live Video Preview frame Sync
  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hoverProgressBarRef.current || duration === 0) return;
    const rect = hoverProgressBarRef.current.getBoundingClientRect();
    const hoverX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = hoverX / rect.width;
    const calculatedTime = percent * duration;

    setHoverTime(calculatedTime);
    setHoverPosition(hoverX);

    // Sync Live Video frame preview
    if (previewVideoRef.current) {
      previewVideoRef.current.currentTime = calculatedTime;
    }
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

  // Custom Video Quality Switcher (Simulates buffering / CDN transition)
  const handleQualityChange = (newQuality: typeof quality) => {
    if (newQuality === quality) return;
    setIsSwappingQuality(true);
    setQuality(newQuality);
    
    const wasPlaying = isPlaying;
    const savedTime = videoRef.current ? videoRef.current.currentTime : currentTime;
    
    // Pause main and glow videos
    if (videoRef.current) videoRef.current.pause();
    if (glowVideoRef.current) glowVideoRef.current.pause();

    setTimeout(() => {
      setIsSwappingQuality(false);
      if (videoRef.current) {
        videoRef.current.currentTime = savedTime;
        if (wasPlaying) {
          videoRef.current.play().catch(() => {});
        }
      }
    }, 600);
  };

  // Custom Context Menu Right Click Interceptor with Collision Avoidance
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Dimensions of the context menu (w-52 is 208px, max-height with 7 items is ~310px)
    const menuWidth = 208;
    const menuHeight = 310;

    // Check if x coordinate + menuWidth overflows the container width
    const x = clickX + menuWidth > rect.width ? rect.width - menuWidth - 8 : clickX;

    // Check if y coordinate + menuHeight overflows the container height
    const y = clickY + menuHeight > rect.height ? rect.height - menuHeight - 8 : clickY;

    setContextMenu({
      x: Math.max(8, x),
      y: Math.max(8, y),
      visible: true
    });
  };

  // Copy URL with elegant toast notification
  const handleCopyURL = (e: React.MouseEvent) => {
    e.stopPropagation();
    setContextMenu(p => ({ ...p, visible: false }));
    navigator.clipboard.writeText(window.location.href);
    setToastMessage('Link copiado para a área de transferência!');
    setShowClipboardToast(true);
    setTimeout(() => setShowClipboardToast(false), 2000);
  };

  // Capture Frame Screenshot (CORS-friendly defensive code)
  const handleScreenshot = (e: React.MouseEvent) => {
    e.stopPropagation();
    setContextMenu(p => ({ ...p, visible: false }));
    const video = videoRef.current;
    if (!video) return;
    
    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `pixon_frame_${Math.floor(video.currentTime)}s.png`;
        a.click();
        setToastMessage('Frame capturado e salvo como PNG!');
        setShowClipboardToast(true);
        setTimeout(() => setShowClipboardToast(false), 2000);
      }
    } catch (err) {
      console.error('PixonVideoPlayer: Failed to capture frame due to security/CORS bounds:', err);
      setToastMessage('Erro de segurança CORS ao capturar frame!');
      setShowClipboardToast(true);
      setTimeout(() => setShowClipboardToast(false), 3000);
    }
  };

  // Native Browser Picture-In-Picture API handler
  const handleBrowserPiP = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (video.requestPictureInPicture) {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.error('PixonVideoPlayer: Picture-in-Picture request failed:', err);
    }
  };

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
    <>
      {/* Original Layout Flow Placeholder Card (Rendered only when mini mode is active to prevent page collapse) */}
      {isMiniMode && (
        <div className={cn(
          "w-full aspect-video rounded-3xl border border-white/5 bg-zinc-950/40 flex flex-col items-center justify-center gap-3 text-center p-6 select-none animate-in fade-in zoom-in-95",
          className
        )}>
          <div className="h-12 w-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 animate-pulse">
            <PlaySquare className="h-6 w-6" />
          </div>
          <div className="space-y-1 px-4">
            <p className="text-sm font-bold text-white">Vídeo em modo flutuante</p>
            <p className="text-xs text-zinc-400 max-w-xs truncate">{title}</p>
          </div>
          <button 
            onClick={toggleMiniMode}
            className="mt-1 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition-all active:scale-95"
          >
            Restaurar Player
          </button>
        </div>
      )}

      {/* Actual Video Player Frame (Floats fixed if isMiniMode is active) */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onContextMenu={handleContextMenu}
        className={cn(
          "relative transition-all duration-500 ease-out flex items-center justify-center group font-sans select-none overflow-hidden",
          isTheaterMode 
            ? "w-full max-h-[70vh] aspect-[21/9] rounded-none z-30" 
            : "w-full aspect-video rounded-3xl z-10",
          isMiniMode && [
            "fixed w-[340px] h-[190px] rounded-2xl z-50 shadow-2xl border border-white/10 bg-black/85 overflow-hidden transition-shadow",
            isDragging && "shadow-cyan-500/25"
          ],
          !isMiniMode && className
        )}
        style={isMiniMode ? {
          top: 0,
          left: 0,
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
          ...dragProps.style
        } : undefined}
        {...props}
      >
        {/* Dynamic Ambient Glow Backplate (Off-Thread GPU Mirroring) */}
        {localAmbientGlow && !isMiniMode && (
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

          {/* Buffering or Quality Swapping Loader Overlay */}
          {(isBuffering || isSwappingQuality) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px] z-20 pointer-events-none">
              <div className="flex flex-col items-center gap-2 animate-in fade-in zoom-in-95">
                <Loader2 className="h-10 w-10 text-cyan-400 animate-spin" />
                <span className="text-xs text-white/80 font-bold tracking-wide">
                  {isSwappingQuality ? `Alternando para ${quality}...` : "Carregando..."}
                </span>
              </div>
            </div>
          )}

          {/* Drag Handle Overlay for Mini Mode */}
          {isMiniMode && (
            <div 
              {...dragProps}
              className="absolute inset-0 bg-transparent cursor-grab active:cursor-grabbing z-20 flex items-center justify-center"
              onClick={(e) => {
                if (e.detail === 1) togglePlay();
              }}
            />
          )}

          {/* Double-Click Seek Indicators (Left & Right Overlay) */}
          <div className="absolute inset-0 w-full h-full flex z-20 pointer-events-none">
            <div className={cn(
              "w-[40%] h-full flex flex-col items-center justify-center bg-gradient-to-r from-black/40 to-transparent transition-opacity duration-300",
              leftSeekActive ? "opacity-100 animate-pulse" : "opacity-0"
            )}>
              <div className="p-4 rounded-full bg-white/10 backdrop-blur-md flex flex-col items-center gap-1 scale-90">
                <RotateCcw className="h-6 w-6 text-white animate-bounce" />
                <span className="text-xs font-bold text-white">-10s</span>
              </div>
            </div>

            <div className="flex-1" />

            <div className={cn(
              "w-[40%] h-full flex flex-col items-center justify-center bg-gradient-to-l from-black/40 to-transparent transition-opacity duration-300",
              rightSeekActive ? "opacity-100 animate-pulse" : "opacity-0"
            )}>
              <div className="p-4 rounded-full bg-white/10 backdrop-blur-md flex flex-col items-center gap-1 scale-90">
                <RotateCw className="h-6 w-6 text-white animate-bounce" />
                <span className="text-xs font-bold text-white">+10s</span>
              </div>
            </div>
          </div>

          {/* Custom Context Menu */}
          {contextMenu.visible && (
            <div 
              style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
              className="absolute bg-zinc-950/95 border border-white/10 shadow-2xl rounded-2xl p-1.5 w-52 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => { togglePlay(); setContextMenu(p => ({ ...p, visible: false })); }}
                className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-white/10 rounded-lg text-white flex items-center justify-between"
              >
                <span>{isPlaying ? 'Pausar Vídeo' : 'Reproduzir Vídeo'}</span>
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </button>

              <button 
                onClick={() => { toggleMute(); setContextMenu(p => ({ ...p, visible: false })); }}
                className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-white/10 rounded-lg text-white flex items-center justify-between"
              >
                <span>{isMuted ? 'Desmutar Áudio' : 'Mutar Áudio'}</span>
                {isMuted ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              </button>

              <div className="h-px bg-white/10 my-1" />

              <button 
                onClick={() => { handleQualityChange(quality === '1080p' ? '720p' : '1080p'); setContextMenu(p => ({ ...p, visible: false })); }}
                className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-white/10 rounded-lg text-white flex items-center justify-between"
              >
                <span>Qualidade ({quality})</span>
                <Settings className="h-3.5 w-3.5" />
              </button>

              <button 
                onClick={() => { setIsLooping(!isLooping); setContextMenu(p => ({ ...p, visible: false })); }}
                className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-white/10 rounded-lg text-white flex items-center justify-between"
              >
                <span>Repetir em Loop</span>
                {isLooping ? <Check className="h-4 w-4 text-cyan-400" /> : <RefreshCw className="h-3.5 w-3.5 text-zinc-500" />}
              </button>

              <button 
                onClick={handleScreenshot}
                className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-white/10 rounded-lg text-white flex items-center justify-between"
              >
                <span>Capturar Screenshot</span>
                <Camera className="h-3.5 w-3.5 text-zinc-400" />
              </button>

              <button 
                onClick={() => { toggleMiniMode(); setContextMenu(p => ({ ...p, visible: false })); }}
                className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-white/10 rounded-lg text-white flex items-center justify-between"
              >
                <span>Miniplayer Flutuante</span>
                <PlaySquare className="h-3.5 w-3.5" />
              </button>

              <div className="h-px bg-white/10 my-1" />

              <button 
                onClick={handleCopyURL}
                className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-white/10 rounded-lg text-white flex items-center justify-between"
              >
                <span>Copiar link do vídeo</span>
                <Copy className="h-3.5 w-3.5" />
              </button>

              <div className="px-3 py-1.5 text-[9px] font-extrabold text-zinc-500 text-center tracking-wider uppercase">
                PixonUI Media v1.2
              </div>
            </div>
          )}

          {/* Temporary Custom Toast */}
          {showClipboardToast && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-cyan-500 text-black px-4 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-lg shadow-cyan-500/25 animate-in fade-in slide-in-from-top-3 z-50">
              {toastMessage}
            </div>
          )}

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
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                    title="Expandir Player"
                  >
                    <CornerDownLeft className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); pause(); toggleMiniMode(); }} 
                    className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-all"
                    title="Fechar"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {localAmbientGlow && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] text-cyan-300 font-bold drop-shadow-sm animate-pulse">
                      <Sparkles className="h-3 w-3" />
                      Cinema Glow
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Middle Floating Play/Pause trigger button (large, standard cinema look) */}
            {!isMiniMode ? (
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
            ) : (
              /* Simple hover Play Overlay for Mini Mode */
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                <button className="h-10 w-10 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center">
                  {isPlaying ? <Pause className="h-5 w-5 fill-white" /> : <Play className="h-5 w-5 fill-white ml-0.5" />}
                </button>
              </div>
            )}

            {/* Bottom Toolbar Area */}
            <div className="space-y-3 z-40">
              {/* Interactive Timeline Seek Bar */}
              {!isMiniMode ? (
                <div 
                  ref={hoverProgressBarRef}
                  onMouseMove={handleProgressHover}
                  onMouseLeave={handleProgressHoverLeave}
                  onClick={handleProgressClick}
                  className="relative h-1.5 w-full bg-white/20 hover:h-2 rounded-full cursor-pointer transition-all flex items-center group/timeline h-1.5"
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

                  {/* Played active progress */}
                  <div 
                    style={{ width: `${currentPercent}%` }}
                    className={cn("absolute top-0 bottom-0 rounded-full flex items-center justify-end", accentColor)}
                  >
                    {/* Micro-handle scrubbing indicator */}
                    <div className="w-3.5 h-3.5 rounded-full bg-white shadow-md border scale-0 group-hover/timeline:scale-100 transition-transform absolute -right-1.5 bg-cyan-400" />
                  </div>

                  {/* Live Seek Preview Frame & Time Tooltip */}
                  {hoverTime !== null && (
                    <div
                      style={{ left: `${hoverPosition}px` }}
                      className="absolute bottom-6 -translate-x-1/2 p-1.5 rounded-2xl bg-zinc-950/95 border border-white/10 flex flex-col items-center gap-1.5 shadow-2xl pointer-events-none whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 z-50 w-36"
                    >
                      {/* Real-time sync hidden frame viewport */}
                      <div className="w-full aspect-video rounded-lg overflow-hidden bg-black border border-white/5 relative">
                        <video
                          ref={previewVideoRef}
                          src={src}
                          muted
                          playsInline
                          preload="auto"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[10px] font-bold text-white tracking-wide">
                        {formatTime(hoverTime)}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                /* Compact non-interactive progress bar at the absolute bottom of miniplayer */
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
                  <div 
                    style={{ width: `${currentPercent}%` }}
                    className={cn("h-full transition-all duration-300", accentColor)}
                  />
                </div>
              )}

              {/* Bottom Controls Buttons */}
              {!isMiniMode && (
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
                    <div className="text-xs font-semibold text-white/90 drop-shadow flex items-center gap-1.5">
                      <span>{formatTime(currentTime)}</span>
                      <span className="opacity-40">/</span>
                      <span className="opacity-60">{formatTime(duration)}</span>
                    </div>

                    {/* Sound Control Slider */}
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
                  </div>

                  {/* Right Group: Playback settings popover, Theater & Fullscreen Modes */}
                  <div className="flex items-center gap-1.5 relative">
                    
                    {/* Dynamic Cinematic Settings Popover */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          setShowSettings(!showSettings);
                          setSettingsView('main');
                        }}
                        className={cn(
                          "p-1.5 rounded-lg hover:bg-white/10 text-white transition-all flex items-center gap-1 text-xs font-bold",
                          showSettings && "bg-white/15"
                        )}
                        title="Configurações"
                      >
                        <Settings className="h-4 w-4" />
                      </button>

                      {/* Nested Glassmorphic Settings Menu */}
                      {showSettings && (
                        <div className="absolute bottom-11 right-0 py-2.5 rounded-2xl bg-zinc-950/95 border border-white/10 text-white shadow-2xl z-50 w-56 text-left animate-in fade-in slide-in-from-bottom-2 backdrop-blur-xl">
                          
                          {/* VIEW 0: MAIN PANEL */}
                          {settingsView === 'main' && (
                            <div className="space-y-1">
                              <div className="px-3.5 py-1 text-[9px] uppercase font-bold tracking-wider opacity-40 mb-1">
                                Ajustes de Mídia
                              </div>
                              
                              {/* Toggle Cinema Glow */}
                              <button
                                onClick={() => setLocalAmbientGlow(!localAmbientGlow)}
                                className="w-full text-left px-3.5 py-2 text-xs hover:bg-white/10 flex items-center justify-between"
                              >
                                <span className="font-semibold text-white/90">Cinema Ambient Glow</span>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-cyan-400">
                                  <span>{localAmbientGlow ? 'Ativo' : 'Inativo'}</span>
                                  {localAmbientGlow && <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />}
                                </div>
                              </button>

                              {/* Toggle Loop */}
                              <button
                                onClick={() => setIsLooping(!isLooping)}
                                className="w-full text-left px-3.5 py-2 text-xs hover:bg-white/10 flex items-center justify-between"
                              >
                                <span className="font-semibold text-white/90">Repetir em Loop</span>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-cyan-400">
                                  <span>{isLooping ? 'Sim' : 'Não'}</span>
                                </div>
                              </button>

                              {/* Playback Speed Trigger */}
                              <button
                                onClick={() => setSettingsView('speed')}
                                className="w-full text-left px-3.5 py-2 text-xs hover:bg-white/10 flex items-center justify-between"
                              >
                                <span className="font-semibold text-white/90">Velocidade</span>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-white/50">
                                  <span>{playbackRate === 1 ? 'Normal' : `${playbackRate}x`}</span>
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </div>
                              </button>

                              {/* Quality Trigger */}
                              <button
                                onClick={() => setSettingsView('quality')}
                                className="w-full text-left px-3.5 py-2 text-xs hover:bg-white/10 flex items-center justify-between"
                              >
                                <span className="font-semibold text-white/90">Qualidade</span>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-white/50">
                                  <span>{quality}</span>
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </div>
                              </button>
                            </div>
                          )}

                          {/* VIEW 1: SPEED PANEL */}
                          {settingsView === 'speed' && (
                            <div className="space-y-1 animate-in slide-in-from-right-3 duration-200">
                              <button
                                onClick={() => setSettingsView('main')}
                                className="w-full text-left px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-cyan-400 flex items-center gap-1 hover:text-cyan-300"
                              >
                                <ChevronLeft className="h-3.5 w-3.5" />
                                <span>Voltar</span>
                              </button>
                              <div className="h-px bg-white/10 my-1" />
                              {[0.25, 0.5, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                                <button
                                  key={rate}
                                  onClick={() => {
                                    setPlaybackRate(rate);
                                    setShowSettings(false);
                                  }}
                                  className={cn(
                                    "w-full text-left px-4 py-1.5 text-xs hover:bg-white/10 flex items-center justify-between",
                                    playbackRate === rate ? "text-cyan-400 font-bold" : "text-white/85"
                                  )}
                                >
                                  <span>{rate === 1.0 ? 'Normal' : `${rate}x`}</span>
                                  {playbackRate === rate && <Check className="h-3.5 w-3.5" />}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* VIEW 2: QUALITY PANEL */}
                          {settingsView === 'quality' && (
                            <div className="space-y-1 animate-in slide-in-from-right-3 duration-200">
                              <button
                                onClick={() => setSettingsView('main')}
                                className="w-full text-left px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-cyan-400 flex items-center gap-1 hover:text-cyan-300"
                              >
                                <ChevronLeft className="h-3.5 w-3.5" />
                                <span>Voltar</span>
                              </button>
                              <div className="h-px bg-white/10 my-1" />
                              {(['Auto', '1080p', '720p', '480p'] as typeof quality[]).map((q) => (
                                <button
                                  key={q}
                                  onClick={() => {
                                    handleQualityChange(q);
                                    setShowSettings(false);
                                  }}
                                  className={cn(
                                    "w-full text-left px-4 py-1.5 text-xs hover:bg-white/10 flex items-center justify-between",
                                    quality === q ? "text-cyan-400 font-bold" : "text-white/85"
                                  )}
                                >
                                  <span>{q}</span>
                                  {quality === q && <Check className="h-3.5 w-3.5" />}
                                </button>
                              ))}
                            </div>
                          )}

                        </div>
                      )}
                    </div>

                    {/* In-App Miniplayer floating selector */}
                    <button
                      onClick={toggleMiniMode}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-all"
                      title="Floating Miniplayer (In-App)"
                    >
                      <PlaySquare className="h-4 w-4" />
                    </button>

                    {/* Native Browser Picture-In-Picture trigger button */}
                    <button
                      onClick={handleBrowserPiP}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-all"
                      title="Picture-in-Picture do Navegador"
                    >
                      <Monitor className="h-4 w-4" />
                    </button>

                    {/* Theater Cinema Layout Option */}
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
              )}
            </div>

          </div>

        </div>
      </div>
    </>
  );
}
