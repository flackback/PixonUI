import React, { useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';

export interface WaveformVisualizerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * MediaStream from navigator.mediaDevices.getUserMedia (active mic stream)
   */
  stream?: MediaStream | null;
  /**
   * Active state. If false, shows calm ambient waves.
   * @default true
   */
  isActive?: boolean;
  /**
   * Waveform theme/style: 'bars' | 'sine'
   * @default 'bars'
   */
  variant?: 'bars' | 'sine';
  /**
   * Base color of the waveform
   * @default '#3b82f6' (blue-500)
   */
  color?: string;
  /**
   * Number of visual bars (only applicable for 'bars' variant)
   * @default 40
   */
  barCount?: number;
  /**
   * Fallback color used when `isActive` is false and no live stream is present.
   * When omitted, it adapts to the current document theme (light/dark).
   */
  inactiveColor?: string;
}

export const WaveformVisualizer = ({
  stream = null,
  isActive = true,
  variant = 'bars',
  color = '#3b82f6',
  barCount = 40,
  inactiveColor,
  className,
  style,
  ...props
}: WaveformVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafId = useRef<number>(0);
  const isDarkRef = useRef<boolean>(false);

  // Initialize Web Audio API analyzer if stream is provided
  useEffect(() => {
    if (!stream) {
      // Clean up if stream is removed
      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128; // Smaller fft size for smooth bar representation

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      sourceRef.current = source;

      const bufferLength = analyser.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
    } catch (err) {
      console.error('Failed to initialize AudioContext in WaveformVisualizer:', err);
    }

    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [stream]);

  // Track current theme for correct inactive fallback contrast
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const update = () => {
      isDarkRef.current = document.documentElement.classList.contains('dark');
    };
    update();
    const mo = new MutationObserver(update);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, []);

  // Visual render loop (Canvas Drawing)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Handle high-DPI retina displays
      const dpr = window.devicePixelRatio || 1;
      if (canvas.style.width !== `${width / dpr}px`) {
        canvas.width = canvas.getBoundingClientRect().width * dpr;
        canvas.height = canvas.getBoundingClientRect().height * dpr;
      }

      ctx.clearRect(0, 0, width, height);

      const isLive = !!(stream && analyserRef.current && dataArrayRef.current);

      const resolvedInactiveColor =
        inactiveColor ?? (isDarkRef.current ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.18)');

      if (isLive) {
        // Render based on live Audio Frequency data
        const analyser = analyserRef.current!;
        const dataArray = dataArrayRef.current!;
        analyser.getByteFrequencyData(dataArray as any);

        if (variant === 'bars') {
          const barWidth = width / barCount;
          const spacing = 2 * dpr;

          for (let i = 0; i < barCount; i++) {
            // Map freq index to dataArray
            const dataIndex = Math.floor((i / barCount) * dataArray.length);
            const value = dataArray[dataIndex] || 0;
            // Scale and cap height
            const percent = value / 255;
            const barHeight = Math.max(4 * dpr, percent * height * 0.85);

            const x = i * barWidth + spacing / 2;
            const y = (height - barHeight) / 2;

            ctx.fillStyle = color;
            // Draw beautiful rounded bar capsules
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(x, y, barWidth - spacing, barHeight, (barWidth - spacing) / 2);
            } else {
              ctx.rect(x, y, barWidth - spacing, barHeight);
            }
            ctx.fill();
          }
        } else {
          // Sine Wave variant
          ctx.beginPath();
          ctx.lineWidth = 3 * dpr;
          ctx.strokeStyle = color;
          ctx.lineCap = 'round';

          ctx.moveTo(0, height / 2);
          for (let i = 0; i < width; i++) {
            const dataIndex = Math.floor((i / width) * dataArray.length);
            const value = dataArray[dataIndex] || 128;
            const amplitude = (value / 255 - 0.5) * height * 0.7;
            const y = height / 2 + amplitude * Math.sin(i * 0.05 + phase);
            ctx.lineTo(i, y);
          }
          ctx.stroke();
          phase += 0.15;
        }
      } else {
        // Offline / Ambient fallback animation
        phase += 0.05;

        if (variant === 'bars') {
          const barWidth = width / barCount;
          const spacing = 2 * dpr;

          for (let i = 0; i < barCount; i++) {
            // Generate calm aesthetic waves with sine math
            const baseMultiplier = isActive ? 0.7 : 0.15;
            const wave = Math.sin(i * 0.15 - phase) * Math.cos(i * 0.08 + phase * 0.5);
            const amplitude = (wave + 1) / 2; // scale to 0..1
            const barHeight = Math.max(4 * dpr, (amplitude * height * 0.6 + 4) * baseMultiplier);

            const x = i * barWidth + spacing / 2;
            const y = (height - barHeight) / 2;

            ctx.fillStyle = isActive ? color : resolvedInactiveColor;
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(x, y, barWidth - spacing, barHeight, (barWidth - spacing) / 2);
            } else {
              ctx.rect(x, y, barWidth - spacing, barHeight);
            }
            ctx.fill();
          }
        } else {
          // Sine wave mode fallback
          ctx.beginPath();
          ctx.lineWidth = 2.5 * dpr;
          ctx.strokeStyle = isActive ? color : resolvedInactiveColor;
          ctx.lineCap = 'round';

          const waveCount = 3;
          for (let w = 0; w < waveCount; w++) {
            ctx.beginPath();
            ctx.lineWidth = (3 - w) * dpr;
            ctx.strokeStyle = isActive 
              ? `${color}${w === 0 ? '' : w === 1 ? '99' : '44'}` 
              : (isDarkRef.current
                  ? `rgba(255, 255, 255, ${0.3 - w * 0.1})`
                  : `rgba(0, 0, 0, ${0.22 - w * 0.06})`);

            ctx.moveTo(0, height / 2);
            for (let i = 0; i < width; i++) {
              const speedFactor = (w + 1) * 0.8;
              const scaleFactor = isActive ? 0.3 : 0.08;
              const y = height / 2 + Math.sin(i * 0.025 - phase * speedFactor + w) * height * scaleFactor;
              ctx.lineTo(i, y);
            }
            ctx.stroke();
          }
        }
      }

      rafId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(rafId.current);
    };
  }, [stream, isActive, variant, color, barCount]);

  return (
    <div
      className={cn(
        'relative h-12 w-full rounded-xl overflow-hidden bg-white/70 dark:bg-slate-900/40 backdrop-blur-md border border-zinc-200/80 dark:border-white/5 p-1 flex items-center justify-center',
        className
      )}
      style={style}
      {...props}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{
          imageRendering: 'auto',
        }}
      />
    </div>
  );
};

WaveformVisualizer.displayName = 'WaveformVisualizer';
