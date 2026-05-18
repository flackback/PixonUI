import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, Plus, Trash2, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Copy, Check, Repeat, PanelRightClose, PanelRightOpen, Sliders, ChevronDown, Layers, ArrowLeftRight, Type, Square, Disc, Star, Image, Sparkles, Clipboard, PlusCircle, Navigation, RefreshCw } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Surface } from '../../primitives/Surface';
import { Button } from '../button/Button';
import { Text } from '../typography/Text';

export type AnimationStudioChannel = 'opacity' | 'x' | 'y' | 'scale' | 'rotate';

export interface AnimationStudioKeyframe {
  id: string;
  t: number; // ms
  v: number;
  easing?: string;
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

export interface AnimationStudioElement {
  id: string;
  name: string;
  type: 'box' | 'circle' | 'text' | 'image' | 'star';
  text: string;
  color: string;
  imageUrl?: string;
  tracks: AnimationStudioTrack[];
}

export interface GradientPreset {
  id: string;
  name: string;
  classes: string;
}

export const GRADIENT_PRESETS: GradientPreset[] = [
  { id: 'purple-indigo', name: 'Nebula Purple', classes: 'from-purple-500 to-indigo-600 bg-gradient-to-br text-white' },
  { id: 'cyan-blue', name: 'Ocean Breeze', classes: 'from-cyan-400 to-blue-600 bg-gradient-to-br text-white' },
  { id: 'emerald-teal', name: 'Emerald Forest', classes: 'from-emerald-400 to-teal-600 bg-gradient-to-br text-white' },
  { id: 'orange-rose', name: 'Sunset Glow', classes: 'from-amber-400 to-rose-500 bg-gradient-to-br text-white' },
  { id: 'dark-grey', name: 'Carbon Black', classes: 'from-zinc-800 to-black bg-gradient-to-br text-white border border-white/10' },
  { id: 'glass', name: 'Frosted Glass', classes: 'bg-white/10 dark:bg-black/30 backdrop-blur-md border border-white/20 dark:border-white/10 text-zinc-900 dark:text-white shadow-xl' },
];

export interface AnimationStudioProps {
  clip: AnimationStudioClip;
  onClipChange: (next: AnimationStudioClip) => void;
  className?: string;
  initialTimeMs?: number;
  snapMs?: number;
  pxPerSecond?: number;
  showStage?: boolean;
  stage?: React.ReactNode;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  return (t: number) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    let x = t;
    for (let i = 0; i < 8; i++) {
      const currentX = 3 * (1 - x) * (1 - x) * x * x1 + 3 * (1 - x) * x * x * x2 + x * x * x;
      const derivativeX = 3 * (1 - x) * (1 - x) * x1 + 6 * (1 - x) * x * (x2 - x1) + 3 * x * x * (1 - x2);
      if (Math.abs(currentX - t) < 1e-5) break;
      if (Math.abs(derivativeX) < 1e-5) break;
      x -= (currentX - t) / derivativeX;
    }
    return 3 * (1 - x) * (1 - x) * x * y1 + 3 * (1 - x) * x * x * y2 + x * x * x;
  };
}

function easeOutBounce(t: number) {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    let tTemp = t - 1.5 / d1;
    return n1 * tTemp * tTemp + 0.75;
  } else if (t < 2.5 / d1) {
    let tTemp = t - 2.25 / d1;
    return n1 * tTemp * tTemp + 0.9375;
  } else {
    let tTemp = t - 2.625 / d1;
    return n1 * tTemp * tTemp + 0.984375;
  }
}

function easeInBounce(t: number) {
  return 1 - easeOutBounce(1 - t);
}

function easeInOutBounce(t: number) {
  return t < 0.5
    ? (1 - easeOutBounce(1 - 2 * t)) / 2
    : (1 + easeOutBounce(2 * t - 1)) / 2;
}

const EASING_CURVES: Record<string, (t: number) => number> = {
  linear: (t) => t,
  'ease-in': cubicBezier(0.42, 0, 1, 1),
  'ease-out': cubicBezier(0, 0, 0.58, 1),
  'ease-in-out': cubicBezier(0.42, 0, 0.58, 1),
  'ease-in-sine': (t) => 1 - Math.cos((t * Math.PI) / 2),
  'ease-out-sine': (t) => Math.sin((t * Math.PI) / 2),
  'ease-in-out-sine': (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  'ease-in-quad': (t) => t * t,
  'ease-out-quad': (t) => 1 - (1 - t) * (1 - t),
  'ease-in-out-quad': (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  'ease-in-cubic': (t) => t * t * t,
  'ease-out-cubic': (t) => 1 - Math.pow(1 - t, 3),
  'ease-in-out-cubic': (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  'ease-in-quart': (t) => t * t * t * t,
  'ease-out-quart': (t) => 1 - Math.pow(1 - t, 4),
  'ease-in-out-quart': (t) => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,
  'ease-in-quint': (t) => t * t * t * t * t,
  'ease-out-quint': (t) => 1 - Math.pow(1 - t, 5),
  'ease-in-out-quint': (t) => t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2,
  'ease-in-expo': (t) => t === 0 ? 0 : Math.pow(2, 10 * t - 10),
  'ease-out-expo': (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  'ease-in-out-expo': (t) => t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
  'ease-in-circ': (t) => 1 - Math.sqrt(1 - Math.pow(t, 2)),
  'ease-out-circ': (t) => Math.sqrt(1 - Math.pow(t - 1, 2)),
  'ease-in-out-circ': (t) => t < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2,
  'ease-in-back': (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  'ease-out-back': (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  'ease-in-out-back': (t) => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },
  'ease-in-bounce': easeInBounce,
  'ease-out-bounce': easeOutBounce,
  'ease-in-out-bounce': easeInOutBounce,
  'elite-out': cubicBezier(0.16, 1, 0.3, 1),
  'elite-in-out': cubicBezier(0.87, 0, 0.13, 1),
  'spring-out': cubicBezier(0.34, 1.56, 0.64, 1),
  'soft-bounce': cubicBezier(0.47, 1.64, 0.41, 0.8),
};

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
      let p = (t - a.t) / span;
      const easeFn = EASING_CURVES[a.easing || 'linear'] || ((val: number) => val);
      p = easeFn(p);
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
  const [zoom, setZoom] = useState(1.0);
  const durationMs = Math.max(1, clip.durationMs);
  const currentPxPerSecond = pxPerSecond * zoom;
  const pxPerMs = currentPxPerSecond / 1000;

  const [elements, setElements] = useState<AnimationStudioElement[]>(() => {
    const defaultTracks: AnimationStudioTrack[] = clip.tracks.length > 0 ? clip.tracks : [
      { id: 'tr-x-' + uid(), label: 'Position X', channel: 'x' as const, keyframes: [{ id: 'kf-x-0', t: 0, v: 0 }] },
      { id: 'tr-y-' + uid(), label: 'Position Y', channel: 'y' as const, keyframes: [{ id: 'kf-y-0', t: 0, v: 0 }] },
      { id: 'tr-scale-' + uid(), label: 'Scale', channel: 'scale' as const, keyframes: [{ id: 'kf-scale-0', t: 0, v: 1 }] },
      { id: 'tr-rotate-' + uid(), label: 'Rotate', channel: 'rotate' as const, keyframes: [{ id: 'kf-rotate-0', t: 0, v: 0 }] },
      { id: 'tr-opacity-' + uid(), label: 'Opacity', channel: 'opacity' as const, keyframes: [{ id: 'kf-opacity-0', t: 0, v: 1 }] },
    ];
    return [
      {
        id: 'el-1',
        name: 'Pixon Card',
        type: 'box',
        text: 'Pixon Motion',
        color: 'from-purple-500 to-indigo-600 bg-gradient-to-br text-white shadow-xl shadow-purple-500/10',
        tracks: defaultTracks,
      }
    ];
  });

  const [activeElementId, setActiveElementId] = useState<string>('el-1');
  const activeElement = elements.find((el) => el.id === activeElementId) ?? elements[0];

  const [activeTrackId, setActiveTrackId] = useState<string | null>(activeElement?.tracks[0]?.id ?? null);
  const [timeMs, setTimeMs] = useState(() => clamp(initialTimeMs, 0, durationMs));
  const [isPlaying, setIsPlaying] = useState(false);

  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [loop, setLoop] = useState(true);
  const [playDirection, setPlayDirection] = useState<'forward' | 'reverse'>('forward');
  const [selectedKeyframeId, setSelectedKeyframeId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);

  const [previewZoom, setPreviewZoom] = useState<number>(1.0);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    trackId: string;
    keyframeId?: string | null;
    timeMs?: number;
  }>({
    visible: false,
    x: 0,
    y: 0,
    trackId: '',
    keyframeId: null,
    timeMs: 0,
  });
  const [copiedKeyframe, setCopiedKeyframe] = useState<{ v: number; easing?: string } | null>(null);

  const timelineRef = useRef<HTMLDivElement>(null);
  const playRafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number>(0);
  const resizeRef = useRef<{ startX: number; startWidth: number } | null>(null);

  useEffect(() => {
    setTimeMs((t) => clamp(t, 0, durationMs));
  }, [durationMs]);

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
        let next = prev + (playDirection === 'forward' ? dt : -dt);
        if (playDirection === 'forward') {
          if (next >= durationMs) {
            if (loop) return 0;
            setIsPlaying(false);
            return durationMs;
          }
        } else {
          if (next <= 0) {
            if (loop) return durationMs;
            setIsPlaying(false);
            return 0;
          }
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
  }, [isPlaying, durationMs, playDirection, loop]);

  const updateElementsState = (updater: (prev: AnimationStudioElement[]) => AnimationStudioElement[]) => {
    setElements((prev) => {
      const next = updater(prev);
      const active = next.find((el) => el.id === activeElementId) ?? next[0];
      if (active) {
        onClipChange({ ...clip, tracks: active.tracks });
      }
      return next;
    });
  };

  const activeTrack = activeElement?.tracks.find((t) => t.id === activeTrackId) ?? activeElement?.tracks[0];

  const updateTrackValueAtTime = (trackId: string, t: number, nextV: number) => {
    const snappedT = Math.round(t / snapMs) * snapMs;
    updateElementsState((prev) =>
      prev.map((el) => {
        if (el.id !== activeElementId) return el;
        const nextTracks = el.tracks.map((tr) => {
          if (tr.id !== trackId) return tr;
          const existingIndex = tr.keyframes.findIndex((kf) => Math.abs(kf.t - snappedT) < 1);
          if (existingIndex !== -1) {
            const nextKeyframes = [...tr.keyframes];
            nextKeyframes[existingIndex] = {
              ...nextKeyframes[existingIndex]!,
              v: nextV,
            };
            return { ...tr, keyframes: nextKeyframes };
          } else {
            return {
              ...tr,
              keyframes: [...tr.keyframes, { id: uid(), t: snappedT, v: nextV, easing: 'linear' }],
            };
          }
        });
        return { ...el, tracks: nextTracks };
      })
    );
  };

  const selectedKeyframe = useMemo(() => {
    if (!selectedKeyframeId || !activeElement) return null;
    for (const tr of activeElement.tracks) {
      const kf = tr.keyframes.find((k) => k.id === selectedKeyframeId);
      if (kf) return { trackId: tr.id, keyframe: kf };
    }
    return null;
  }, [activeElement?.tracks, selectedKeyframeId]);

  const updateKeyframeProps = (trackId: string, keyframeId: string, updates: Partial<AnimationStudioKeyframe>) => {
    updateElementsState((prev) =>
      prev.map((el) => {
        if (el.id !== activeElementId) return el;
        return {
          ...el,
          tracks: el.tracks.map((tr) => {
            if (tr.id !== trackId) return tr;
            return {
              ...tr,
              keyframes: tr.keyframes.map((k) => {
                if (k.id !== keyframeId) return k;
                const nextKf = { ...k, ...updates };
                if (updates.t !== undefined) {
                  nextKf.t = clamp(Math.round(updates.t / snapMs) * snapMs, 0, durationMs);
                }
                return nextKf;
              }),
            };
          }),
        };
      })
    );
  };

  const addKeyframe = (trackId: string) => {
    const t = Math.round(timeMs / snapMs) * snapMs;
    const newKfId = uid();
    updateElementsState((prev) =>
      prev.map((el) => {
        if (el.id !== activeElementId) return el;
        return {
          ...el,
          tracks: el.tracks.map((tr) => {
            if (tr.id !== trackId) return tr;
            const existingAtT = tr.keyframes.some((kf) => Math.abs(kf.t - t) < 1);
            if (existingAtT) return tr;
            const nextV = valueAt(tr, t);
            return {
              ...tr,
              keyframes: [...tr.keyframes, { id: newKfId, t, v: nextV, easing: 'linear' }],
            };
          }),
        };
      })
    );
    setSelectedKeyframeId(newKfId);
  };

  const removeKeyframe = (trackId: string, keyframeId: string) => {
    if (selectedKeyframeId === keyframeId) setSelectedKeyframeId(null);
    updateElementsState((prev) =>
      prev.map((el) => {
        if (el.id !== activeElementId) return el;
        return {
          ...el,
          tracks: el.tracks.map((tr) => {
            if (tr.id !== trackId) return tr;
            return { ...tr, keyframes: tr.keyframes.filter((k) => k.id !== keyframeId) };
          }),
        };
      })
    );
  };

  const activeTrackKeyframeTimes = useMemo(() => {
    if (!activeTrack) return [];
    return sortKeyframes(activeTrack.keyframes).map((kf) => kf.t);
  }, [activeTrack]);

  const jumpToPrevKeyframe = () => {
    const times = activeTrackKeyframeTimes;
    if (times.length === 0) return;
    const prevs = times.filter((t) => t < timeMs);
    if (prevs.length > 0) {
      const nextT = prevs[prevs.length - 1]!;
      setTimeMs(nextT);
      const kf = activeTrack?.keyframes.find((k) => k.t === nextT);
      if (kf) setSelectedKeyframeId(kf.id);
    }
  };

  const jumpToNextKeyframe = () => {
    const times = activeTrackKeyframeTimes;
    if (times.length === 0) return;
    const nexts = times.filter((t) => t > timeMs);
    if (nexts.length > 0) {
      const nextT = nexts[0]!;
      setTimeMs(nextT);
      const kf = activeTrack?.keyframes.find((k) => k.t === nextT);
      if (kf) setSelectedKeyframeId(kf.id);
    }
  };

  const addTrackForChannel = (channel: AnimationStudioChannel) => {
    const channelLabels: Record<AnimationStudioChannel, string> = {
      x: 'Position X',
      y: 'Position Y',
      scale: 'Scale',
      rotate: 'Rotate',
      opacity: 'Opacity',
    };
    const t = Math.round(timeMs / snapMs) * snapMs;
    const initialValues: Record<AnimationStudioChannel, number> = {
      x: 0,
      y: 0,
      scale: 1,
      rotate: 0,
      opacity: 1,
    };
    updateElementsState((prev) =>
      prev.map((el) => {
        if (el.id !== activeElementId) return el;
        if (el.tracks.some((tr) => tr.channel === channel)) return el;
        const newTrack: AnimationStudioTrack = {
          id: `tr-${channel}-${Date.now().toString(36)}`,
          label: channelLabels[channel],
          channel,
          keyframes: [{ id: uid(), t, v: initialValues[channel], easing: 'linear' }],
        };
        return { ...el, tracks: [...el.tracks, newTrack] };
      })
    );
  };

  const hasKeyframeAtTime = (track: AnimationStudioTrack, t: number) => {
    const snappedT = Math.round(t / snapMs) * snapMs;
    return track.keyframes.some((kf) => Math.abs(kf.t - snappedT) < 1);
  };

  const toggleKeyframeAtTime = (trackId: string, t: number) => {
    const snappedT = Math.round(t / snapMs) * snapMs;
    updateElementsState((prev) =>
      prev.map((el) => {
        if (el.id !== activeElementId) return el;
        return {
          ...el,
          tracks: el.tracks.map((tr) => {
            if (tr.id !== trackId) return tr;
            const index = tr.keyframes.findIndex((kf) => Math.abs(kf.t - snappedT) < 1);
            if (index !== -1) {
              const nextKf = tr.keyframes.filter((_, idx) => idx !== index);
              return { ...tr, keyframes: nextKf };
            } else {
              const nextV = valueAt(tr, snappedT);
              const newKf: AnimationStudioKeyframe = {
                id: uid(),
                t: snappedT,
                v: nextV,
                easing: 'linear',
              };
              return { ...tr, keyframes: [...tr.keyframes, newKf] };
            }
          }),
        };
      })
    );
  };

  const handleKeyframeContextMenu = (e: React.MouseEvent, trackId: string, kf: AnimationStudioKeyframe) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      trackId,
      keyframeId: kf.id,
      timeMs: kf.t,
    });
  };

  const handleTrackContextMenu = (e: React.MouseEvent, trackId: string) => {
    e.preventDefault();
    const el = timelineRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const clickX = e.clientX - rect.left + el.scrollLeft - 16;
    const t = clamp(Math.round((clickX / pxPerMs) / snapMs) * snapMs, 0, durationMs);
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      trackId,
      keyframeId: null,
      timeMs: t,
    });
  };

  const deleteKeyframe = (trackId: string, keyframeId: string) => {
    updateElementsState((prev) =>
      prev.map((el) => {
        if (el.id !== activeElementId) return el;
        return {
          ...el,
          tracks: el.tracks.map((tr) => {
            if (tr.id !== trackId) return tr;
            return { ...tr, keyframes: tr.keyframes.filter((k) => k.id !== keyframeId) };
          }),
        };
      })
    );
    setSelectedKeyframeId(null);
  };

  const handleCopyKeyframe = (trackId: string, keyframeId: string) => {
    const tr = activeElement?.tracks.find((t) => t.id === trackId);
    const kf = tr?.keyframes.find((k) => k.id === keyframeId);
    if (kf) {
      setCopiedKeyframe({ v: kf.v, easing: kf.easing });
    }
  };

  const handlePasteKeyframe = (trackId: string, time: number) => {
    if (!copiedKeyframe) return;
    updateElementsState((prev) =>
      prev.map((el) => {
        if (el.id !== activeElementId) return el;
        return {
          ...el,
          tracks: el.tracks.map((tr) => {
            if (tr.id !== trackId) return tr;
            const filtered = tr.keyframes.filter((k) => Math.abs(k.t - time) >= 1);
            const newKf: AnimationStudioKeyframe = {
              id: uid(),
              t: time,
              v: copiedKeyframe.v,
              easing: copiedKeyframe.easing || 'linear',
            };
            return { ...tr, keyframes: [...filtered, newKf] };
          }),
        };
      })
    );
  };

  const handleDuplicateKeyframe = (trackId: string, keyframeId: string) => {
    const tr = activeElement?.tracks.find((t) => t.id === trackId);
    const kf = tr?.keyframes.find((k) => k.id === keyframeId);
    if (kf) {
      const nextTime = Math.min(durationMs, kf.t + 250);
      updateElementsState((prev) =>
        prev.map((el) => {
          if (el.id !== activeElementId) return el;
          return {
            ...el,
            tracks: el.tracks.map((t) => {
              if (t.id !== trackId) return t;
              const filtered = t.keyframes.filter((k) => Math.abs(k.t - nextTime) >= 1);
              const duplicated: AnimationStudioKeyframe = {
                id: uid(),
                t: nextTime,
                v: kf.v,
                easing: kf.easing || 'linear',
              };
              return { ...t, keyframes: [...filtered, duplicated] };
            }),
          };
        })
      );
    }
  };

  const handleUpdateEasing = (trackId: string, keyframeId: string, easing: string) => {
    updateKeyframeProps(trackId, keyframeId, { easing });
  };

  const clearTrackKeyframes = (trackId: string) => {
    updateElementsState((prev) =>
      prev.map((el) => {
        if (el.id !== activeElementId) return el;
        return {
          ...el,
          tracks: el.tracks.map((tr) => {
            if (tr.id !== trackId) return tr;
            const firstKf = tr.keyframes.find((k) => k.t === 0) || { id: uid(), t: 0, v: tr.channel === 'opacity' || tr.channel === 'scale' ? 1 : 0 };
            return { ...tr, keyframes: [firstKf] };
          }),
        };
      })
    );
  };

  const addKeyframeAtPlayhead = (trackId: string) => {
    const track = activeElement?.tracks.find((t) => t.id === trackId);
    if (track) {
      const hasKf = track.keyframes.some((k) => Math.abs(k.t - timeMs) < 1);
      if (!hasKf) {
        toggleKeyframeAtTime(trackId, timeMs);
      }
    }
  };

  useEffect(() => {
    const handleClose = () => {
      if (contextMenu.visible) {
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }
    };
    window.addEventListener('click', handleClose);
    window.addEventListener('contextmenu', handleClose);
    return () => {
      window.removeEventListener('click', handleClose);
      window.removeEventListener('contextmenu', handleClose);
    };
  }, [contextMenu.visible]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        const active = document.activeElement;
        const isTyping = active && (
          active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          active.getAttribute('contenteditable') === 'true'
        );
        if (!isTyping) {
          e.preventDefault();
          setIsPlaying((prev) => !prev);
        }
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setZoom((z) => clamp(parseFloat((z + 0.1).toFixed(2)), 0.1, 4.0));
      }

      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        setZoom((z) => clamp(parseFloat((z - 0.1).toFixed(2)), 0.1, 4.0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const onPlayheadPointerDown = (e: React.PointerEvent) => {
    const el = timelineRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const clickX = e.clientX - rect.left + el.scrollLeft - 16;
    const t = clamp(clickX / pxPerMs, 0, durationMs);
    setTimeMs(Math.round(t / snapMs) * snapMs);
    setSelectedKeyframeId(null);

    const onPointerMove = (moveEvt: PointerEvent) => {
      const moveX = moveEvt.clientX - rect.left + el.scrollLeft - 16;
      const mt = clamp(moveX / pxPerMs, 0, durationMs);
      setTimeMs(Math.round(mt / snapMs) * snapMs);
    };
    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const onDurationResizePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    const el = timelineRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const currentTarget = e.currentTarget as HTMLElement;
    currentTarget.setPointerCapture(e.pointerId);

    const onPointerMove = (moveEvt: PointerEvent) => {
      const moveX = moveEvt.clientX - rect.left + el.scrollLeft - 16;
      const rawMs = moveX / pxPerMs;
      const nextDuration = clamp(Math.round(rawMs / snapMs) * snapMs, 250, 120000);
      onClipChange({ ...clip, durationMs: nextDuration });
    };

    const onPointerUp = (upEvt: PointerEvent) => {
      try {
        currentTarget.releasePointerCapture(upEvt.pointerId);
      } catch (err) {}
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const onKeyframePointerDown = (e: React.PointerEvent, trackId: string, keyframeId: string, currentT: number) => {
    e.stopPropagation();
    setSelectedKeyframeId(keyframeId);
    setActiveTrackId(trackId);
    
    const el = timelineRef.current;
    if (!el) return;
    
    const startX = e.clientX;
    const currentTarget = e.currentTarget as HTMLElement;
    
    try {
      currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}

    const onPointerMove = (moveEvt: PointerEvent) => {
      const dx = moveEvt.clientX - startX;
      const dt = dx / pxPerMs;
      const nextT = clamp(Math.round((currentT + dt) / snapMs) * snapMs, 0, durationMs);
      updateKeyframeProps(trackId, keyframeId, { t: nextT });
    };

    const onPointerUp = (upEvt: PointerEvent) => {
      try {
        currentTarget.releasePointerCapture(upEvt.pointerId);
      } catch (err) {}
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };



  const copyReactCode = () => {
    const elementsData = elements.map((el) => {
      const trackLines = el.tracks
        .map((tr) => {
          const kfs = tr.keyframes
            .map((k) => `            { t: ${k.t}, v: ${k.v}${k.easing ? `, easing: '${k.easing}'` : ''} }`)
            .join(',\n');
          return `        {\n          channel: '${tr.channel}',\n          keyframes: [\n${kfs}\n          ]\n        }`;
        })
        .join(',\n');
      return `    {\n      name: '${el.name}',\n      type: '${el.type}',\n      text: '${el.text}',\n      color: '${el.color}',\n      tracks: [\n${trackLines}\n      ]\n    }`;
    }).join(',\n');

    const code = `import React from 'react';
import { Animate } from '@pixonui/react';

export function MyTimelineAnimation() {
  const elements = [
${elementsData}
  ];

  return (
    <div className="relative w-full h-[300px] bg-zinc-950 flex items-center justify-center overflow-hidden rounded-3xl">
      {elements.map((el) => (
        <Animate
          key={el.name}
          tracks={el.tracks}
          durationMs={${durationMs}}
          loop={${loop}}
          autoplay
        >
          <div className={\`px-6 py-4 rounded-3xl \${el.color}\`}>
            {el.text}
          </div>
        </Animate>
      ))}
    </div>
  );
}`;

    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const secondsMarkers: number[] = [];
  const maxVisibleMs = Math.max(durationMs + 10000, 30000);
  const stepSec = zoom < 0.35 ? 5 : zoom < 0.65 ? 2 : 1;
  for (let i = 0; i <= maxVisibleMs / 1000; i += stepSec) {
    secondsMarkers.push(i);
  }

  const onResizePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    resizeRef.current = {
      startX: e.clientX,
      startWidth: sidebarWidth,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onResizePointerMove = (e: React.PointerEvent) => {
    const data = resizeRef.current;
    if (!data) return;
    const dx = e.clientX - data.startX;
    const nextWidth = clamp(data.startWidth + dx, 180, 480);
    setSidebarWidth(nextWidth);
  };

  const onResizePointerUp = () => {
    resizeRef.current = null;
  };

  const addNewElement = (type: 'box' | 'circle' | 'text' | 'image' | 'star') => {
    const newId = `el-${Date.now().toString(36)}`;
    const typeLabels = {
      box: 'Rounded Box',
      circle: 'Circle Layer',
      text: 'Text Layer',
      image: 'Image Layer',
      star: 'SVG Star',
    };
    const typeColors = {
      box: 'from-purple-500 to-indigo-600 bg-gradient-to-br text-white shadow-xl',
      circle: 'from-cyan-400 to-blue-600 bg-gradient-to-br text-white shadow-xl',
      text: 'text-zinc-800 dark:text-white',
      image: 'bg-zinc-200 dark:bg-zinc-800 border border-white/10 shadow-xl',
      star: 'text-amber-400 drop-shadow-md',
    };
    const typeTexts = {
      box: 'Box Element',
      circle: 'Circle Element',
      text: 'Double Click to Edit',
      image: 'Image Element',
      star: 'Glowing Star',
    };

    const newTracks: AnimationStudioTrack[] = [
      { id: `tr-x-${uid()}`, label: 'Position X', channel: 'x', keyframes: [{ id: uid(), t: 0, v: Math.floor(Math.random() * 80 - 40) }] },
      { id: `tr-y-${uid()}`, label: 'Position Y', channel: 'y', keyframes: [{ id: uid(), t: 0, v: Math.floor(Math.random() * 80 - 40) }] },
      { id: `tr-scale-${uid()}`, label: 'Scale', channel: 'scale', keyframes: [{ id: uid(), t: 0, v: 1 }] },
      { id: `tr-rotate-${uid()}`, label: 'Rotate', channel: 'rotate', keyframes: [{ id: uid(), t: 0, v: 0 }] },
      { id: `tr-opacity-${uid()}`, label: 'Opacity', channel: 'opacity', keyframes: [{ id: uid(), t: 0, v: 1 }] },
    ];

    const newEl: AnimationStudioElement = {
      id: newId,
      name: `${typeLabels[type]} ${elements.length + 1}`,
      type,
      text: typeTexts[type],
      color: typeColors[type],
      imageUrl: type === 'image' ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop' : undefined,
      tracks: newTracks,
    };

    updateElementsState((prev) => [...prev, newEl]);
    setActiveElementId(newId);
    setSelectedKeyframeId(null);
  };

  const deleteElement = (elementId: string) => {
    if (elements.length <= 1) return;
    const nextElements = elements.filter((el) => el.id !== elementId);
    setElements(nextElements);
    if (activeElementId === elementId) {
      setActiveElementId(nextElements[0]!.id);
      setSelectedKeyframeId(null);
    }
  };

  const updateElementProps = (elementId: string, updates: Partial<AnimationStudioElement>) => {
    updateElementsState((prev) =>
      prev.map((el) => (el.id === elementId ? { ...el, ...updates } : el))
    );
  };

  const updateElementTrackValue = (elementId: string, channel: AnimationStudioChannel, nextV: number) => {
    const snappedT = Math.round(timeMs / snapMs) * snapMs;
    updateElementsState((prev) =>
      prev.map((el) => {
        if (el.id !== elementId) return el;
        const track = el.tracks.find((t) => t.channel === channel);
        let nextTracks = [...el.tracks];
        if (!track) {
          const channelLabels = { x: 'Position X', y: 'Position Y', scale: 'Scale', rotate: 'Rotate', opacity: 'Opacity' };
          const newTr: AnimationStudioTrack = {
            id: `tr-${channel}-${uid()}`,
            label: channelLabels[channel],
            channel,
            keyframes: [{ id: uid(), t: snappedT, v: nextV, easing: 'linear' }],
          };
          nextTracks.push(newTr);
        } else {
          const existingIndex = track.keyframes.findIndex((kf) => Math.abs(kf.t - snappedT) < 1);
          let nextKeyframes = [...track.keyframes];
          if (existingIndex !== -1) {
            nextKeyframes[existingIndex] = { ...nextKeyframes[existingIndex]!, v: nextV };
          } else {
            nextKeyframes.push({ id: uid(), t: snappedT, v: nextV, easing: 'linear' });
          }
          nextTracks = el.tracks.map((t) => (t.channel === channel ? { ...t, keyframes: nextKeyframes } : t));
        }
        return { ...el, tracks: nextTracks };
      })
    );
  };

  const startDragTranslate = (e: React.PointerEvent, elementId: string, currentX: number, currentY: number) => {
    e.stopPropagation();
    setActiveElementId(elementId);
    setSelectedKeyframeId(null);
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;

    const onPointerMove = (moveEvt: PointerEvent) => {
      const dx = moveEvt.clientX - startMouseX;
      const dy = moveEvt.clientY - startMouseY;
      updateElementTrackValue(elementId, 'x', Math.round(currentX + dx));
      updateElementTrackValue(elementId, 'y', Math.round(currentY + dy));
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const startDragScale = (e: React.PointerEvent, elementId: string, startScale: number) => {
    e.stopPropagation();
    const startY = e.clientY;

    const onPointerMove = (moveEvt: PointerEvent) => {
      const dy = startY - moveEvt.clientY;
      const scaleDelta = dy * 0.015;
      const newScale = clamp(parseFloat((startScale + scaleDelta).toFixed(3)), 0.1, 4.0);
      updateElementTrackValue(elementId, 'scale', newScale);
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const startDragRotate = (e: React.PointerEvent, elementId: string, startRotate: number) => {
    e.stopPropagation();
    const startX = e.clientX;

    const onPointerMove = (moveEvt: PointerEvent) => {
      const dx = moveEvt.clientX - startX;
      const angleDelta = dx * 0.8;
      const newRotate = Math.round(startRotate + angleDelta);
      updateElementTrackValue(elementId, 'rotate', newRotate);
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const renderDrawerPropertyRow = (
    label: string,
    channel: AnimationStudioChannel,
    min: number,
    max: number,
    step: number,
    unit: string = ''
  ) => {
    const track = activeElement?.tracks.find((tr) => tr.channel === channel);
    if (!track) {
      return (
        <div className="flex items-center justify-between py-2.5 border-b border-zinc-100 dark:border-white/[0.04] transition-colors hover:bg-zinc-50/50 dark:hover:bg-white/[0.01] px-1 rounded-lg">
          <Text className="text-xs font-bold text-zinc-400 dark:text-zinc-500">{label}</Text>
          <Button
            variant="secondary"
            size="sm"
            className="h-7 gap-1 text-[10px] py-1 px-2.5 font-extrabold rounded-lg"
            onClick={() => addTrackForChannel(channel)}
          >
            <Plus className="h-3 w-3 text-purple-500" />
            + Animate
          </Button>
        </div>
      );
    }

    const currentVal = valueAt(track, timeMs);
    const hasKf = hasKeyframeAtTime(track, timeMs);

    return (
      <div className="flex flex-col py-2.5 border-b border-zinc-100 dark:border-white/[0.04] transition-colors hover:bg-zinc-50/50 dark:hover:bg-white/[0.01] px-1 rounded-lg">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleKeyframeAtTime(track.id, timeMs)}
              className={cn(
                'w-2.5 h-2.5 rotate-45 border transition-all cursor-pointer flex-shrink-0',
                hasKf
                  ? 'bg-purple-600 border-purple-600 shadow-[0_0_6px_rgba(168,85,247,0.6)]'
                  : 'bg-transparent border-zinc-400 dark:border-zinc-500 hover:border-purple-500'
              )}
              title={hasKf ? 'Remove keyframe at playhead' : 'Add keyframe at playhead'}
            />
            <Text className="text-xs font-extrabold text-zinc-700 dark:text-zinc-300">{label}</Text>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              step={step}
              value={parseFloat(currentVal.toFixed(2))}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) updateTrackValueAtTime(track.id, timeMs, clamp(val, min, max));
              }}
              className="w-16 text-center text-xs font-mono font-bold bg-zinc-100 dark:bg-black/30 text-zinc-950 dark:text-white rounded border border-zinc-200/80 dark:border-white/10 p-0.5"
            />
            {unit && <Text className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono font-bold">{unit}</Text>}
          </div>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentVal}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            updateTrackValueAtTime(track.id, timeMs, val);
          }}
          className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
        />
      </div>
    );
  };

  const summaryKeyframeTimes = useMemo(() => {
    const times = new Set<number>();
    if (activeElement) {
      for (const tr of activeElement.tracks) {
        for (const kf of tr.keyframes) {
          times.add(kf.t);
        }
      }
    }
    return [...times].sort((a, b) => a - b);
  }, [activeElement?.tracks]);

  const renderToolbar = (isCompactStage = false) => {
    return (
      <div className={cn(
        "flex flex-wrap items-center justify-between gap-4 p-4",
        isCompactStage 
          ? "mt-4 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-200/50 dark:border-white/[0.03] rounded-2xl" 
          : "bg-white/70 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 rounded-3xl shadow-sm"
      )}>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={isPlaying ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-9 font-extrabold rounded-xl"
          >
            {isPlaying ? <Pause className="h-4 w-4 mr-1.5 fill-current" /> : <Play className="h-4 w-4 mr-1.5 fill-current" />}
            {isPlaying ? 'Pause' : 'Play'}
          </Button>

          <span className="w-px h-5 bg-zinc-200 dark:bg-white/10 mx-1" />

          <div className="flex items-center rounded-xl bg-zinc-100/70 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none border-none text-zinc-500 hover:text-zinc-950 dark:text-white/40 dark:hover:text-white"
              onClick={jumpToPrevKeyframe}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none border-none text-zinc-500 hover:text-zinc-950 dark:text-white/40 dark:hover:text-white"
              onClick={jumpToNextKeyframe}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <span className="w-px h-5 bg-zinc-200 dark:bg-white/10 mx-1" />

          <Button
            variant={playDirection === 'reverse' ? 'primary' : 'secondary'}
            size="sm"
            className="gap-1.5 font-bold rounded-xl"
            onClick={() => setPlayDirection((d) => (d === 'forward' ? 'reverse' : 'forward'))}
            title="Toggle reverse playback"
          >
            <ArrowLeftRight className={cn('h-4 w-4 transition-transform', playDirection === 'reverse' && 'rotate-180 text-purple-300')} />
            {playDirection === 'forward' ? 'Forward' : 'Reverse'}
          </Button>

          <Button
            variant={loop ? 'primary' : 'secondary'}
            size="sm"
            className="gap-1.5 font-bold rounded-xl"
            onClick={() => setLoop((l) => !l)}
            title="Toggle loop wrapping"
          >
            <Repeat className={cn('h-4 w-4', loop && 'text-purple-300')} />
            Loop
          </Button>

          <span className="w-px h-5 bg-zinc-200 dark:bg-white/10 mx-1" />

          <Surface className="px-3 py-2 rounded-xl bg-white/70 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10">
            <Text size="xs" className="tabular-nums text-zinc-700 dark:text-white/70 font-bold">
              {formatTime(timeMs)} / {formatTime(durationMs)}
            </Text>
          </Surface>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Dynamic Numeric Duration Editor */}
          <div className="flex items-center gap-2">
            <Text size="xs" className="text-zinc-500 dark:text-white/40 font-extrabold select-none">Duration:</Text>
            <div className="flex items-center bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-white/10 rounded-xl px-2 py-1 shadow-sm gap-1">
              <button
                type="button"
                className="text-zinc-400 hover:text-zinc-950 dark:hover:text-white text-xs font-extrabold px-1 cursor-pointer select-none"
                onClick={() => onClipChange({ ...clip, durationMs: Math.max(250, clip.durationMs - 250) })}
                title="Shorter by 250ms"
              >
                -
              </button>
              <input
                type="number"
                value={durationMs}
                step={100}
                min={250}
                max={120000}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val > 0) {
                    onClipChange({ ...clip, durationMs: val });
                  }
                }}
                className="w-16 text-center text-xs font-mono font-bold bg-transparent border-none text-zinc-950 dark:text-white focus:outline-none focus:ring-0 p-0"
              />
              <button
                type="button"
                className="text-zinc-400 hover:text-zinc-950 dark:hover:text-white text-xs font-extrabold px-1 cursor-pointer select-none"
                onClick={() => onClipChange({ ...clip, durationMs: Math.min(120000, clip.durationMs + 250) })}
                title="Longer by 250ms"
              >
                +
              </button>
              <span className="text-[10px] text-zinc-400 font-extrabold uppercase ml-1">ms</span>
            </div>
          </div>

          <span className="w-px h-5 bg-zinc-200 dark:bg-white/10" />

          {/* Dynamic Stage Preview Zoom Slider */}
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-white/10 rounded-xl px-2.5 py-1.5 shadow-sm">
            <Text size="xs" className="text-zinc-500 dark:text-white/40 font-extrabold select-none">Stage Zoom:</Text>
            <ZoomOut className="h-3.5 w-3.5 text-zinc-400" />
            <input
              type="range"
              min="0.25"
              max="2.0"
              step="0.05"
              value={previewZoom}
              onChange={(e) => setPreviewZoom(parseFloat(e.target.value))}
              className="w-24 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-600 focus:outline-none"
              title="Stage preview zoom scale"
            />
            <ZoomIn className="h-3.5 w-3.5 text-zinc-400" />
            <span className="text-[10px] text-zinc-400 dark:text-white/40 font-mono font-bold w-10 text-right select-none">
              {Math.round(previewZoom * 100)}%
            </span>
          </div>

          <span className="w-px h-5 bg-zinc-200 dark:bg-white/10" />

          <Button
            variant="secondary"
            size="sm"
            className="gap-2 font-bold rounded-xl bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/40 hover:bg-purple-100 dark:hover:bg-purple-900/30"
            onClick={copyReactCode}
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied!' : 'Export Code'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {!showStage && renderToolbar()}

      {showStage && (
        <Surface className="p-6 mb-2 bg-white/70 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <Text className="text-sm font-extrabold text-zinc-900 dark:text-white">Stage Canvas</Text>
            <Text size="xs" className="text-zinc-500 dark:text-white/40 font-bold">
              Click elements to select • Drag center to Move • Drag outer handles to Scale/Rotate
            </Text>
          </div>
          <div className="relative h-[280px] rounded-3xl border border-zinc-200/80 dark:border-white/10 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-950/70 dark:to-black/60 overflow-hidden shadow-inner">
            <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.10]" style={{
              backgroundImage:
                'linear-gradient(to right, rgba(0,0,0,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.12) 1px, transparent 1px)',
              backgroundSize: '18px 18px',
            }} />
            <div className="absolute inset-0 flex items-center justify-center">
              {stage ?? (
                <div 
                  className="relative w-full h-full overflow-hidden flex items-center justify-center transition-transform duration-150 ease-out"
                  style={{ transform: `scale(${previewZoom})`, transformOrigin: 'center' }}
                >
                  {elements.map((el) => {
                    const isSelected = el.id === activeElementId;
                    const trackX = el.tracks.find((t) => t.channel === 'x');
                    const trackY = el.tracks.find((t) => t.channel === 'y');
                    const trackScale = el.tracks.find((t) => t.channel === 'scale');
                    const trackRotate = el.tracks.find((t) => t.channel === 'rotate');
                    const trackOpacity = el.tracks.find((t) => t.channel === 'opacity');

                    const valX = trackX ? valueAt(trackX, timeMs) : 0;
                    const valY = trackY ? valueAt(trackY, timeMs) : 0;
                    const valScale = trackScale ? valueAt(trackScale, timeMs) : 1;
                    const valRotate = trackRotate ? valueAt(trackRotate, timeMs) : 0;
                    const valOpacity = trackOpacity ? valueAt(trackOpacity, timeMs) : 1;

                    const style: React.CSSProperties = {
                      position: 'absolute',
                      transform: `translate3d(${valX}px, ${valY}px, 0px) scale(${valScale}) rotate(${valRotate}deg)`,
                      opacity: valOpacity,
                      zIndex: isSelected ? 50 : 10,
                      cursor: isPlaying ? 'default' : 'move',
                    };

                    const renderElementBody = () => {
                      const textDisplay = editingElementId === el.id ? (
                        <input
                          autoFocus
                          value={el.text}
                          onChange={(e) => updateElementProps(el.id, { text: e.target.value })}
                          onBlur={() => setEditingElementId(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') setEditingElementId(null);
                          }}
                          className="bg-black/50 text-white font-bold text-center text-[11px] p-0.5 rounded border border-purple-500 focus:outline-none w-28"
                          onClick={(evt) => evt.stopPropagation()}
                        />
                      ) : (
                        <Text size="xs" className="font-extrabold select-none truncate max-w-[120px]" onDoubleClick={(evt) => {
                          evt.stopPropagation();
                          setEditingElementId(el.id);
                        }}>
                          {el.text}
                        </Text>
                      );

                      if (el.type === 'circle') {
                        return (
                          <div className={cn("w-16 h-16 rounded-full flex items-center justify-center p-2 text-center", el.color)}>
                            {textDisplay}
                          </div>
                        );
                      }
                      if (el.type === 'box') {
                        return (
                          <Surface className={cn("px-4 py-3 rounded-2xl flex items-center gap-3 border shadow-md", el.color)}>
                            <div className="h-6 w-6 rounded-lg bg-white/20 flex-shrink-0 flex items-center justify-center">
                              <Layers className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              {textDisplay}
                              <Text className="text-[9px] opacity-70 font-bold leading-none select-none">Layer</Text>
                            </div>
                          </Surface>
                        );
                      }
                      if (el.type === 'text') {
                        return (
                          <div className={cn("px-2 py-1 font-extrabold text-lg select-none tracking-tight", el.color)}>
                            {textDisplay}
                          </div>
                        );
                      }
                      if (el.type === 'image') {
                        return (
                          <div className="relative w-28 h-20 rounded-2xl overflow-hidden shadow-lg border border-white/15 bg-zinc-900 group">
                            <img src={el.imageUrl} alt={el.name} className="w-full h-full object-cover select-none pointer-events-none" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-1">
                              {textDisplay}
                            </div>
                          </div>
                        );
                      }
                      if (el.type === 'star') {
                        return (
                          <div className="flex flex-col items-center justify-center text-amber-400 select-none animate-pulse">
                            <Star className="h-10 w-10 fill-current" />
                            <div className="mt-1">{textDisplay}</div>
                          </div>
                        );
                      }
                      return null;
                    };

                    return (
                      <div
                        key={el.id}
                        style={style}
                        onPointerDown={(e) => startDragTranslate(e, el.id, valX, valY)}
                        className="will-change-transform"
                      >
                        {renderElementBody()}

                        {/* Bounding box transform handles if selected & not playing */}
                        {isSelected && !isPlaying && (
                          <>
                            {/* Selected Border Outline */}
                            <div className="absolute -inset-2 border border-dashed border-purple-500 rounded-lg pointer-events-none shadow-[0_0_8px_rgba(168,85,247,0.3)]" />

                            {/* 8 resize anchors */}
                            {/* Top Left */}
                            <div
                              className="absolute -top-3.5 -left-3.5 w-2.5 h-2.5 bg-white border-2 border-purple-600 rounded-sm shadow-md cursor-nwse-resize hover:scale-125 transition-transform z-50 pointer-events-auto"
                              onPointerDown={(e) => startDragScale(e, el.id, valScale)}
                            />
                            {/* Top Center */}
                            <div
                              className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-2 border-purple-600 rounded-sm shadow-md cursor-ns-resize hover:scale-125 transition-transform z-50 pointer-events-auto"
                              onPointerDown={(e) => startDragScale(e, el.id, valScale)}
                            />
                            {/* Top Right */}
                            <div
                              className="absolute -top-3.5 -right-3.5 w-2.5 h-2.5 bg-white border-2 border-purple-600 rounded-sm shadow-md cursor-nesw-resize hover:scale-125 transition-transform z-50 pointer-events-auto"
                              onPointerDown={(e) => startDragScale(e, el.id, valScale)}
                            />
                            {/* Right Center */}
                            <div
                              className="absolute top-1/2 -translate-y-1/2 -right-3.5 w-2.5 h-2.5 bg-white border-2 border-purple-600 rounded-sm shadow-md cursor-ew-resize hover:scale-125 transition-transform z-50 pointer-events-auto"
                              onPointerDown={(e) => startDragScale(e, el.id, valScale)}
                            />
                            {/* Bottom Right */}
                            <div
                              className="absolute -bottom-3.5 -right-3.5 w-2.5 h-2.5 bg-white border-2 border-purple-600 rounded-sm shadow-md cursor-nwse-resize hover:scale-125 transition-transform z-50 pointer-events-auto"
                              onPointerDown={(e) => startDragScale(e, el.id, valScale)}
                            />
                            {/* Bottom Center */}
                            <div
                              className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-2 border-purple-600 rounded-sm shadow-md cursor-ns-resize hover:scale-125 transition-transform z-50 pointer-events-auto"
                              onPointerDown={(e) => startDragScale(e, el.id, valScale)}
                            />
                            {/* Bottom Left */}
                            <div
                              className="absolute -bottom-3.5 -left-3.5 w-2.5 h-2.5 bg-white border-2 border-purple-600 rounded-sm shadow-md cursor-nesw-resize hover:scale-125 transition-transform z-50 pointer-events-auto"
                              onPointerDown={(e) => startDragScale(e, el.id, valScale)}
                            />
                            {/* Left Center */}
                            <div
                              className="absolute top-1/2 -translate-y-1/2 -left-3.5 w-2.5 h-2.5 bg-white border-2 border-purple-600 rounded-sm shadow-md cursor-ew-resize hover:scale-125 transition-transform z-50 pointer-events-auto"
                              onPointerDown={(e) => startDragScale(e, el.id, valScale)}
                            />

                            {/* Rotation Handle protruder */}
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center z-50 select-none pointer-events-auto">
                              <div className="w-0.5 h-3.5 bg-purple-500" />
                              <div
                                className="w-3.5 h-3.5 bg-purple-600 rounded-full border-2 border-white shadow-lg cursor-grab active:cursor-grabbing hover:scale-125 hover:bg-purple-500 transition-all"
                                onPointerDown={(e) => startDragRotate(e, el.id, valRotate)}
                                title="Drag horizontal to Rotate"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          {renderToolbar(true)}
        </Surface>
      )}

      <div className="flex gap-4 w-full items-stretch min-h-[350px]">
        <Surface className="flex flex-1 overflow-hidden bg-white/70 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 rounded-3xl shadow-sm">
          <div className="flex flex-col py-4" style={{ width: sidebarWidth }}>
            <div className="px-4 flex items-center justify-between mb-3 relative">
              <Text className="text-sm font-extrabold text-zinc-900 dark:text-white">Layers</Text>
              <div className="relative group">
                <Button
                  variant="ghost"
                  size="icon"
                  title="Add new Element"
                  className="h-8 w-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <div className="absolute right-0 top-8 w-40 bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-white/10 rounded-2xl shadow-xl py-2 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button onClick={() => addNewElement('box')} className="w-full px-3 py-1.5 text-xs text-left hover:bg-zinc-50 dark:hover:bg-white/5 flex items-center gap-2 text-zinc-700 dark:text-white font-semibold">
                    <Square className="h-3.5 w-3.5 text-purple-500" /> Rounded Box
                  </button>
                  <button onClick={() => addNewElement('circle')} className="w-full px-3 py-1.5 text-xs text-left hover:bg-zinc-50 dark:hover:bg-white/5 flex items-center gap-2 text-zinc-700 dark:text-white font-semibold">
                    <Disc className="h-3.5 w-3.5 text-cyan-500" /> Circle Layer
                  </button>
                  <button onClick={() => addNewElement('text')} className="w-full px-3 py-1.5 text-xs text-left hover:bg-zinc-50 dark:hover:bg-white/5 flex items-center gap-2 text-zinc-700 dark:text-white font-semibold">
                    <Type className="h-3.5 w-3.5 text-emerald-500" /> Text Layer
                  </button>
                  <button onClick={() => addNewElement('image')} className="w-full px-3 py-1.5 text-xs text-left hover:bg-zinc-50 dark:hover:bg-white/5 flex items-center gap-2 text-zinc-700 dark:text-white font-semibold">
                    <Image className="h-3.5 w-3.5 text-rose-500" /> Image Layer
                  </button>
                  <button onClick={() => addNewElement('star')} className="w-full px-3 py-1.5 text-xs text-left hover:bg-zinc-50 dark:hover:bg-white/5 flex items-center gap-2 text-zinc-700 dark:text-white font-semibold">
                    <Star className="h-3.5 w-3.5 text-amber-500" /> SVG Star
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col overflow-y-auto max-h-[300px]">
              {elements.map((el) => {
                const isElActive = el.id === activeElementId;
                return (
                  <div key={el.id} className="flex flex-col">
                    <div
                      className={cn(
                        "w-full flex items-center justify-between gap-2 px-3 py-2 text-left border-y border-zinc-200/40 dark:border-white/5 transition-colors cursor-pointer",
                        isElActive ? "bg-purple-500/10 border-purple-500/20" : "hover:bg-zinc-50 dark:hover:bg-white/[0.02]"
                      )}
                      onClick={() => {
                        setActiveElementId(el.id);
                        setSelectedKeyframeId(null);
                      }}
                      style={{ height: 40 }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {el.type === 'circle' && <Disc className="h-4 w-4 text-cyan-500" />}
                        {el.type === 'box' && <Square className="h-4 w-4 text-purple-500" />}
                        {el.type === 'text' && <Type className="h-4 w-4 text-emerald-500" />}
                        {el.type === 'image' && <Image className="h-4 w-4 text-rose-500" />}
                        {el.type === 'star' && <Star className="h-4 w-4 text-amber-500" />}
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{el.name}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {elements.length > 1 && (
                          <button
                            onClick={(evt) => {
                              evt.stopPropagation();
                              deleteElement(el.id);
                            }}
                            className="p-1 hover:text-red-500 text-zinc-400 rounded transition-colors"
                            title="Delete Layer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {isElActive && (
                      <div className="flex flex-col bg-zinc-50/50 dark:bg-black/10">
                        {el.tracks.map((tr) => {
                          const isActiveTrack = tr.id === activeTrack?.id;
                          const val = valueAt(tr, timeMs);
                          const valStr = tr.channel === 'opacity' || tr.channel === 'scale' ? val.toFixed(2) : Math.round(val);
                          const suffix = tr.channel === 'x' || tr.channel === 'y' ? 'px' : tr.channel === 'rotate' ? '°' : '';
                          const hasKf = hasKeyframeAtTime(tr, timeMs);

                          return (
                            <button
                              key={tr.id}
                              type="button"
                              onClick={() => {
                                setActiveTrackId(tr.id);
                                setSelectedKeyframeId(null);
                              }}
                              className={cn(
                                'w-full flex items-center justify-between gap-2 pl-8 pr-3 py-1 text-left transition-colors border-b border-zinc-100 dark:border-white/[0.02]',
                                isActiveTrack
                                  ? 'bg-purple-500/5 text-purple-700 dark:text-purple-300 font-extrabold'
                                  : 'text-zinc-500 dark:text-white/40 hover:bg-zinc-50/50 dark:hover:bg-white/[0.01]'
                              )}
                              style={{ height: 32 }}
                            >
                              <div className="flex items-center min-w-0">
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleKeyframeAtTime(tr.id, timeMs);
                                  }}
                                  className={cn(
                                    'w-2 h-2 rotate-45 border-2 transition-all mr-2 flex-shrink-0 cursor-pointer block',
                                    hasKf
                                      ? 'bg-purple-600 border-purple-600 shadow-[0_0_6px_rgba(168,85,247,0.6)]'
                                      : 'bg-transparent border-zinc-400 dark:border-zinc-500 hover:border-purple-500'
                                  )}
                                  title={hasKf ? 'Remove keyframe' : 'Add keyframe'}
                                />
                                <span className="text-[11px] font-semibold truncate">{tr.label}</span>
                              </div>
                              <span className="text-[10px] font-bold font-mono opacity-80 shrink-0">
                                {valStr}
                                {suffix}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div
            onPointerDown={onResizePointerDown}
            onPointerMove={onResizePointerMove}
            onPointerUp={onResizePointerUp}
            onPointerLeave={onResizePointerUp}
            className="w-1 cursor-col-resize hover:bg-purple-500/50 active:bg-purple-600 bg-zinc-200/80 dark:bg-white/10 transition-colors z-20 select-none flex-shrink-0"
          />

          <div className="flex-1 min-w-0 flex flex-col py-4 overflow-hidden relative">
            <div className="px-4 flex items-center justify-between mb-3">
              <Text className="text-sm font-extrabold text-zinc-900 dark:text-white">Timeline</Text>
              <Text size="xs" className="text-zinc-500 dark:text-white/40 font-bold">
                Click headers to scrub • Drag keyframes
              </Text>
            </div>

            <div
              ref={timelineRef}
              className="flex-1 w-full overflow-auto rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-white/60 dark:bg-black/20"
              onPointerDown={onPlayheadPointerDown}
            >
              <div
                className="relative min-w-full"
                style={{
                  width: durationMs * pxPerMs + 64,
                  height: 40 + (activeElement ? activeElement.tracks.length * 32 : 0) + 40,
                }}
              >
                <div
                  className="absolute top-0 bottom-0 bg-zinc-100/30 dark:bg-zinc-950/20 pointer-events-none z-0"
                  style={{
                    left: durationMs * pxPerMs + 16,
                    right: 0,
                    width: '100%',
                  }}
                >
                  <div className="absolute top-2 left-3 text-[9px] font-extrabold text-zinc-400 dark:text-zinc-600 uppercase tracking-wider select-none">
                    End of Clip
                  </div>
                </div>

                <div
                  className="absolute top-0 bottom-0 w-4 -ml-2 cursor-col-resize group z-30"
                  style={{ left: durationMs * pxPerMs + 16 }}
                  onPointerDown={onDurationResizePointerDown}
                  title="Drag to resize animation duration"
                >
                  <div className="absolute inset-y-0 left-1.5 w-1 border-l-2 border-dashed border-zinc-300 dark:border-white/20 group-hover:border-purple-500 group-active:border-purple-600 transition-colors" />
                  <div className="absolute top-0 left-0 w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-700 opacity-0 group-hover:opacity-100 group-hover:scale-110 group-hover:bg-purple-500 dark:group-hover:bg-purple-500 transition-all shadow-md shadow-purple-500/20 border border-white" />
                </div>

                {secondsMarkers.map((s) => (
                  <div
                    key={s}
                    className="absolute top-0 bottom-0 border-l border-zinc-200/70 dark:border-white/5 z-0"
                    style={{ left: s * currentPxPerSecond + 16 }}
                  >
                    <div className="absolute top-2 left-2 text-[10px] font-extrabold text-zinc-500 dark:text-white/40 tabular-nums select-none">
                      {s}s
                    </div>
                  </div>
                ))}

                <div
                  className="absolute top-0 bottom-0 w-px bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.4)] z-20 pointer-events-none"
                  style={{ left: timeMs * pxPerMs + 16 }}
                >
                  <div className="absolute top-0 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-purple-500 shadow-md shadow-purple-500/40 border border-white" />
                </div>

                <div className="absolute left-0 right-0 top-10 flex flex-col z-10">
                  <div
                    className="relative w-full flex items-center bg-zinc-50/50 dark:bg-white/[0.01] border-y border-zinc-200/80 dark:border-white/5 px-4"
                    style={{ height: 40 }}
                  >
                    {summaryKeyframeTimes.map((time) => (
                      <div
                        key={time}
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-zinc-400 dark:bg-zinc-600 border border-zinc-300 dark:border-zinc-800"
                        style={{ left: time * pxPerMs + 16 }}
                        title={`Folder Keyframes @ ${formatTime(time)}`}
                      />
                    ))}
                  </div>

                  {activeElement &&
                    activeElement.tracks.map((tr) => {
                      const isActive = tr.id === activeTrack?.id;
                      return (
                        <div
                          key={tr.id}
                          className={cn(
                            'relative w-full border-b border-zinc-100 dark:border-white/[0.02] px-4 transition-colors',
                            isActive ? 'bg-purple-500/[0.02]' : 'bg-transparent'
                          )}
                          style={{ height: 32 }}
                          onContextMenu={(e) => handleTrackContextMenu(e, tr.id)}
                        >
                          {tr.keyframes.length >= 2 && (() => {
                            const sorted = sortKeyframes(tr.keyframes);
                            const tStart = sorted[0]!.t;
                            const tEnd = sorted[sorted.length - 1]!.t;
                            const left = tStart * pxPerMs + 16;
                            const width = (tEnd - tStart) * pxPerMs;
                            return (
                              <div
                                className="absolute top-1/2 -translate-y-1/2 h-[3.5px] rounded-full bg-gradient-to-r from-purple-500/25 via-purple-500/10 to-purple-500/25 border-t border-b border-purple-400/10 pointer-events-none shadow-[0_0_8px_rgba(168,85,247,0.1)]"
                                style={{ left, width }}
                              />
                            );
                          })()}

                          {tr.keyframes.map((kf) => {
                            const isSelected = selectedKeyframeId === kf.id;
                            return (
                              <div
                                key={kf.id}
                                className={cn(
                                  'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45 border shadow-sm cursor-grab active:cursor-grabbing transition-transform hover:scale-125 z-10',
                                  isSelected
                                    ? 'bg-purple-500 border-purple-300 dark:border-purple-400 scale-125 ring-2 ring-purple-500/30'
                                    : 'bg-white dark:bg-zinc-950 border-zinc-300 dark:border-white/20'
                                )}
                                style={{ left: kf.t * pxPerMs + 16 }}
                                onPointerDown={(e) => onKeyframePointerDown(e, tr.id, kf.id, kf.t)}
                                onContextMenu={(e) => handleKeyframeContextMenu(e, tr.id, kf)}
                                title={`${tr.label} @ ${formatTime(kf.t)} (${kf.easing || 'linear'})`}
                              />
                            );
                          })}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Timeline zoom slider in bottom footer of timeline wrapper */}
            <div className="px-4 mt-3 flex items-center justify-between border-t border-zinc-200/50 dark:border-white/[0.05] pt-3 shrink-0 select-none">
              <div className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500 text-[10px] font-extrabold uppercase tracking-wider">
                <span>Timeline Control</span>
              </div>
              <div className="flex items-center gap-2 bg-white/50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-white/10 rounded-xl px-2.5 py-1 shadow-sm">
                <ZoomOut className="h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="range"
                  min="0.1"
                  max="4.0"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-28 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-600 focus:outline-none"
                  title="Horizontal timeline zoom scale"
                />
                <ZoomIn className="h-3.5 w-3.5 text-zinc-400" />
                <span className="text-[10px] text-zinc-400 dark:text-white/40 font-mono font-bold w-10 text-right select-none">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
            </div>
          </div>
        </Surface>

        {isDrawerOpen ? (
          <Surface className="w-[320px] p-5 bg-white/70 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 rounded-3xl shadow-sm flex flex-col justify-between shrink-0 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-purple-500" />
                  <Text className="text-sm font-extrabold text-zinc-900 dark:text-white">Properties</Text>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-xl"
                  onClick={() => setIsDrawerOpen(false)}
                  title="Close properties panel"
                >
                  <PanelRightClose className="h-4 w-4" />
                </Button>
              </div>

              {activeElement && (
                <div className="mb-4 bg-zinc-50 dark:bg-black/20 rounded-2xl border border-zinc-200/50 dark:border-white/[0.03] p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-purple-500" />
                      <Text className="text-xs font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider">
                        Layer Config
                      </Text>
                    </div>
                    {elements.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-lg text-red-500 hover:bg-red-500/10"
                        onClick={() => deleteElement(activeElement.id)}
                        title="Delete Layer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-extrabold uppercase text-zinc-400 select-none block mb-1">Layer Name</label>
                      <input
                        type="text"
                        value={activeElement.name}
                        onChange={(e) => updateElementProps(activeElement.id, { name: e.target.value })}
                        className="w-full text-xs font-bold bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white rounded-xl border border-zinc-200 dark:border-white/10 px-2.5 py-1.5 shadow-sm focus:ring-1 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold uppercase text-zinc-400 select-none block mb-1">Content Text</label>
                      <input
                        type="text"
                        value={activeElement.text}
                        onChange={(e) => updateElementProps(activeElement.id, { text: e.target.value })}
                        className="w-full text-xs font-bold bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white rounded-xl border border-zinc-200 dark:border-white/10 px-2.5 py-1.5 shadow-sm focus:ring-1 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>

                    {activeElement.type === 'image' && (
                      <div>
                        <label className="text-[10px] font-extrabold uppercase text-zinc-400 select-none block mb-1">Image URL</label>
                        <input
                          type="text"
                          value={activeElement.imageUrl || ''}
                          onChange={(e) => updateElementProps(activeElement.id, { imageUrl: e.target.value })}
                          className="w-full text-xs font-bold bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white rounded-xl border border-zinc-200 dark:border-white/10 px-2.5 py-1.5 shadow-sm focus:ring-1 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>
                    )}

                    {activeElement.type !== 'text' && activeElement.type !== 'star' && (
                      <div>
                        <label className="text-[10px] font-extrabold uppercase text-zinc-400 select-none block mb-1">Theme Gradient</label>
                        <select
                          value={GRADIENT_PRESETS.find(p => activeElement.color.includes(p.classes.split(' ')[0] || ''))?.id || 'purple-indigo'}
                          onChange={(e) => {
                            const preset = GRADIENT_PRESETS.find(p => p.id === e.target.value);
                            if (preset) {
                              updateElementProps(activeElement.id, { color: preset.classes });
                            }
                          }}
                          className="w-full text-xs font-bold bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white rounded-xl border border-zinc-200 dark:border-white/10 px-2.5 py-1.5 shadow-sm focus:ring-1 focus:ring-purple-500 focus:outline-none cursor-pointer"
                        >
                          {GRADIENT_PRESETS.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-1">
                {renderDrawerPropertyRow('Position X', 'x', -300, 300, 1, 'px')}
                {renderDrawerPropertyRow('Position Y', 'y', -300, 300, 1, 'px')}
                {renderDrawerPropertyRow('Scale', 'scale', 0.1, 4.0, 0.01, '')}
                {renderDrawerPropertyRow('Rotate', 'rotate', -360, 360, 1, 'deg')}
                {renderDrawerPropertyRow('Opacity', 'opacity', 0.0, 1.0, 0.01, '')}
              </div>
            </div>

            {selectedKeyframe && (
              <div className="mt-6 border-t border-zinc-200/80 dark:border-white/10 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Text className="text-xs font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-widest">
                    🔑 Keyframe Config
                  </Text>
                </div>

                <div className="space-y-3.5 bg-zinc-50 dark:bg-black/20 rounded-2xl border border-zinc-200/60 dark:border-white/[0.05] p-3">
                  <div className="flex items-center justify-between">
                    <Text className="text-xs font-semibold text-zinc-500">Exact Time</Text>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={selectedKeyframe.keyframe.t}
                        step={snapMs}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val)) {
                            updateKeyframeProps(selectedKeyframe.trackId, selectedKeyframe.keyframe.id, { t: val });
                          }
                        }}
                        className="w-20 text-center text-xs font-mono font-bold bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white rounded-lg border border-zinc-200 dark:border-white/10 p-1"
                      />
                      <Text className="text-[10px] text-zinc-400 font-mono font-bold">ms</Text>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Text className="text-xs font-semibold text-zinc-500">Value</Text>
                    <input
                      type="number"
                      value={parseFloat(selectedKeyframe.keyframe.v.toFixed(3))}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                          updateKeyframeProps(selectedKeyframe.trackId, selectedKeyframe.keyframe.id, { v: val });
                        }
                      }}
                      className="w-20 text-center text-xs font-mono font-bold bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white rounded-lg border border-zinc-200 dark:border-white/10 p-1"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <Text className="text-xs font-semibold text-zinc-500">Curve Easing</Text>
                      <select
                        value={selectedKeyframe.keyframe.easing ?? 'linear'}
                        onChange={(e) => {
                          updateKeyframeProps(selectedKeyframe.trackId, selectedKeyframe.keyframe.id, {
                            easing: e.target.value,
                          });
                        }}
                        className="text-xs font-bold bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white rounded-lg border border-zinc-200 dark:border-white/10 p-1 focus:ring-1 focus:ring-purple-500 cursor-pointer"
                      >
                        {Object.keys(EASING_CURVES).map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <Button
                    variant="danger"
                    size="sm"
                    className="w-full h-8 gap-1 text-[10px] py-1.5 font-bold justify-center rounded-xl"
                    onClick={() => removeKeyframe(selectedKeyframe.trackId, selectedKeyframe.keyframe.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete Keyframe
                  </Button>
                </div>
              </div>
            )}
          </Surface>
        ) : (
          <Surface className="flex flex-col items-center justify-center p-3 border border-zinc-200/80 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] rounded-3xl w-14 shrink-0 transition-all select-none">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-xl"
              onClick={() => setIsDrawerOpen(true)}
              title="Open properties panel"
            >
              <PanelRightOpen className="h-4 w-4" />
            </Button>
          </Surface>
        )}
      </div>

      {contextMenu.visible && (
        <div
          className="fixed bg-zinc-950/95 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-1.5 w-48 text-left z-[100] animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-0.5 select-none"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.keyframeId ? (
            <>
              <button
                onClick={() => {
                  handleCopyKeyframe(contextMenu.trackId, contextMenu.keyframeId!);
                  setContextMenu((prev) => ({ ...prev, visible: false }));
                }}
                className="w-full text-left px-3 py-2 text-xs font-bold text-zinc-300 hover:text-white hover:bg-purple-600 rounded-xl transition-colors flex items-center gap-2"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy Keyframe
              </button>
              <button
                onClick={() => {
                  handleDuplicateKeyframe(contextMenu.trackId, contextMenu.keyframeId!);
                  setContextMenu((prev) => ({ ...prev, visible: false }));
                }}
                className="w-full text-left px-3 py-2 text-xs font-bold text-zinc-300 hover:text-white hover:bg-purple-600 rounded-xl transition-colors flex items-center gap-2"
              >
                <Copy className="h-3.5 w-3.5" />
                Duplicate Keyframe
              </button>
              <button
                onClick={() => {
                  deleteKeyframe(contextMenu.trackId, contextMenu.keyframeId!);
                  setContextMenu((prev) => ({ ...prev, visible: false }));
                }}
                className="w-full text-left px-3 py-2 text-xs font-bold text-red-400 hover:text-white hover:bg-red-600 rounded-xl transition-colors flex items-center gap-2"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Keyframe
              </button>

              <div className="h-px bg-white/10 my-1 mx-1" />
              
              <div className="px-3 py-1 text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest">
                Change Easing
              </div>
              {Object.keys(EASING_CURVES).map((name) => (
                <button
                  key={name}
                  onClick={() => {
                    handleUpdateEasing(contextMenu.trackId, contextMenu.keyframeId!, name);
                    setContextMenu((prev) => ({ ...prev, visible: false }));
                  }}
                  className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-zinc-400 hover:text-white hover:bg-purple-600 rounded-lg transition-colors pl-6 relative"
                >
                  {activeElement?.tracks.find((t) => t.id === contextMenu.trackId)?.keyframes.find((k) => k.id === contextMenu.keyframeId)?.easing === name && (
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-purple-400" />
                  )}
                  {name}
                </button>
              ))}
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  addKeyframeAtPlayhead(contextMenu.trackId);
                  setContextMenu((prev) => ({ ...prev, visible: false }));
                }}
                className="w-full text-left px-3 py-2 text-xs font-bold text-zinc-300 hover:text-white hover:bg-purple-600 rounded-xl transition-colors flex items-center gap-2"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Add Keyframe Here
              </button>
              <button
                disabled={!copiedKeyframe}
                onClick={() => {
                  if (copiedKeyframe && contextMenu.timeMs !== undefined) {
                    handlePasteKeyframe(contextMenu.trackId, contextMenu.timeMs);
                  }
                  setContextMenu((prev) => ({ ...prev, visible: false }));
                }}
                className="w-full text-left px-3 py-2 text-xs font-bold text-zinc-300 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-zinc-300 hover:text-white hover:bg-purple-600 rounded-xl transition-colors flex items-center gap-2"
              >
                <Clipboard className="h-3.5 w-3.5" />
                Paste Keyframe
              </button>
              <button
                onClick={() => {
                  if (contextMenu.timeMs !== undefined) {
                    setTimeMs(contextMenu.timeMs);
                  }
                  setContextMenu((prev) => ({ ...prev, visible: false }));
                }}
                className="w-full text-left px-3 py-2 text-xs font-bold text-zinc-300 hover:text-white hover:bg-purple-600 rounded-xl transition-colors flex items-center gap-2"
              >
                <Navigation className="h-3.5 w-3.5" />
                Move Playhead Here
              </button>
              <div className="h-px bg-white/10 my-1 mx-1" />
              <button
                onClick={() => {
                  clearTrackKeyframes(contextMenu.trackId);
                  setContextMenu((prev) => ({ ...prev, visible: false }));
                }}
                className="w-full text-left px-3 py-2 text-xs font-bold text-red-400 hover:text-white hover:bg-red-600 rounded-xl transition-colors flex items-center gap-2"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Clear All Keyframes
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
