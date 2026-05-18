import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, Plus, Trash2, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Surface } from '../../primitives/Surface';
import { Button } from '../button/Button';
import { Text } from '../typography/Text';

export type AnimationStudioChannel = 'opacity' | 'x' | 'y' | 'scale' | 'rotate';

export interface AnimationStudioKeyframe {
  id: string;
  t: number; // ms
  v: number;
}

export interface AnimationStudioTrack {
  id: string;
  label: string;
  channel: AnimationStudioChannel;
  keyframes: AnimationStudioKeyframe[];
}

export interface AnimationStudioClip {
  durationMs: number;
  tracks: AnimationStudioTrack[];
}

export interface AnimationStudioProps {
  clip: AnimationStudioClip;
  onClipChange: (next: AnimationStudioClip) => void;
  className?: string;
  /**
   * Start playhead position (ms).
   * @default 0
   */
  initialTimeMs?: number;
  /**
   * Snap interval when dragging/adding keyframes (ms).
   * @default 50
   */
  snapMs?: number;
  /**
   * Timeline scale in pixels per second.
   * @default 120
   */
  pxPerSecond?: number;
  /**
   * Show an integrated stage preview with scrubbable WAAPI playback.
   * @default true
   */
  showStage?: boolean;
  /**
   * Optional custom stage content.
   */
  stage?: React.ReactNode;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function sortKeyframes(keyframes: AnimationStudioKeyframe[]) {
  return [...keyframes].sort((a, b) => a.t - b.t);
}

function valueAt(track: AnimationStudioTrack, t: number) {
  const kfs = sortKeyframes(track.keyframes);
  if (kfs.length === 0) {
    if (track.channel === 'opacity') return 1;
    if (track.channel === 'scale') return 1;
    return 0;
  }
  if (t <= kfs[0]!.t) return kfs[0]!.v;
  if (t >= kfs[kfs.length - 1]!.t) return kfs[kfs.length - 1]!.v;
  for (let i = 0; i < kfs.length - 1; i++) {
    const a = kfs[i]!;
    const b = kfs[i + 1]!;
    if (t >= a.t && t <= b.t) {
      const span = b.t - a.t || 1;
      const p = (t - a.t) / span;
      return lerp(a.v, b.v, p);
    }
  }
  return kfs[kfs.length - 1]!.v;
}

function compileKeyframes(clip: AnimationStudioClip) {
  const durationMs = Math.max(1, clip.durationMs);
  const times = new Set<number>([0, durationMs]);
  for (const track of clip.tracks) {
    for (const kf of track.keyframes) times.add(clamp(kf.t, 0, durationMs));
  }
  const sortedTimes = [...times].sort((a, b) => a - b);

  const channels: Record<AnimationStudioChannel, number> = {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    rotate: 0,
  };

  const trackMap = new Map<AnimationStudioChannel, AnimationStudioTrack>();
  for (const t of clip.tracks) trackMap.set(t.channel, t);

  return sortedTimes.map((time) => {
    for (const ch of Object.keys(channels) as AnimationStudioChannel[]) {
      const track = trackMap.get(ch);
      channels[ch] = track ? valueAt(track, time) : (ch === 'opacity' || ch === 'scale' ? 1 : 0);
    }
    const transform = `translate3d(${channels.x}px, ${channels.y}px, 0px) scale(${channels.scale}) rotate(${channels.rotate}deg)`;
    return {
      offset: clamp(time / durationMs, 0, 1),
      opacity: channels.opacity,
      transform,
    } as Keyframe;
  });
}

function formatTime(ms: number) {
  const s = Math.max(0, ms) / 1000;
  return `${s.toFixed(2)}s`;
}

function uid() {
  const anyCrypto = (globalThis as any).crypto as Crypto | undefined;
  const uuid = anyCrypto?.randomUUID?.();
  return uuid ?? `kf_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function AnimationStudio({
  clip,
  onClipChange,
  className,
  initialTimeMs = 0,
  snapMs = 50,
  pxPerSecond = 120,
  showStage = true,
  stage,
}: AnimationStudioProps) {
  const durationMs = Math.max(1, clip.durationMs);
  const pxPerMs = pxPerSecond / 1000;

  const [activeTrackId, setActiveTrackId] = useState<string | null>(clip.tracks[0]?.id ?? null);
  const [timeMs, setTimeMs] = useState(() => clamp(initialTimeMs, 0, durationMs));
  const [isPlaying, setIsPlaying] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<Animation | null>(null);
  const playRafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number>(0);

  const compiledKeyframes = useMemo(() => compileKeyframes(clip), [clip]);

  useEffect(() => {
    setTimeMs((t) => clamp(t, 0, durationMs));
  }, [durationMs]);

  // Build (paused) WAAPI animation for scrubbing.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    if (typeof el.animate !== 'function') return;

    animRef.current?.cancel();
    const anim = el.animate(compiledKeyframes, {
      duration: durationMs,
      easing: 'linear',
      fill: 'both',
    });
    anim.pause();
    anim.currentTime = timeMs;
    animRef.current = anim;

    return () => {
      anim.cancel();
      if (animRef.current === anim) animRef.current = null;
    };
  }, [compiledKeyframes, durationMs]);

  // Keep playhead sync with animation currentTime.
  useEffect(() => {
    const anim = animRef.current;
    if (!anim) return;
    try {
      anim.currentTime = timeMs;
    } catch {
      // no-op
    }
  }, [timeMs]);

  // Playback loop (just advances playhead; WAAPI rendering stays native).
  useEffect(() => {
    if (!isPlaying) {
      if (playRafRef.current !== null) cancelAnimationFrame(playRafRef.current);
      playRafRef.current = null;
      return;
    }

    lastTsRef.current = performance.now();
    const tick = (ts: number) => {
      const dt = ts - lastTsRef.current;
      lastTsRef.current = ts;
      setTimeMs((prev) => {
        const next = prev + dt;
        if (next >= durationMs) {
          setIsPlaying(false);
          return durationMs;
        }
        return next;
      });
      playRafRef.current = requestAnimationFrame(tick);
    };
    playRafRef.current = requestAnimationFrame(tick);
    return () => {
      if (playRafRef.current !== null) cancelAnimationFrame(playRafRef.current);
      playRafRef.current = null;
    };
  }, [isPlaying, durationMs]);

  const setClip = (updater: (prev: AnimationStudioClip) => AnimationStudioClip) => {
    onClipChange(updater(clip));
  };

  const activeTrack = clip.tracks.find((t) => t.id === activeTrackId) ?? clip.tracks[0];

  const addKeyframe = (trackId: string) => {
    const t = Math.round(timeMs / snapMs) * snapMs;
    setClip((prev) => {
      const nextTracks = prev.tracks.map((tr) => {
        if (tr.id !== trackId) return tr;
        const existingAtT = tr.keyframes.some((kf) => Math.abs(kf.t - t) < 1);
        if (existingAtT) return tr;
        const nextV = valueAt(tr, t);
        const nextKf: AnimationStudioKeyframe = { id: uid(), t, v: nextV };
        return { ...tr, keyframes: [...tr.keyframes, nextKf] };
      });
      return { ...prev, tracks: nextTracks };
    });
  };

  const removeKeyframe = (trackId: string, keyframeId: string) => {
    setClip((prev) => {
      const nextTracks = prev.tracks.map((tr) => {
        if (tr.id !== trackId) return tr;
        return { ...tr, keyframes: tr.keyframes.filter((k) => k.id !== keyframeId) };
      });
      return { ...prev, tracks: nextTracks };
    });
  };

  const dragStateRef = useRef<null | {
    trackId: string;
    keyframeId: string;
    originX: number;
    timelineLeft: number;
    initialT: number;
  }>(null);

  const onKeyframePointerDown = (e: React.PointerEvent, trackId: string, keyframeId: string, t: number) => {
    const host = timelineRef.current;
    if (!host) return;
    const rect = host.getBoundingClientRect();
    dragStateRef.current = {
      trackId,
      keyframeId,
      originX: e.clientX,
      timelineLeft: rect.left,
      initialT: t,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onTimelinePointerMove = (e: React.PointerEvent) => {
    const ds = dragStateRef.current;
    if (!ds) return;
    const dx = e.clientX - ds.originX;
    const dt = dx / pxPerMs;
    const raw = ds.initialT + dt;
    const snapped = Math.round(raw / snapMs) * snapMs;
    const nextT = clamp(snapped, 0, durationMs);
    setClip((prev) => {
      const nextTracks = prev.tracks.map((tr) => {
        if (tr.id !== ds.trackId) return tr;
        return {
          ...tr,
          keyframes: tr.keyframes.map((k) => (k.id === ds.keyframeId ? { ...k, t: nextT } : k)),
        };
      });
      return { ...prev, tracks: nextTracks };
    });
  };

  const onTimelinePointerUp = () => {
    dragStateRef.current = null;
  };

  const onPlayheadPointerDown = (e: React.PointerEvent) => {
    const host = timelineRef.current;
    if (!host) return;
    const rect = host.getBoundingClientRect();
    const x = e.clientX - rect.left + host.scrollLeft;
    const next = clamp((x - 0) / pxPerMs, 0, durationMs);
    setTimeMs(next);
  };

  const secondsMarkers = useMemo(() => {
    const totalSeconds = Math.ceil(durationMs / 1000);
    return Array.from({ length: totalSeconds + 1 }).map((_, i) => i);
  }, [durationMs]);

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="gap-2"
            onClick={() => setIsPlaying((p) => !p)}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
          <Surface className="px-3 py-2 rounded-xl bg-white/70 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10">
            <Text size="xs" className="tabular-nums text-zinc-700 dark:text-white/70">
              {formatTime(timeMs)} / {formatTime(durationMs)}
            </Text>
          </Surface>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onClipChange({ ...clip, durationMs: Math.max(250, clip.durationMs - 250) })}
            title="Shorter"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onClipChange({ ...clip, durationMs: Math.min(60000, clip.durationMs + 250) })}
            title="Longer"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showStage && (
        <Surface className="p-6 mb-4 bg-white/70 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10">
          <div className="flex items-center justify-between mb-4">
            <Text className="text-sm font-semibold text-zinc-900 dark:text-white">Stage</Text>
            <Text size="xs" className="text-zinc-500 dark:text-white/40">
              Scrub the timeline to preview (WAAPI).
            </Text>
          </div>
          <div className="relative h-[220px] rounded-3xl border border-zinc-200/80 dark:border-white/10 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-950/70 dark:to-black/60 overflow-hidden">
            <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.10]" style={{
              backgroundImage:
                'linear-gradient(to right, rgba(0,0,0,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.12) 1px, transparent 1px)',
              backgroundSize: '18px 18px',
            }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div ref={stageRef} className="will-change-transform">
                {stage ?? (
                  <Surface className="px-6 py-4 rounded-3xl bg-white/90 dark:bg-black/40 border border-zinc-200/70 dark:border-white/10 shadow-2xl shadow-black/10 dark:shadow-black/60">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500" />
                      <div className="flex flex-col">
                        <Text className="text-sm font-extrabold tracking-tight">Pixon Motion</Text>
                        <Text size="xs" className="text-zinc-600 dark:text-white/50">Timeline Studio (MVP)</Text>
                      </div>
                    </div>
                  </Surface>
                )}
              </div>
            </div>
          </div>
        </Surface>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
        <Surface className="p-4 bg-white/70 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10">
          <div className="flex items-center justify-between mb-3">
            <Text className="text-sm font-semibold text-zinc-900 dark:text-white">Tracks</Text>
            {activeTrack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => addKeyframe(activeTrack.id)}
                title="Add keyframe"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {clip.tracks.map((tr) => {
              const isActive = tr.id === activeTrack?.id;
              return (
                <button
                  key={tr.id}
                  type="button"
                  onClick={() => setActiveTrackId(tr.id)}
                  className={cn(
                    'w-full flex items-center justify-between gap-2 px-3 py-2 rounded-2xl border transition-colors',
                    isActive
                      ? 'bg-zinc-100 border-zinc-300 text-zinc-900 dark:bg-white/[0.06] dark:border-white/20 dark:text-white'
                      : 'bg-transparent border-zinc-200/70 text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/[0.03]'
                  )}
                >
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-xs font-bold truncate">{tr.label}</span>
                    <span className="text-[10px] uppercase tracking-wider opacity-60">{tr.channel}</span>
                  </div>
                  <span className="text-[10px] tabular-nums opacity-70">
                    {tr.keyframes.length} kf
                  </span>
                </button>
              );
            })}
          </div>
        </Surface>

        <Surface className="p-4 bg-white/70 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <Text className="text-sm font-semibold text-zinc-900 dark:text-white">Timeline</Text>
            <Text size="xs" className="text-zinc-500 dark:text-white/40">
              Drag keyframes • click to scrub
            </Text>
          </div>

          <div
            ref={timelineRef}
            className="relative w-full overflow-x-auto overflow-y-hidden rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-white/60 dark:bg-black/20"
            onPointerMove={onTimelinePointerMove}
            onPointerUp={onTimelinePointerUp}
            onPointerLeave={onTimelinePointerUp}
            onPointerDown={onPlayheadPointerDown}
            style={{ height: 180 }}
          >
            <div className="relative" style={{ width: durationMs * pxPerMs + 64, height: 180 }}>
              {/* Grid */}
              {secondsMarkers.map((s) => (
                <div
                  key={s}
                  className="absolute top-0 bottom-0 border-l border-zinc-200/70 dark:border-white/5"
                  style={{ left: s * pxPerSecond }}
                >
                  <div className="absolute top-2 left-2 text-[10px] font-semibold text-zinc-500 dark:text-white/40 tabular-nums">
                    {s}s
                  </div>
                </div>
              ))}

              {/* Playhead */}
              <div
                className="absolute top-0 bottom-0 w-px bg-purple-500 shadow-[0_0_16px_rgba(168,85,247,0.35)]"
                style={{ left: timeMs * pxPerMs }}
              >
                <div className="absolute top-0 -translate-x-1/2 w-3 h-3 rounded-full bg-purple-500 shadow-lg shadow-purple-500/30" />
              </div>

              {/* Tracks */}
              <div className="absolute left-0 right-0 top-10 bottom-3 flex flex-col gap-3 px-4">
                {clip.tracks.map((tr) => (
                  <div key={tr.id} className="relative h-10 rounded-xl bg-zinc-100/70 dark:bg-white/[0.03] border border-zinc-200/70 dark:border-white/10">
                    {tr.keyframes.map((kf) => (
                      <div
                        key={kf.id}
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-white/20 shadow-sm cursor-grab active:cursor-grabbing"
                        style={{ left: kf.t * pxPerMs }}
                        onPointerDown={(e) => onKeyframePointerDown(e, tr.id, kf.id, kf.t)}
                        title={`${tr.label} @ ${formatTime(kf.t)}`}
                      />
                    ))}

                    {/* Remove nearest keyframe */}
                    {tr.id === activeTrack?.id && tr.keyframes.length > 0 && (
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-zinc-500 hover:text-red-600 dark:text-white/30 dark:hover:text-red-400 hover:bg-white/70 dark:hover:bg-white/5 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          // remove closest to playhead
                          const sorted = sortKeyframes(tr.keyframes);
                          const closest = sorted.reduce((best, cur) => {
                            const a = Math.abs(cur.t - timeMs);
                            const b = Math.abs(best.t - timeMs);
                            return a < b ? cur : best;
                          }, sorted[0]!);
                          removeKeyframe(tr.id, closest.id);
                        }}
                        title="Remove closest keyframe"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Surface>
      </div>
    </div>
  );
}
