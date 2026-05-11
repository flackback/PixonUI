import { useState, useEffect, useRef, useCallback } from 'react';

export interface BufferedRange {
  start: number;
  end: number;
}

export function usePixonVideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [bufferedRanges, setBufferedRanges] = useState<BufferedRange[]>([]);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isMiniMode, setIsMiniMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Synchronize play state
  const play = useCallback(async () => {
    if (videoRef.current) {
      try {
        await videoRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('PixonVideoPlayer: Playback initiation failed:', err);
        }
      }
    }
  }, []);

  const pause = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  // Seek to specific time
  const seek = useCallback((time: number) => {
    if (videoRef.current) {
      const clampedTime = Math.max(0, Math.min(time, duration));
      videoRef.current.currentTime = clampedTime;
      setCurrentTime(clampedTime);
    }
  }, [duration]);

  // Adjust volume
  const setVolume = useCallback((vol: number) => {
    if (videoRef.current) {
      const clampedVol = Math.max(0, Math.min(vol, 1));
      videoRef.current.volume = clampedVol;
      setVolumeState(clampedVol);
      if (clampedVol > 0 && isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      const targetMute = !isMuted;
      videoRef.current.muted = targetMute;
      setIsMuted(targetMute);
    }
  }, [isMuted]);

  const setPlaybackRate = useCallback((rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRateState(rate);
    }
  }, []);

  const toggleTheaterMode = useCallback(() => {
    setIsTheaterMode(prev => !prev);
    if (isMiniMode) setIsMiniMode(false);
  }, [isMiniMode]);

  const toggleMiniMode = useCallback(() => {
    setIsMiniMode(prev => !prev);
    if (isTheaterMode) setIsTheaterMode(false);
  }, [isTheaterMode]);

  // Native fullscreen toggle
  const toggleFullscreen = useCallback(async (containerElement?: HTMLElement | null) => {
    const target = containerElement || videoRef.current;
    if (!target) return;

    try {
      if (!document.fullscreenElement) {
        if (target.requestFullscreen) {
          await target.requestFullscreen();
        } else if ((target as any).webkitRequestFullscreen) {
          await (target as any).webkitRequestFullscreen(); // Safari support
        } else if ((target as any).msRequestFullscreen) {
          await (target as any).msRequestFullscreen(); // IE11 support
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('PixonVideoPlayer: Fullscreen toggle failed:', err);
    }
  }, []);

  // Update buffer segments in real-time
  const updateBufferRanges = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const buffered = video.buffered;
    const ranges: BufferedRange[] = [];
    for (let i = 0; i < buffered.length; i++) {
      ranges.push({
        start: buffered.start(i),
        end: buffered.end(i),
      });
    }
    setBufferedRanges(ranges);
  }, []);

  // Listen to video element native events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      updateBufferRanges();
    };
    const onDurationChange = () => setDuration(video.duration);
    const onVolumeChange = () => {
      setVolumeState(video.volume);
      setIsMuted(video.muted);
    };
    const onProgress = () => updateBufferRanges();
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => setIsBuffering(false);
    const onEnded = () => {
      setIsPlaying(false);
      video.currentTime = 0;
      setCurrentTime(0);
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('volumechange', onVolumeChange);
    video.addEventListener('progress', onProgress);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('ended', onEnded);

    // Initial setup
    setDuration(video.duration || 0);
    setVolumeState(video.volume);
    setIsMuted(video.muted);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('volumechange', onVolumeChange);
      video.removeEventListener('progress', onProgress);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('ended', onEnded);
    };
  }, [updateBufferRanges]);

  // Synchronize fullscreen change events at document level
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
    };
  }, []);

  // Global hotkeys listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isTyping = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.getAttribute('contenteditable') === 'true'
      );

      if (isTyping) return;

      switch (e.key.toLowerCase()) {
        case ' ': // Space: toggle play/pause
          e.preventDefault();
          togglePlay();
          break;
        case 'arrowright': // ArrowRight: seek forward 5s
          e.preventDefault();
          seek(currentTime + 5);
          break;
        case 'arrowleft': // ArrowLeft: seek backward 5s
          e.preventDefault();
          seek(currentTime - 5);
          break;
        case 'arrowup': // ArrowUp: volume up
          e.preventDefault();
          setVolume(volume + 0.1);
          break;
        case 'arrowdown': // ArrowDown: volume down
          e.preventDefault();
          setVolume(volume - 0.1);
          break;
        case 'm': // m: toggle mute
          toggleMute();
          break;
        case 'f': // f: fullscreen
          toggleFullscreen();
          break;
        case 't': // t: theater mode
          toggleTheaterMode();
          break;
        case 'i': // i: miniplayer
          toggleMiniMode();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [togglePlay, seek, currentTime, setVolume, volume, toggleMute, toggleFullscreen, toggleTheaterMode, toggleMiniMode]);

  return {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    bufferedRanges,
    isBuffering,
    isTheaterMode,
    isMiniMode,
    isFullscreen,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    setPlaybackRate,
    toggleTheaterMode,
    toggleMiniMode,
    toggleFullscreen,
  };
}
