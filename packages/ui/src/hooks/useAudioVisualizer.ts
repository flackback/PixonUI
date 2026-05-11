import { useEffect, useRef, useState } from 'react';

export interface UseAudioVisualizerOptions {
  fftSize?: number;
  smoothingTimeConstant?: number;
}

export function useAudioVisualizer(
  audioElement: HTMLAudioElement | null,
  options: UseAudioVisualizerOptions = {}
) {
  const { fftSize = 64, smoothingTimeConstant = 0.8 } = options;
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);
  
  const [frequencies, setFrequencies] = useState<number[]>(new Array(fftSize / 2).fill(0));

  useEffect(() => {
    if (!audioElement) return;

    // Track play state
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audioElement.addEventListener('play', handlePlay);
    audioElement.addEventListener('pause', handlePause);

    return () => {
      audioElement.removeEventListener('play', handlePlay);
      audioElement.removeEventListener('pause', handlePause);
    };
  }, [audioElement]);

  useEffect(() => {
    if (!audioElement || !isPlaying) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    // Initialize AudioContext lazily on user interaction (when audio actually plays)
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioContextRef.current = new AudioCtx();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = fftSize;
        analyserRef.current.smoothingTimeConstant = smoothingTimeConstant;
        
        try {
          sourceRef.current = audioContextRef.current.createMediaElementSource(audioElement);
          sourceRef.current.connect(analyserRef.current);
          analyserRef.current.connect(audioContextRef.current.destination);
        } catch (err) {
          console.warn('MediaElementSource initialization failed, might be already connected:', err);
        }
      }
    }

    // Resume AudioContext if it got suspended by policy
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    const bufferLength = analyserRef.current ? analyserRef.current.frequencyBinCount : fftSize / 2;
    const dataArray = new Uint8Array(bufferLength);

    const updateFrequencies = () => {
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
        // Normalize 0-255 values to 0-1 range for easy styling/canvas rendering
        const normalized = Array.from(dataArray).map(val => val / 255);
        setFrequencies(normalized);
      }
      rafRef.current = requestAnimationFrame(updateFrequencies);
    };

    updateFrequencies();

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [audioElement, isPlaying, fftSize, smoothingTimeConstant]);

  return {
    frequencies,
    isPlaying,
    audioContext: audioContextRef.current,
    analyser: analyserRef.current
  };
}
