import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, Plus, Trash2, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Copy, Check, Repeat, PanelRightClose, PanelRightOpen, Sliders, ChevronDown, Layers, ArrowLeftRight, Type, Square, Disc, Star, Image, Sparkles, Clipboard, PlusCircle, Navigation, RefreshCw, Activity, Undo, Redo, ArrowUp, ArrowDown, Save, Upload, Download, Grid, Grid3X3, EyeOff, Scissors, Undo2, Redo2, MousePointer2, Move, Maximize, Code, Box, Eye, Settings2, TypeOutline, Hash, PaintBucket, Palette, Image as ImageIcon, Music, Volume2, Hand, Paintbrush, Camera, MoveHorizontal } from 'lucide-react';
import { Surface } from '../../primitives/Surface';
import { Text } from '../typography/Text';
import { Button } from '../button/Button';
import { ScrollArea } from '../data-display/ScrollArea';
import { cn } from '../../utils/cn';
import { Animotion } from './Animotion';
import { TimelineCanvas } from './animation-studio/TimelineCanvas';

import { EasingVisualizer } from './EasingVisualizer';
import { GraphEditor } from './animation-studio/GraphEditor';
import {
  clamp,
  lerp,
  cubicBezier,
  easeOutBounce,
  easeInBounce,
  easeInOutBounce,
  EASING_CURVES,
  calculateSpringCurve,
  sortKeyframes,
  parsePathStandalone,
  serializePathStandalone,
  interpolateSvgPaths,
  valueAt,
  compileKeyframes,
  formatTime,
  uid,
  getChildren,
  getRootElements,
  parseCubicBezierString,
  formatMotionOffsetRotate,
  resolveElementFrame,
  wouldCreateParentCycle as wouldCreateParentCycleInTree,
  toLocalPoint,
  resolveElementTree
} from './AnimationStudio.utils';
import {
  GRADIENT_PRESETS,
} from './AnimationStudio.types';
import type {
  AnimationStudioChannel,
  AnimationStudioKeyframe,
  AnimationStudioTrack,
  AnimationStudioClip,
  AnimationStudioElement,
  AnimationStudioComponentPreset,
  GradientPreset,
  AnimationStudioProps
} from './AnimationStudio.types';

// Re-exports for backwards compatibility and tests
export * from './AnimationStudio.types';
export {
  clamp,
  lerp,
  cubicBezier,
  easeOutBounce,
  easeInBounce,
  easeInOutBounce,
  EASING_CURVES,
  calculateSpringCurve,
  sortKeyframes,
  parsePathStandalone,
  serializePathStandalone,
  interpolateSvgPaths,
  valueAt,
  compileKeyframes,
  formatTime,
  uid,
  getChildren,
  getRootElements,
  parseCubicBezierString,
  formatMotionOffsetRotate,
  resolveElementFrame,
  resolveElementTree,
  toLocalPoint,
  wouldCreateParentCycle
} from './AnimationStudio.utils';
function DraggablePropertyValue({ 
  value, 
  unit, 
  step, 
  min, 
  max, 
  onChange 
}: { 
  value: number | string, 
  unit?: string, 
  step: number, 
  min: number, 
  max: number, 
  onChange: (val: number | string) => void 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempVal, setTempVal] = useState(String(value));

  useEffect(() => {
    if (!isEditing) setTempVal(String(value));
  }, [value, isEditing]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isEditing) return;
    if (e.button !== 0) return; // Only left click
    const startX = e.clientX;
    const startVal = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
    let hasMoved = false;

    const onPointerMove = (moveEvt: PointerEvent) => {
      const dx = moveEvt.clientX - startX;
      if (Math.abs(dx) > 2) hasMoved = true;
      const valueDelta = dx * step * 0.5;
      let nextVal = startVal + valueDelta;
      if (typeof min === 'number') nextVal = Math.max(min, nextVal);
      if (typeof max === 'number') nextVal = Math.min(max, nextVal);
      onChange(parseFloat(nextVal.toFixed(2)));
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      if (!hasMoved) {
        setIsEditing(true);
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1.5 w-[72px]">
        <input
          autoFocus
          type={typeof value === 'number' ? "number" : "text"}
          step={step}
          value={tempVal}
          onChange={(e) => setTempVal(e.target.value)}
          onBlur={() => {
            setIsEditing(false);
            if (typeof value === 'number') {
              const val = parseFloat(tempVal);
              if (!isNaN(val)) onChange(Math.max(min, Math.min(max, val)));
            } else {
              onChange(tempVal);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.currentTarget.blur();
            }
          }}
          className="w-full text-center text-[10px] font-mono font-bold bg-zinc-100 dark:bg-black/30 text-zinc-950 dark:text-white rounded border border-zinc-200/80 dark:border-white/10 p-0.5"
        />
      </div>
    );
  }

  return (
    <div 
      onPointerDown={handlePointerDown}
      className="flex items-center justify-center gap-1 min-w-[48px] max-w-[72px] cursor-ew-resize hover:bg-zinc-100 dark:hover:bg-white/5 rounded px-1 py-0.5 select-none transition-colors"
      title="Drag to adjust, click to edit"
    >
      <span className="text-[10px] font-mono font-bold text-zinc-950 dark:text-white truncate">
        {typeof value === 'number' ? parseFloat(value.toFixed(2)) : value}
      </span>
      {unit && <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono font-bold flex-shrink-0">{unit}</span>}
    </div>
  );
}

const LOCAL_STORAGE_ELEMENTS_KEY = 'pixon_animation_studio_elements';

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

  const [history, setHistory] = useState<{
    past: AnimationStudioElement[][];
    present: AnimationStudioElement[];
    future: AnimationStudioElement[][];
  }>(() => {
    const defaultTracks: AnimationStudioTrack[] = clip.tracks.length > 0 ? clip.tracks : [
      { id: 'tr-x-' + uid(), label: 'Position X', channel: 'x' as const, keyframes: [{ id: 'kf-x-0', t: 0, v: 320 }] },
      { id: 'tr-y-' + uid(), label: 'Position Y', channel: 'y' as const, keyframes: [{ id: 'kf-y-0', t: 0, v: 190 }] },
      { id: 'tr-scale-' + uid(), label: 'Scale', channel: 'scale' as const, keyframes: [{ id: 'kf-scale-0', t: 0, v: 1 }] },
      { id: 'tr-rotate-' + uid(), label: 'Rotate', channel: 'rotate' as const, keyframes: [{ id: 'kf-rotate-0', t: 0, v: 0 }] },
      { id: 'tr-opacity-' + uid(), label: 'Opacity', channel: 'opacity' as const, keyframes: [{ id: 'kf-opacity-0', t: 0, v: 1 }] },
    ];
    const initialElements = [
      {
        id: 'el-bg',
        name: 'Background Glow',
        type: 'circle' as const,
        text: '',
        color: 'rounded-full',
        tracks: [
          { id: 'tr-width-' + uid(), label: 'Width', channel: 'width' as const, keyframes: [{ id: 'kf-w-0', t: 0, v: 400 }] },
          { id: 'tr-height-' + uid(), label: 'Height', channel: 'height' as const, keyframes: [{ id: 'kf-h-0', t: 0, v: 400 }] },
          { id: 'tr-bg-h-' + uid(), label: 'BG Hue', channel: 'bgH' as const, keyframes: [{ id: 'kf-bg-h-0', t: 0, v: 274 }] },
          { id: 'tr-bg-s-' + uid(), label: 'BG Saturation', channel: 'bgS' as const, keyframes: [{ id: 'kf-bg-s-0', t: 0, v: 78 }] },
          { id: 'tr-bg-l-' + uid(), label: 'BG Lightness', channel: 'bgL' as const, keyframes: [{ id: 'kf-bg-l-0', t: 0, v: 54 }] },
          { id: 'tr-bg-a-' + uid(), label: 'BG Alpha', channel: 'bgA' as const, keyframes: [{ id: 'kf-bg-a-0', t: 0, v: 0.26 }] },
          { id: 'tr-bg2-h-' + uid(), label: 'Gradient Hue', channel: 'bg2H' as const, keyframes: [{ id: 'kf-bg2-h-0', t: 0, v: 226 }] },
          { id: 'tr-bg2-s-' + uid(), label: 'Gradient Saturation', channel: 'bg2S' as const, keyframes: [{ id: 'kf-bg2-s-0', t: 0, v: 82 }] },
          { id: 'tr-bg2-l-' + uid(), label: 'Gradient Lightness', channel: 'bg2L' as const, keyframes: [{ id: 'kf-bg2-l-0', t: 0, v: 48 }] },
          { id: 'tr-bg2-a-' + uid(), label: 'Gradient Alpha', channel: 'bg2A' as const, keyframes: [{ id: 'kf-bg2-a-0', t: 0, v: 0.10 }] },
          { id: 'tr-bg-angle-' + uid(), label: 'Gradient Angle', channel: 'bgAngle' as const, keyframes: [{ id: 'kf-bg-angle-0', t: 0, v: 135 }] },
          { id: 'tr-blur-' + uid(), label: 'Blur Filter', channel: 'blur' as const, keyframes: [{ id: 'kf-blur-0', t: 0, v: 28 }] },
          { id: 'tr-scale-' + uid(), label: 'Scale', channel: 'scale' as const, keyframes: [
            { id: 'kf-s-0', t: 0, v: 0.8, easing: 'linear' },
            { id: 'kf-s-1', t: 2000, v: 1.2, easing: 'linear' },
            { id: 'kf-s-2', t: 4000, v: 0.8, easing: 'linear' }
          ]},
          { id: 'tr-opacity-' + uid(), label: 'Opacity', channel: 'opacity' as const, keyframes: [{ id: 'kf-o-0', t: 0, v: 0.6 }] },
        ],
      },
      {
        id: 'el-1',
        name: 'Pixon Card',
        type: 'box' as const,
        text: 'Pixon Motion',
        color: 'from-purple-500 to-indigo-600 bg-gradient-to-br text-white shadow-2xl shadow-purple-500/20 rounded-2xl border border-white/10',
        tracks: [
          { id: 'tr-width-' + uid(), label: 'Width', channel: 'width' as const, keyframes: [{ id: 'kf-width-0', t: 0, v: 180 }] },
          { id: 'tr-height-' + uid(), label: 'Height', channel: 'height' as const, keyframes: [{ id: 'kf-height-0', t: 0, v: 140 }] },
          { id: 'tr-x-' + uid(), label: 'Position X', channel: 'x' as const, keyframes: [
            { id: 'kf-x-0', t: 0, v: -250, easing: 'spring-out' },
            { id: 'kf-x-1', t: 1200, v: 0, easing: 'linear' },
            { id: 'kf-x-2', t: 2800, v: 0, easing: 'elite-in-out' },
            { id: 'kf-x-3', t: 4000, v: 250, easing: 'linear' },
          ]},
          { id: 'tr-y-' + uid(), label: 'Position Y', channel: 'y' as const, keyframes: [
            { id: 'kf-y-0', t: 0, v: 50, easing: 'spring-out' },
            { id: 'kf-y-1', t: 1500, v: -20, easing: 'soft-bounce' },
            { id: 'kf-y-2', t: 2800, v: 0, easing: 'elite-in-out' },
            { id: 'kf-y-3', t: 4000, v: -50, easing: 'linear' },
          ]},
          { id: 'tr-rotate-' + uid(), label: 'Rotate', channel: 'rotate' as const, keyframes: [
            { id: 'kf-r-0', t: 0, v: -15, easing: 'spring-out' },
            { id: 'kf-r-1', t: 1200, v: 5, easing: 'linear' },
            { id: 'kf-r-2', t: 2800, v: -5, easing: 'elite-in-out' },
            { id: 'kf-r-3', t: 4000, v: 15, easing: 'linear' },
          ]},
          { id: 'tr-scale-' + uid(), label: 'Scale', channel: 'scale' as const, keyframes: [
            { id: 'kf-s-0', t: 0, v: 0.5, easing: 'spring-out' },
            { id: 'kf-s-1', t: 1200, v: 1.05, easing: 'linear' },
            { id: 'kf-s-2', t: 2800, v: 1, easing: 'elite-in-out' },
            { id: 'kf-s-3', t: 4000, v: 0.5, easing: 'linear' },
          ]},
          { id: 'tr-opacity-' + uid(), label: 'Opacity', channel: 'opacity' as const, keyframes: [
            { id: 'kf-o-0', t: 0, v: 0, easing: 'linear' },
            { id: 'kf-o-1', t: 600, v: 1, easing: 'linear' },
            { id: 'kf-o-2', t: 3400, v: 1, easing: 'linear' },
            { id: 'kf-o-3', t: 4000, v: 0, easing: 'linear' },
          ]},
        ],
      },
      {
        id: 'el-sparkle',
        name: 'Floating Sparkle',
        type: 'text' as const,
        text: '✨',
        color: 'text-4xl drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]',
        tracks: [
          { id: 'tr-x-' + uid(), label: 'Position X', channel: 'x' as const, keyframes: [
            { id: 'kf-x-0', t: 0, v: 150, easing: 'linear' },
            { id: 'kf-x-1', t: 2000, v: 180, easing: 'linear' },
            { id: 'kf-x-2', t: 4000, v: 150, easing: 'linear' },
          ]},
          { id: 'tr-y-' + uid(), label: 'Position Y', channel: 'y' as const, keyframes: [
            { id: 'kf-y-0', t: 0, v: -80, easing: 'linear' },
            { id: 'kf-y-1', t: 2000, v: -110, easing: 'linear' },
            { id: 'kf-y-2', t: 4000, v: -80, easing: 'linear' },
          ]},
          { id: 'tr-rotate-' + uid(), label: 'Rotate', channel: 'rotate' as const, keyframes: [
            { id: 'kf-r-0', t: 0, v: 0, easing: 'linear' },
            { id: 'kf-r-1', t: 4000, v: 360, easing: 'linear' },
          ]},
          { id: 'tr-scale-' + uid(), label: 'Scale', channel: 'scale' as const, keyframes: [
            { id: 'kf-s-0', t: 0, v: 0, easing: 'spring-out' },
            { id: 'kf-s-1', t: 1000, v: 1.5, easing: 'linear' },
            { id: 'kf-s-2', t: 3000, v: 1.5, easing: 'elite-in-out' },
            { id: 'kf-s-3', t: 4000, v: 0, easing: 'linear' },
          ]},
        ],
      },
      {
        id: 'el-camera',
        name: '🎥 Virtual Camera',
        type: 'box' as const,
        text: 'Camera Control',
        color: 'text-zinc-400',
        locked: true,
        visible: false,
        collapsed: true,
        tracks: [
          { id: 'tr-cameraZoom-' + uid(), label: 'Camera Zoom', channel: 'cameraZoom' as const, keyframes: [
            { id: 'kf-cz-0', t: 0, v: 0.9, easing: 'linear' },
            { id: 'kf-cz-1', t: 2000, v: 1.05, easing: 'linear' },
            { id: 'kf-cz-2', t: 4000, v: 0.9, easing: 'linear' },
          ] },
          { id: 'tr-cameraPanX-' + uid(), label: 'Camera Pan X', channel: 'cameraPanX' as const, keyframes: [{ id: 'kf-cpx-0', t: 0, v: 0 }] },
          { id: 'tr-cameraPanY-' + uid(), label: 'Camera Pan Y', channel: 'cameraPanY' as const, keyframes: [{ id: 'kf-cpy-0', t: 0, v: 0 }] },
          { id: 'tr-cameraTilt-' + uid(), label: 'Camera Tilt', channel: 'cameraTilt' as const, keyframes: [{ id: 'kf-ct-0', t: 0, v: 0 }] },
        ],
      }
    ];
    return {
      past: [],
      present: initialElements.map((el) => ({ ...el, collapsed: true })),
      future: [],
    };
  });

  const elements = history.present;

  const setElements = (
    newElements: AnimationStudioElement[] | ((prev: AnimationStudioElement[]) => AnimationStudioElement[])
  ) => {
    setHistory((prev) => {
      const nextPresent = typeof newElements === 'function' ? newElements(prev.present) : newElements;
      if (JSON.stringify(prev.present) === JSON.stringify(nextPresent)) return prev;
      return {
        past: [...prev.past, prev.present].slice(-50),
        present: nextPresent,
        future: [],
      };
    });
  };

  const undo = () => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;
      const previous = prev.past[prev.past.length - 1]!;
      const newPast = prev.past.slice(0, prev.past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future],
      };
    });
  };

  const redo = () => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;
      const next = prev.future[0]!;
      const newFuture = prev.future.slice(1);
      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture,
      };
    });
  };

  const [activeElementId, setActiveElementId] = useState<string>('el-1');
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>(['el-1']);
  const activeElement = elements.find((el) => el.id === activeElementId) ?? elements[0];

  const [activeTrackId, setActiveTrackId] = useState<string | null>(activeElement?.tracks[0]?.id ?? null);
  const [timeMs, setTimeMs] = useState(() => clamp(initialTimeMs, 0, durationMs));
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [previewHeight, setPreviewHeight] = useState(450);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [loop, setLoop] = useState(true);
  const [yoyo, setYoyo] = useState(false);
  const [playDirection, setPlayDirection] = useState<'forward' | 'reverse'>('forward');
  const [selectedKeyframeId, setSelectedKeyframeId] = useState<string | null>(null);
  const [selectedKeyframeIds, setSelectedKeyframeIds] = useState<string[]>([]);
  const [studioSearch, setStudioSearch] = useState<string>('');
  const [isAutoKeyArmed, setIsAutoKeyArmed] = useState<boolean>(true);
  const [componentPresets, setComponentPresets] = useState<AnimationStudioComponentPreset[]>([]);
  const [selectionBox, setSelectionBox] = useState<{ startX: number; startY: number; currentX: number; currentY: number; } | null>(null);
  const [stageSelectionBox, setStageSelectionBox] = useState<{ startX: number; startY: number; currentX: number; currentY: number; } | null>(null);

  const selectKeyframe = (kfId: string | null, isMulti = false) => {
    if (!kfId) {
      setSelectedKeyframeId(null);
      setSelectedKeyframeIds([]);
    } else {
      setSelectedKeyframeId(kfId);
      if (isMulti) {
        setSelectedKeyframeIds((prev) =>
          prev.includes(kfId) ? prev.filter((id) => id !== kfId) : [...prev, kfId]
        );
      } else {
        setSelectedKeyframeIds([kfId]);
      }
    }
  };
  const [copied, setCopied] = useState(false);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [layerContextMenu, setLayerContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    elementId: string;
  } | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    transform: true,
    filters: false,
    borders: false,
    background: false,
    shadow: false,
    clip: false,
    motion: false,
    audio: false,
  });

  // Advanced Audio Integration States
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioName, setAudioName] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Advanced Multi-Export Modal States
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportTab, setExportTab] = useState<'waapi' | 'react' | 'css' | 'lottie'>('waapi');

  // Custom Spring Dynamics State variables (for UI inputs preview)
  const [springMass, setSpringMass] = useState(1);
  const [springStiffness, setSpringStiffness] = useState(100);
  const [springDamping, setSpringDamping] = useState(10);

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
  const [copiedKeyframe, setCopiedKeyframe] = useState<{ v: string | number; easing?: string } | null>(null);
  const [hoveredSubmenu, setHoveredSubmenu] = useState<'easing' | 'actions' | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const playheadLineRef = useRef<HTMLDivElement>(null);
  const playheadTimeRef = useRef<number>(timeMs);
  const playRafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number>(0);
  const didHydrateLocalStorageRef = useRef(false);
  const resizeRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const previewResizeRef = useRef<{ startY: number; startHeight: number } | null>(null);

  const [stageBg, setStageBg] = useState<'dark' | 'light' | 'purple' | 'slate' | 'transparent'>('dark');
  const [stageGrid, setStageGrid] = useState<'grid' | 'dots' | 'none'>('none');
  const [stageContextMenu, setStageContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
  } | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Advanced Upgrades States
  const [snapLines, setSnapLines] = useState<{ type: 'h' | 'v'; val: number; label?: string }[]>([]);
  const [isPhysicsActive, setIsPhysicsActive] = useState<boolean>(false);
  const [isRecordingPhysics, setIsRecordingPhysics] = useState<boolean>(false);

  // Studio Tools States
  const [activeTool, setActiveTool] = useState<'select' | 'hand' | 'brush'>('select');
  const activeToolRef = useRef<'select' | 'hand' | 'brush'>('select');
  const previousToolRef = useRef<'select' | 'hand' | 'brush'>('select');
  const spacePressedRef = useRef(false);
  const spacePanUsedRef = useRef(false);
  const spacePressedAtRef = useRef(0);
  const [activeTransformMode, setActiveTransformMode] = useState<'none' | 'free' | 'clip'>('none');
  const [editingTrackValue, setEditingTrackValue] = useState<{ elementId: string; trackId: string; valStr: string; channel: AnimationStudioChannel } | null>(null);

  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);

  useEffect(() => {
    const handleTimelineWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        setZoom((z) => Math.min(5, Math.max(0.1, z - e.deltaY * 0.001)));
      }
    };
    
    const handleStageWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        setPreviewZoom((z) => Math.min(2.0, Math.max(0.2, z - e.deltaY * 0.001)));
      }
    };

    const tlNode = timelineRef.current;
    const stageNode = containerRef.current?.querySelector('.stage-canvas-container') as HTMLElement; // We will add this class to stage
    
    if (tlNode) tlNode.addEventListener('wheel', handleTimelineWheel, { passive: false });
    if (stageNode) stageNode.addEventListener('wheel', handleStageWheel, { passive: false });
    
    return () => {
      if (tlNode) tlNode.removeEventListener('wheel', handleTimelineWheel);
      if (stageNode) stageNode.removeEventListener('wheel', handleStageWheel);
    };
  }, []);

  useEffect(() => {
    setActiveTransformMode('none');
  }, [selectedElementIds]);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDrawingBrush, setIsDrawingBrush] = useState<boolean>(false);
  const [brushPoints, setBrushPoints] = useState<{ x: number; y: number }[]>([]);

  // Physics Simulation Loop
  useEffect(() => {
    if (!isPhysicsActive) return;

    let animId: number;
    let velocities: Record<string, { vx: number; vy: number }> = {};
    let squashTargets: Record<string, number> = {};

    const step = () => {
      squashTargets = {};
      updateElementsState((prev) => {
        const list = prev.map((el) => {
          if (!velocities[el.id]) {
            velocities[el.id] = { vx: 0, vy: 0 };
          }
          
          const trackX = el.tracks.find((t) => t.channel === 'x');
          const trackY = el.tracks.find((t) => t.channel === 'y');
          const trackW = el.tracks.find((t) => t.channel === 'width');
          const trackH = el.tracks.find((t) => t.channel === 'height');
          const trackScaleX = el.tracks.find((t) => t.channel === 'scaleX');
          const trackScaleY = el.tracks.find((t) => t.channel === 'scaleY');

          const x = trackX ? Number(valueAt(trackX, timeMs)) : 0;
          const y = trackY ? Number(valueAt(trackY, timeMs)) : 0;
          const w = trackW ? Number(valueAt(trackW, timeMs)) : 100;
          const h = trackH ? Number(valueAt(trackH, timeMs)) : 100;
          const scaleX = trackScaleX ? Number(valueAt(trackScaleX, timeMs)) : 1;
          const scaleY = trackScaleY ? Number(valueAt(trackScaleY, timeMs)) : 1;

          return { el, x, y, w, h, scaleX, scaleY, id: el.id };
        });

        const gravity = 0.6;
        const friction = 0.99;
        const restitution = 0.75;
        const boundaryW = 800;
        const boundaryH = 500;

        const updated = list.map((item) => {
          if (item.id === 'el-camera') return item;
          const vel = velocities[item.id]!;
          const canSquash = item.el.type === 'circle' || /ball/i.test(item.el.name);
          
          vel.vy += gravity;
          vel.vx *= friction;
          
          let nextX = item.x + vel.vx;
          let nextY = item.y + vel.vy;

          if (nextY + item.h > boundaryH) {
            nextY = boundaryH - item.h;
            vel.vy = -vel.vy * restitution;
            vel.vx *= 0.8;
            if (canSquash) {
              squashTargets[item.id] = Math.max(squashTargets[item.id] ?? 0, clamp(Math.abs(vel.vy) / 24, 0, 0.35));
            }
          }
          if (nextY < 0) {
            nextY = 0;
            vel.vy = -vel.vy * restitution;
          }
          if (nextX + item.w > boundaryW) {
            nextX = boundaryW - item.w;
            vel.vx = -vel.vx * restitution;
          }
          if (nextX < 0) {
            nextX = 0;
            vel.vx = -vel.vx * restitution;
          }

          return { ...item, x: nextX, y: nextY };
        });

        for (let i = 0; i < updated.length; i++) {
          const a = updated[i]!;
          if (a.id === 'el-camera') continue;
          for (let j = i + 1; j < updated.length; j++) {
            const b = updated[j]!;
            if (b.id === 'el-camera') continue;

            const cxA = a.x + a.w / 2;
            const cyA = a.y + a.h / 2;
            const cxB = b.x + b.w / 2;
            const cyB = b.y + b.h / 2;

            const dx = cxB - cxA;
            const dy = cyB - cyA;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const rA = Math.max(a.w, a.h) / 2;
            const rB = Math.max(b.w, b.h) / 2;
            const minDist = rA + rB;

            if (distance < minDist && distance > 0) {
              const overlap = minDist - distance;
              const nx = dx / distance;
              const ny = dy / distance;

              a.x -= nx * overlap * 0.5;
              a.y -= ny * overlap * 0.5;
              b.x += nx * overlap * 0.5;
              b.y += ny * overlap * 0.5;

              const velA = velocities[a.id]!;
              const velB = velocities[b.id]!;
              const kx = velA.vx - velB.vx;
              const ky = velA.vy - velB.vy;
              const pImpulse = 2 * (kx * nx + ky * ny) / 2;

              velA.vx -= pImpulse * nx * restitution;
              velA.vy -= pImpulse * ny * restitution;
              velB.vx += pImpulse * nx * restitution;
              velB.vy += pImpulse * ny * restitution;
              if (a.el.type === 'circle' || /ball/i.test(a.el.name)) {
                squashTargets[a.id] = Math.max(squashTargets[a.id] ?? 0, clamp(Math.abs(velA.vy) / 28, 0, 0.28));
              }
              if (b.el.type === 'circle' || /ball/i.test(b.el.name)) {
                squashTargets[b.id] = Math.max(squashTargets[b.id] ?? 0, clamp(Math.abs(velB.vy) / 28, 0, 0.28));
              }
            }
          }
        }

        return prev.map((el) => {
          const item = updated.find((it) => it.id === el.id);
          if (!item || el.id === 'el-camera') return el;

          let nextTracks = [...el.tracks];
          const snappedT = Math.round(timeMs / snapMs) * snapMs;
          const squash = squashTargets[item.id] ?? 0;
          const canSquash = item.el.type === 'circle' || /ball/i.test(item.el.name);
          const targetScaleX = 1 + squash;
          const targetScaleY = 1 - squash * 0.75;
          const shouldUpdateScale = canSquash || nextTracks.some((t) => t.channel === 'scaleX' || t.channel === 'scaleY');
          const channelsToWrite = shouldUpdateScale ? (['x', 'y', 'scaleX', 'scaleY'] as const) : (['x', 'y'] as const);

          for (const ch of channelsToWrite) {
            const channel = ch;
            const nextV = channel === 'x'
              ? Math.round(item.x)
              : channel === 'y'
                ? Math.round(item.y)
                : channel === 'scaleX'
                  ? Number(lerp(item.scaleX, targetScaleX, 0.35).toFixed(3))
                  : Number(lerp(item.scaleY, targetScaleY, 0.35).toFixed(3));
            let track = nextTracks.find((t) => t.channel === channel);
            if (!track) {
              track = {
                id: uid(),
                label: channel === 'scaleX' ? 'Scale X' : channel === 'scaleY' ? 'Scale Y' : channel,
                channel,
                keyframes: [{ id: uid(), t: 0, v: channel === 'scaleX' || channel === 'scaleY' ? 1 : nextV, easing: 'linear' }],
              };
              nextTracks = [...nextTracks, track];
            }

            if (track) {
              let nextKeyframes = [...track.keyframes];
              if (isRecordingPhysics) {
                const existingIndex = nextKeyframes.findIndex((kf) => kf.t === snappedT);
                if (existingIndex !== -1) {
                  nextKeyframes[existingIndex] = { ...nextKeyframes[existingIndex]!, v: nextV };
                } else {
                  nextKeyframes.push({ id: uid(), t: snappedT, v: nextV, easing: 'linear' });
                }
              } else {
                const existingIndex = nextKeyframes.findIndex((kf) => kf.t === 0);
                if (existingIndex !== -1) {
                  nextKeyframes[existingIndex] = { ...nextKeyframes[existingIndex]!, v: nextV };
                }
              }
              nextTracks = nextTracks.map((t) => (t.channel === channel ? { ...t, keyframes: nextKeyframes } : t));
            }
          }
          return { ...el, tracks: nextTracks };
        });
      });

      if (isRecordingPhysics) {
        setTimeMs((t) => {
          const nextT = t + 16;
          if (nextT >= durationMs) {
            setIsRecordingPhysics(false);
            setIsPhysicsActive(false);
            return durationMs;
          }
          return nextT;
        });
      }

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isPhysicsActive, isRecordingPhysics, timeMs, snapMs, durationMs]);

  useEffect(() => {
    if (didHydrateLocalStorageRef.current) return;
    didHydrateLocalStorageRef.current = true;
    if (clip.tracks.length > 0) return;

    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ELEMENTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const nextElements = Array.isArray(parsed) ? parsed : parsed?.elements;
        if (Array.isArray(nextElements) && nextElements.length > 0) {
          setElements(nextElements.map((el) => ({ ...el, collapsed: el.collapsed ?? true })));
          setComponentPresets(Array.isArray(parsed?.componentPresets) ? parsed.componentPresets : []);
          setActiveElementId(nextElements[0].id);
          setSelectedElementIds([nextElements[0].id]);
        }
      }
    } catch (e) {
      console.error('Failed to load saved animation data from localStorage', e);
    }
  }, [clip.tracks.length]);

  const handleSaveToLocalStorage = () => {
    setSaveStatus('saving');
    try {
      localStorage.setItem(LOCAL_STORAGE_ELEMENTS_KEY, JSON.stringify({ elements, componentPresets }));
      setTimeout(() => setSaveStatus('saved'), 600);
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
      console.error('Failed to save to localStorage', e);
      setSaveStatus('idle');
    }
  };

  const handleExportJSON = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ elements, componentPresets }, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `pixon_animation_${activeElement?.name || 'studio'}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error('Failed to export JSON', e);
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const nextElements = Array.isArray(parsed) ? parsed : parsed?.elements;
        if (Array.isArray(nextElements) && nextElements.length > 0) {
          setElements(nextElements);
          setComponentPresets(Array.isArray(parsed?.componentPresets) ? parsed.componentPresets : []);
          setActiveElementId(nextElements[0].id);
          setSelectedElementIds([nextElements[0].id]);
        } else {
          alert('Invalid file structure.');
        }
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  useEffect(() => {
    setTimeMs((t) => clamp(t, 0, durationMs));
  }, [durationMs]);

  // Keep ref synchronized with state when not playing
  useEffect(() => {
    if (!isPlaying) {
      playheadTimeRef.current = timeMs;
    }
  }, [timeMs, isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      if (playRafRef.current !== null) cancelAnimationFrame(playRafRef.current);
      playRafRef.current = null;
      setTimeMs(playheadTimeRef.current); // Sync final scrub back to state
      if (audioRef.current) {
        audioRef.current.pause();
      }
      return;
    }

    if (audioRef.current && audioUrl) {
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.currentTime = playheadTimeRef.current / 1000;
      audioRef.current.play().catch((e) => console.log("Audio play deferred", e));
    }

    lastTsRef.current = performance.now();
    const tick = (ts: number) => {
      const dt = (ts - lastTsRef.current) * playbackRate;
      lastTsRef.current = ts;
      
      let next = playheadTimeRef.current + (playDirection === 'forward' ? dt : -dt);
      
      // Sincronização impecável baseada no tempo do hardware de áudio!
      if (audioRef.current && audioUrl && !audioRef.current.paused) {
        next = audioRef.current.currentTime * 1000;
      }
      
      let endReached = false;
      
      if (playDirection === 'forward') {
        if (next >= durationMs) {
          if (loop) {
            if (yoyo) {
              next = durationMs;
              setTimeMs(next);
              setPlayDirection('reverse');
              if (audioRef.current) audioRef.current.currentTime = durationMs / 1000;
            } else {
              next = 0;
              if (audioRef.current) audioRef.current.currentTime = 0;
            }
          } else {
            next = durationMs;
            endReached = true;
          }
        }
      } else {
        if (next <= 0) {
          if (loop) {
            if (yoyo) {
              next = 0;
              setTimeMs(next);
              setPlayDirection('forward');
              if (audioRef.current) audioRef.current.currentTime = 0;
            } else {
              next = durationMs;
              if (audioRef.current) audioRef.current.currentTime = durationMs / 1000;
            }
          } else {
            next = 0;
            endReached = true;
          }
        }
      }

      playheadTimeRef.current = next;
      
      // Imperative update to avoid React re-renders during playback!
      if (playheadLineRef.current) {
         playheadLineRef.current.style.left = `${next * pxPerMs + 16}px`;
      }
      
      if (endReached) {
        setIsPlaying(false);
        setTimeMs(next);
        if (audioRef.current) audioRef.current.pause();
      } else {
        playRafRef.current = requestAnimationFrame(tick);
      }
    };
    playRafRef.current = requestAnimationFrame(tick);
    return () => {
      if (playRafRef.current !== null) cancelAnimationFrame(playRafRef.current);
      playRafRef.current = null;
    };
  }, [isPlaying, durationMs, playDirection, loop, yoyo, pxPerMs, audioUrl, playbackRate]);

  // Audio Scrub Sincronizador
  useEffect(() => {
    if (!isPlaying && audioRef.current && audioUrl) {
      audioRef.current.currentTime = timeMs / 1000;
    }
  }, [timeMs, isPlaying, audioUrl]);

  const updateElementsState = (updater: (prev: AnimationStudioElement[]) => AnimationStudioElement[]) => {
    setElements(updater);
  };

  const findTrackOwner = (trackId: string) => {
    return elements.find((el) => el.tracks.some((tr) => tr.id === trackId));
  };

  const findKeyframeOwner = (keyframeId: string) => {
    for (const el of elements) {
      for (const tr of el.tracks) {
        const kf = tr.keyframes.find((item) => item.id === keyframeId);
        if (kf) return { element: el, track: tr, keyframe: kf };
      }
    }
    return null;
  };

  const updateTrackById = (
    trackId: string,
    updater: (track: AnimationStudioTrack) => AnimationStudioTrack
  ) => {
    updateElementsState((prev) =>
      prev.map((el) => ({
        ...el,
        tracks: el.tracks.map((tr) => (tr.id === trackId ? updater(tr) : tr)),
      }))
    );
  };

  const getValidParentTargets = (target: AnimationStudioElement) => {
    return elements.filter((el) =>
      el.id !== target.id &&
      el.id !== target.parentId &&
      (el.type === 'box' || el.type === 'circle' || el.type === 'group') &&
      !wouldCreateParentCycleInTree(elements, target.id, el.id)
    );
  };

  const setElementParentPreservingPosition = (elementId: string, parentId?: string) => {
    if (parentId && wouldCreateParentCycleInTree(elements, elementId, parentId)) return;
    const local = parentId ? toLocalPoint(elements, elementId, parentId, timeMs) : null;
    updateElementsState((prev) =>
      prev.map((el) => {
        if (el.id !== elementId) return el;
        const nextTracks = parentId && local
          ? el.tracks.map((tr) => {
              if (tr.channel === 'x') return { ...tr, keyframes: [{ id: uid(), t: 0, v: Math.round(local.x), easing: 'linear' }] };
              if (tr.channel === 'y') return { ...tr, keyframes: [{ id: uid(), t: 0, v: Math.round(local.y), easing: 'linear' }] };
              return tr;
            })
          : el.tracks;
        return { ...el, parentId, tracks: nextTracks };
      })
    );
  };

  useEffect(() => {
    const active = elements.find((el) => el.id === activeElementId) ?? elements[0];
    if (active && onClipChange) {
      const activeTracksStr = JSON.stringify(active.tracks);
      const parentTracksStr = JSON.stringify(clip.tracks);
      if (activeTracksStr !== parentTracksStr) {
        onClipChange({ ...clip, tracks: active.tracks });
      }
    }
  }, [elements, activeElementId, clip, onClipChange]);

  const bringToFront = () => {
    if (!activeElementId) return;
    updateElementsState((prev) => {
      const el = prev.find((e) => e.id === activeElementId);
      if (!el) return prev;
      const rest = prev.filter((e) => e.id !== activeElementId);
      const nextElements = [...rest, el];
      const zIndexTrack = el.tracks.find((t) => t.channel === 'zIndex');
      if (zIndexTrack) {
        const snappedT = Math.round(timeMs / snapMs) * snapMs;
        const maxOtherZ = nextElements
          .filter((e) => e.id !== activeElementId)
          .map((e) => {
            const tr = e.tracks.find((t) => t.channel === 'zIndex');
            return tr ? Number(valueAt(tr, timeMs)) : 10;
          });
        const targetZ = maxOtherZ.length > 0 ? Math.max(...maxOtherZ) + 10 : 100;
        
        return nextElements.map((e) => {
          if (e.id !== activeElementId) return e;
          return {
            ...e,
            tracks: e.tracks.map((tr) => {
              if (tr.channel !== 'zIndex') return tr;
              const idx = tr.keyframes.findIndex((kf) => Math.abs(kf.t - snappedT) < 1);
              if (idx !== -1) {
                const nextKfs = [...tr.keyframes];
                nextKfs[idx] = { ...nextKfs[idx]!, v: targetZ };
                return { ...tr, keyframes: nextKfs };
              } else {
                return { ...tr, keyframes: [...tr.keyframes, { id: uid(), t: snappedT, v: targetZ, easing: 'linear' }] };
              }
            })
          };
        });
      }
      return nextElements;
    });
  };

  const sendToBack = () => {
    if (!activeElementId) return;
    updateElementsState((prev) => {
      const el = prev.find((e) => e.id === activeElementId);
      if (!el) return prev;
      const rest = prev.filter((e) => e.id !== activeElementId);
      const nextElements = [el, ...rest];
      const zIndexTrack = el.tracks.find((t) => t.channel === 'zIndex');
      if (zIndexTrack) {
        const snappedT = Math.round(timeMs / snapMs) * snapMs;
        const minOtherZ = nextElements
          .filter((e) => e.id !== activeElementId)
          .map((e) => {
            const tr = e.tracks.find((t) => t.channel === 'zIndex');
            return tr ? Number(valueAt(tr, timeMs)) : 10;
          });
        const targetZ = minOtherZ.length > 0 ? Math.max(1, Math.min(...minOtherZ) - 10) : 1;
        
        return nextElements.map((e) => {
          if (e.id !== activeElementId) return e;
          return {
            ...e,
            tracks: e.tracks.map((tr) => {
              if (tr.channel !== 'zIndex') return tr;
              const idx = tr.keyframes.findIndex((kf) => Math.abs(kf.t - snappedT) < 1);
              if (idx !== -1) {
                const nextKfs = [...tr.keyframes];
                nextKfs[idx] = { ...nextKfs[idx]!, v: targetZ };
                return { ...tr, keyframes: nextKfs };
              } else {
                return { ...tr, keyframes: [...tr.keyframes, { id: uid(), t: snappedT, v: targetZ, easing: 'linear' }] };
              }
            })
          };
        });
      }
      return nextElements;
    });
  };

  const activeTrack = elements.flatMap((el) => el.tracks).find((t) => t.id === activeTrackId) ?? activeElement?.tracks[0];

  const updateTrackValueAtTime = (trackId: string, t: number, nextV: number | string) => {
    const snappedT = Math.round(t / snapMs) * snapMs;
    updateTrackById(trackId, (tr) => {
      const existingIndex = tr.keyframes.findIndex((kf) => Math.abs(kf.t - snappedT) < 1);
      if (existingIndex !== -1) {
        const nextKeyframes = [...tr.keyframes];
        nextKeyframes[existingIndex] = {
          ...nextKeyframes[existingIndex]!,
          v: nextV,
        };
        return { ...tr, keyframes: nextKeyframes };
      }
      return {
        ...tr,
        keyframes: [...tr.keyframes, { id: uid(), t: snappedT, v: nextV, easing: 'linear' }],
      };
    });
  };

  const selectedKeyframe = useMemo(() => {
    if (!selectedKeyframeId) return null;
    const found = findKeyframeOwner(selectedKeyframeId);
    return found ? { elementId: found.element.id, trackId: found.track.id, track: found.track, keyframe: found.keyframe } : null;
  }, [elements, selectedKeyframeId]);

  const updateKeyframeProps = (
    trackId: string,
    keyframeId: string,
    updates: Partial<AnimationStudioKeyframe>,
    options?: { skipSnap?: boolean }
  ) => {
    updateTrackById(trackId, (tr) => ({
      ...tr,
      keyframes: tr.keyframes.map((k) => {
        if (k.id !== keyframeId) return k;
        const nextKf = { ...k, ...updates };
        if (updates.t !== undefined && !options?.skipSnap) {
          nextKf.t = clamp(Math.round(updates.t / snapMs) * snapMs, 0, durationMs);
        }
        return nextKf;
      }),
    }));
  };

  const addKeyframe = (trackId: string) => {
    const t = Math.round(timeMs / snapMs) * snapMs;
    const newKfId = uid();
    updateTrackById(trackId, (tr) => {
      const existingAtT = tr.keyframes.some((kf) => Math.abs(kf.t - t) < 1);
      if (existingAtT) return tr;
      const nextV = valueAt(tr, t);
      return {
        ...tr,
        keyframes: [...tr.keyframes, { id: newKfId, t, v: nextV, easing: 'linear' }],
      };
    });
    selectKeyframe(newKfId);
  };

  const removeKeyframe = (trackId: string, keyframeId: string) => {
    deleteKeyframe(trackId, keyframeId);
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
        scaleX: 'Scale X',
        scaleY: 'Scale Y',
        rotate: 'Rotate',
      opacity: 'Opacity',
      blur: 'Blur Filter',
      brightness: 'Brightness Filter',
      contrast: 'Contrast Filter',
      grayscale: 'Grayscale Filter',
      hueRotate: 'Hue Rotate Filter',
      saturate: 'Saturate Filter',
      sepia: 'Sepia Filter',
      zIndex: 'Depth (z-index)',
      rotateX: 'Rotate X',
      rotateY: 'Rotate Y',
      originX: 'Origin X',
      originY: 'Origin Y',
      shadowX: 'Shadow X Offset',
      shadowY: 'Shadow Y Offset',
      shadowBlur: 'Shadow Blur',
      shadowSpread: 'Shadow Spread',
      shadowOpacity: 'Shadow Opacity',
      borderRadius: 'Border Radius',
      borderRadiusTopLeft: 'Radius Top Left',
      borderRadiusTopRight: 'Radius Top Right',
      borderRadiusBottomRight: 'Radius Bottom Right',
      borderRadiusBottomLeft: 'Radius Bottom Left',
      borderTopWidth: 'Border Top Width',
      borderRightWidth: 'Border Right Width',
      borderBottomWidth: 'Border Bottom Width',
      borderLeftWidth: 'Border Left Width',
      borderColorH: 'Border Color Hue',
      borderColorS: 'Border Color Saturation',
      borderColorL: 'Border Color Lightness',
      borderColorA: 'Border Color Alpha',
      bgH: 'BG Hue',
      bgS: 'BG Saturation',
      bgL: 'BG Lightness',
      bgA: 'BG Alpha',
      bg2H: 'Gradient Hue',
      bg2S: 'Gradient Saturation',
      bg2L: 'Gradient Lightness',
      bg2A: 'Gradient Alpha',
      bgAngle: 'Gradient Angle',
      bgPosX: 'BG Position X',
      bgPosY: 'BG Position Y',
      clipTop: 'Clip Inset Top',
      clipRight: 'Clip Inset Right',
      clipBottom: 'Clip Inset Bottom',
      clipLeft: 'Clip Inset Left',
      width: 'Width',
      height: 'Height',
      offsetDistance: 'Motion Path Distance',
      offsetRotate: 'Motion Path Rotate Offset',
      d: 'SVG Path (d)',
      cameraZoom: 'Camera Zoom',
      cameraPanX: 'Camera Pan X',
      cameraPanY: 'Camera Pan Y',
      cameraTilt: 'Camera Tilt',
    };
    const t = Math.round(timeMs / snapMs) * snapMs;
      const initialValues: Record<AnimationStudioChannel, number | string> = {
        x: 0,
        y: 0,
        scale: 1,
        scaleX: 1,
        scaleY: 1,
        rotate: 0,
      opacity: 1,
      blur: 0,
      brightness: 100,
      contrast: 100,
      grayscale: 0,
      hueRotate: 0,
      saturate: 100,
      sepia: 0,
      zIndex: 1,
      rotateX: 0,
      rotateY: 0,
      originX: 50,
      originY: 50,
      shadowX: 0,
      shadowY: 0,
      shadowBlur: 0,
      shadowSpread: 0,
      shadowOpacity: 0,
      borderRadius: 0,
      borderRadiusTopLeft: 0,
      borderRadiusTopRight: 0,
      borderRadiusBottomRight: 0,
      borderRadiusBottomLeft: 0,
      borderTopWidth: 0,
      borderRightWidth: 0,
      borderBottomWidth: 0,
      borderLeftWidth: 0,
      borderColorH: 270,
      borderColorS: 80,
      borderColorL: 50,
      borderColorA: 1,
      bgH: 270,
      bgS: 80,
      bgL: 50,
      bgA: 1,
      bg2H: 220,
      bg2S: 80,
      bg2L: 50,
      bg2A: 0,
      bgAngle: 135,
      bgPosX: 0,
      bgPosY: 0,
      clipTop: 0,
      clipRight: 0,
      clipBottom: 0,
      clipLeft: 0,
      width: 150,
      height: 150,
      offsetDistance: 0,
      offsetRotate: 0,
      d: "M 10 10 L 90 10 L 90 90 L 10 90 Z",
      cameraZoom: 1,
      cameraPanX: 0,
      cameraPanY: 0,
      cameraTilt: 0,
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

  const hexToHsl = (hex: string) => {
    const normalized = hex.replace('#', '').trim();
    const full = normalized.length === 3
      ? normalized.split('').map((ch) => ch + ch).join('')
      : normalized.padEnd(6, '0').slice(0, 6);
    const r = parseInt(full.slice(0, 2), 16) / 255;
    const g = parseInt(full.slice(2, 4), 16) / 255;
    const b = parseInt(full.slice(4, 6), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    const d = max - min;
    const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    let h = 0;
    if (d !== 0) {
      switch (max) {
        case r: h = ((g - b) / d) % 6; break;
        case g: h = (b - r) / d + 2; break;
        default: h = (r - g) / d + 4; break;
      }
      h *= 60;
      if (h < 0) h += 360;
    }
    return { h, s: s * 100, l: l * 100 };
  };

  const setAnimatedColorAtTime = (targetId: string, hex: string, kind: 'background' | 'border') => {
    const { h, s, l } = hexToHsl(hex);
    const alpha = 1;
    const prefix = kind === 'background' ? 'bg' : kind === 'border' ? 'borderColor' : 'textColor';
    const channels = [
      { channel: `${prefix}H` as AnimationStudioChannel, value: h },
      { channel: `${prefix}S` as AnimationStudioChannel, value: s },
      { channel: `${prefix}L` as AnimationStudioChannel, value: l },
      { channel: `${prefix}A` as AnimationStudioChannel, value: alpha },
    ];

    updateElementsState((prev) => prev.map((el) => {
      if (el.id !== targetId) return el;
      const nextTracks = el.tracks.map((track) => {
        const hit = channels.find((entry) => entry.channel === track.channel);
        if (!hit) return track;
        const keyframeTime = Math.round(timeMs / snapMs) * snapMs;
        const existingIndex = track.keyframes.findIndex((kf) => Math.abs(kf.t - keyframeTime) < 1);
        if (existingIndex >= 0) {
          return {
            ...track,
            keyframes: track.keyframes.map((kf, idx) => idx === existingIndex ? { ...kf, v: hit.value } : kf),
          };
        }
        return {
          ...track,
          keyframes: [...track.keyframes, { id: uid(), t: keyframeTime, v: hit.value, easing: 'linear' }],
        };
      });
      const missingTracks = channels.filter((entry) => !el.tracks.some((track) => track.channel === entry.channel)).map((entry) => ({
        id: `tr-${entry.channel}-${uid()}`,
        label: channelLabels[entry.channel],
        channel: entry.channel,
        keyframes: [{ id: uid(), t: Math.round(timeMs / snapMs) * snapMs, v: entry.value, easing: 'linear' }],
      }));
      return { ...el, tracks: [...nextTracks, ...missingTracks] };
    }));
  };

  const generateAutoSquashStretch = (mode: 'soft' | 'ball' | 'heavy' = 'ball') => {
    const intensityMultiplierMap = { soft: 0.65, ball: 1, heavy: 1.35 } as const;
    const intensityMultiplier = intensityMultiplierMap[mode];
    const targetId = selectedElementIds.find((id) => id !== 'el-camera') || activeElementId;
    if (!targetId) return;

    const estimateImpactPhase = (easing: string, direction: 'down' | 'up' | 'flat') => {
      const parsed = parseCubicBezierString(easing);
      const easeFn =
        parsed ? cubicBezier(...parsed) :
        EASING_CURVES[easing] ||
        EASING_CURVES['ease-out'] ||
        ((t: number) => t);

      const start = direction === 'down' ? 0.32 : 0.2;
      const end = direction === 'down' ? 0.985 : 0.96;
      const steps = 360;
      const values: number[] = [];
      for (let i = 0; i <= steps; i++) {
        const t = start + ((end - start) * i) / steps;
        values.push(easeFn(t));
      }

      let bestIndex = values.length - 1;
      let bestScore = -Infinity;
      for (let i = 2; i < values.length; i++) {
        const v0 = values[i - 2]!;
        const v1 = values[i - 1]!;
        const v2 = values[i]!;
        const velocity1 = v1 - v0;
        const velocity2 = v2 - v1;
        const accel = velocity2 - velocity1;
        const t = start + ((end - start) * i) / steps;
        const lateWeight = 0.4 + (t - start) / Math.max(0.001, end - start);
        const score = Math.abs(accel) * lateWeight * (direction === 'down' ? 1.15 : 1);
        if (score >= bestScore) {
          bestScore = score;
          bestIndex = i;
        }
      }

      return clamp(start + ((end - start) * bestIndex) / steps, start, end);
    };

    updateElementsState((prev) => {
      return prev.map((el) => {
        if (el.id !== targetId) return el;
        const yTrack = el.tracks.find((tr) => tr.channel === 'y');
        const xTrack = el.tracks.find((tr) => tr.channel === 'x');
        const motionTrack = sortKeyframes((yTrack?.keyframes.length ? yTrack.keyframes : xTrack?.keyframes) ?? []);
        if (motionTrack.length < 2) return el;

        const buildScaleTrack = (makeValue: (intensity: number) => number) => {
          const keyframes: AnimationStudioKeyframe[] = [];
          for (let i = 0; i < motionTrack.length - 1; i++) {
            const a = motionTrack[i]!;
            const b = motionTrack[i + 1]!;
            const span = Math.max(1, b.t - a.t);
            const delta = Math.abs(Number(b.v) - Number(a.v));
            const easing = String(a.easing || '');
            const isBounceLike = /(bounce|spring|elastic)/i.test(easing);
            const isFalling = Number(b.v) > Number(a.v);
            const impactPhase = isBounceLike
              ? estimateImpactPhase(easing, isFalling ? 'down' : 'up')
              : 0.76;
            const intensity = clamp(
              ((delta / Math.max(40, span)) * 0.35 + (isBounceLike ? 0.08 : 0) + (span < 220 ? 0.04 : 0)) * intensityMultiplier,
              0.06,
              0.3
            );
            const preImpactT = Math.max(a.t + 1, Math.round(a.t + span * Math.max(0.1, impactPhase - 0.07)));
            const impactT = Math.max(preImpactT + 1, Math.round(a.t + span * impactPhase));
            const settleT = Math.min(b.t - 1, Math.max(impactT + 1, Math.round(a.t + span * Math.min(0.99, impactPhase + 0.08))));
            const push = makeValue(intensity);
            keyframes.push(
              { id: uid(), t: a.t, v: 1, easing: 'linear' },
              { id: uid(), t: preImpactT, v: Number((1 - intensity * 0.15).toFixed(3)), easing: 'linear' },
              { id: uid(), t: impactT, v: Number(push.toFixed(3)), easing: 'linear' },
              { id: uid(), t: settleT, v: Number((1 + intensity * 0.1).toFixed(3)), easing: 'linear' },
              { id: uid(), t: b.t, v: 1, easing: 'linear' },
            );
          }

          const merged = new Map<number, AnimationStudioKeyframe>();
          for (const kf of keyframes) merged.set(kf.t, kf);
          return sortKeyframes(Array.from(merged.values()));
        };

        const scaleXTrack = el.tracks.find((tr) => tr.channel === 'scaleX');
        const scaleYTrack = el.tracks.find((tr) => tr.channel === 'scaleY');
        const nextScaleX = buildScaleTrack((intensity) => 1 + intensity);
        const nextScaleY = buildScaleTrack((intensity) => 1 - intensity * 0.75);

        const nextTracks = el.tracks
          .filter((tr) => tr.channel !== 'scaleX' && tr.channel !== 'scaleY')
          .concat([
            { ...(scaleXTrack ?? { id: `tr-scaleX-${Date.now().toString(36)}`, label: 'Scale X', channel: 'scaleX', keyframes: [] }), keyframes: nextScaleX },
            { ...(scaleYTrack ?? { id: `tr-scaleY-${Date.now().toString(36)}`, label: 'Scale Y', channel: 'scaleY', keyframes: [] }), keyframes: nextScaleY },
          ]);

        return { ...el, tracks: nextTracks };
      });
    });
  };

  const hasKeyframeAtTime = (track: AnimationStudioTrack, t: number) => {
    const snappedT = Math.round(t / snapMs) * snapMs;
    return track.keyframes.some((kf) => Math.abs(kf.t - snappedT) < 1);
  };

  const toggleKeyframeAtTime = (trackId: string, t: number) => {
    const snappedT = Math.round(t / snapMs) * snapMs;
    updateTrackById(trackId, (tr) => {
      const index = tr.keyframes.findIndex((kf) => Math.abs(kf.t - snappedT) < 1);
      if (index !== -1) {
        const nextKf = tr.keyframes.filter((_, idx) => idx !== index);
        return { ...tr, keyframes: nextKf };
      }
      const nextV = valueAt(tr, snappedT);
      const newKf: AnimationStudioKeyframe = {
        id: uid(),
        t: snappedT,
        v: nextV,
        easing: 'linear',
      };
      return { ...tr, keyframes: [...tr.keyframes, newKf] };
    });
  };

  const handleKeyframeContextMenu = (e: React.MouseEvent, trackId: string, kf: AnimationStudioKeyframe) => {
    e.preventDefault();
    e.stopPropagation();
    selectKeyframe(kf.id);
    const rect = containerRef.current?.getBoundingClientRect();
    const x = rect ? e.clientX - rect.left : e.clientX;
    const y = rect ? e.clientY - rect.top : e.clientY;
    setContextMenu({
      visible: true,
      x,
      y,
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
    const containerRect = containerRef.current?.getBoundingClientRect();
    const x = containerRect ? e.clientX - containerRect.left : e.clientX;
    const y = containerRect ? e.clientY - containerRect.top : e.clientY;
    setContextMenu({
      visible: true,
      x,
      y,
      trackId,
      keyframeId: null,
      timeMs: t,
    });
  };

  const deleteKeyframe = (trackId: string, keyframeId: string) => {
    const toDelete = selectedKeyframeIds.includes(keyframeId)
      ? selectedKeyframeIds
      : [keyframeId];

    updateElementsState((prev) =>
      prev.map((el) => ({
        ...el,
        tracks: el.tracks.map((tr) => ({ ...tr, keyframes: tr.keyframes.filter((k) => !toDelete.includes(k.id)) })),
      }))
    );
    selectKeyframe(null);
  };

  const handleCopyKeyframe = (trackId: string, keyframeId: string) => {
    const tr = findTrackOwner(trackId)?.tracks.find((t) => t.id === trackId);
    const kf = tr?.keyframes.find((k) => k.id === keyframeId);
    if (kf) {
      setCopiedKeyframe({ v: kf.v, easing: kf.easing });
    }
  };

  const handlePasteKeyframe = (trackId: string, time: number) => {
    if (!copiedKeyframe) return;
    const newKfId = uid();
    updateTrackById(trackId, (tr) => {
      const filtered = tr.keyframes.filter((k) => Math.abs(k.t - time) >= 1);
      const newKf: AnimationStudioKeyframe = {
        id: newKfId,
        t: time,
        v: copiedKeyframe.v,
        easing: copiedKeyframe.easing || 'linear',
      };
      return { ...tr, keyframes: [...filtered, newKf] };
    });
    selectKeyframe(newKfId);
  };

  const handleDuplicateKeyframe = (trackId: string, keyframeId: string) => {
    const tr = findTrackOwner(trackId)?.tracks.find((t) => t.id === trackId);
    const kf = tr?.keyframes.find((k) => k.id === keyframeId);
    if (kf) {
      const nextTime = Math.min(durationMs, kf.t + 250);
      const newKfId = uid();
      updateTrackById(trackId, (t) => {
        const filtered = t.keyframes.filter((item) => Math.abs(item.t - nextTime) >= 1);
        const duplicated: AnimationStudioKeyframe = {
          id: newKfId,
          t: nextTime,
          v: kf.v,
          easing: kf.easing || 'linear',
        };
        return { ...t, keyframes: [...filtered, duplicated] };
      });
      selectKeyframe(newKfId);
    }
  };

  const handleUpdateEasing = (trackId: string, keyframeId: string, easing: string) => {
    const toUpdate = selectedKeyframeIds.includes(keyframeId)
      ? selectedKeyframeIds
      : [keyframeId];

    toUpdate.forEach((id) => {
      let foundTrackId = trackId;
      const found = findKeyframeOwner(id);
      if (found) foundTrackId = found.track.id;
      updateKeyframeProps(foundTrackId, id, { easing });
    });
  };

  const clearTrackKeyframes = (trackId: string) => {
    updateTrackById(trackId, (tr) => {
      const firstKf = tr.keyframes.find((k) => k.t === 0) || { id: uid(), t: 0, v: tr.channel === 'opacity' || tr.channel === 'scale' ? 1 : 0 };
      return { ...tr, keyframes: [firstKf] };
    });
  };

  const addKeyframeAtPlayhead = (trackId: string) => {
    const track = findTrackOwner(trackId)?.tracks.find((t) => t.id === trackId);
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
      if (layerContextMenu) {
        setLayerContextMenu(null);
      }
      if (stageContextMenu) {
        setStageContextMenu(null);
      }
    };
    window.addEventListener('click', handleClose);
    window.addEventListener('contextmenu', handleClose);
    return () => {
      window.removeEventListener('click', handleClose);
      window.removeEventListener('contextmenu', handleClose);
    };
  }, [contextMenu.visible, layerContextMenu, stageContextMenu]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const isTyping = active && (
        active.tagName === 'INPUT' ||
        active.tagName === 'TEXTAREA' ||
        active.getAttribute('contenteditable') === 'true'
      );

      if (!isTyping) {
        if (e.key.toLowerCase() === 'v') {
          e.preventDefault();
          setActiveTool('select');
        } else if (e.key.toLowerCase() === 'h') {
          e.preventDefault();
          setActiveTool('hand');
        } else if (e.key.toLowerCase() === 'b') {
          e.preventDefault();
          setActiveTool('brush');
        }
      }

      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        if (!isTyping && !spacePressedRef.current) {
          spacePressedRef.current = true;
          spacePanUsedRef.current = false;
          spacePressedAtRef.current = performance.now();
          previousToolRef.current = activeToolRef.current;
          setActiveTool('hand');
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (!isTyping) {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        if (!isTyping) {
          e.preventDefault();
          redo();
        }
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setZoom((z) => clamp(parseFloat((z + 0.1).toFixed(2)), 0.1, 4.0));
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        if (!isTyping) {
          e.preventDefault();
          duplicateSelectedElements();
        }
      }

      if (!isTyping && e.key === '[') {
        e.preventDefault();
        jumpToPrevKeyframe();
      }

      if (!isTyping && e.key === ']') {
        e.preventDefault();
        jumpToNextKeyframe();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        setZoom((z) => clamp(parseFloat((z - 0.1).toFixed(2)), 0.1, 4.0));
      }

      if (e.key === 'Delete' || e.code === 'Delete') {
        if (!isTyping) {
          e.preventDefault();
          if (selectedKeyframeIds.length > 0) {
            updateElementsState((prev) =>
              prev.map((el) => {
                if (el.id !== activeElementId) return el;
                return {
                  ...el,
                  tracks: el.tracks.map((tr) => ({
                    ...tr,
                    keyframes: tr.keyframes.filter((k) => !selectedKeyframeIds.includes(k.id))
                  }))
                };
              })
            );
            setSelectedKeyframeId(null);
            setSelectedKeyframeIds([]);
            return;
          }
          const isTrackActiveOnElement = activeElement?.tracks.some((tr) => tr.id === activeTrackId);
          if (activeTrackId && isTrackActiveOnElement) {
            updateElementsState((prev) =>
              prev.map((el) => {
                if (el.id !== activeElementId) return el;
                return {
                  ...el,
                  tracks: el.tracks.filter((tr) => tr.id !== activeTrackId)
                };
              })
            );
            setActiveTrackId(null);
            return;
          }
          if (selectedElementIds.length > 0) {
            const toDelete = [...selectedElementIds];
            if (toDelete.length < elements.length) {
              const nextElements = elements.filter((el) => !toDelete.includes(el.id));
              setElements(nextElements);
              const remainingSelected = selectedElementIds.filter((id) => !toDelete.includes(id));
              if (remainingSelected.length > 0) {
                setSelectedElementIds(remainingSelected);
                if (toDelete.includes(activeElementId)) {
                  setActiveElementId(remainingSelected[0]!);
                }
              } else if (nextElements.length > 0) {
                setSelectedElementIds([nextElements[0]!.id]);
                setActiveElementId(nextElements[0]!.id);
              }
              setSelectedKeyframeId(null);
              setSelectedKeyframeIds([]);
            }
            return;
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        if (spacePressedRef.current) {
          const wasQuickTap = performance.now() - spacePressedAtRef.current < 220;
          const shouldTogglePlayPause = wasQuickTap && !spacePanUsedRef.current;
          spacePressedRef.current = false;
          setActiveTool(previousToolRef.current);
          if (shouldTogglePlayPause) {
            setIsPlaying((prev) => !prev);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
    };
  }, [history]);

  const onPlayheadPointerDown = (e: React.PointerEvent) => {
    const el = timelineRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const clickX = e.clientX - rect.left + el.scrollLeft - 16;
    const t = clamp(clickX / pxPerMs, 0, durationMs);
    playheadTimeRef.current = t;
    setTimeMs(t);
    setSelectedKeyframeId(null);

    const onPointerMove = (moveEvt: PointerEvent) => {
      const moveX = moveEvt.clientX - rect.left + el.scrollLeft - 16;
      const mt = clamp(moveX / pxPerMs, 0, durationMs);
      playheadTimeRef.current = mt;
      setTimeMs(mt);
    };
    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const onTimelineTrackAreaPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;

    setSelectionBox({
      startX,
      startY,
      currentX: startX,
      currentY: startY,
    });

    const onPointerMove = (moveEvt: PointerEvent) => {
      const currentX = moveEvt.clientX - rect.left;
      const currentY = moveEvt.clientY - rect.top;
      setSelectionBox((prev) => prev ? { ...prev, currentX, currentY } : null);
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      setSelectionBox((box) => {
        if (!box) return null;
        const x1 = Math.min(box.startX, box.currentX);
        const x2 = Math.max(box.startX, box.currentX);
        const y1 = Math.min(box.startY, box.currentY);
        const y2 = Math.max(box.startY, box.currentY);
        const w = x2 - x1;
        const h = y2 - y1;

        if (w > 2 || h > 2) {
          let currentYOffset = 0;
          const matchedKfIds: string[] = [];

          elements.forEach((el) => {
            currentYOffset += 40;
            const isElActive = el.id === activeElementId;
            if (isElActive) {
              el.tracks.forEach((tr) => {
                const trackTop = currentYOffset;
                const trackBottom = currentYOffset + 32;
                currentYOffset += 32;

                if (trackTop < y2 && trackBottom > y1) {
                  tr.keyframes.forEach((kf) => {
                    const kfX = kf.t * pxPerMs + 16;
                    if (kfX >= x1 && kfX <= x2) {
                      matchedKfIds.push(kf.id);
                    }
                  });
                }
              });
            }
          });

          if (matchedKfIds.length > 0) {
            setSelectedKeyframeIds(matchedKfIds);
            setSelectedKeyframeId(matchedKfIds[0] || null);
          } else {
            setSelectedKeyframeIds([]);
            setSelectedKeyframeId(null);
          }
        }
        return null;
      });
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const onStagePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;

    if (activeTool === 'hand') {
      e.stopPropagation();
      if (spacePressedRef.current) {
        spacePanUsedRef.current = true;
      }
      const startX = e.clientX;
      const startY = e.clientY;
      const initialPanX = panOffset.x;
      const initialPanY = panOffset.y;

      const onPointerMove = (moveEvt: PointerEvent) => {
        const dx = moveEvt.clientX - startX;
        const dy = moveEvt.clientY - startY;
        setPanOffset({
          x: initialPanX + dx,
          y: initialPanY + dy,
        });
      };

      const onPointerUp = () => {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      return;
    }

    if (activeTool === 'brush') {
      e.stopPropagation();
      setIsDrawingBrush(true);
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = (e.clientX - rect.left) / previewZoom;
      const clickY = (e.clientY - rect.top) / previewZoom;
      const newPoints = [{ x: clickX, y: clickY }];
      setBrushPoints(newPoints);

      const onPointerMove = (moveEvt: PointerEvent) => {
        const currentX = (moveEvt.clientX - rect.left) / previewZoom;
        const currentY = (moveEvt.clientY - rect.top) / previewZoom;
        newPoints.push({ x: currentX, y: currentY });
        setBrushPoints([...newPoints]);
      };

      const onPointerUp = () => {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        setIsDrawingBrush(false);
        if (newPoints.length >= 2) {
          addNewSvgBrushElement(newPoints);
        }
        setBrushPoints([]);
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      return;
    }

    // Default select tool marquee selection
    if (e.target !== e.currentTarget) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const startX = (e.clientX - rect.left) / previewZoom;
    const startY = (e.clientY - rect.top) / previewZoom;

    setStageSelectionBox({
      startX,
      startY,
      currentX: startX,
      currentY: startY,
    });

    setSelectedElementIds([]);
    setActiveElementId('');

    const onPointerMove = (moveEvt: PointerEvent) => {
      const currentX = (moveEvt.clientX - rect.left) / previewZoom;
      const currentY = (moveEvt.clientY - rect.top) / previewZoom;
      setStageSelectionBox((prev) => prev ? { ...prev, currentX, currentY } : null);
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      setStageSelectionBox((box) => {
        if (!box) return null;
        const x1 = Math.min(box.startX, box.currentX);
        const x2 = Math.max(box.startX, box.currentX);
        const y1 = Math.min(box.startY, box.currentY);
        const y2 = Math.max(box.startY, box.currentY);
        const w = x2 - x1;
        const h = y2 - y1;

        if (w > 2 || h > 2) {
          const matchedElIds: string[] = [];

          elements.forEach((el) => {
            if (el.id === 'el-camera') return;
            const trackX = el.tracks.find((t) => t.channel === 'x');
            const trackY = el.tracks.find((t) => t.channel === 'y');
            const trackWidth = el.tracks.find((t) => t.channel === 'width');
            const trackHeight = el.tracks.find((t) => t.channel === 'height');
            const valX = Number(trackX ? valueAt(trackX, timeMs) : 0);
            const valY = Number(trackY ? valueAt(trackY, timeMs) : 0);

            const valWidth = Number(trackWidth ? valueAt(trackWidth, timeMs) : (el.type === 'box' || el.type === 'circle' ? 100 : el.type === 'image' ? 120 : el.type === 'star' ? 80 : 80));
            const valHeight = Number(trackHeight ? valueAt(trackHeight, timeMs) : (el.type === 'box' || el.type === 'circle' ? 100 : el.type === 'image' ? 80 : el.type === 'star' ? 80 : 80));

            const elLeft = valX;
            const elRight = valX + valWidth;
            const elTop = valY;
            const elBottom = valY + valHeight;

            if (elLeft < x2 && elRight > x1 && elTop < y2 && elBottom > y1) {
              matchedElIds.push(el.id);
            }
          });

          if (matchedElIds.length > 0) {
            setSelectedElementIds(matchedElIds);
            setActiveElementId(matchedElIds[matchedElIds.length - 1] || '');
          } else {
            setSelectedElementIds([]);
            setActiveElementId('');
          }
        }
        return null;
      });
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
    
    const isMulti = e.ctrlKey || e.metaKey;
    let nextIds = [...selectedKeyframeIds];
    
    if (isMulti) {
      if (nextIds.includes(keyframeId)) {
        nextIds = nextIds.filter((id) => id !== keyframeId);
      } else {
        nextIds.push(keyframeId);
      }
    } else {
      if (!nextIds.includes(keyframeId)) {
        nextIds = [keyframeId];
      }
    }

    setSelectedKeyframeId(keyframeId);
    setSelectedKeyframeIds(nextIds);
    setActiveTrackId(trackId);

    const keyframesStartTimes: Array<{ trackId: string; keyframeId: string; startT: number }> = [];
    nextIds.forEach((id) => {
      let found = false;
      if (activeElement) {
        for (const tr of activeElement.tracks) {
          const kf = tr.keyframes.find((k) => k.id === id);
          if (kf) {
            keyframesStartTimes.push({ trackId: tr.id, keyframeId: id, startT: kf.t });
            found = true;
            break;
          }
        }
      }
      if (!found) {
        for (const el of elements) {
          for (const tr of el.tracks) {
            const kf = tr.keyframes.find((k) => k.id === id);
            if (kf) {
              keyframesStartTimes.push({ trackId: tr.id, keyframeId: id, startT: kf.t });
              found = true;
              break;
            }
          }
          if (found) break;
        }
      }
    });

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
      const dragSnapMs = Math.max(1, Math.round(snapMs / Math.max(1, zoom * 8)));

      keyframesStartTimes.forEach(({ trackId: tId, keyframeId: kId, startT }) => {
        const nextT = clamp(Math.round((startT + dt) / dragSnapMs) * dragSnapMs, 0, durationMs);
        updateKeyframeProps(tId, kId, { t: nextT }, { skipSnap: true });
      });
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



  const getUniqueKeyframeTimes = (el: AnimationStudioElement) => {
    const times = new Set<number>();
    times.add(0);
    times.add(durationMs);
    el.tracks.forEach(track => {
      track.keyframes.forEach(kf => {
        times.add(kf.t);
      });
    });
    return Array.from(times).sort((a, b) => a - b);
  };

  const getElementStyleAt = (el: AnimationStudioElement, timeMs: number) => {
    const styles: Record<string, string> = {};
    
    // Base properties
    const trackX = el.tracks.find(t => t.channel === 'x');
    const trackY = el.tracks.find(t => t.channel === 'y');
    const trackScale = el.tracks.find(t => t.channel === 'scale');
    const trackRotate = el.tracks.find(t => t.channel === 'rotate');
    const trackRotateX = el.tracks.find(t => t.channel === 'rotateX');
    const trackRotateY = el.tracks.find(t => t.channel === 'rotateY');
    const trackScaleX = el.tracks.find(t => t.channel === 'scaleX');
    const trackScaleY = el.tracks.find(t => t.channel === 'scaleY');
    
    const valX = trackX ? valueAt(trackX, timeMs) : 0;
    const valY = trackY ? valueAt(trackY, timeMs) : 0;
    const valScale = trackScale ? valueAt(trackScale, timeMs) : 1;
    const valScaleX = trackScaleX ? valueAt(trackScaleX, timeMs) : 1;
    const valScaleY = trackScaleY ? valueAt(trackScaleY, timeMs) : 1;
    const valRotate = trackRotate ? valueAt(trackRotate, timeMs) : 0;
    const valRotateX = trackRotateX ? valueAt(trackRotateX, timeMs) : 0;
    const valRotateY = trackRotateY ? valueAt(trackRotateY, timeMs) : 0;
    
    let transformStr = `translate(${valX}px, ${valY}px)`;
    if (valScale !== 1 || valScaleX !== 1 || valScaleY !== 1) transformStr += ` scale(${Number(valScale) * Number(valScaleX)}, ${Number(valScale) * Number(valScaleY)})`;
    if (valRotate !== 0) transformStr += ` rotate(${valRotate}deg)`;
    if (valRotateX !== 0) transformStr += ` rotateX(${valRotateX}deg)`;
    if (valRotateY !== 0) transformStr += ` rotateY(${valRotateY}deg)`;
    styles['transform'] = transformStr;

    const trackOpacity = el.tracks.find(t => t.channel === 'opacity');
    if (trackOpacity) {
      styles['opacity'] = `${valueAt(trackOpacity, timeMs)}`;
    }

    const trackWidth = el.tracks.find(t => t.channel === 'width');
    const trackHeight = el.tracks.find(t => t.channel === 'height');
    if (trackWidth) styles['width'] = `${valueAt(trackWidth, timeMs)}px`;
    if (trackHeight) styles['height'] = `${valueAt(trackHeight, timeMs)}px`;

    const trackBorderRadius = el.tracks.find(t => t.channel === 'borderRadius');
    if (trackBorderRadius) styles['border-radius'] = `${valueAt(trackBorderRadius, timeMs)}px`;

    const trackZIndex = el.tracks.find(t => t.channel === 'zIndex');
    if (trackZIndex) styles['z-index'] = `${Math.round(Number(valueAt(trackZIndex, timeMs)))}`;

    // Filters
    const filters = [];
    const trackBlur = el.tracks.find(t => t.channel === 'blur');
    const trackBrightness = el.tracks.find(t => t.channel === 'brightness');
    const trackContrast = el.tracks.find(t => t.channel === 'contrast');
    const trackGrayscale = el.tracks.find(t => t.channel === 'grayscale');
    const trackHueRotate = el.tracks.find(t => t.channel === 'hueRotate');
    const trackSaturate = el.tracks.find(t => t.channel === 'saturate');
    const trackSepia = el.tracks.find(t => t.channel === 'sepia');

    if (trackBlur) filters.push(`blur(${valueAt(trackBlur, timeMs)}px)`);
    if (trackBrightness) filters.push(`brightness(${valueAt(trackBrightness, timeMs)}%)`);
    if (trackContrast) filters.push(`contrast(${valueAt(trackContrast, timeMs)}%)`);
    if (trackGrayscale) filters.push(`grayscale(${valueAt(trackGrayscale, timeMs)}%)`);
    if (trackHueRotate) filters.push(`hue-rotate(${valueAt(trackHueRotate, timeMs)}deg)`);
    if (trackSaturate) filters.push(`saturate(${valueAt(trackSaturate, timeMs)}%)`);
    if (trackSepia) filters.push(`sepia(${valueAt(trackSepia, timeMs)}%)`);

    if (filters.length > 0) {
      styles['filter'] = filters.join(' ');
    }

    // Origin
    const trackOriginX = el.tracks.find(t => t.channel === 'originX');
    const trackOriginY = el.tracks.find(t => t.channel === 'originY');
    if (trackOriginX || trackOriginY) {
      const ox = trackOriginX ? valueAt(trackOriginX, timeMs) : 50;
      const oy = trackOriginY ? valueAt(trackOriginY, timeMs) : 50;
      styles['transform-origin'] = `${ox}% ${oy}%`;
    }

    // Background HSL
    const trackBgH = el.tracks.find(t => t.channel === 'bgH');
    const trackBgS = el.tracks.find(t => t.channel === 'bgS');
    const trackBgL = el.tracks.find(t => t.channel === 'bgL');
    const trackBgA = el.tracks.find(t => t.channel === 'bgA');
    const trackBg2H = el.tracks.find(t => t.channel === 'bg2H');
    const trackBg2S = el.tracks.find(t => t.channel === 'bg2S');
    const trackBg2L = el.tracks.find(t => t.channel === 'bg2L');
    const trackBg2A = el.tracks.find(t => t.channel === 'bg2A');
    const trackBgAngle = el.tracks.find(t => t.channel === 'bgAngle');
    if (trackBgH || trackBgS || trackBgL || trackBgA || trackBg2H || trackBg2S || trackBg2L || trackBg2A || trackBgAngle) {
      const h = trackBgH ? valueAt(trackBgH, timeMs) : 270;
      const s = trackBgS ? valueAt(trackBgS, timeMs) : 80;
      const l = trackBgL ? valueAt(trackBgL, timeMs) : 50;
      const a = trackBgA ? valueAt(trackBgA, timeMs) : 1;
      const h2 = trackBg2H ? valueAt(trackBg2H, timeMs) : 220;
      const s2 = trackBg2S ? valueAt(trackBg2S, timeMs) : 80;
      const l2 = trackBg2L ? valueAt(trackBg2L, timeMs) : 50;
      const a2 = trackBg2A ? valueAt(trackBg2A, timeMs) : 0;
      const angle = trackBgAngle ? valueAt(trackBgAngle, timeMs) : 135;
      styles['background-color'] = `hsla(${h}, ${s}%, ${l}%, ${a})`;
      if (Number(a2) > 0) {
        styles['background-image'] = `linear-gradient(${angle}deg, hsla(${h}, ${s}%, ${l}%, ${a}), hsla(${h2}, ${s2}%, ${l2}%, ${a2}))`;
      }
    }

    return styles;
  };

  const generateWAAPICode = () => {
    let script = `// Standalone Web Animations API (WAAPI) Code\n`;
    script += `// Target element: querySelector your element and run:\n\n`;

    elements.filter((el) => el.id !== 'el-camera').forEach((el) => {
      const times = getUniqueKeyframeTimes(el);
      const kfObjects = times.map((t) => {
        const styles = getElementStyleAt(el, t);
        const offset = t / durationMs;
        const stylesStr = Object.entries(styles)
          .map(([k, v]) => `    ${k}: '${v}'`)
          .join(',\n');
        return `  {\n${stylesStr},\n    offset: ${offset.toFixed(4)}\n  }`;
      }).join(',\n');

      script += `// Animation for: ${el.name} (${el.type})\n`;
      script += `const el_${el.id.replace(/-/g, '_')} = document.querySelector('#element-${el.id}');\n`;
      script += `if (el_${el.id.replace(/-/g, '_')}) {\n`;
      script += `  el_${el.id.replace(/-/g, '_')}.animate([\n${kfObjects}\n  ], {\n`;
      script += `    duration: ${durationMs},\n`;
      script += `    iterations: ${loop ? 'Infinity' : '1'},\n`;
      script += `    fill: 'both'\n`;
      script += `  });\n`;
      script += `}\n\n`;
    });

    return script;
  };

  const generateCSSKeyframes = () => {
    let css = `/* Standalone CSS Keyframes and Styles */\n\n`;

    elements.filter((el) => el.id !== 'el-camera').forEach((el) => {
      const times = getUniqueKeyframeTimes(el);
      const kfRules = times.map((t) => {
        const styles = getElementStyleAt(el, t);
        const pct = (t / durationMs) * 100;
        const stylesStr = Object.entries(styles)
          .map(([k, v]) => `    ${k}: ${v};`)
          .join('\n');
        return `  ${pct.toFixed(2)}% {\n${stylesStr}\n  }`;
      }).join('\n\n');

      css += `/* Element styles for: ${el.name} */\n`;
      css += `.anim-element-${el.id} {\n`;
      if (el.type === 'circle') css += `  border-radius: 9999px;\n`;
      css += `  animation: play-anim-${el.id} ${durationMs}ms ${loop ? 'infinite' : 'forwards'} linear;\n`;
      css += `}\n\n`;

      css += `@keyframes play-anim-${el.id} {\n${kfRules}\n}\n\n`;
    });

    return css;
  };

    const generateReactCode = () => {
      const elementsData = JSON.stringify(elements, null, 2);
      const hasCamera = elements.some((el) => el.id === 'el-camera');

    return `import React from 'react';
import { Animotion, type AnimationStudioElement } from '@pixonui/react';

const elements = ${elementsData} satisfies AnimationStudioElement[];

export function MyTimelineAnimation() {
  const camera = elements.find((el) => el.id === 'el-camera');
  const stageElements = elements.filter((el) => el.id !== 'el-camera');
  return (
    <div className="relative w-full h-[300px] bg-zinc-950 flex items-center justify-center overflow-hidden rounded-3xl">
      ${hasCamera ? `
      {camera ? (
        <Animotion
          tracks={camera.tracks}
          durationMs={${durationMs}}
          loop={${loop}}
          autoplay
          camera
          className="absolute inset-0 pointer-events-none"
        >
          {stageElements.map((el) => (
            <Animotion
              key={el.id}
              tracks={el.tracks}
              durationMs={${durationMs}}
              loop={${loop}}
              autoplay
              motionPath={el.motionPath}
              motionRotate={el.motionRotate}
              className="absolute left-0 top-0"
            >
              <div className={\`flex h-full w-full items-center justify-center px-6 py-4 rounded-3xl \${el.color}\`}>
                {el.text}
              </div>
            </Animotion>
          ))}
        </Animotion>
      ) : (
        stageElements.map((el) => (
          <Animotion
            key={el.id}
            tracks={el.tracks}
            durationMs={${durationMs}}
            loop={${loop}}
            autoplay
            motionPath={el.motionPath}
            motionRotate={el.motionRotate}
            className="absolute left-0 top-0"
          >
            <div className={\`flex h-full w-full items-center justify-center px-6 py-4 rounded-3xl \${el.color}\`}>
              {el.text}
            </div>
          </Animotion>
        ))
      )}
      ` : `
      {stageElements.map((el) => (
        <Animotion
          key={el.id}
          tracks={el.tracks}
          durationMs={${durationMs}}
          loop={${loop}}
          autoplay
          motionPath={el.motionPath}
          motionRotate={el.motionRotate}
          className="absolute left-0 top-0"
        >
          <div className={\`flex h-full w-full items-center justify-center px-6 py-4 rounded-3xl \${el.color}\`}>
            {el.text}
          </div>
        </Animotion>
      ))}
      `}
    </div>
  );
}`;
    };

  const copyReactCode = () => {
    const code = generateReactCode();
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const generateLottieJSON = () => {
    const fps = 60;
    const totalFrames = Math.max(1, Math.round((durationMs / 1000) * fps));

    const layers = elements.filter((el) => el.id !== 'el-camera').map((el, idx) => {
      let times = getUniqueKeyframeTimes(el);
      if (times.length === 0) {
        times = [0];
      }
      
      const trackX = el.tracks.find(t => t.channel === 'x');
      const trackY = el.tracks.find(t => t.channel === 'y');
      const trackScale = el.tracks.find(t => t.channel === 'scale');
      const trackRotate = el.tracks.find(t => t.channel === 'rotate');
      const trackOpacity = el.tracks.find(t => t.channel === 'opacity');

      const hasAnim = (track: any) => track && track.keyframes && track.keyframes.length > 0;

      // Position (p)
      const pObj: any = { a: 0, k: [400, 300, 0] };
      if (hasAnim(trackX) || hasAnim(trackY)) {
        pObj.a = 1;
        pObj.k = times.map((t, i) => {
          const x = trackX ? Number(valueAt(trackX, t)) : 0;
          const y = trackY ? Number(valueAt(trackY, t)) : 0;
          const frame = Math.round((t / durationMs) * totalFrames);
          
          const item: any = {
            t: frame,
            s: [x + 400, y + 300, 0]
          };
          if (i < times.length - 1) {
            const nextT = times[i + 1]!;
            const nextX = trackX ? Number(valueAt(trackX, nextT)) : 0;
            const nextY = trackY ? Number(valueAt(trackY, nextT)) : 0;
            item.e = [nextX + 400, nextY + 300, 0];
            item.h = 0;
          }
          return item;
        });
      } else {
        const x = trackX ? Number(valueAt(trackX, 0)) : 0;
        const y = trackY ? Number(valueAt(trackY, 0)) : 0;
        pObj.k = [x + 400, y + 300, 0];
      }

      // Scale (s)
      const sObj: any = { a: 0, k: [100, 100, 100] };
      if (hasAnim(trackScale)) {
        sObj.a = 1;
        sObj.k = times.map((t, i) => {
          const sVal = Number(trackScale ? valueAt(trackScale, t) : 1) * 100;
          const frame = Math.round((t / durationMs) * totalFrames);
          const item: any = {
            t: frame,
            s: [sVal, sVal, 100]
          };
          if (i < times.length - 1) {
            const nextT = times[i + 1]!;
            const nextSVal = Number(trackScale ? valueAt(trackScale, nextT) : 1) * 100;
            item.e = [nextSVal, nextSVal, 100];
            item.h = 0;
          }
          return item;
        });
      } else {
        const sVal = Number(trackScale ? valueAt(trackScale, 0) : 1) * 100;
        sObj.k = [sVal, sVal, 100];
      }

      // Rotation (r)
      const rObj: any = { a: 0, k: 0 };
      if (hasAnim(trackRotate)) {
        rObj.a = 1;
        rObj.k = times.map((t, i) => {
          const rVal = Number(trackRotate ? valueAt(trackRotate, t) : 0);
          const frame = Math.round((t / durationMs) * totalFrames);
          const item: any = {
            t: frame,
            s: [rVal]
          };
          if (i < times.length - 1) {
            const nextT = times[i + 1]!;
            const nextRVal = Number(trackRotate ? valueAt(trackRotate, nextT) : 0);
            item.e = [nextRVal];
            item.h = 0;
          }
          return item;
        });
      } else {
        rObj.k = Number(trackRotate ? valueAt(trackRotate, 0) : 0);
      }

      // Opacity (o)
      const oObj: any = { a: 0, k: 100 };
      if (hasAnim(trackOpacity)) {
        oObj.a = 1;
        oObj.k = times.map((t, i) => {
          const oVal = Number(trackOpacity ? valueAt(trackOpacity, t) : 1) * 100;
          const frame = Math.round((t / durationMs) * totalFrames);
          const item: any = {
            t: frame,
            s: [oVal]
          };
          if (i < times.length - 1) {
            const nextT = times[i + 1]!;
            const nextOVal = Number(trackOpacity ? valueAt(trackOpacity, nextT) : 1) * 100;
            item.e = [nextOVal];
            item.h = 0;
          }
          return item;
        });
      } else {
        oObj.k = Number(trackOpacity ? valueAt(trackOpacity, 0) : 1) * 100;
      }

      return {
        ddd: 0,
        ind: idx + 1,
        ty: (el.type as string) === 'svg' || el.tracks.some(t => t.channel === 'd') ? 4 : 1,
        nm: el.name,
        sr: 1,
        ks: {
          o: oObj,
          r: rObj,
          p: pObj,
          s: sObj,
          a: { a: 0, k: [0, 0, 0] }
        },
        ao: 0,
        ip: 0,
        op: totalFrames,
        st: 0,
        bm: 0
      };
    });

    const lottie = {
      v: "5.7.5",
      fr: fps,
      ip: 0,
      op: totalFrames,
      w: 800,
      h: 600,
      nm: "PixonUI Animation",
      ddd: 0,
      assets: [],
      layers: layers
    };

    return JSON.stringify(lottie, null, 2);
  };

  const copyLottieCode = () => {
    const code = generateLottieJSON();
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

  const searchTerm = studioSearch.trim().toLowerCase();
  const cameraElement = useMemo(() => elements.find((el) => el.id === 'el-camera') ?? null, [elements]);
  const visibleElementIds = useMemo(() => {
    if (!searchTerm) return new Set(elements.map((el) => el.id));

    const matches = new Set<string>();
    for (const el of elements) {
      const haystack = [
        el.name,
        el.text,
        el.type,
        el.id,
        ...el.tracks.map((tr) => tr.label),
        ...el.tracks.map((tr) => tr.channel),
      ].join(' ').toLowerCase();
      if (haystack.includes(searchTerm)) matches.add(el.id);
    }

    const includeAncestors = (id: string) => {
      let current = elements.find((el) => el.id === id)?.parentId;
      while (current) {
        matches.add(current);
        current = elements.find((el) => el.id === current)?.parentId;
      }
    };

    const includeDescendants = (id: string) => {
      for (const child of getChildren(elements, id)) {
        if (!matches.has(child.id)) matches.add(child.id);
        includeDescendants(child.id);
      }
    };

    [...matches].forEach((id) => {
      includeAncestors(id);
      includeDescendants(id);
    });

    return matches;
  }, [elements, searchTerm]);

  const orderedElements = [...elements].reverse().filter((el) => el.id !== 'el-camera' && visibleElementIds.has(el.id));
  const timelineElements = cameraElement
    ? [cameraElement, ...orderedElements]
    : orderedElements;

  const timelineRows = timelineElements.flatMap((el) => {
    const elementRow = [{ type: 'element' as const, element: el, track: null }];
    if (el.collapsed) return elementRow;
    return [
      ...elementRow,
      ...el.tracks.map((track) => ({ type: 'track' as const, element: el, track })),
    ];
  });
  const timelineRowsHeight = timelineRows.reduce((sum, row) => sum + (row.type === 'element' ? 40 : 32), 0);

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

  const startResizePreview = (e: React.PointerEvent) => {
    e.stopPropagation();
    previewResizeRef.current = {
      startY: e.clientY,
      startHeight: previewHeight,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onResizePreviewMove = (e: React.PointerEvent) => {
    const data = previewResizeRef.current;
    if (!data) return;
    const dy = e.clientY - data.startY;
    const nextHeight = clamp(data.startHeight + dy, 150, 800);
    setPreviewHeight(nextHeight);
  };

  const onResizePreviewUp = () => {
    previewResizeRef.current = null;
  };

  const pointsToSvgPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0]?.x ?? 0} ${pts[0]?.y ?? 0}`;
    for (let i = 1; i < pts.length; i++) {
      d += ` L ${pts[i]?.x ?? 0} ${pts[i]?.y ?? 0}`;
    }
    return d;
  };

  const addNewSvgBrushElement = (points: { x: number; y: number }[]) => {
    if (points.length < 2) return;
    const xMin = Math.min(...points.map(p => p.x));
    const xMax = Math.max(...points.map(p => p.x));
    const yMin = Math.min(...points.map(p => p.y));
    const yMax = Math.max(...points.map(p => p.y));
    const w = Math.max(10, xMax - xMin);
    const h = Math.max(10, yMax - yMin);

    const normalizedPoints = points.map(p => ({
      x: w > 0 ? Math.round(((p.x - xMin) / w) * 100) : 0,
      y: h > 0 ? Math.round(((p.y - yMin) / h) * 100) : 0,
    }));

    let pathD = `M ${normalizedPoints[0]?.x ?? 0} ${normalizedPoints[0]?.y ?? 0}`;
    for (let i = 1; i < normalizedPoints.length; i++) {
      pathD += ` L ${normalizedPoints[i]?.x ?? 0} ${normalizedPoints[i]?.y ?? 0}`;
    }

    const newId = `el-${Date.now().toString(36)}`;
    const newTracks: AnimationStudioTrack[] = [
      { id: `tr-x-${uid()}`, label: 'Position X', channel: 'x', keyframes: [{ id: uid(), t: 0, v: Math.round(xMin) }] },
      { id: `tr-y-${uid()}`, label: 'Position Y', channel: 'y', keyframes: [{ id: uid(), t: 0, v: Math.round(yMin) }] },
      { id: `tr-scale-${uid()}`, label: 'Scale', channel: 'scale', keyframes: [{ id: uid(), t: 0, v: 1 }] },
      { id: `tr-rotate-${uid()}`, label: 'Rotate', channel: 'rotate', keyframes: [{ id: uid(), t: 0, v: 0 }] },
      { id: `tr-opacity-${uid()}`, label: 'Opacity', channel: 'opacity', keyframes: [{ id: uid(), t: 0, v: 1 }] },
      { id: `tr-width-${uid()}`, label: 'Width', channel: 'width', keyframes: [{ id: uid(), t: 0, v: Math.round(w) }] },
      { id: `tr-height-${uid()}`, label: 'Height', channel: 'height', keyframes: [{ id: uid(), t: 0, v: Math.round(h) }] },
      { id: `tr-d-${uid()}`, label: 'Path Data', channel: 'd', keyframes: [{ id: uid(), t: 0, v: pathD }] },
    ];

    const newEl: AnimationStudioElement = {
      id: newId,
      name: `Freehand Brush ${elements.filter(el => el.name.startsWith('Freehand Brush')).length + 1}`,
      type: 'box',
      text: '',
      color: 'text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]',
      tracks: newTracks,
      collapsed: true,
    };

    updateElementsState((prev) => [...prev, newEl]);
    setActiveElementId(newId);
    setSelectedElementIds([newId]);
    setSelectedKeyframeId(null);
  };

  const addNewElement = (type: 'box' | 'circle' | 'text' | 'image' | 'star' | 'group') => {
    const newId = `el-${Date.now().toString(36)}`;
    const typeLabels = {
      box: 'Rectangle',
      circle: 'Circle',
      text: 'Text Layer',
      image: 'Image Layer',
      star: 'SVG Star',
      group: 'Group',
    };
    const typeColors = {
      box: 'bg-zinc-400 border border-black/10',
      circle: 'bg-zinc-400 border border-black/10',
      text: 'text-zinc-800 dark:text-white',
      image: 'bg-zinc-200 dark:bg-zinc-800 border border-white/10 shadow-xl',
      star: 'text-amber-400 drop-shadow-md',
      group: 'border border-dashed border-purple-500/40 bg-purple-500/5',
    };
    const typeTexts = {
      box: '',
      circle: '',
      text: 'Double Click to Edit',
      image: '',
      star: '',
      group: '',
    };

    const newTracks: AnimationStudioTrack[] = [
      { id: `tr-x-${uid()}`, label: 'Position X', channel: 'x', keyframes: [{ id: uid(), t: 0, v: Math.floor(350 + Math.random() * 80 - 40) }] },
      { id: `tr-y-${uid()}`, label: 'Position Y', channel: 'y', keyframes: [{ id: uid(), t: 0, v: Math.floor(200 + Math.random() * 80 - 40) }] },
      { id: `tr-scale-${uid()}`, label: 'Scale', channel: 'scale', keyframes: [{ id: uid(), t: 0, v: 1 }] },
      { id: `tr-rotate-${uid()}`, label: 'Rotate', channel: 'rotate', keyframes: [{ id: uid(), t: 0, v: 0 }] },
      { id: `tr-opacity-${uid()}`, label: 'Opacity', channel: 'opacity', keyframes: [{ id: uid(), t: 0, v: 1 }] },
    ];

    if (type === 'box' || type === 'circle' || type === 'image') {
      newTracks.push(
        { id: `tr-width-${uid()}`, label: 'Width', channel: 'width', keyframes: [{ id: uid(), t: 0, v: type === 'image' ? 120 : 100 }] },
        { id: `tr-height-${uid()}`, label: 'Height', channel: 'height', keyframes: [{ id: uid(), t: 0, v: type === 'image' ? 80 : 100 }] }
      );
    }

    const newEl: AnimationStudioElement = {
      id: newId,
      name: `${typeLabels[type]} ${elements.length + 1}`,
      type,
      text: typeTexts[type],
      color: typeColors[type],
      imageUrl: type === 'image' ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop' : undefined,
      tracks: newTracks,
      collapsed: true,
    };

    updateElementsState((prev) => [...prev, newEl]);
    setActiveElementId(newId);
    setSelectedElementIds([newId]);
    setSelectedKeyframeId(null);
  };

  const createVirtualCamera = () => {
    const existing = elements.find((el) => el.id === 'el-camera');
    if (existing) {
      setActiveElementId(existing.id);
      setSelectedElementIds([existing.id]);
      setSelectedKeyframeId(null);
      return;
    }

    const cameraElement: AnimationStudioElement = {
      id: 'el-camera',
      name: '🎥 Virtual Camera',
      type: 'box',
      text: 'Camera Control',
      color: 'text-zinc-400',
      locked: true,
      visible: false,
      collapsed: true,
      tracks: [
        { id: `tr-cameraZoom-${uid()}`, label: 'Camera Zoom', channel: 'cameraZoom', keyframes: [
          { id: `kf-cz-${uid()}`, t: 0, v: 0.9, easing: 'linear' },
          { id: `kf-cz-${uid()}`, t: 2000, v: 1.05, easing: 'linear' },
          { id: `kf-cz-${uid()}`, t: 4000, v: 0.9, easing: 'linear' },
        ]},
        { id: `tr-cameraPanX-${uid()}`, label: 'Camera Pan X', channel: 'cameraPanX', keyframes: [{ id: `kf-cpx-${uid()}`, t: 0, v: 0 }] },
        { id: `tr-cameraPanY-${uid()}`, label: 'Camera Pan Y', channel: 'cameraPanY', keyframes: [{ id: `kf-cpy-${uid()}`, t: 0, v: 0 }] },
        { id: `tr-cameraTilt-${uid()}`, label: 'Camera Tilt', channel: 'cameraTilt', keyframes: [{ id: `kf-ct-${uid()}`, t: 0, v: 0 }] },
      ],
    };

    updateElementsState((prev) => [cameraElement, ...prev.filter((el) => el.id !== 'el-camera')]);
    setActiveElementId(cameraElement.id);
    setSelectedElementIds([cameraElement.id]);
    setSelectedKeyframeId(null);
  };

  const offsetElementPositionTracks = (el: AnimationStudioElement, dx: number, dy: number) => ({
    ...el,
    tracks: el.tracks.map((tr) => {
      if (tr.channel === 'x') {
        return { ...tr, keyframes: tr.keyframes.map((kf) => ({ ...kf, v: Number(kf.v) + dx })) };
      }
      if (tr.channel === 'y') {
        return { ...tr, keyframes: tr.keyframes.map((kf) => ({ ...kf, v: Number(kf.v) + dy })) };
      }
      return tr;
    }),
  });

  const groupSelectedElements = () => {
    const ids = selectedElementIds.filter((id) => id !== 'el-camera');
    if (ids.length < 2) return;
    const selected = elements.filter((el) => ids.includes(el.id));
    const rootsOnly = selected.filter((el) => !el.parentId || !ids.includes(el.parentId));
    const positions = rootsOnly.map((el) => ({
      x: Number(valueAt(el.tracks.find((tr) => tr.channel === 'x')!, timeMs) || 0),
      y: Number(valueAt(el.tracks.find((tr) => tr.channel === 'y')!, timeMs) || 0),
    }));
    const groupX = Math.min(...positions.map((pos) => pos.x));
    const groupY = Math.min(...positions.map((pos) => pos.y));
    const groupId = `el-group-${uid()}`;
    const groupTracks: AnimationStudioTrack[] = [
      { id: `tr-x-${uid()}`, label: 'Position X', channel: 'x', keyframes: [{ id: uid(), t: 0, v: groupX, easing: 'linear' }] },
      { id: `tr-y-${uid()}`, label: 'Position Y', channel: 'y', keyframes: [{ id: uid(), t: 0, v: groupY, easing: 'linear' }] },
      { id: `tr-scale-${uid()}`, label: 'Scale', channel: 'scale', keyframes: [{ id: uid(), t: 0, v: 1, easing: 'linear' }] },
      { id: `tr-rotate-${uid()}`, label: 'Rotate', channel: 'rotate', keyframes: [{ id: uid(), t: 0, v: 0, easing: 'linear' }] },
      { id: `tr-opacity-${uid()}`, label: 'Opacity', channel: 'opacity', keyframes: [{ id: uid(), t: 0, v: 1, easing: 'linear' }] },
    ];
    const groupEl: AnimationStudioElement = {
      id: groupId,
      name: `Group ${componentPresets.length + 1}`,
      type: 'group',
      text: '',
      color: 'border border-dashed border-purple-500/40 bg-purple-500/5',
      tracks: groupTracks,
      collapsed: true,
    };

    updateElementsState((prev) => [
      ...prev.map((el) => {
        if (!ids.includes(el.id) || (el.parentId && ids.includes(el.parentId))) return el;
        return { ...offsetElementPositionTracks(el, -groupX, -groupY), parentId: groupId };
      }),
      groupEl,
    ]);
    setActiveElementId(groupId);
    setSelectedElementIds([groupId]);
  };

  const ungroupElement = (groupId: string) => {
    const group = elements.find((el) => el.id === groupId && el.type === 'group');
    if (!group) return;
    const groupX = Number(valueAt(group.tracks.find((tr) => tr.channel === 'x')!, timeMs) || 0);
    const groupY = Number(valueAt(group.tracks.find((tr) => tr.channel === 'y')!, timeMs) || 0);
    updateElementsState((prev) =>
      prev
        .filter((el) => el.id !== groupId)
        .map((el) => {
          if (el.parentId !== groupId) return el;
          return { ...offsetElementPositionTracks(el, groupX, groupY), parentId: group.parentId };
        })
    );
    const children = elements.filter((el) => el.parentId === groupId);
    setSelectedElementIds(children.map((el) => el.id));
    setActiveElementId(children[0]?.id ?? '');
  };

  const cloneElementsForPreset = (source: AnimationStudioElement[], parentId?: string) => {
    const idMap = new Map<string, string>();
    source.forEach((el) => idMap.set(el.id, `el-${uid()}`));
    return source.map((el) => ({
      ...el,
      id: idMap.get(el.id)!,
      parentId: el.parentId ? idMap.get(el.parentId) ?? parentId : parentId,
      tracks: el.tracks.map((tr) => ({
        ...tr,
        id: `tr-${tr.channel}-${uid()}`,
        keyframes: tr.keyframes.map((kf) => ({ ...kf, id: uid() })),
      })),
    }));
  };

  const saveComponentPreset = (rootId: string) => {
    const collect = (id: string): AnimationStudioElement[] => {
      const root = elements.find((el) => el.id === id);
      if (!root) return [];
      return [root, ...elements.filter((el) => el.parentId === id).flatMap((child) => collect(child.id))];
    };
    const source = collect(rootId);
    if (source.length === 0) return;
    const presetId = `cmp-${uid()}`;
    setComponentPresets((prev) => [
      ...prev,
      {
        id: presetId,
        name: `${source[0]!.name} Component`,
        rootElementId: source[0]!.id,
        elements: source,
      },
    ]);
  };

  const insertComponentPreset = (preset: AnimationStudioComponentPreset) => {
    const clones = cloneElementsForPreset(preset.elements);
    updateElementsState((prev) => [...prev, ...clones]);
    setActiveElementId(clones[0]?.id ?? activeElementId);
    setSelectedElementIds(clones[0] ? [clones[0].id] : []);
  };

  const deleteElement = (elementId: string) => {
    if (elements.length <= 1) return;
    const nextElements = elements.filter((el) => el.id !== elementId);
    setElements(nextElements);
    
    setSelectedElementIds((prev) => {
      const next = prev.filter((id) => id !== elementId);
      if (next.length === 0 && nextElements[0]) {
        return [nextElements[0].id];
      }
      return next;
    });

    if (activeElementId === elementId) {
      setActiveElementId(nextElements[0]!.id);
      setSelectedKeyframeId(null);
    }
  };

  const duplicateSelectedElements = () => {
    const ids = selectedElementIds.filter((id) => id !== 'el-camera');
    const sourceIds = ids.length > 0 ? ids : (activeElementId && activeElementId !== 'el-camera' ? [activeElementId] : []);
    if (sourceIds.length === 0) return;

    const clones = sourceIds.flatMap((elementId) => {
      const targetEl = elements.find((el) => el.id === elementId);
      if (!targetEl) return [];
      const newId = `el-${Date.now().toString(36)}-${uid()}`;
      return [{
        ...targetEl,
        id: newId,
        name: `${targetEl.name} Copy`,
        tracks: targetEl.tracks.map((tr) => ({
          ...tr,
          id: `tr-${tr.channel}-${uid()}`,
          keyframes: tr.keyframes.map((kf) => ({ ...kf, id: uid() })),
        })),
      }];
    });

    if (clones.length === 0) return;
    updateElementsState((prev) => [...prev, ...clones]);
    setActiveElementId(clones[clones.length - 1]!.id);
    setSelectedElementIds([clones[clones.length - 1]!.id]);
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
          if (!isAutoKeyArmed) return el;
          const channelLabels: Partial<Record<AnimationStudioChannel, string>> = {
            x: 'Position X',
            y: 'Position Y',
            scale: 'Scale',
            scaleX: 'Scale X',
            scaleY: 'Scale Y',
            rotate: 'Rotate',
            opacity: 'Opacity',
            blur: 'Blur Filter',
            brightness: 'Brightness Filter',
            contrast: 'Contrast Filter',
            grayscale: 'Grayscale Filter',
            hueRotate: 'Hue Rotate Filter',
            saturate: 'Saturate Filter',
            sepia: 'Sepia Filter',
            width: 'Width',
            height: 'Height',
            offsetDistance: 'Motion Path Distance',
            offsetRotate: 'Motion Path Rotate Offset',
          };
          const newTr: AnimationStudioTrack = {
            id: `tr-${channel}-${uid()}`,
            label: channelLabels[channel] || String(channel),
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
    
    const isMulti = e.ctrlKey || e.metaKey;
    let activeIds = [...selectedElementIds];
    
    if (isMulti) {
      if (activeIds.includes(elementId)) {
        activeIds = activeIds.filter((id) => id !== elementId);
        setActiveElementId(activeIds[activeIds.length - 1] || '');
      } else {
        activeIds.push(elementId);
        setActiveElementId(elementId);
      }
      setSelectedElementIds(activeIds);
    } else {
      if (!activeIds.includes(elementId)) {
        activeIds = [elementId];
        setSelectedElementIds(activeIds);
        setActiveElementId(elementId);
      }
    }
    
    setSelectedKeyframeId(null);
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;

    // Get current starting coordinate for all elements that will be translated
    const startCoords = activeIds.map((id) => {
      const el = elements.find((item) => item.id === id);
      const trackX = el?.tracks.find((t) => t.channel === 'x');
      const trackY = el?.tracks.find((t) => t.channel === 'y');
      return {
        id,
        x: Number(trackX ? valueAt(trackX, timeMs) : 0),
        y: Number(trackY ? valueAt(trackY, timeMs) : 0),
      };
    });

    const onPointerMove = (moveEvt: PointerEvent) => {
      const dx = moveEvt.clientX - startMouseX;
      const dy = moveEvt.clientY - startMouseY;
      
      const newSnapLines: typeof snapLines = [];

      updateElementsState((prev) => {
        return prev.map((el) => {
          const startInfo = startCoords.find((info) => info.id === el.id);
          if (!startInfo) return el;
          
          let nextX = Math.round(startInfo.x + dx / previewZoom);
          let nextY = Math.round(startInfo.y + dy / previewZoom);
          
          // Snapping logic if dragging a single element
          if (activeIds.length === 1 && activeIds[0] === el.id) {
            const tW = el.tracks.find(t => t.channel === 'width');
            const tH = el.tracks.find(t => t.channel === 'height');
            const targetWidth = Number(tW ? valueAt(tW, timeMs) : 100);
            const targetHeight = Number(tH ? valueAt(tH, timeMs) : 100);

            let snappedX = false;
            let snappedY = false;

            // Check against other elements
            for (const otherEl of prev) {
              if (otherEl.id === el.id) continue;
              const oXTrack = otherEl.tracks.find(t => t.channel === 'x');
              const oYTrack = otherEl.tracks.find(t => t.channel === 'y');
              const oWTrack = otherEl.tracks.find(t => t.channel === 'width');
              const oHTrack = otherEl.tracks.find(t => t.channel === 'height');

              const otherX = Number(oXTrack ? valueAt(oXTrack, timeMs) : 0);
              const otherY = Number(oYTrack ? valueAt(oYTrack, timeMs) : 0);
              const otherWidth = Number(oWTrack ? valueAt(oWTrack, timeMs) : 100);
              const otherHeight = Number(oHTrack ? valueAt(oHTrack, timeMs) : 100);

              const otherLeft = otherX;
              const otherRight = otherX + otherWidth;
              const otherCenterX = otherX + otherWidth / 2;

              const otherTop = otherY;
              const otherBottom = otherY + otherHeight;
              const otherCenterY = otherY + otherHeight / 2;

              // Horizontal (X) Snap checks
              if (!snappedX) {
                if (Math.abs(nextX - otherLeft) < 6) {
                  nextX = otherLeft;
                  newSnapLines.push({ type: 'v', val: otherLeft });
                  snappedX = true;
                } else if (Math.abs((nextX + targetWidth) - otherRight) < 6) {
                  nextX = otherRight - targetWidth;
                  newSnapLines.push({ type: 'v', val: otherRight });
                  snappedX = true;
                } else if (Math.abs((nextX + targetWidth / 2) - otherCenterX) < 6) {
                  nextX = otherCenterX - targetWidth / 2;
                  newSnapLines.push({ type: 'v', val: otherCenterX });
                  snappedX = true;
                } else if (Math.abs(nextX - otherRight) < 6) {
                  nextX = otherRight;
                  newSnapLines.push({ type: 'v', val: otherRight });
                  snappedX = true;
                } else if (Math.abs((nextX + targetWidth) - otherLeft) < 6) {
                  nextX = otherLeft - targetWidth;
                  newSnapLines.push({ type: 'v', val: otherLeft });
                  snappedX = true;
                }
              }

              // Vertical (Y) Snap checks
              if (!snappedY) {
                if (Math.abs(nextY - otherTop) < 6) {
                  nextY = otherTop;
                  newSnapLines.push({ type: 'h', val: otherTop });
                  snappedY = true;
                } else if (Math.abs((nextY + targetHeight) - otherBottom) < 6) {
                  nextY = otherBottom - targetHeight;
                  newSnapLines.push({ type: 'h', val: otherBottom });
                  snappedY = true;
                } else if (Math.abs((nextY + targetHeight / 2) - otherCenterY) < 6) {
                  nextY = otherCenterY - targetHeight / 2;
                  newSnapLines.push({ type: 'h', val: otherCenterY });
                  snappedY = true;
                } else if (Math.abs(nextY - otherBottom) < 6) {
                  nextY = otherBottom;
                  newSnapLines.push({ type: 'h', val: otherBottom });
                  snappedY = true;
                } else if (Math.abs((nextY + targetHeight) - otherTop) < 6) {
                  nextY = otherTop - targetHeight;
                  newSnapLines.push({ type: 'h', val: otherTop });
                  snappedY = true;
                }
              }
            }
          }

          let nextTracks = [...el.tracks];
          for (const ch of ['x', 'y'] as const) {
            const channel = ch;
            const nextV = channel === 'x' ? nextX : nextY;
            const track = el.tracks.find((t) => t.channel === channel);
            if (track) {
              const snappedT = Math.round(timeMs / snapMs) * snapMs;
              const existingIndex = track.keyframes.findIndex((kf) => kf.t === snappedT);
              let nextKeyframes = [...track.keyframes];
              if (existingIndex !== -1) {
                nextKeyframes[existingIndex] = { ...nextKeyframes[existingIndex]!, v: nextV };
              } else {
                nextKeyframes.push({ id: uid(), t: snappedT, v: nextV, easing: 'linear' });
              }
              nextTracks = nextTracks.map((t) => (t.channel === channel ? { ...t, keyframes: nextKeyframes } : t));
            }
          }
          return { ...el, tracks: nextTracks };
        });
      });

      setSnapLines(newSnapLines);
    };

    const onPointerUp = () => {
      setSnapLines([]);
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

  const startDragBorderRadius = (
    e: React.PointerEvent,
    elementId: string,
    corner: 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft'
  ) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;

    const targetEl = elements.find((item) => item.id === elementId);
    if (!targetEl) return;

    const trackBorderRadius = targetEl.tracks.find((t) => t.channel === 'borderRadius');
    const baseRadius = Number(trackBorderRadius ? valueAt(trackBorderRadius, timeMs) : 0);

    const startTopLeft = Number(targetEl.borderRadiusTopLeft !== undefined ? targetEl.borderRadiusTopLeft : baseRadius);
    const startTopRight = Number(targetEl.borderRadiusTopRight !== undefined ? targetEl.borderRadiusTopRight : baseRadius);
    const startBottomRight = Number(targetEl.borderRadiusBottomRight !== undefined ? targetEl.borderRadiusBottomRight : baseRadius);
    const startBottomLeft = Number(targetEl.borderRadiusBottomLeft !== undefined ? targetEl.borderRadiusBottomLeft : baseRadius);

    const onPointerMove = (moveEvt: PointerEvent) => {
      const dx = (moveEvt.clientX - startX) / previewZoom;
      const dy = (moveEvt.clientY - startY) / previewZoom;

      let delta = 0;
      const sensitivity = 0.8;
      if (corner === 'topLeft') {
        delta = (dx + dy) * 0.5 * sensitivity;
      } else if (corner === 'topRight') {
        delta = (-dx + dy) * 0.5 * sensitivity;
      } else if (corner === 'bottomRight') {
        delta = (-dx - dy) * 0.5 * sensitivity;
      } else if (corner === 'bottomLeft') {
        delta = (dx - dy) * 0.5 * sensitivity;
      }

      const startVal =
        corner === 'topLeft'
          ? startTopLeft
          : corner === 'topRight'
          ? startTopRight
          : corner === 'bottomRight'
          ? startBottomRight
          : startBottomLeft;
      const nextVal = Math.max(0, Math.round(startVal + delta));

      updateElementsState((prev) => {
        return prev.map((el) => {
          if (el.id !== elementId) return el;

          if (moveEvt.ctrlKey) {
            const track = el.tracks.find((t) => t.channel === 'borderRadius');
            let nextTracks = [...el.tracks];
            const snappedT = Math.round(timeMs / snapMs) * snapMs;

            if (!track) {
              nextTracks.push({
                id: `tr-borderRadius-${uid()}`,
                label: 'Border Radius',
                channel: 'borderRadius',
                keyframes: [{ id: uid(), t: snappedT, v: nextVal, easing: 'linear' }],
              });
            } else {
              nextTracks = nextTracks.map((tr) => {
                if (tr.channel !== 'borderRadius') return tr;
                const existingIndex = tr.keyframes.findIndex((kf) => Math.abs(kf.t - snappedT) < 1);
                const nextKeyframes = [...tr.keyframes];
                if (existingIndex !== -1) {
                  nextKeyframes[existingIndex] = { ...nextKeyframes[existingIndex]!, v: nextVal };
                } else {
                  nextKeyframes.push({ id: uid(), t: snappedT, v: nextVal, easing: 'linear' });
                }
                return { ...tr, keyframes: nextKeyframes };
              });
            }

            return {
              ...el,
              borderRadiusTopLeft: nextVal,
              borderRadiusTopRight: nextVal,
              borderRadiusBottomRight: nextVal,
              borderRadiusBottomLeft: nextVal,
              tracks: nextTracks,
            };
          } else {
            const propName =
              corner === 'topLeft'
                ? 'borderRadiusTopLeft'
                : corner === 'topRight'
                ? 'borderRadiusTopRight'
                : corner === 'bottomRight'
                ? 'borderRadiusBottomRight'
                : 'borderRadiusBottomLeft';

            const labelName =
              corner === 'topLeft'
                ? 'Radius Top Left'
                : corner === 'topRight'
                ? 'Radius Top Right'
                : corner === 'bottomRight'
                ? 'Radius Bottom Right'
                : 'Radius Bottom Left';

            const track = el.tracks.find((t) => t.channel === propName);
            let nextTracks = [...el.tracks];
            const snappedT = Math.round(timeMs / snapMs) * snapMs;

            if (!track) {
              nextTracks.push({
                id: `tr-${propName}-${uid()}`,
                label: labelName,
                channel: propName,
                keyframes: [{ id: uid(), t: snappedT, v: nextVal, easing: 'linear' }],
              });
            } else {
              nextTracks = nextTracks.map((tr) => {
                if (tr.channel !== propName) return tr;
                const existingIndex = tr.keyframes.findIndex((kf) => Math.abs(kf.t - snappedT) < 1);
                const nextKeyframes = [...tr.keyframes];
                if (existingIndex !== -1) {
                  nextKeyframes[existingIndex] = { ...nextKeyframes[existingIndex]!, v: nextVal };
                } else {
                  nextKeyframes.push({ id: uid(), t: snappedT, v: nextVal, easing: 'linear' });
                }
                return { ...tr, keyframes: nextKeyframes };
              });
            }

            return {
              ...el,
              [propName]: nextVal,
              tracks: nextTracks,
            };
          }
        });
      });
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const startDragClip = (
    e: React.PointerEvent,
    elementId: string,
    edge: 'top' | 'right' | 'bottom' | 'left',
    startVal: number
  ) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;

    const onPointerMove = (moveEvt: PointerEvent) => {
      const dx = (moveEvt.clientX - startX) / previewZoom;
      const dy = (moveEvt.clientY - startY) / previewZoom;

      let delta = 0;
      const sensitivity = 0.5;
      if (edge === 'top') {
        delta = dy * sensitivity;
      } else if (edge === 'bottom') {
        delta = -dy * sensitivity;
      } else if (edge === 'left') {
        delta = dx * sensitivity;
      } else if (edge === 'right') {
        delta = -dx * sensitivity;
      }

      const nextVal = Math.max(0, Math.min(100, Math.round(startVal + delta)));

      updateElementsState((prev) => {
        return prev.map((el) => {
          if (el.id !== elementId) return el;
          
          const propName = 
            edge === 'top' ? 'clipTop' :
            edge === 'right' ? 'clipRight' :
            edge === 'bottom' ? 'clipBottom' : 'clipLeft';
          
          const labelName = 
            edge === 'top' ? 'Clip Top' :
            edge === 'right' ? 'Clip Right' :
            edge === 'bottom' ? 'Clip Bottom' : 'Clip Left';

          const track = el.tracks.find((t) => t.channel === propName);
          let nextTracks = [...el.tracks];
          const snappedT = Math.round(timeMs / snapMs) * snapMs;

          if (!track) {
            nextTracks.push({
              id: `tr-${propName}-${uid()}`,
              label: labelName,
              channel: propName,
              keyframes: [{ id: uid(), t: snappedT, v: nextVal, easing: 'linear' }],
            });
          } else {
            nextTracks = nextTracks.map((tr) => {
              if (tr.channel !== propName) return tr;
              const existingIndex = tr.keyframes.findIndex((kf) => Math.abs(kf.t - snappedT) < 1);
              const nextKeyframes = [...tr.keyframes];
              if (existingIndex !== -1) {
                nextKeyframes[existingIndex] = { ...nextKeyframes[existingIndex]!, v: nextVal };
              } else {
                nextKeyframes.push({ id: uid(), t: snappedT, v: nextVal, easing: 'linear' });
              }
              return { ...tr, keyframes: nextKeyframes };
            });
          }

          return {
            ...el,
            [propName]: nextVal,
            tracks: nextTracks,
          };
        });
      });
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };


  const startScrubProperty = (e: React.PointerEvent, elementId: string, channel: AnimationStudioChannel, startVal: number) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;

    const onPointerMove = (moveEvt: PointerEvent) => {
      const dx = moveEvt.clientX - startX;
      
      let sensitivity = 1;
      if (channel === 'opacity' || channel === 'scale' || channel === 'shadowOpacity' || channel === 'borderColorA' || channel === 'bgA' || channel === 'bg2A') {
        sensitivity = 0.01;
      } else if (channel.includes('Color') || channel.includes('bgH') || channel.includes('bgS') || channel.includes('bgL') || channel.includes('bg2')) {
        sensitivity = 1;
      }

      let nextVal = startVal + dx * sensitivity;
      
      if (channel === 'opacity' || channel === 'shadowOpacity' || channel === 'borderColorA' || channel === 'bgA' || channel === 'bg2A') {
        nextVal = Math.max(0, Math.min(1, nextVal));
      } else if (channel === 'scale') {
        nextVal = Math.max(0, nextVal);
      } else if (channel.includes('Radius') || channel.includes('Width') || channel === 'shadowBlur' || channel === 'blur') {
        nextVal = Math.max(0, Math.round(nextVal));
      } else {
        nextVal = Math.round(nextVal);
      }

      updateElementTrackValue(elementId, channel, nextVal);
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const startDragOrigin = (e: React.PointerEvent, elementId: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    const startX = e.clientX;
    const startY = e.clientY;

    const targetContainer = e.currentTarget.parentElement;
    if (!targetContainer) return;
    const rect = targetContainer.getBoundingClientRect();

    const targetEl = elements.find((item) => item.id === elementId);
    if (!targetEl) return;

    const trackOriginX = targetEl.tracks.find((t) => t.channel === 'originX');
    const trackOriginY = targetEl.tracks.find((t) => t.channel === 'originY');
    const startOriginX = Number(trackOriginX ? valueAt(trackOriginX, timeMs) : 50);
    const startOriginY = Number(trackOriginY ? valueAt(trackOriginY, timeMs) : 50);

    const onPointerMove = (moveEvt: PointerEvent) => {
      const dx = (moveEvt.clientX - startX) / previewZoom;
      const dy = (moveEvt.clientY - startY) / previewZoom;

      const pctDx = (dx / (rect.width / previewZoom)) * 100;
      const pctDy = (dy / (rect.height / previewZoom)) * 100;

      const nextOriginX = clamp(Math.round(startOriginX + pctDx), 0, 100);
      const nextOriginY = clamp(Math.round(startOriginY + pctDy), 0, 100);

      updateElementsState((prev) => {
        return prev.map((el) => {
          if (el.id !== elementId) return el;
          let nextTracks = [...el.tracks];
          const snappedT = Math.round(timeMs / snapMs) * snapMs;

          for (const ch of ['originX', 'originY'] as const) {
            const channel = ch;
            const nextV = channel === 'originX' ? nextOriginX : nextOriginY;
            const track = el.tracks.find((t) => t.channel === channel);
            if (!track) {
              nextTracks.push({
                id: `tr-${channel}-${uid()}`,
                label: channel === 'originX' ? 'Origin X' : 'Origin Y',
                channel,
                keyframes: [{ id: uid(), t: snappedT, v: nextV, easing: 'linear' }],
              });
            } else {
              nextTracks = nextTracks.map((tr) => {
                if (tr.channel !== channel) return tr;
                const existingIndex = tr.keyframes.findIndex((kf) => Math.abs(kf.t - snappedT) < 1);
                const nextKeyframes = [...tr.keyframes];
                if (existingIndex !== -1) {
                  nextKeyframes[existingIndex] = { ...nextKeyframes[existingIndex]!, v: nextV };
                } else {
                  nextKeyframes.push({ id: uid(), t: snappedT, v: nextV, easing: 'linear' });
                }
                return { ...tr, keyframes: nextKeyframes };
              });
            }
          }
          return { ...el, tracks: nextTracks };
        });
      });
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
            <Text className="text-xs font-extrabold text-zinc-700 dark:text-zinc-300 select-none">
              {label}
            </Text>
          </div>
          <div className="flex items-center gap-1.5 justify-end w-24">
            <DraggablePropertyValue
              value={currentVal}
              unit={unit}
              step={step}
              min={min}
              max={max}
              onChange={(val) => updateTrackValueAtTime(track.id, timeMs, val)}
            />
          </div>
        </div>
        {typeof currentVal === 'number' && (
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
        )}
      </div>
    );
  };

  const isCameraActive = activeElementId === 'el-camera';

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

  const renderTopToolbar = () => {
    return (
      <div className="flex flex-wrap items-center justify-end gap-3 p-3 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-200/50 dark:border-white/[0.03] rounded-2xl">
        {/* Save Button */}
        <Button
          variant="secondary"
          size="sm"
          className="gap-2 font-bold rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
          onClick={handleSaveToLocalStorage}
        >
          {saveStatus === 'saved' ? (
            <Check className="h-3.5 w-3.5 text-green-500 animate-bounce" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save'}
        </Button>

        {/* Import JSON Button */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportJSON}
          accept=".json"
          className="hidden"
        />
        <Button
          variant="secondary"
          size="sm"
          className="gap-2 font-bold rounded-xl bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/[0.05]"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-3.5 w-3.5" />
          Import
        </Button>

        {/* Export JSON Button */}
        <Button
          variant="secondary"
          size="sm"
          className="gap-2 font-bold rounded-xl bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/[0.05]"
          onClick={handleExportJSON}
        >
          <Download className="h-3.5 w-3.5" />
          Export JSON
        </Button>

        <span className="w-px h-5 bg-zinc-200 dark:bg-white/10 mx-1" />

        {/* Physics Buttons */}
        <Button
          variant="secondary"
          size="sm"
          className={cn(
            "gap-2 font-bold rounded-xl",
            isPhysicsActive
              ? "bg-amber-500/20 text-amber-500 border-amber-500/40 hover:bg-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)] animate-pulse"
              : "bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/[0.05]"
          )}
          onClick={() => {
            setIsPhysicsActive(!isPhysicsActive);
            if (isPhysicsActive) setIsRecordingPhysics(false);
          }}
        >
          <Activity className="h-3.5 w-3.5" />
          {isPhysicsActive ? '⚡ Physics ON' : '⚡ Physics Stage'}
        </Button>

        {isPhysicsActive && (
          <Button
            variant="secondary"
            size="sm"
            className={cn(
              "gap-2 font-bold rounded-xl",
              isRecordingPhysics
                ? "bg-rose-500/20 text-rose-500 border-rose-500/40 hover:bg-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.2)]"
                : "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20"
            )}
            onClick={() => {
              if (!isRecordingPhysics) {
                setTimeMs(0);
              }
              setIsRecordingPhysics(!isRecordingPhysics);
            }}
          >
            <Disc className={cn("h-3.5 w-3.5", isRecordingPhysics && "animate-ping")} />
            {isRecordingPhysics ? '🔴 Recording...' : '🔴 Record Physics'}
          </Button>
        )}

        <Button
          variant={isAutoKeyArmed ? 'primary' : 'secondary'}
          size="sm"
          className="gap-2 font-bold rounded-xl"
          onClick={() => setIsAutoKeyArmed((v) => !v)}
          title="Arm keyframes for direct edits"
        >
          <Settings2 className="h-3.5 w-3.5" />
          {isAutoKeyArmed ? 'Auto-Key Armed' : 'Auto-Key Off'}
        </Button>

        <Button
          variant="secondary"
          size="sm"
          className="gap-2 font-bold rounded-xl bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/[0.05]"
          onClick={() => generateAutoSquashStretch('ball')}
          disabled={!activeElement || activeElementId === 'el-camera'}
          title="Generate automatic squash/stretch from motion"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Auto Squash
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="gap-2 font-bold rounded-xl bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/[0.05]"
          onClick={() => generateAutoSquashStretch('soft')}
          disabled={!activeElement || activeElementId === 'el-camera'}
          title="Subtle squash/stretch"
        >
          Soft
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="gap-2 font-bold rounded-xl bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/[0.05]"
          onClick={() => generateAutoSquashStretch('heavy')}
          disabled={!activeElement || activeElementId === 'el-camera'}
          title="Stronger squash/stretch"
        >
          Heavy
        </Button>

        <span className="w-px h-5 bg-zinc-200 dark:bg-white/10 mx-1" />

        {/* Export Code Button */}
        <Button
          variant="secondary"
          size="sm"
          className="gap-2 font-bold rounded-xl bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/40 hover:bg-purple-100 dark:hover:bg-purple-900/30"
          onClick={() => setIsExportModalOpen(true)}
        >
          <Code className="h-3.5 w-3.5" />
          Export Code
        </Button>
      </div>
    );
  };

  const renderBottomToolbar = () => {
    return (
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-200/50 dark:border-white/[0.03] rounded-2xl mt-4">
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
              title="Previous Keyframe"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none border-none text-zinc-500 hover:text-zinc-950 dark:text-white/40 dark:hover:text-white"
              onClick={jumpToNextKeyframe}
              title="Next Keyframe"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <span className="w-px h-5 bg-zinc-200 dark:bg-white/10 mx-1" />

          <div className="flex items-center rounded-xl bg-zinc-100/70 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none border-none text-zinc-500 hover:text-zinc-950 dark:text-white/40 dark:hover:text-white disabled:opacity-40"
              onClick={undo}
              disabled={history.past.length === 0}
              title="Undo (Ctrl+Z)"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none border-none text-zinc-500 hover:text-zinc-950 dark:text-white/40 dark:hover:text-white disabled:opacity-40"
              onClick={redo}
              disabled={history.future.length === 0}
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo className="h-4 w-4" />
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

          <Button
            variant={playbackRate < 1 ? 'primary' : 'secondary'}
            size="sm"
            className="gap-1.5 font-bold rounded-xl"
            onClick={() => setPlaybackRate((rate) => (rate === 1 ? 0.5 : rate === 0.5 ? 0.25 : 1))}
            title="Toggle playback speed"
          >
            <Activity className={cn('h-4 w-4', playbackRate < 1 && 'text-purple-300')} />
            {playbackRate}x
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

          {/* Stage Preview Zoom Slider */}
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
        </div>
      </div>
    );
  };

  interface PathCommand {
    type: string;
    args: number[];
  }

  const parsePath = (d: string): PathCommand[] => {
    const commands: PathCommand[] = [];
    const regex = /([MLHVCSQTAZmlhvcsqtaz])([^MLHVCSQTAZmlhvcsqtaz]*)/g;
    let match;
    while ((match = regex.exec(d)) !== null) {
      const type = match[1] ?? '';
      const argStr = (match[2] ?? '').trim();
      const args = argStr ? argStr.split(/[\s,]+/).map(Number).filter(n => !isNaN(n)) : [];
      commands.push({ type, args });
    }
    return commands;
  };

  const serializePath = (commands: PathCommand[]): string => {
    return commands.map(c => `${c.type} ${c.args.join(' ')}`).join(' ');
  };

  interface DraggablePoint {
    commandIndex: number;
    argIndex: number;
    x: number;
    y: number;
    label: string;
    isControlPoint: boolean;
  }

  const getDraggablePoints = (commands: PathCommand[]): DraggablePoint[] => {
    const points: DraggablePoint[] = [];
    commands.forEach((cmd, cmdIdx) => {
      const type = cmd.type.toUpperCase();
      if (type === 'M' || type === 'L' || type === 'T') {
        if (cmd.args.length >= 2) {
          points.push({
            commandIndex: cmdIdx,
            argIndex: 0,
            x: cmd.args[0] ?? 0,
            y: cmd.args[1] ?? 0,
            label: type === 'M' ? 'Start' : 'Point',
            isControlPoint: false
          });
        }
      } else if (type === 'Q') {
        if (cmd.args.length >= 4) {
          points.push({
            commandIndex: cmdIdx,
            argIndex: 0,
            x: cmd.args[0] ?? 0,
            y: cmd.args[1] ?? 0,
            label: 'Control',
            isControlPoint: true
          });
          points.push({
            commandIndex: cmdIdx,
            argIndex: 2,
            x: cmd.args[2] ?? 0,
            y: cmd.args[3] ?? 0,
            label: 'End',
            isControlPoint: false
          });
        }
      } else if (type === 'C') {
        if (cmd.args.length >= 6) {
          points.push({
            commandIndex: cmdIdx,
            argIndex: 0,
            x: cmd.args[0] ?? 0,
            y: cmd.args[1] ?? 0,
            label: 'Ctrl 1',
            isControlPoint: true
          });
          points.push({
            commandIndex: cmdIdx,
            argIndex: 2,
            x: cmd.args[2] ?? 0,
            y: cmd.args[3] ?? 0,
            label: 'Ctrl 2',
            isControlPoint: true
          });
          points.push({
            commandIndex: cmdIdx,
            argIndex: 4,
            x: cmd.args[4] ?? 0,
            y: cmd.args[5] ?? 0,
            label: 'End',
            isControlPoint: false
          });
        }
      } else if (type === 'S') {
        if (cmd.args.length >= 4) {
          points.push({
            commandIndex: cmdIdx,
            argIndex: 0,
            x: cmd.args[0] ?? 0,
            y: cmd.args[1] ?? 0,
            label: 'Ctrl 2',
            isControlPoint: true
          });
          points.push({
            commandIndex: cmdIdx,
            argIndex: 2,
            x: cmd.args[2] ?? 0,
            y: cmd.args[3] ?? 0,
            label: 'End',
            isControlPoint: false
          });
        }
      } else if (type === 'A') {
        if (cmd.args.length >= 7) {
          points.push({
            commandIndex: cmdIdx,
            argIndex: 5,
            x: cmd.args[5] ?? 0,
            y: cmd.args[6] ?? 0,
            label: 'Arc End',
            isControlPoint: false
          });
        }
      }
    });
    return points;
  };

  const startDragPathPoint = (
    e: React.PointerEvent,
    elementId: string,
    pathStr: string,
    commandIndex: number,
    argIndex: number,
    startXVal: number,
    startYVal: number
  ) => {
    e.stopPropagation();
    e.preventDefault();
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const match = pathStr.match(/path\(['"]?([^'"]+)['"]?\)/);
    const d = (match && match[1]) ? match[1] : pathStr;
    const commands = parsePath(d);

    const onPointerMove = (moveEvt: PointerEvent) => {
      const dx = (moveEvt.clientX - startMouseX) / previewZoom;
      const dy = (moveEvt.clientY - startMouseY) / previewZoom;

      const nextCommands = commands.map((cmd, cmdIdx) => {
        if (cmdIdx !== commandIndex) return cmd;
        const nextArgs = [...cmd.args];
        nextArgs[argIndex] = Math.round(startXVal + dx);
        nextArgs[argIndex + 1] = Math.round(startYVal + dy);
        return { ...cmd, args: nextArgs };
      });

      const nextD = serializePath(nextCommands);
      const nextPathStr = `path('${nextD}')`;

      updateElementsState((prev) =>
        prev.map((el) => {
          if (el.id !== elementId) return el;
          return {
            ...el,
            motionPath: nextPathStr
          };
        })
      );
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const addPathPoint = (elementId: string, x: number, y: number) => {
    updateElementsState((prev) =>
      prev.map((el) => {
        if (el.id !== elementId || !el.motionPath) return el;
        const match = el.motionPath.match(/path\(['"]?([^'"]+)['"]?\)/);
        const d = (match && match[1]) ? match[1] : (el.motionPath || '');
        const commands = parsePath(d);
        if (commands.length === 0) return el;

        const lastCmd = commands[commands.length - 1]!;
        const lastX = lastCmd.args[lastCmd.args.length - 2] ?? 0;
        const lastY = lastCmd.args[lastCmd.args.length - 1] ?? 0;

        const ctrlX = Math.round((lastX + x) / 2);
        const ctrlY = Math.round((lastY + y) / 2);

        commands.push({
          type: 'Q',
          args: [ctrlX, ctrlY, Math.round(x), Math.round(y)],
        });

        const nextD = serializePath(commands);
        return {
          ...el,
          motionPath: `path('${nextD}')`,
        };
      })
    );
  };

  const removePathPoint = (elementId: string, commandIndex: number) => {
    if (commandIndex === 0) return; // Do not remove the M command!
    updateElementsState((prev) =>
      prev.map((el) => {
        if (el.id !== elementId || !el.motionPath) return el;
        const match = el.motionPath.match(/path\(['"]?([^'"]+)['"]?\)/);
        const d = (match && match[1]) ? match[1] : (el.motionPath || '');
        const commands = parsePath(d);
        if (commands.length <= 1) return el; // Keep at least M

        const nextCommands = commands.filter((_, idx) => idx !== commandIndex);
        const nextD = serializePath(nextCommands);
        return {
          ...el,
          motionPath: `path('${nextD}')`,
        };
      })
    );
  };

  const getStageBgStyle = () => {
    switch (stageBg) {
      case 'light':
        return { background: 'linear-gradient(135deg, #ffffff 0%, #f4f4f5 100%)' };
      case 'purple':
        return { background: 'linear-gradient(135deg, #1e1b4b 0%, #311042 100%)' };
      case 'slate':
        return { background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)' };
      case 'transparent':
        return {
          background: 'conic-gradient(#e4e4e7 0.25turn, #ffffff 0.25turn 0.5turn, #e4e4e7 0.5turn 0.75turn, #ffffff 0.75turn)',
          backgroundSize: '20px 20px',
        };
      case 'dark':
      default:
        return { background: 'linear-gradient(135deg, #09090b 0%, #000000 100%)' };
    }
  };

  const getStageGridStyle = () => {
    if (stageGrid === 'none') return {};
    const color = stageBg === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)';
    if (stageGrid === 'dots') {
      return {
        backgroundImage: `radial-gradient(${color} 1.5px, transparent 1.5px)`,
        backgroundSize: '20px 20px',
      };
    }
    return {
      backgroundImage: `linear-gradient(to right, ${color} 1px, transparent 1px), linear-gradient(to bottom, ${color} 1px, transparent 1px)`,
      backgroundSize: '20px 20px',
    };
  };

  return (
    <div ref={containerRef} className={cn('relative flex gap-4 items-stretch w-full', className)}>
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          loop={loop}
          preload="auto"
          className="hidden"
        />
      )}
      {/* Left Column: Stage + Timeline */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {!showStage && (
          <div className="flex flex-col gap-4">
            {renderTopToolbar()}
            {renderBottomToolbar()}
          </div>
        )}

        {showStage && (
          <Surface className="p-6 bg-white/70 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <Text className="text-sm font-extrabold text-zinc-900 dark:text-white">Stage Canvas</Text>
            <Text size="xs" className="text-zinc-500 dark:text-white/40 font-bold">
              Click elements to select • Drag center to Move • Drag outer handles to Scale/Rotate
            </Text>
          </div>
          <div className="mb-4">
            {renderTopToolbar()}
          </div>
          <div
            className="stage-canvas-container relative rounded-3xl border border-zinc-200/80 dark:border-white/10 overflow-hidden shadow-inner select-none"
            style={{ ...getStageBgStyle(), height: `${previewHeight}px` }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const rect = containerRef.current?.getBoundingClientRect();
              const x = rect ? e.clientX - rect.left : e.clientX;
              const y = rect ? e.clientY - rect.top : e.clientY;
              setStageContextMenu({ visible: true, x, y });
            }}
          >
            {/* Floating vertical studio toolbar panel */}
            <div className="absolute left-4 top-4 z-[45] flex flex-col gap-2 p-1.5 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md rounded-2xl border border-zinc-200/50 dark:border-white/5 shadow-xl">
              <button
                type="button"
                onClick={() => setActiveTool('select')}
                className={cn(
                  "p-2 rounded-xl transition-all duration-150 flex items-center justify-center relative group",
                  activeTool === 'select'
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-500/35"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5"
                )}
              >
                <MousePointer2 className="h-4 w-4" />
                <span className="absolute left-full ml-2 px-2 py-1 bg-zinc-950 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold z-[50]">
                  Select (V)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('hand')}
                className={cn(
                  "p-2 rounded-xl transition-all duration-150 flex items-center justify-center relative group",
                  activeTool === 'hand'
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-500/35"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5"
                )}
              >
                <Hand className="h-4 w-4" />
                <span className="absolute left-full ml-2 px-2 py-1 bg-zinc-950 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold z-[50]">
                  Hand / Pan (H)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('brush')}
                className={cn(
                  "p-2 rounded-xl transition-all duration-150 flex items-center justify-center relative group",
                  activeTool === 'brush'
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-500/35"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5"
                )}
              >
                <Paintbrush className="h-4 w-4" />
                <span className="absolute left-full ml-2 px-2 py-1 bg-zinc-950 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold z-[50]">
                  Freehand Brush (B)
                </span>
              </button>
            </div>

            <div 
              className="absolute inset-0 flex items-center justify-center overflow-hidden"
              onWheel={(e) => {
                if (e.ctrlKey || e.metaKey) {
                  e.preventDefault();
                  setPreviewZoom(z => Math.max(0.25, Math.min(2.0, z - e.deltaY * 0.001)));
                }
              }}
            >
              {stage ?? (
                <div 
                  className="relative w-[800px] h-[500px] bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl transition-transform duration-150 ease-out"
                  onPointerDown={onStagePointerDown}
                  style={{ 
                    transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${previewZoom})`, 
                    transformOrigin: 'center',
                    perspective: '1000px',
                    transformStyle: 'preserve-3d',
                    cursor: activeTool === 'hand' ? 'grab' : activeTool === 'brush' ? 'cell' : 'crosshair'
                  }}
                >
                  <div className="absolute inset-0 pointer-events-none" style={getStageGridStyle()} />
                  {/* Motion Paths Visual Guides & Interactive Vector Editor */}
                  <svg className="absolute inset-0 w-full h-full opacity-80 z-[35] overflow-visible pointer-events-none">
                    <defs>
                      <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                      <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>
                    <style>{`
                      @keyframes flowGuide {
                        from { stroke-dashoffset: 20; }
                        to { stroke-dashoffset: 0; }
                      }
                      .motion-path-flow {
                        stroke-dasharray: 6 4;
                        animation: flowGuide 1s linear infinite;
                      }
                    `}</style>
                    {elements.map((el) => {
                      if (!el.motionPath) return null;
                      const match = el.motionPath.match(/path\(['"]?([^'"]+)['"]?\)/);
                      const d = match ? match[1] : '';
                      if (!d) return null;
                      const isElSelected = el.id === activeElementId;
                      const commands = parsePath(d);
                      const draggablePoints = getDraggablePoints(commands);

                      const trackX = el.tracks.find((t) => t.channel === 'x');
                      const trackY = el.tracks.find((t) => t.channel === 'y');
                      const valX = Number(trackX ? valueAt(trackX, timeMs) : 0);
                      const valY = Number(trackY ? valueAt(trackY, timeMs) : 0);

                      return (
                        <g key={`motion-path-guide-${el.id}`} transform={`translate(${valX}, ${valY})`}>
                          {/* Main Guide Path Backdrop */}
                          {isElSelected && (
                            <path
                              d={d}
                              fill="none"
                              stroke="#a855f7"
                              strokeWidth={4}
                              className="opacity-20 blur-sm pointer-events-none"
                            />
                          )}
                          {/* Flowing Guide Path */}
                          <path
                            d={d}
                            fill="none"
                            stroke={isElSelected ? "url(#neonGradient)" : "currentColor"}
                            strokeWidth={isElSelected ? 2.5 : 1}
                            className={cn(
                              "pointer-events-none",
                              isElSelected ? "motion-path-flow text-purple-500" : "text-zinc-400/25"
                            )}
                          />

                          {/* Thick transparent double-clickable path overlay to add control points */}
                          {isElSelected && (
                            <path
                              d={d}
                              fill="none"
                              stroke="transparent"
                              strokeWidth={15}
                              className="cursor-pointer pointer-events-auto"
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                                if (rect) {
                                  // Translate client coordinates to stage space factoring zoom and translate offset
                                  const clickX = (e.clientX - rect.left) / previewZoom - valX;
                                  const clickY = (e.clientY - rect.top) / previewZoom - valY;
                                  addPathPoint(el.id, clickX, clickY);
                                }
                              }}
                            >
                              <title>Double-click anywhere on the path to add a control point</title>
                            </path>
                          )}

                          {/* Dashed lines connecting control points to anchor points */}
                          {isElSelected && commands.map((cmd, cmdIdx) => {
                            const type = cmd.type.toUpperCase();
                            if (type === 'Q' && cmd.args.length >= 4) {
                              let startX = 0;
                              let startY = 0;
                              if (cmdIdx > 0) {
                                const prev = commands[cmdIdx - 1];
                                if (prev && prev.args.length >= 2) {
                                  startX = prev.args[prev.args.length - 2] ?? 0;
                                  startY = prev.args[prev.args.length - 1] ?? 0;
                                }
                              }
                              return (
                                <g key={`dashed-lines-${cmdIdx}`} className="opacity-40">
                                  <line
                                    x1={startX}
                                    y1={startY}
                                    x2={cmd.args[0]}
                                    y2={cmd.args[1]}
                                    stroke="#22d3ee"
                                    strokeWidth={1}
                                    strokeDasharray="3 3"
                                  />
                                  <line
                                    x1={cmd.args[0]}
                                    y1={cmd.args[1]}
                                    x2={cmd.args[2]}
                                    y2={cmd.args[3]}
                                    stroke="#22d3ee"
                                    strokeWidth={1}
                                    strokeDasharray="3 3"
                                  />
                                </g>
                              );
                            } else if (type === 'C' && cmd.args.length >= 6) {
                              let startX = 0;
                              let startY = 0;
                              if (cmdIdx > 0) {
                                const prev = commands[cmdIdx - 1];
                                if (prev && prev.args.length >= 2) {
                                  startX = prev.args[prev.args.length - 2] ?? 0;
                                  startY = prev.args[prev.args.length - 1] ?? 0;
                                }
                              }
                              return (
                                <g key={`dashed-lines-${cmdIdx}`} className="opacity-40">
                                  <line
                                    x1={startX}
                                    y1={startY}
                                    x2={cmd.args[0]}
                                    y2={cmd.args[1]}
                                    stroke="#22d3ee"
                                    strokeWidth={1}
                                    strokeDasharray="3 3"
                                  />
                                  <line
                                    x1={cmd.args[2]}
                                    y1={cmd.args[3]}
                                    x2={cmd.args[4]}
                                    y2={cmd.args[5]}
                                    stroke="#22d3ee"
                                    strokeWidth={1}
                                    strokeDasharray="3 3"
                                  />
                                </g>
                              );
                            }
                            return null;
                          })}

                          {/* Interactive control handles for selected path */}
                          {isElSelected && draggablePoints.map((pt, ptIdx) => {
                            const isCtrl = pt.isControlPoint;
                            return (
                              <circle
                                key={`handle-${el.id}-${ptIdx}`}
                                cx={pt.x}
                                cy={pt.y}
                                r={isCtrl ? 5.5 : 7}
                                fill={isCtrl ? "#22d3ee" : "#a855f7"}
                                stroke="#ffffff"
                                strokeWidth={2}
                                className="cursor-move hover:scale-130 active:scale-110 transition-transform duration-150 origin-center pointer-events-auto shadow-lg"
                                style={{ filter: isCtrl ? "drop-shadow(0 0 4px rgba(34,211,238,0.5))" : "drop-shadow(0 0 4px rgba(168,85,247,0.5))" }}
                                onPointerDown={(e) =>
                                  startDragPathPoint(
                                    e,
                                    el.id,
                                    el.motionPath!,
                                    pt.commandIndex,
                                    pt.argIndex,
                                    pt.x,
                                    pt.y
                                  )
                                }
                                onDoubleClick={(e) => {
                                  e.stopPropagation();
                                  removePathPoint(el.id, pt.commandIndex);
                                }}
                              >
                                <title>{pt.commandIndex === 0 ? "Start Point (Drag to Move)" : "Drag to adjust curve • Double-click to delete point"}</title>
                              </circle>
                            );
                        })}
                      </g>
                    );
                  })}
                  {/* Smart Snapping Guide Lines */}
                  {snapLines.map((line, idx) => {
                    if (line.type === 'h') {
                      return (
                        <line
                          key={`snap-h-${idx}`}
                          x1="-10000"
                          x2="10000"
                          y1={line.val}
                          y2={line.val}
                          stroke="#ec4899"
                          strokeWidth={1.5}
                          strokeDasharray="4,4"
                          style={{ filter: 'drop-shadow(0 0 4px #ec4899)' }}
                        />
                      );
                    } else {
                      return (
                        <line
                          key={`snap-v-${idx}`}
                          x1={line.val}
                          x2={line.val}
                          y1="-10000"
                          y2="10000"
                          stroke="#ec4899"
                          strokeWidth={1.5}
                          strokeDasharray="4,4"
                          style={{ filter: 'drop-shadow(0 0 4px #ec4899)' }}
                        />
                      );
                    }
                  })}
                </svg>

                {/* Virtual Camera Viewport Transform Wrapper */}
                {(() => {
                  const cameraEl = elements.find((el) => el.id === 'el-camera');
                  const cameraTrackZoom = cameraEl?.tracks.find((t) => t.channel === 'cameraZoom');
                  const cameraTrackPanX = cameraEl?.tracks.find((t) => t.channel === 'cameraPanX');
                  const cameraTrackPanY = cameraEl?.tracks.find((t) => t.channel === 'cameraPanY');
                  const cameraTrackTilt = cameraEl?.tracks.find((t) => t.channel === 'cameraTilt');

                  const camZoom = cameraTrackZoom ? Number(valueAt(cameraTrackZoom, timeMs)) : 1;
                  const camPanX = cameraTrackPanX ? Number(valueAt(cameraTrackPanX, timeMs)) : 0;
                  const camPanY = cameraTrackPanY ? Number(valueAt(cameraTrackPanY, timeMs)) : 0;
                  const camTilt = cameraTrackTilt ? Number(valueAt(cameraTrackTilt, timeMs)) : 0;

                  return (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        transform: `scale(${camZoom}) translate(${-camPanX}px, ${-camPanY}px) rotateX(${camTilt}deg)`,
                        transformOrigin: 'center',
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      {getRootElements(elements).filter((el) => el.visible !== false).map((el) => {
                        if (el.id === 'el-camera') return null; // Hide camera layer visually!
                        const isElActive = el.id === activeElementId;
                        const isElSelected = selectedElementIds.includes(el.id);
                    const isSelected = isElSelected;
                    const trackX = el.tracks.find((t) => t.channel === 'x');
                    const trackY = el.tracks.find((t) => t.channel === 'y');
                    const trackScale = el.tracks.find((t) => t.channel === 'scale');
                    const trackRotate = el.tracks.find((t) => t.channel === 'rotate');
                    const trackOpacity = el.tracks.find((t) => t.channel === 'opacity');

                    const valX = Number(trackX ? valueAt(trackX, timeMs) : 0);
                    const valY = Number(trackY ? valueAt(trackY, timeMs) : 0);
                    const valScale = Number(trackScale ? valueAt(trackScale, timeMs) : 1);
                    const valRotate = Number(trackRotate ? valueAt(trackRotate, timeMs) : 0);
                    const valOpacity = Number(trackOpacity ? valueAt(trackOpacity, timeMs) : 1);

                    const trackBlur = el.tracks.find((t) => t.channel === 'blur');
                    const trackBrightness = el.tracks.find((t) => t.channel === 'brightness');
                    const trackContrast = el.tracks.find((t) => t.channel === 'contrast');
                    const trackGrayscale = el.tracks.find((t) => t.channel === 'grayscale');
                    const trackHueRotate = el.tracks.find((t) => t.channel === 'hueRotate');
                    const trackSaturate = el.tracks.find((t) => t.channel === 'saturate');
                    const trackSepia = el.tracks.find((t) => t.channel === 'sepia');

                    const valBlur = Number(trackBlur ? valueAt(trackBlur, timeMs) : 0);
                    const valBrightness = Number(trackBrightness ? valueAt(trackBrightness, timeMs) : 100);
                    const valContrast = Number(trackContrast ? valueAt(trackContrast, timeMs) : 100);
                    const valGrayscale = Number(trackGrayscale ? valueAt(trackGrayscale, timeMs) : 0);
                    const valHueRotate = Number(trackHueRotate ? valueAt(trackHueRotate, timeMs) : 0);
                    const valSaturate = Number(trackSaturate ? valueAt(trackSaturate, timeMs) : 100);
                    const valSepia = Number(trackSepia ? valueAt(trackSepia, timeMs) : 0);

                    const filterParts: string[] = [];
                    if (valBlur > 0) filterParts.push(`blur(${valBlur}px)`);
                    if (valBrightness !== 100) filterParts.push(`brightness(${valBrightness}%)`);
                    if (valContrast !== 100) filterParts.push(`contrast(${valContrast}%)`);
                    if (valGrayscale > 0) filterParts.push(`grayscale(${valGrayscale}%)`);
                    if (valHueRotate !== 0) filterParts.push(`hue-rotate(${valHueRotate}deg)`);
                    if (valSaturate !== 100) filterParts.push(`saturate(${valSaturate}%)`);
                    if (valSepia > 0) filterParts.push(`sepia(${valSepia}%)`);
                    const filterString = filterParts.length > 0 ? filterParts.join(' ') : undefined;

                    // NEW CHANNELS
                    const trackZIndex = el.tracks.find((t) => t.channel === 'zIndex');
                    const trackRotateX = el.tracks.find((t) => t.channel === 'rotateX');
                    const trackRotateY = el.tracks.find((t) => t.channel === 'rotateY');
                    const trackOriginX = el.tracks.find((t) => t.channel === 'originX');
                    const trackOriginY = el.tracks.find((t) => t.channel === 'originY');
                    const trackShadowX = el.tracks.find((t) => t.channel === 'shadowX');
                    const trackShadowY = el.tracks.find((t) => t.channel === 'shadowY');
                    const trackShadowBlur = el.tracks.find((t) => t.channel === 'shadowBlur');
                    const trackShadowSpread = el.tracks.find((t) => t.channel === 'shadowSpread');
                    const trackShadowOpacity = el.tracks.find((t) => t.channel === 'shadowOpacity');
                    const trackBorderRadius = el.tracks.find((t) => t.channel === 'borderRadius');
                    const trackBorderTopWidth = el.tracks.find((t) => t.channel === 'borderTopWidth');
                    const trackBorderRightWidth = el.tracks.find((t) => t.channel === 'borderRightWidth');
                    const trackBorderBottomWidth = el.tracks.find((t) => t.channel === 'borderBottomWidth');
                    const trackBorderLeftWidth = el.tracks.find((t) => t.channel === 'borderLeftWidth');
                    const trackBorderColorH = el.tracks.find((t) => t.channel === 'borderColorH');
                    const trackBorderColorS = el.tracks.find((t) => t.channel === 'borderColorS');
                    const trackBorderColorL = el.tracks.find((t) => t.channel === 'borderColorL');
                    const trackBorderColorA = el.tracks.find((t) => t.channel === 'borderColorA');
                    const trackBgH = el.tracks.find((t) => t.channel === 'bgH');
                    const trackBgS = el.tracks.find((t) => t.channel === 'bgS');
                    const trackBgL = el.tracks.find((t) => t.channel === 'bgL');
                    const trackBgA = el.tracks.find((t) => t.channel === 'bgA');
                    const trackBg2H = el.tracks.find((t) => t.channel === 'bg2H');
                    const trackBg2S = el.tracks.find((t) => t.channel === 'bg2S');
                    const trackBg2L = el.tracks.find((t) => t.channel === 'bg2L');
                    const trackBg2A = el.tracks.find((t) => t.channel === 'bg2A');
                    const trackBgAngle = el.tracks.find((t) => t.channel === 'bgAngle');
                    const trackBgPosX = el.tracks.find((t) => t.channel === 'bgPosX');
                    const trackBgPosY = el.tracks.find((t) => t.channel === 'bgPosY');
                    const trackClipTop = el.tracks.find((t) => t.channel === 'clipTop');
                    const trackClipRight = el.tracks.find((t) => t.channel === 'clipRight');
                    const trackClipBottom = el.tracks.find((t) => t.channel === 'clipBottom');
                    const trackClipLeft = el.tracks.find((t) => t.channel === 'clipLeft');

                    // NEW CHANNELS
                    const trackWidth = el.tracks.find((t) => t.channel === 'width');
                    const trackHeight = el.tracks.find((t) => t.channel === 'height');
                    const trackScaleX = el.tracks.find((t) => t.channel === 'scaleX');
                    const trackScaleY = el.tracks.find((t) => t.channel === 'scaleY');
                    const trackOffsetDistance = el.tracks.find((t) => t.channel === 'offsetDistance');
                    const trackOffsetRotate = el.tracks.find((t) => t.channel === 'offsetRotate');

                    const valZIndex = Number(trackZIndex ? valueAt(trackZIndex, timeMs) : (isSelected ? 50 : 10));
                    const valRotateX = Number(trackRotateX ? valueAt(trackRotateX, timeMs) : 0);
                    const valRotateY = Number(trackRotateY ? valueAt(trackRotateY, timeMs) : 0);
                    const valOriginX = Number(trackOriginX ? valueAt(trackOriginX, timeMs) : 50);
                    const valOriginY = Number(trackOriginY ? valueAt(trackOriginY, timeMs) : 50);
                    const valShadowX = trackShadowX ? valueAt(trackShadowX, timeMs) : 0;
                    const valShadowY = trackShadowY ? valueAt(trackShadowY, timeMs) : 0;
                    const valShadowBlur = trackShadowBlur ? valueAt(trackShadowBlur, timeMs) : 0;
                    const valShadowSpread = trackShadowSpread ? valueAt(trackShadowSpread, timeMs) : 0;
                    const valShadowOpacity = trackShadowOpacity ? valueAt(trackShadowOpacity, timeMs) : 0;
                    const valBorderRadius = trackBorderRadius ? valueAt(trackBorderRadius, timeMs) : 0;
                    const valBorderTopWidth = trackBorderTopWidth ? valueAt(trackBorderTopWidth, timeMs) : 0;
                    const valBorderRightWidth = trackBorderRightWidth ? valueAt(trackBorderRightWidth, timeMs) : 0;
                    const valBorderBottomWidth = trackBorderBottomWidth ? valueAt(trackBorderBottomWidth, timeMs) : 0;
                    const valBorderLeftWidth = trackBorderLeftWidth ? valueAt(trackBorderLeftWidth, timeMs) : 0;
                    const valBorderColorH = trackBorderColorH ? valueAt(trackBorderColorH, timeMs) : 270;
                    const valBorderColorS = trackBorderColorS ? valueAt(trackBorderColorS, timeMs) : 80;
                    const valBorderColorL = trackBorderColorL ? valueAt(trackBorderColorL, timeMs) : 50;
                    const valBorderColorA = trackBorderColorA ? valueAt(trackBorderColorA, timeMs) : 1;
                    const valBgH = trackBgH ? valueAt(trackBgH, timeMs) : 270;
                    const valBgS = trackBgS ? valueAt(trackBgS, timeMs) : 80;
                    const valBgL = trackBgL ? valueAt(trackBgL, timeMs) : 50;
                    const valBgA = trackBgA ? valueAt(trackBgA, timeMs) : 1;
                    const valBg2H = trackBg2H ? valueAt(trackBg2H, timeMs) : 220;
                    const valBg2S = trackBg2S ? valueAt(trackBg2S, timeMs) : 80;
                    const valBg2L = trackBg2L ? valueAt(trackBg2L, timeMs) : 50;
                    const valBg2A = trackBg2A ? valueAt(trackBg2A, timeMs) : 0;
                    const valBgAngle = trackBgAngle ? valueAt(trackBgAngle, timeMs) : 135;
                    const valBgPosX = trackBgPosX ? valueAt(trackBgPosX, timeMs) : 0;
                    const valBgPosY = trackBgPosY ? valueAt(trackBgPosY, timeMs) : 0;
                    const valClipTop = Number(trackClipTop ? valueAt(trackClipTop, timeMs) : 0);
                    const valClipRight = Number(trackClipRight ? valueAt(trackClipRight, timeMs) : 0);
                    const valClipBottom = Number(trackClipBottom ? valueAt(trackClipBottom, timeMs) : 0);
                    const valClipLeft = Number(trackClipLeft ? valueAt(trackClipLeft, timeMs) : 0);

                    // NEW VALUES
                    const valWidth = Number(trackWidth ? valueAt(trackWidth, timeMs) : (el.type === 'box' || el.type === 'circle' ? 100 : el.type === 'image' ? 120 : el.type === 'star' ? 80 : el.type === 'group' ? 0 : 0));
                    const valHeight = Number(trackHeight ? valueAt(trackHeight, timeMs) : (el.type === 'box' || el.type === 'circle' ? 100 : el.type === 'image' ? 80 : el.type === 'star' ? 80 : el.type === 'group' ? 0 : 0));
                    const valScaleX = Number(trackScaleX ? valueAt(trackScaleX, timeMs) : 1);
                    const valScaleY = Number(trackScaleY ? valueAt(trackScaleY, timeMs) : 1);
                    const valOffsetDistance = trackOffsetDistance ? valueAt(trackOffsetDistance, timeMs) : 0;
                    const valOffsetRotate = trackOffsetRotate ? valueAt(trackOffsetRotate, timeMs) : 0;

                    const trackBorderTopLeft = el.tracks.find((t) => t.channel === 'borderRadiusTopLeft');
                    const trackBorderTopRight = el.tracks.find((t) => t.channel === 'borderRadiusTopRight');
                    const trackBorderBottomRight = el.tracks.find((t) => t.channel === 'borderRadiusBottomRight');
                    const trackBorderBottomLeft = el.tracks.find((t) => t.channel === 'borderRadiusBottomLeft');

                    const hasBgTrack = trackBgH || trackBgS || trackBgL || trackBgA || trackBg2H || trackBg2S || trackBg2L || trackBg2A || trackBgAngle || trackBgPosX || trackBgPosY;
                    const hasBorderTrack = trackBorderTopWidth || trackBorderRightWidth || trackBorderBottomWidth || trackBorderLeftWidth || trackBorderColorH || trackBorderColorS || trackBorderColorL || trackBorderColorA;
                    const hasBorderRadiusTrack = !!trackBorderRadius || !!trackBorderTopLeft || !!trackBorderTopRight || !!trackBorderBottomRight || !!trackBorderBottomLeft || el.borderRadiusTopLeft !== undefined || el.borderRadiusTopRight !== undefined || el.borderRadiusBottomRight !== undefined || el.borderRadiusBottomLeft !== undefined;
                    const valBorderTopLeft = Number(trackBorderTopLeft ? valueAt(trackBorderTopLeft, timeMs) : (el.borderRadiusTopLeft !== undefined ? el.borderRadiusTopLeft : valBorderRadius));
                    const valBorderTopRight = Number(trackBorderTopRight ? valueAt(trackBorderTopRight, timeMs) : (el.borderRadiusTopRight !== undefined ? el.borderRadiusTopRight : valBorderRadius));
                    const valBorderBottomRight = Number(trackBorderBottomRight ? valueAt(trackBorderBottomRight, timeMs) : (el.borderRadiusBottomRight !== undefined ? el.borderRadiusBottomRight : valBorderRadius));
                    const valBorderBottomLeft = Number(trackBorderBottomLeft ? valueAt(trackBorderBottomLeft, timeMs) : (el.borderRadiusBottomLeft !== undefined ? el.borderRadiusBottomLeft : valBorderRadius));
                    const hasShadowTrack = trackShadowX || trackShadowY || trackShadowBlur || trackShadowSpread || trackShadowOpacity;
                    const hasClipTrack = trackClipTop || trackClipRight || trackClipBottom || trackClipLeft;

                    const containerStyle: React.CSSProperties = {
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      transform: `translate3d(${valX}px, ${valY}px, 0px) scale(${valScale * valScaleX}, ${valScale * valScaleY}) rotate(${valRotate}deg) rotateX(${valRotateX}deg) rotateY(${valRotateY}deg)`,
                      transformOrigin: `${valOriginX}% ${valOriginY}%`,
                      zIndex: valZIndex,
                      cursor: isPlaying ? 'default' : 'move',
                      ...(valWidth > 0 ? { width: `${valWidth}px` } : {}),
                      ...(valHeight > 0 ? { height: `${valHeight}px` } : {}),
                      ...(el.motionPath ? {
                        offsetPath: el.motionPath,
                        offsetDistance: `${valOffsetDistance}%`,
                        offsetRotate: formatMotionOffsetRotate(el.motionRotate, Number(valOffsetRotate)),
                      } : {}),
                    };

                    const visualStyle: React.CSSProperties = {
                      opacity: valOpacity,
                      filter: filterString,
                      ...(hasBgTrack ? {
                        backgroundColor: `hsla(${valBgH}, ${valBgS}%, ${valBgL}%, ${valBgA})`,
                        ...(Number(valBg2A) > 0 ? {
                          backgroundImage: `linear-gradient(${valBgAngle}deg, hsla(${valBgH}, ${valBgS}%, ${valBgL}%, ${valBgA}), hsla(${valBg2H}, ${valBg2S}%, ${valBg2L}%, ${valBg2A}))`,
                        } : {}),
                        backgroundPosition: `${valBgPosX}px ${valBgPosY}px`,
                      } : {}),
                      ...(hasBorderTrack ? {
                        borderStyle: 'solid',
                        borderTopWidth: `${valBorderTopWidth}px`,
                        borderRightWidth: `${valBorderRightWidth}px`,
                        borderBottomWidth: `${valBorderBottomWidth}px`,
                        borderLeftWidth: `${valBorderLeftWidth}px`,
                        borderColor: `hsla(${valBorderColorH}, ${valBorderColorS}%, ${valBorderColorL}%, ${valBorderColorA})`,
                      } : {}),
                      ...(hasBorderRadiusTrack ? {
                        borderTopLeftRadius: `${valBorderTopLeft}px`,
                        borderTopRightRadius: `${valBorderTopRight}px`,
                        borderBottomRightRadius: `${valBorderBottomRight}px`,
                        borderBottomLeftRadius: `${valBorderBottomLeft}px`,
                      } : {}),
                      ...(hasShadowTrack ? {
                        boxShadow: `${valShadowX}px ${valShadowY}px ${valShadowBlur}px ${valShadowSpread}px rgba(0, 0, 0, ${valShadowOpacity})`,
                      } : {}),
                      ...(hasClipTrack ? {
                        clipPath: `inset(${valClipTop}% ${valClipRight}% ${valClipBottom}% ${valClipLeft}%)`,
                      } : {}),
                    };

                    const playbackStyle: React.CSSProperties = {
                      ...containerStyle,
                      overflow: 'visible',
                      backgroundColor: visualStyle.backgroundColor || el.backgroundColor,
                      backgroundImage: visualStyle.backgroundImage,
                      backgroundPosition: visualStyle.backgroundPosition,
                      borderStyle: visualStyle.borderStyle,
                      borderTopWidth: visualStyle.borderTopWidth,
                      borderRightWidth: visualStyle.borderRightWidth,
                      borderBottomWidth: visualStyle.borderBottomWidth,
                      borderLeftWidth: visualStyle.borderLeftWidth,
                      borderColor: visualStyle.borderColor,
                      boxShadow: visualStyle.boxShadow,
                      clipPath: visualStyle.clipPath,
                    };

                    const childStyle: React.CSSProperties = {
                      borderTopLeftRadius: `${valBorderTopLeft}px`,
                      borderTopRightRadius: `${valBorderTopRight}px`,
                      borderBottomRightRadius: `${valBorderBottomRight}px`,
                      borderBottomLeftRadius: `${valBorderBottomLeft}px`,
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

                      // Get children of this element
                      const childElements = elements.filter(c => c.parentId === el.id);

                      const renderChildren = () => childElements.map((child) => {
                        const cTrackX = child.tracks.find(t => t.channel === 'x');
                        const cTrackY = child.tracks.find(t => t.channel === 'y');
                        const cTrackScale = child.tracks.find(t => t.channel === 'scale');
                        const cTrackScaleX = child.tracks.find(t => t.channel === 'scaleX');
                        const cTrackScaleY = child.tracks.find(t => t.channel === 'scaleY');
                        const cTrackRotate = child.tracks.find(t => t.channel === 'rotate');
                        const cTrackOpacity = child.tracks.find(t => t.channel === 'opacity');
                        const cTrackWidth = child.tracks.find(t => t.channel === 'width');
                        const cTrackHeight = child.tracks.find(t => t.channel === 'height');
                        const cX = Number(cTrackX ? valueAt(cTrackX, timeMs) : 0);
                        const cY = Number(cTrackY ? valueAt(cTrackY, timeMs) : 0);
                        const cScale = Number(cTrackScale ? valueAt(cTrackScale, timeMs) : 1);
                        const cScaleX = Number(cTrackScaleX ? valueAt(cTrackScaleX, timeMs) : 1);
                        const cScaleY = Number(cTrackScaleY ? valueAt(cTrackScaleY, timeMs) : 1);
                        const cRotate = Number(cTrackRotate ? valueAt(cTrackRotate, timeMs) : 0);
                        const cOpacity = Number(cTrackOpacity ? valueAt(cTrackOpacity, timeMs) : 1);
                        const cW = Number(cTrackWidth ? valueAt(cTrackWidth, timeMs) : (child.type === 'box' || child.type === 'circle' ? 100 : 0));
                        const cH = Number(cTrackHeight ? valueAt(cTrackHeight, timeMs) : (child.type === 'box' || child.type === 'circle' ? 100 : 0));

                        const childIsActive = child.id === activeElementId;
                        const childIsSelected = selectedElementIds.includes(child.id);

                        const childTextDisplay = child.text ? (
                          <span
                            style={{
                              fontSize: child.fontSize ? `${child.fontSize}px` : undefined,
                              fontFamily: child.fontFamily || undefined,
                              fontWeight: child.fontWeight || undefined,
                              color: child.color?.startsWith('#') ? child.color : undefined,
                            }}
                            className={cn(
                              "select-none",
                              child.color?.startsWith('#') ? '' : child.color
                            )}
                          >
                            {child.text}
                          </span>
                        ) : null;

                        const childBgColor = child.backgroundColor || (child.type === 'box' || child.type === 'circle' ? '#a1a1aa' : undefined);

                        return (
                          <div
                            key={child.id}
                            className={cn(
                              "absolute pointer-events-auto",
                              child.type === 'circle' ? 'rounded-full' : '',
                            )}
                            style={{
                              left: cX,
                              top: cY,
                              transform: `scale(${cScale * cScaleX}, ${cScale * cScaleY}) rotate(${cRotate}deg)`,
                              opacity: cOpacity,
                              ...(cW > 0 ? { width: cW } : {}),
                              ...(cH > 0 ? { height: cH } : {}),
                              backgroundColor: (child.type === 'box' || child.type === 'circle') ? childBgColor : undefined,
                              cursor: isPlaying ? 'default' : 'move',
                            }}
                            onPointerDown={!isPlaying ? (e) => {
                              e.stopPropagation();
                              startDragTranslate(e, child.id, cX, cY);
                            } : undefined}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveElementId(child.id);
                              setSelectedElementIds([child.id]);
                            }}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setActiveElementId(child.id);
                              setSelectedElementIds([child.id]);
                              const rect = containerRef.current?.getBoundingClientRect();
                              const x = rect ? e.clientX - rect.left : e.clientX;
                              const y = rect ? e.clientY - rect.top : e.clientY;
                              setLayerContextMenu({ visible: true, x, y, elementId: child.id });
                            }}
                          >
                            <div className="w-full h-full flex items-center justify-center">
                              {child.type === 'text' ? (
                                <span style={{
                                  fontSize: child.fontSize ? `${child.fontSize}px` : '18px',
                                  fontFamily: child.fontFamily || 'Inter',
                                  fontWeight: child.fontWeight || 800,
                                  color: child.color?.startsWith('#') ? child.color : undefined,
                                }} className={cn("select-none", child.color?.startsWith('#') ? '' : child.color)}>
                                  {child.text}
                                </span>
                              ) : child.type === 'star' ? (
                                <Star className="h-8 w-8 fill-current text-amber-400" />
                              ) : child.type === 'image' ? (
                                <img src={child.imageUrl} alt={child.name} className="w-full h-full object-cover" />
                              ) : (
                                childTextDisplay
                              )}
                            </div>

                            {/* Selection indicators for child elements */}
                            {childIsSelected && !isPlaying && (
                              <div className={cn(
                                "absolute -inset-1 border border-dashed rounded-md pointer-events-none",
                                childIsActive ? 'border-purple-500' : 'border-indigo-400/70'
                              )} />
                            )}
                          </div>
                        );
                      });

                      const trackD = el.tracks.find((t) => t.channel === 'd');
                      const valD = trackD ? valueAt(trackD, timeMs) : undefined;

                      const elBgColor = el.backgroundColor || undefined;
                      const elBgStyle: React.CSSProperties = elBgColor ? { backgroundColor: elBgColor } : {};

                      if (trackD && valD) {
                        return (
                          <div className="w-full h-full flex items-center justify-center p-1 text-center relative overflow-hidden">
                            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full pointer-events-none drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">
                              <path d={String(valD)} fill="currentColor" className="text-purple-500 transition-all duration-75" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              {textDisplay}
                            </div>
                          </div>
                        );
                      }

                      if (el.type === 'circle') {
                        return (
                          <div
                            className={cn("w-full h-full rounded-full flex items-center justify-center p-2 text-center relative", el.color)}
                            style={elBgStyle}
                          >
                            {el.text && textDisplay}
                            {renderChildren()}
                          </div>
                        );
                      }
                      if (el.type === 'box') {
                        const hasChildren = childElements.length > 0;
                        return (
                          <div
                            className={cn(
                              "w-full h-full flex items-center justify-center relative",
                              hasBorderRadiusTrack ? "" : "rounded-2xl",
                              !elBgColor ? el.color : '',
                            )}
                            style={{
                              ...(hasBorderRadiusTrack ? childStyle : {}),
                              ...elBgStyle,
                            }}
                          >
                            {!hasChildren && el.text && textDisplay}
                            {hasChildren && renderChildren()}
                          </div>
                        );
                      }
                      if (el.type === 'group') {
                        return (
                          <div className="relative w-full h-full min-w-0 min-h-0">
                            {renderChildren()}
                          </div>
                        );
                      }
                      if (el.type === 'text') {
                        return (
                          <div
                            className={cn("px-2 py-1 select-none tracking-tight", el.color?.startsWith('#') ? '' : el.color)}
                            style={{
                              fontSize: el.fontSize ? `${el.fontSize}px` : '18px',
                              fontFamily: el.fontFamily || 'Inter',
                              fontWeight: el.fontWeight || 800,
                              color: el.color?.startsWith('#') ? el.color : undefined,
                            }}
                          >
                            {textDisplay}
                          </div>
                        );
                      }
                      if (el.type === 'image') {
                        return (
                          <div
                            className={cn(
                              "relative w-full h-full overflow-hidden shadow-lg border border-white/15 bg-zinc-900 group",
                              hasBorderRadiusTrack ? "" : "rounded-2xl"
                            )}
                            style={hasBorderRadiusTrack ? childStyle : undefined}
                          >
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
                      <Animotion
                        key={el.id}
                        tracks={el.tracks}
                        durationMs={durationMs}
                        loop={loop}
                        autoplay={isPlaying}
                        currentTimeMs={timeMs}
                        direction={
                          yoyo 
                            ? (playDirection === 'reverse' ? 'alternate-reverse' : 'alternate') 
                            : (playDirection === 'reverse' ? 'reverse' : 'normal')
                        }
                        className="will-change-transform pointer-events-auto"
                        motionPath={el.motionPath}
                        motionRotate={el.motionRotate}
                        style={isPlaying ? playbackStyle : containerStyle}
                        onPointerDown={!isPlaying ? (e) => startDragTranslate(e, el.id, valX, valY) : undefined}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          
                          if (!selectedElementIds.includes(el.id)) {
                            setActiveElementId(el.id);
                            setSelectedElementIds([el.id]);
                          } else {
                            setActiveElementId(el.id);
                          }
                          
                          setSelectedKeyframeId(null);
                          const rect = containerRef.current?.getBoundingClientRect();
                          const x = rect ? e.clientX - rect.left : e.clientX;
                          const y = rect ? e.clientY - rect.top : e.clientY;
                          setLayerContextMenu({
                            visible: true,
                            x,
                            y,
                            elementId: el.id
                          });
                        }}
                      >
                        {!isPlaying ? (
                          <div className="w-full h-full" style={visualStyle}>
                            {renderElementBody()}
                          </div>
                        ) : (
                          renderElementBody()
                        )}

                        {/* Secondary Selected Border Outline (for selected but inactive elements) */}
                        {isElSelected && !isElActive && !isPlaying && (
                          <div className="absolute -inset-2 border border-dashed border-indigo-400/70 rounded-lg pointer-events-none" />
                        )}

                        {/* Bounding box transform handles if active & not playing */}
                        {isElActive && !isPlaying && (
                          <>
                            {/* Selected Border Outline */}
                            <div className="absolute -inset-2 border border-dashed border-purple-500 rounded-lg pointer-events-none shadow-[0_0_8px_rgba(168,85,247,0.3)]" />

                            {activeTransformMode === 'free' && (
                              <>
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

                                {/* Border Radius Corner Handles */}
                                {/* Top Left */}
                                <div
                                  className="absolute w-3.5 h-3.5 bg-white border-2 border-purple-500 rounded-full shadow-md flex items-center justify-center cursor-pointer hover:scale-125 hover:bg-purple-100 transition-all pointer-events-auto z-50 group/br"
                                  style={{
                                    top: `${Math.max(6, valBorderTopLeft - 6)}px`,
                                    left: `${Math.max(6, valBorderTopLeft - 6)}px`,
                                  }}
                                  onPointerDown={(e) => startDragBorderRadius(e, el.id, 'topLeft')}
                                  title="Drag diagonally to adjust Top-Left Corner Radius (Hold Ctrl for All)"
                                >
                                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                                </div>

                                {/* Top Right */}
                                <div
                                  className="absolute w-3.5 h-3.5 bg-white border-2 border-purple-500 rounded-full shadow-md flex items-center justify-center cursor-pointer hover:scale-125 hover:bg-purple-100 transition-all pointer-events-auto z-50 group/br"
                                  style={{
                                    top: `${Math.max(6, valBorderTopRight - 6)}px`,
                                    right: `${Math.max(6, valBorderTopRight - 6)}px`,
                                  }}
                                  onPointerDown={(e) => startDragBorderRadius(e, el.id, 'topRight')}
                                  title="Drag diagonally to adjust Top-Right Corner Radius (Hold Ctrl for All)"
                                >
                                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                                </div>

                                {/* Bottom Right */}
                                <div
                                  className="absolute w-3.5 h-3.5 bg-white border-2 border-purple-500 rounded-full shadow-md flex items-center justify-center cursor-pointer hover:scale-125 hover:bg-purple-100 transition-all pointer-events-auto z-50 group/br"
                                  style={{
                                    bottom: `${Math.max(6, valBorderBottomRight - 6)}px`,
                                    right: `${Math.max(6, valBorderBottomRight - 6)}px`,
                                  }}
                                  onPointerDown={(e) => startDragBorderRadius(e, el.id, 'bottomRight')}
                                  title="Drag diagonally to adjust Bottom-Right Corner Radius (Hold Ctrl for All)"
                                >
                                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                                </div>

                                {/* Bottom Left */}
                                <div
                                  className="absolute w-3.5 h-3.5 bg-white border-2 border-purple-500 rounded-full shadow-md flex items-center justify-center cursor-pointer hover:scale-125 hover:bg-purple-100 transition-all pointer-events-auto z-50 group/br"
                                  style={{
                                    bottom: `${Math.max(6, valBorderBottomLeft - 6)}px`,
                                    left: `${Math.max(6, valBorderBottomLeft - 6)}px`,
                                  }}
                                  onPointerDown={(e) => startDragBorderRadius(e, el.id, 'bottomLeft')}
                                  title="Drag diagonally to adjust Bottom-Left Corner Radius (Hold Ctrl for All)"
                                >
                                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                                </div>

                                {/* Pivot axis crosshair handle */}
                                <div
                                  className="absolute w-6 h-6 flex items-center justify-center z-50 pointer-events-auto cursor-move -translate-x-1/2 -translate-y-1/2 group/pivot"
                                  style={{
                                    left: `${valOriginX}%`,
                                    top: `${valOriginY}%`,
                                  }}
                                  onPointerDown={(e) => startDragOrigin(e, el.id)}
                                  title="Drag to adjust Pivot Axis (Transform Origin)"
                                >
                                  <div className="absolute w-5 h-5 rounded-full border-2 border-purple-500 bg-white/90 shadow-lg flex items-center justify-center group-hover/pivot:scale-110 group-hover/pivot:bg-purple-50 group-active/pivot:scale-95 group-active/pivot:bg-purple-500/10 transition-all">
                                    <div className="absolute w-full h-[1.5px] bg-purple-500/80" />
                                    <div className="absolute h-full w-[1.5px] bg-purple-500/80" />
                                    <div className="w-2 h-2 bg-purple-600 rounded-full border border-white shadow-inner" />
                                  </div>
                                </div>
                              </>
                            )}

                            {activeTransformMode === 'clip' && (
                              <>
                                {/* Top Clip */}
                                <div
                                  className="absolute left-1/2 -translate-x-1/2 w-8 h-2.5 bg-indigo-500/80 border border-white rounded-full shadow-md cursor-ns-resize hover:scale-y-125 transition-transform z-50 pointer-events-auto hover:bg-indigo-400"
                                  style={{ top: `${Math.max(-10, (valClipTop / 100) * valHeight - 5)}px` }}
                                  onPointerDown={(e) => startDragClip(e, el.id, 'top', valClipTop)}
                                  title="Drag to adjust Top Clip"
                                />
                                {/* Bottom Clip */}
                                <div
                                  className="absolute left-1/2 -translate-x-1/2 w-8 h-2.5 bg-indigo-500/80 border border-white rounded-full shadow-md cursor-ns-resize hover:scale-y-125 transition-transform z-50 pointer-events-auto hover:bg-indigo-400"
                                  style={{ bottom: `${Math.max(-10, (valClipBottom / 100) * valHeight - 5)}px` }}
                                  onPointerDown={(e) => startDragClip(e, el.id, 'bottom', valClipBottom)}
                                  title="Drag to adjust Bottom Clip"
                                />
                                {/* Left Clip */}
                                <div
                                  className="absolute top-1/2 -translate-y-1/2 h-8 w-2.5 bg-indigo-500/80 border border-white rounded-full shadow-md cursor-ew-resize hover:scale-x-125 transition-transform z-50 pointer-events-auto hover:bg-indigo-400"
                                  style={{ left: `${Math.max(-10, (valClipLeft / 100) * valWidth - 5)}px` }}
                                  onPointerDown={(e) => startDragClip(e, el.id, 'left', valClipLeft)}
                                  title="Drag to adjust Left Clip"
                                />
                                {/* Right Clip */}
                                <div
                                  className="absolute top-1/2 -translate-y-1/2 h-8 w-2.5 bg-indigo-500/80 border border-white rounded-full shadow-md cursor-ew-resize hover:scale-x-125 transition-transform z-50 pointer-events-auto hover:bg-indigo-400"
                                  style={{ right: `${Math.max(-10, (valClipRight / 100) * valWidth - 5)}px` }}
                                  onPointerDown={(e) => startDragClip(e, el.id, 'right', valClipRight)}
                                  title="Drag to adjust Right Clip"
                                />
                              </>
                            )}
                          </>
                        )}
                      </Animotion>
                    );
                  })}
                    </div>
                  );
                })()}

                  {stageSelectionBox && (
                    <div
                      className="absolute border border-purple-500 bg-purple-500/10 pointer-events-none z-50 rounded-lg shadow-sm"
                      style={{
                        left: Math.min(stageSelectionBox.startX, stageSelectionBox.currentX),
                        top: Math.min(stageSelectionBox.startY, stageSelectionBox.currentY),
                        width: Math.abs(stageSelectionBox.startX - stageSelectionBox.currentX),
                        height: Math.abs(stageSelectionBox.startY - stageSelectionBox.currentY),
                      }}
                    />
                  )}

                  {isDrawingBrush && brushPoints.length >= 2 && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-[40]">
                      <path
                        d={pointsToSvgPath(brushPoints)}
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth={4}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                      />
                    </svg>
                  )}
                </div>
              )}
            </div>
            
            {/* Horizontal Resize Handle for Preview Height */}
            <div
              className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize bg-zinc-500/0 hover:bg-purple-500/30 active:bg-purple-600/50 transition-colors z-50 flex items-center justify-center pointer-events-auto"
              onPointerDown={startResizePreview}
              onPointerMove={onResizePreviewMove}
              onPointerUp={onResizePreviewUp}
              title="Drag up/down to resize preview stage"
            >
              <div className="w-12 h-1.5 rounded-full bg-zinc-400/40 dark:bg-white/30 hover:bg-purple-400" />
            </div>
          </div>
          {renderBottomToolbar()}
        </Surface>
      )}

      <div className="flex gap-4 w-full items-stretch min-h-[350px]">
        <Surface className="flex flex-1 overflow-hidden bg-white/70 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 rounded-3xl shadow-sm">
          <div className="flex flex-col py-4" style={{ width: sidebarWidth }}>
            <div className="px-4 flex items-center justify-between mb-3 relative overflow-visible">
              <Text className="text-sm font-extrabold text-zinc-900 dark:text-white">Layers</Text>
              <div className="relative group shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  title="Add new Element"
                  className="h-8 w-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <div className="absolute left-0 top-9 w-56 bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-white/10 rounded-2xl shadow-xl py-2 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex flex-col p-1 w-56">
                  <button onClick={createVirtualCamera} className="w-full px-3 py-1.5 text-xs text-left hover:bg-zinc-50 dark:hover:bg-white/5 flex items-center gap-2 text-cyan-700 dark:text-cyan-300 font-semibold">
                    <Camera className="h-3.5 w-3.5 text-cyan-500" /> Virtual Camera
                  </button>
                  <button onClick={() => addNewElement('box')} className="w-full px-3 py-1.5 text-xs text-left hover:bg-zinc-50 dark:hover:bg-white/5 flex items-center gap-2 text-zinc-700 dark:text-white font-semibold">
                    <Square className="h-3.5 w-3.5 text-purple-500" /> Rectangle
                  </button>
                  <button onClick={() => addNewElement('circle')} className="w-full px-3 py-1.5 text-xs text-left hover:bg-zinc-50 dark:hover:bg-white/5 flex items-center gap-2 text-zinc-700 dark:text-white font-semibold">
                    <Disc className="h-3.5 w-3.5 text-cyan-500" /> Circle
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
                  <button onClick={() => addNewElement('group')} className="w-full px-3 py-1.5 text-xs text-left hover:bg-zinc-50 dark:hover:bg-white/5 flex items-center gap-2 text-zinc-700 dark:text-white font-semibold">
                    <Box className="h-3.5 w-3.5 text-purple-500" /> Empty Group
                  </button>
                  {componentPresets.length > 0 && (
                    <div className="mt-1 border-t border-zinc-200/80 dark:border-white/10 pt-1">
                      {componentPresets.map((preset) => (
                        <button key={preset.id} onClick={() => insertComponentPreset(preset)} className="w-full px-3 py-1.5 text-xs text-left hover:bg-zinc-50 dark:hover:bg-white/5 flex items-center gap-2 text-zinc-700 dark:text-white font-semibold">
                          <Layers className="h-3.5 w-3.5 text-cyan-500" /> {preset.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="px-4 pb-2">
              <input
                type="text"
                value={studioSearch}
                onChange={(e) => setStudioSearch(e.target.value)}
                placeholder="Search layers / tracks"
                className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-zinc-950/60 px-3 py-2 text-xs font-semibold text-zinc-800 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

          </div>

          <ScrollArea scrollbarSize="sm" className="flex-grow max-h-[350px] pr-1">
              <div className="flex flex-col">
                <div style={{ height: 40 }} className="w-full shrink-0 border-b border-transparent" />
                {cameraElement && (
                  <div className="flex flex-col relative group/layer">
                    <div
                      className={cn(
                        "w-full flex items-center justify-between gap-2 px-3 py-2 text-left border-b border-zinc-200/40 dark:border-white/5 transition-colors cursor-pointer select-none",
                        activeElementId === cameraElement.id
                          ? "bg-purple-500/20"
                          : selectedElementIds.includes(cameraElement.id)
                            ? "bg-purple-500/10"
                            : "hover:bg-zinc-50 dark:hover:bg-white/[0.02]"
                      )}
                      onClick={(e) => {
                        const isMulti = e.ctrlKey || e.metaKey;
                        if (isMulti) {
                          setSelectedElementIds((prev) => {
                            if (prev.includes(cameraElement.id)) {
                              const next = prev.filter((id) => id !== cameraElement.id);
                              setActiveElementId(next[next.length - 1] || '');
                              return next;
                            }
                            setActiveElementId(cameraElement.id);
                            return [...prev, cameraElement.id];
                          });
                        } else {
                          setActiveElementId(cameraElement.id);
                          setSelectedElementIds([cameraElement.id]);
                        }
                        setSelectedKeyframeId(null);
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveElementId(cameraElement.id);
                        setSelectedElementIds([cameraElement.id]);
                        setSelectedKeyframeId(null);
                        const rect = containerRef.current?.getBoundingClientRect();
                        const x = rect ? e.clientX - rect.left : e.clientX;
                        const y = rect ? e.clientY - rect.top : e.clientY;
                        setLayerContextMenu({
                          visible: true,
                          x,
                          y,
                          elementId: cameraElement.id,
                        });
                      }}
                      style={{ height: 40 }}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateElementProps(cameraElement.id, { visible: cameraElement.visible === false ? true : false });
                          }}
                          className={cn(
                            "h-5 w-5 shrink-0 rounded-md flex items-center justify-center transition-colors",
                            cameraElement.visible === false
                              ? "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                              : "text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                          )}
                          title={cameraElement.visible === false ? 'Show camera layer' : 'Hide camera layer'}
                        >
                          {cameraElement.visible === false ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                        <Camera className="h-4 w-4 text-cyan-500" />
                        <span className={cn(
                          "text-xs font-bold truncate flex-1",
                          cameraElement.visible === false ? "text-zinc-400 dark:text-zinc-600 line-through" : "text-zinc-800 dark:text-zinc-200"
                        )}>
                          {cameraElement.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const rect = containerRef.current?.getBoundingClientRect();
                          const x = rect ? e.clientX - rect.left : e.clientX;
                          const y = rect ? e.clientY - rect.top : e.clientY;
                          setLayerContextMenu({
                            visible: true,
                            x,
                            y,
                            elementId: cameraElement.id,
                          });
                        }}
                        className="flex items-center gap-1 shrink-0 text-[10px] text-zinc-400 font-extrabold select-none opacity-40 dark:text-zinc-500 hover:opacity-100 hover:text-white transition-opacity px-1 py-1 rounded"
                      >
                        •••
                      </button>
                    </div>
                  </div>
                )}
              {orderedElements.map((el, listIndex) => {
                const isElActive = el.id === activeElementId;
                const isElSelected = selectedElementIds.includes(el.id);
                // Compute nesting depth for indentation
                let nestDepth = 0;
                let parentCheck = el.parentId;
                while (parentCheck) {
                  nestDepth++;
                  const parent = elements.find(e => e.id === parentCheck);
                  parentCheck = parent?.parentId;
                }
                // We use a local state or just simple CSS for drag hover
                return (
                  <div 
                    key={el.id} 
                    className="flex flex-col relative group/layer"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      e.currentTarget.classList.add('border-t-2', 'border-t-purple-500');
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('border-t-2', 'border-t-purple-500');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-t-2', 'border-t-purple-500');
                      const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
                      if (isNaN(sourceIndex) || sourceIndex === listIndex) return;
                      
                      setElements((prev) => {
                        const nextReversed = [...prev].reverse();
                        const [moved] = nextReversed.splice(sourceIndex, 1);
                        if (moved) nextReversed.splice(listIndex, 0, moved);
                        return nextReversed.reverse();
                      });
                    }}
                  >
                    <div
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', listIndex.toString());
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      className={cn(
                        "w-full flex items-center justify-between gap-2 px-3 py-2 text-left border-b border-zinc-200/40 dark:border-white/5 transition-colors cursor-pointer select-none",
                        isElActive 
                          ? "bg-purple-500/20" 
                          : isElSelected 
                            ? "bg-purple-500/10" 
                            : "hover:bg-zinc-50 dark:hover:bg-white/[0.02]"
                      )}
                      onClick={(e) => {
                        const isMulti = e.ctrlKey || e.metaKey;
                        if (isMulti) {
                          setSelectedElementIds((prev) => {
                            if (prev.includes(el.id)) {
                              const next = prev.filter((id) => id !== el.id);
                              setActiveElementId(next[next.length - 1] || '');
                              return next;
                            } else {
                              setActiveElementId(el.id);
                              return [...prev, el.id];
                            }
                          });
                        } else {
                          setActiveElementId(el.id);
                          setSelectedElementIds([el.id]);
                        }
                        setSelectedKeyframeId(null);
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        if (!selectedElementIds.includes(el.id)) {
                          setActiveElementId(el.id);
                          setSelectedElementIds([el.id]);
                        } else {
                          setActiveElementId(el.id);
                        }
                        
                        setSelectedKeyframeId(null);
                        const rect = containerRef.current?.getBoundingClientRect();
                        const x = rect ? e.clientX - rect.left : e.clientX;
                        const y = rect ? e.clientY - rect.top : e.clientY;
                        setLayerContextMenu({
                          visible: true,
                          x,
                          y,
                          elementId: el.id
                        });
                      }}
                      style={{ height: 40, paddingLeft: nestDepth > 0 ? `${nestDepth * 20 + 12}px` : undefined }}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {nestDepth > 0 && (
                            <span className="text-zinc-500 text-[10px] mr-[-4px]">└</span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateElementProps(el.id, { collapsed: !el.collapsed });
                            }}
                            className="h-5 w-5 shrink-0 rounded-md text-zinc-400 hover:text-purple-500 hover:bg-purple-500/10 flex items-center justify-center transition-colors"
                            title={el.collapsed ? 'Expand layer properties' : 'Collapse layer properties'}
                          >
                            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", el.collapsed ? "-rotate-90" : "")} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateElementProps(el.id, { visible: el.visible === false ? true : false });
                            }}
                            className={cn(
                              "h-5 w-5 shrink-0 rounded-md flex items-center justify-center transition-colors",
                              el.visible === false
                                ? "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                                : "text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                            )}
                            title={el.visible === false ? 'Show layer' : 'Hide layer'}
                          >
                            {el.visible === false ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                          {el.type === 'circle' && <Disc className="h-4 w-4 text-cyan-500" />}
                          {el.type === 'box' && <Square className="h-4 w-4 text-purple-500" />}
                          {el.type === 'text' && <Type className="h-4 w-4 text-emerald-500" />}
                          {el.type === 'image' && <Image className="h-4 w-4 text-rose-500" />}
                          {el.type === 'star' && <Star className="h-4 w-4 text-amber-500" />}
                          {el.type === 'group' && <Box className="h-4 w-4 text-purple-500" />}
                          {editingElementId === el.id ? (
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onBlur={() => {
                              if (editingName.trim()) {
                                updateElementProps(el.id, { name: editingName.trim() });
                              }
                              setEditingElementId(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                if (editingName.trim()) {
                                  updateElementProps(el.id, { name: editingName.trim() });
                                }
                                setEditingElementId(null);
                              } else if (e.key === 'Escape') {
                                setEditingElementId(null);
                              }
                            }}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                            className="text-[11px] font-bold bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white rounded border border-purple-500 px-1 py-0.5 focus:outline-none w-full"
                          />
                        ) : (
                            <span
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                setEditingElementId(el.id);
                                setEditingName(el.name);
                              }}
                              className={cn(
                                "text-xs font-bold truncate flex-1",
                                el.visible === false ? "text-zinc-400 dark:text-zinc-600 line-through" : "text-zinc-800 dark:text-zinc-200"
                              )}
                              title="Double-click to Rename, Right-click for Options"
                            >
                              {el.name}
                            </span>
                          )}
                      </div>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!selectedElementIds.includes(el.id)) {
                            setActiveElementId(el.id);
                            setSelectedElementIds([el.id]);
                          }
                          const rect = containerRef.current?.getBoundingClientRect();
                          const x = rect ? e.clientX - rect.left : e.clientX;
                          const y = rect ? e.clientY - rect.top : e.clientY;
                          setLayerContextMenu({
                            visible: true,
                            x,
                            y,
                            elementId: el.id
                          });
                        }}
                        className="flex items-center gap-1 shrink-0 text-[10px] text-zinc-400 font-extrabold select-none opacity-40 dark:text-zinc-500 hover:opacity-100 hover:text-white transition-opacity px-1 py-1 rounded"
                      >
                        •••
                      </button>
                    </div>

                    {isElActive && !el.collapsed && (
                      <div className="flex flex-col bg-zinc-50/50 dark:bg-black/10">
                        {el.tracks.map((tr) => {
                          const isActiveTrack = tr.id === activeTrack?.id;
                          const val = valueAt(tr, timeMs);
                          const valStr = tr.channel === 'opacity' || tr.channel === 'scale' ? Number(val).toFixed(2) : (typeof val === 'string' ? val : Math.round(val));
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
                              {editingTrackValue?.elementId === el.id && editingTrackValue?.trackId === tr.id ? (
                                <input
                                  type="number"
                                  step="any"
                                  autoFocus
                                  value={editingTrackValue.valStr}
                                  onChange={(e) => setEditingTrackValue({ ...editingTrackValue, valStr: e.target.value })}
                                  onBlur={() => {
                                    const num = parseFloat(editingTrackValue.valStr);
                                    if (!isNaN(num)) updateElementTrackValue(el.id, tr.channel, num);
                                    setEditingTrackValue(null);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const num = parseFloat(editingTrackValue.valStr);
                                      if (!isNaN(num)) updateElementTrackValue(el.id, tr.channel, num);
                                      setEditingTrackValue(null);
                                    } else if (e.key === 'Escape') {
                                      setEditingTrackValue(null);
                                    }
                                  }}
                                  className="text-[10px] font-bold bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white rounded border border-purple-500 px-1 py-0 focus:outline-none w-14 text-right"
                                  onClick={(e) => e.stopPropagation()}
                                  onPointerDown={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <span 
                                  className="text-[10px] font-bold font-mono opacity-80 shrink-0 cursor-ew-resize hover:text-purple-400 select-none px-1"
                                  onPointerDown={(e) => {
                                    if (typeof val === 'number') {
                                      startScrubProperty(e, el.id, tr.channel, val);
                                    }
                                  }}
                                  onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    if (typeof val === 'number') {
                                      setEditingTrackValue({ elementId: el.id, trackId: tr.id, valStr: valStr.toString(), channel: tr.channel });
                                    }
                                  }}
                                >
                                  {valStr}
                                  {suffix}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
              </div>
            </ScrollArea>
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

            <ScrollArea
              ref={timelineRef}
              orientation="both"
              scrollbarSize="sm"
              className="flex-1 w-full rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-white/60 dark:bg-black/20"
              onWheel={(e) => {
                if (e.ctrlKey || e.metaKey) {
                  e.preventDefault();
                  setZoom(z => Math.max(0.25, Math.min(4.0, z - e.deltaY * 0.001)));
                }
              }}
            >
              <div
                className="relative min-w-full"
                style={{
                  width: durationMs * pxPerMs + 64,
                  height: 40 + timelineRowsHeight + 40,
                }}
              >
                {/* Time ruler header area for scrubbing */}
                <div 
                  className="absolute top-0 left-0 right-0 h-10 cursor-ew-resize z-20"
                  onPointerDown={onPlayheadPointerDown}
                />
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

                {audioUrl && (
                  <div
                    className="absolute top-10 bottom-0 left-4 right-4 pointer-events-none opacity-[0.06] dark:opacity-[0.08] z-0 overflow-hidden flex items-end justify-between gap-[2px]"
                    style={{ width: durationMs * pxPerMs }}
                  >
                    {Array.from({ length: Math.ceil((durationMs * pxPerMs) / 6) }).map((_, idx) => {
                      const pseudoRandomHeight = ((idx * 7 + 13) % 40) + 15;
                      return (
                        <div
                          key={idx}
                          className="w-[2.5px] bg-purple-600 dark:bg-purple-400 rounded-full"
                          style={{ height: `${pseudoRandomHeight}%` }}
                        />
                      );
                    })}
                  </div>
                )}

                {secondsMarkers.map((s) => (
                  <div
                    key={s}
                    className="absolute top-0 bottom-0 border-l border-zinc-200/70 dark:border-white/5 z-0 group cursor-ew-resize"
                    style={{ left: s * currentPxPerSecond + 16 }}
                  >
                    <div className="absolute top-2 left-2 flex items-center gap-1 text-[10px] font-extrabold text-zinc-500 dark:text-white/40 tabular-nums select-none">
                      <MoveHorizontal className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-purple-500" />
                      {s}s
                    </div>
                  </div>
                ))}

                <div
                  ref={playheadLineRef}
                  className="absolute top-0 bottom-0 w-px bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.4)] z-20 pointer-events-none"
                  style={{ left: playheadTimeRef.current * pxPerMs + 16 }}
                >
                  <div className="absolute top-0 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-purple-500 shadow-md shadow-purple-500/40 border border-white" />
                </div>

                <div className="absolute left-0 right-0 top-10 z-0 pointer-events-none">
                  <TimelineCanvas
                    rows={timelineRows}
                    width={durationMs * pxPerMs + 64}
                    height={timelineRowsHeight}
                    durationMs={durationMs}
                    pxPerMs={pxPerMs}
                    activeElementId={activeElementId}
                    activeTrackId={activeTrackId}
                    selectedKeyframeId={selectedKeyframeId}
                    selectedKeyframeIds={selectedKeyframeIds}
                    selectionBox={selectionBox}
                  />
                </div>

                <div
                  className="absolute left-0 right-0 top-10 flex flex-col z-10 select-none opacity-0 pointer-events-auto"
                  onPointerDown={onTimelineTrackAreaPointerDown}
                >
                  {timelineRows.map((row) => {
                    const el = row.element;
                    if (row.type === 'element') {
                      const elTimes = new Set<number>();
                      el.tracks.forEach(tr => tr.keyframes.forEach(k => elTimes.add(k.t)));
                      const elSummaryTimes = Array.from(elTimes).sort((a, b) => a - b);
                      return (
                        <div
                          key={`${el.id}-summary`}
                          className={cn(
                            "relative w-full flex items-center bg-zinc-50/50 dark:bg-white/[0.01] border-y border-zinc-200/80 dark:border-white/5 px-4",
                            el.id === activeElementId ? "bg-purple-500/[0.06]" : ""
                          )}
                          style={{ height: 40 }}
                          onClick={() => {
                            setActiveElementId(el.id);
                            setSelectedElementIds([el.id]);
                          }}
                        >
                          <button
                            type="button"
                            className="absolute left-1 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-purple-500"
                            onClick={(evt) => {
                              evt.stopPropagation();
                              updateElementProps(el.id, { collapsed: !el.collapsed });
                            }}
                            title={el.collapsed ? 'Expand tracks' : 'Collapse tracks'}
                          >
                            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", el.collapsed ? "-rotate-90" : "")} />
                          </button>
                          <span className="ml-4 text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 truncate max-w-40">
                            {el.name}
                          </span>
                          {elSummaryTimes.map((time) => (
                            <div
                              key={`${el.id}-summary-${time}`}
                              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-zinc-400 dark:bg-zinc-600 border border-zinc-300 dark:border-zinc-800"
                              style={{ left: time * pxPerMs + 16 }}
                              title={`Layer keyframes @ ${formatTime(time)}`}
                            />
                          ))}
                        </div>
                      );
                    }
                    const tr = row.track!;
                    const isActive = tr.id === activeTrack?.id;
                    return (
                      <div
                        key={`${el.id}-${tr.id}`}
                        className={cn(
                          'relative w-full border-b border-zinc-100 dark:border-white/[0.02] px-4 transition-colors',
                          isActive ? 'bg-purple-500/[0.04]' : 'bg-transparent'
                        )}
                        style={{ height: 32 }}
                        onClick={() => {
                          setActiveElementId(el.id);
                          setActiveTrackId(tr.id);
                        }}
                        onContextMenu={(e) => handleTrackContextMenu(e, tr.id)}
                      >
                        <span className="absolute left-8 top-1/2 -translate-y-1/2 text-[9px] font-bold text-zinc-400 dark:text-zinc-600 pointer-events-none">
                          {tr.label}
                        </span>
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
                          const isKfActive = selectedKeyframeId === kf.id;
                          const isSelected = selectedKeyframeIds.includes(kf.id);
                          return (
                            <div
                              key={kf.id}
                              className={cn(
                                'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45 border shadow-sm cursor-grab active:cursor-grabbing transition-transform hover:scale-125 z-10',
                                isKfActive
                                  ? 'bg-purple-500 border-purple-300 dark:border-purple-400 scale-125 ring-2 ring-purple-500/30'
                                  : isSelected
                                    ? 'bg-indigo-500 border-indigo-300 dark:border-indigo-400 scale-110 ring-2 ring-indigo-500/20'
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

                  {selectionBox && (
                    <div
                      className="absolute border border-purple-500 bg-purple-500/10 pointer-events-none z-50 rounded-lg shadow-sm"
                      style={{
                        left: Math.min(selectionBox.startX, selectionBox.currentX),
                        top: Math.min(selectionBox.startY, selectionBox.currentY),
                        width: Math.abs(selectionBox.startX - selectionBox.currentX),
                        height: Math.abs(selectionBox.startY - selectionBox.currentY),
                      }}
                    />
                  )}
                </div>
              </div>
            </ScrollArea>

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
      </div>
    </div>

      {showStage && (
        isDrawerOpen ? (
          <Surface className="w-[320px] p-5 bg-white/70 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 rounded-3xl shadow-sm flex flex-col justify-between shrink-0">
            <ScrollArea scrollbarSize="sm" className="flex-grow pr-1">
              <div className="flex flex-col gap-4">
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



              <div className="space-y-2">
                {isCameraActive && (
                  <div className="border border-zinc-200/50 dark:border-white/[0.04] rounded-2xl overflow-hidden bg-zinc-50/50 dark:bg-black/10">
                    <button
                      type="button"
                      onClick={() => setOpenSections((s) => ({ ...s, transform: !s.transform }))}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-white/[0.02]"
                    >
                      <span className="flex items-center gap-2">🎥 Camera Viewport</span>
                      <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", openSections.transform && "rotate-180")} />
                    </button>
                    {openSections.transform && (
                      <div className="px-3.5 pb-3.5 pt-1 space-y-1">
                        {renderDrawerPropertyRow('Camera Zoom', 'cameraZoom', 0.25, 2.5, 0.01, '')}
                        {renderDrawerPropertyRow('Camera Pan X', 'cameraPanX', -3000, 3000, 1, 'px')}
                        {renderDrawerPropertyRow('Camera Pan Y', 'cameraPanY', -3000, 3000, 1, 'px')}
                        {renderDrawerPropertyRow('Camera Tilt', 'cameraTilt', -45, 45, 0.1, 'deg')}
                      </div>
                    )}
                  </div>
                )}

                {/* TRANSFORM SECTION */}
                <div className="border border-zinc-200/50 dark:border-white/[0.04] rounded-2xl overflow-hidden bg-zinc-50/50 dark:bg-black/10">
                  <button
                    type="button"
                    onClick={() => setOpenSections((s) => ({ ...s, transform: !s.transform }))}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-white/[0.02]"
                  >
                    <span className="flex items-center gap-2">📐 Transforms & Depth</span>
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", openSections.transform && "rotate-180")} />
                  </button>
                  {openSections.transform && (
                    <div className="px-3.5 pb-3.5 pt-1 space-y-1">
                      {renderDrawerPropertyRow('Position X', 'x', -3300, 3300, 1, 'px')}
                      {renderDrawerPropertyRow('Position Y', 'y', -3300, 3300, 1, 'px')}
                      {renderDrawerPropertyRow('Width', 'width', 10, 3300, 1, 'px')}
                      {renderDrawerPropertyRow('Height', 'height', 10, 3300, 1, 'px')}
                      {renderDrawerPropertyRow('Scale', 'scale', 0.1, 4.0, 0.01, '')}
                      {renderDrawerPropertyRow('Scale X', 'scaleX', 0.1, 4.0, 0.01, '')}
                      {renderDrawerPropertyRow('Scale Y', 'scaleY', 0.1, 4.0, 0.01, '')}
                      {renderDrawerPropertyRow('Rotate', 'rotate', -360, 360, 1, 'deg')}
                      {renderDrawerPropertyRow('Rotate X (3D)', 'rotateX', -360, 360, 1, 'deg')}
                      {renderDrawerPropertyRow('Rotate Y (3D)', 'rotateY', -360, 360, 1, 'deg')}
                      {renderDrawerPropertyRow('Transform Origin X', 'originX', 0, 100, 1, '%')}
                      {renderDrawerPropertyRow('Transform Origin Y', 'originY', 0, 100, 1, '%')}
                      {renderDrawerPropertyRow('Depth (z-index)', 'zIndex', 1, 100, 1, '')}
                    </div>
                  )}
                </div>

                {/* FILTERS & OPACITY SECTION */}
                <div className="border border-zinc-200/50 dark:border-white/[0.04] rounded-2xl overflow-hidden bg-zinc-50/50 dark:bg-black/10">
                  <button
                    type="button"
                    onClick={() => setOpenSections((s) => ({ ...s, filters: !s.filters }))}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-white/[0.02]"
                  >
                    <span className="flex items-center gap-2">🎬 Opacity & Filters</span>
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", openSections.filters && "rotate-180")} />
                  </button>
                  {openSections.filters && (
                    <div className="px-3.5 pb-3.5 pt-1 space-y-1">
                      {renderDrawerPropertyRow('Opacity', 'opacity', 0.0, 1.0, 0.01, '')}
                      {renderDrawerPropertyRow('Blur Filter', 'blur', 0, 40, 0.1, 'px')}
                      {renderDrawerPropertyRow('Brightness Filter', 'brightness', 0, 300, 1, '%')}
                      {renderDrawerPropertyRow('Contrast Filter', 'contrast', 0, 300, 1, '%')}
                      {renderDrawerPropertyRow('Grayscale Filter', 'grayscale', 0, 100, 1, '%')}
                      {renderDrawerPropertyRow('Hue Rotate Filter', 'hueRotate', -180, 180, 1, 'deg')}
                      {renderDrawerPropertyRow('Saturate Filter', 'saturate', 0, 300, 1, '%')}
                      {renderDrawerPropertyRow('Sepia Filter', 'sepia', 0, 100, 1, '%')}
                    </div>
                  )}
                </div>

                {/* MOTION PATH SECTION */}
                <div className="border border-zinc-200/50 dark:border-white/[0.04] rounded-2xl overflow-hidden bg-zinc-50/50 dark:bg-black/10">
                  <button
                    type="button"
                    onClick={() => setOpenSections((s) => ({ ...s, motion: !s.motion }))}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-white/[0.02]"
                  >
                    <span className="flex items-center gap-2">🔄 Motion Path</span>
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", openSections.motion && "rotate-180")} />
                  </button>
                  {openSections.motion && (
                    <div className="px-3.5 pb-3.5 pt-1 space-y-3.5 text-left">
                      {activeElement && (
                        <>
                          <div>
                            <label className="text-[10px] font-extrabold uppercase text-zinc-400 select-none block mb-1">Path Preset / Custom</label>
                            <select
                              value={
                                activeElement.motionPath === "path('M 10 80 Q 95 10 180 80 T 350 80')" ? "wave" :
                                activeElement.motionPath === "path('M 25 100 A 75 75 0 1 1 25 100.1')" ? "circle" :
                                activeElement.motionPath === "path('M 10 50 C 90 0, 160 100, 240 50')" ? "loop" :
                                activeElement.motionPath === "path('M 10 180 Q 80 50 150 180 T 290 180')" ? "bounce" :
                                activeElement.motionPath === "path('M 150 150 A 60 60 0 1 0 150 270 A 90 90 0 1 0 150 330 A 120 120 0 1 0 150 390')" ? "spiral" :
                                activeElement.motionPath === "path('M 150 120 C 150 120, 130 90, 100 90 C 70 90, 50 115, 50 145 C 50 180, 110 205, 150 230 C 190 205, 250 180, 250 145 C 250 115, 230 90, 200 90 C 170 90, 150 120, 150 120 Z')" ? "heart" :
                                activeElement.motionPath === "path('M 50 100 C 100 150, 150 50, 200 100 C 250 150, 300 50, 350 100 C 300 150, 250 50, 200 100 C 150 150, 100 50, 50 100 Z')" ? "infinity" :
                                activeElement.motionPath ? "custom" : "none"
                              }
                              onChange={(e) => {
                                const val = e.target.value;
                                let pathStr = "";
                                if (val === "wave") pathStr = "path('M 10 80 Q 95 10 180 80 T 350 80')";
                                else if (val === "circle") pathStr = "path('M 25 100 A 75 75 0 1 1 25 100.1')";
                                else if (val === "loop") pathStr = "path('M 10 50 C 90 0, 160 100, 240 50')";
                                else if (val === "bounce") pathStr = "path('M 10 180 Q 80 50 150 180 T 290 180')";
                                else if (val === "spiral") pathStr = "path('M 150 150 A 60 60 0 1 0 150 270 A 90 90 0 1 0 150 330 A 120 120 0 1 0 150 390')";
                                else if (val === "heart") pathStr = "path('M 150 120 C 150 120, 130 90, 100 90 C 70 90, 50 115, 50 145 C 50 180, 110 205, 150 230 C 190 205, 250 180, 250 145 C 250 115, 230 90, 200 90 C 170 90, 150 120, 150 120 Z')";
                                else if (val === "infinity") pathStr = "path('M 50 100 C 100 150, 150 50, 200 100 C 250 150, 300 50, 350 100 C 300 150, 250 50, 200 100 C 150 150, 100 50, 50 100 Z')";
                                else if (val === "custom") pathStr = "path('M 0 0 L 100 100')";
                                updateElementsState((prev) =>
                                  prev.map((el) => {
                                    if (el.id !== activeElement.id) return el;
                                    let nextTracks = [...el.tracks];
                                    if (pathStr) {
                                      const distanceTrack = nextTracks.find((t) => t.channel === 'offsetDistance');
                                      if (!distanceTrack) {
                                        nextTracks.push({
                                          id: 'tr-distance-' + uid(),
                                          label: 'Motion Path Distance',
                                          channel: 'offsetDistance',
                                          keyframes: [
                                            { id: uid(), t: 0, v: 0, easing: 'linear' },
                                            { id: uid(), t: Math.min(2000, durationMs), v: 100, easing: 'linear' }
                                          ]
                                        });
                                      }
                                      const rotateTrack = nextTracks.find((t) => t.channel === 'offsetRotate');
                                      if (!rotateTrack) {
                                        nextTracks.push({
                                          id: 'tr-offset-rot-' + uid(),
                                          label: 'Motion Path Rotate Offset',
                                          channel: 'offsetRotate',
                                          keyframes: [
                                            { id: uid(), t: 0, v: 0, easing: 'linear' }
                                          ]
                                        });
                                      }
                                    }
                                    return {
                                      ...el,
                                      motionPath: pathStr || undefined,
                                      tracks: nextTracks,
                                    };
                                  })
                                );
                              }}
                              className="w-full text-xs font-bold bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white rounded-xl border border-zinc-200 dark:border-white/10 px-2.5 py-1.5 shadow-sm focus:ring-1 focus:ring-purple-500 focus:outline-none cursor-pointer"
                            >
                              <option value="none">None</option>
                              <option value="wave">Wave Preset 〰</option>
                              <option value="circle">Circle Preset ◯</option>
                              <option value="loop">S-Curve Loop Preset 🔁</option>
                              <option value="bounce">Bounce Arches Preset ⤾</option>
                              <option value="spiral">Spiral Preset 🌀</option>
                              <option value="heart">Heart Shape Preset ♥</option>
                              <option value="infinity">Infinity Preset ♾</option>
                              <option value="custom">Custom Line (M 0 0 L 100 100) ➖</option>
                            </select>
                          </div>

                          {activeElement.motionPath && (
                            <>
                              <div>
                                <label className="text-[10px] font-extrabold uppercase text-zinc-400 select-none block mb-1">Custom Path String</label>
                                <input
                                  type="text"
                                  value={activeElement.motionPath}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    updateElementsState((prev) =>
                                      prev.map((el) => {
                                        if (el.id !== activeElement.id) return el;
                                        return {
                                          ...el,
                                          motionPath: val,
                                        };
                                      })
                                    );
                                  }}
                                  placeholder="path('M 0 0 L 100 100')"
                                  className="w-full text-xs font-bold bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white rounded-xl border border-zinc-200 dark:border-white/10 px-2.5 py-1.5 shadow-sm focus:ring-1 focus:ring-purple-500 focus:outline-none"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-extrabold uppercase text-zinc-400 select-none block mb-1">Rotation Option</label>
                                <select
                                  value={activeElement.motionRotate || "auto"}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    updateElementsState((prev) =>
                                      prev.map((el) => {
                                        if (el.id !== activeElement.id) return el;
                                        return {
                                          ...el,
                                          motionRotate: val,
                                        };
                                      })
                                    );
                                  }}
                                  className="w-full text-xs font-bold bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white rounded-xl border border-zinc-200 dark:border-white/10 px-2.5 py-1.5 shadow-sm focus:ring-1 focus:ring-purple-500 focus:outline-none cursor-pointer"
                                >
                                  <option value="auto">Auto Orient</option>
                                  <option value="auto 180deg">Auto Orient + 180°</option>
                                  <option value="0deg">0deg Fixed</option>
                                  <option value="90deg">90deg Fixed</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                {renderDrawerPropertyRow('Path Distance', 'offsetDistance', 0, 100, 1, '%')}
                                {renderDrawerPropertyRow('Rotate Offset', 'offsetRotate', -360, 360, 1, 'deg')}
                              </div>

                              <div className="mt-3.5 pt-3 border-t border-zinc-200/80 dark:border-white/10 space-y-2">
                                <label className="text-[10px] font-extrabold uppercase text-zinc-400 select-none block mb-1">
                                  📍 Path Control Points
                                </label>
                                
                                <div className="grid grid-cols-2 gap-2">
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="h-8 text-[10px] font-bold rounded-xl justify-center cursor-pointer"
                                    onClick={() => {
                                      const match = activeElement.motionPath?.match(/path\(['"]?([^'"]+)['"]?\)/);
                                      const d = (match && match[1]) ? match[1] : (activeElement.motionPath || '');
                                      const commands = parsePath(d);
                                      let nextX = 100, nextY = 100;
                                      if (commands.length > 0) {
                                        const lastCmd = commands[commands.length - 1]!;
                                        const lastX = lastCmd.args[lastCmd.args.length - 2] ?? 0;
                                        const lastY = lastCmd.args[lastCmd.args.length - 1] ?? 0;
                                        nextX = lastX + 50;
                                        nextY = lastY + 50;
                                      }
                                      addPathPoint(activeElement.id, nextX, nextY);
                                    }}
                                  >
                                    ➕ Add Point
                                  </Button>
                                  
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="h-8 text-[10px] font-bold rounded-xl justify-center text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 cursor-pointer"
                                    onClick={() => {
                                      const match = activeElement.motionPath?.match(/path\(['"]?([^'"]+)['"]?\)/);
                                      const d = (match && match[1]) ? match[1] : (activeElement.motionPath || '');
                                      const commands = parsePath(d);
                                      if (commands.length > 1) {
                                        removePathPoint(activeElement.id, commands.length - 1);
                                      }
                                    }}
                                  >
                                    ➖ Delete Last
                                  </Button>
                                </div>
                                
                                <Button
                                  variant="danger"
                                  size="sm"
                                  className="w-full h-8 text-[10px] font-bold rounded-xl justify-center cursor-pointer"
                                  onClick={() => {
                                    updateElementsState((prev) =>
                                      prev.map((el) => {
                                        if (el.id !== activeElement.id) return el;
                                        return {
                                          ...el,
                                          motionPath: undefined,
                                          tracks: el.tracks.filter(
                                            (t) => t.channel !== 'offsetDistance' && t.channel !== 'offsetRotate'
                                          ),
                                        };
                                      })
                                    );
                                  }}
                                >
                                  ❌ Remove Motion Path
                                </Button>
                                
                                <p className="text-[10px] leading-relaxed text-zinc-400 italic mt-1 select-none">
                                  💡 <strong>Stage Tip:</strong> Double-click directly on the path line on stage to add points; double-click handles to delete them.
                                </p>
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* BORDERS & RADIUS SECTION */}
                <div className="border border-zinc-200/50 dark:border-white/[0.04] rounded-2xl overflow-hidden bg-zinc-50/50 dark:bg-black/10">
                  <button
                    type="button"
                    onClick={() => setOpenSections((s) => ({ ...s, borders: !s.borders }))}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-white/[0.02]"
                  >
                    <span className="flex items-center gap-2">🔲 Borders & Radius</span>
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", openSections.borders && "rotate-180")} />
                  </button>
                  {openSections.borders && (
                    <div className="px-3.5 pb-3.5 pt-1 space-y-1">
                      {renderDrawerPropertyRow('Border Radius', 'borderRadius', 0, 200, 1, 'px')}
                      {renderDrawerPropertyRow('Border Top', 'borderTopWidth', 0, 50, 1, 'px')}
                      {renderDrawerPropertyRow('Border Right', 'borderRightWidth', 0, 50, 1, 'px')}
                      {renderDrawerPropertyRow('Border Bottom', 'borderBottomWidth', 0, 50, 1, 'px')}
                      {renderDrawerPropertyRow('Border Left', 'borderLeftWidth', 0, 50, 1, 'px')}
                      {renderDrawerPropertyRow('Border Hue', 'borderColorH', 0, 360, 1, '')}
                      {renderDrawerPropertyRow('Border Saturation', 'borderColorS', 0, 100, 1, '%')}
                      {renderDrawerPropertyRow('Border Lightness', 'borderColorL', 0, 100, 1, '%')}
                      {renderDrawerPropertyRow('Border Alpha', 'borderColorA', 0, 1, 0.05, '')}
                    </div>
                  )}
                </div>

                {/* BACKGROUND SECTION */}
                <div className="border border-zinc-200/50 dark:border-white/[0.04] rounded-2xl overflow-hidden bg-zinc-50/50 dark:bg-black/10">
                  <button
                    type="button"
                    onClick={() => setOpenSections((s) => ({ ...s, background: !s.background }))}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-white/[0.02]"
                  >
                    <span className="flex items-center gap-2">🎨 Background Style</span>
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", openSections.background && "rotate-180")} />
                  </button>
                  {openSections.background && (
                    <div className="px-3.5 pb-3.5 pt-1 space-y-1">
                      {renderDrawerPropertyRow('BG Hue', 'bgH', 0, 360, 1, '')}
                      {renderDrawerPropertyRow('BG Saturation', 'bgS', 0, 100, 1, '%')}
                      {renderDrawerPropertyRow('BG Lightness', 'bgL', 0, 100, 1, '%')}
                      {renderDrawerPropertyRow('BG Alpha', 'bgA', 0, 1, 0.05, '')}
                      <div className="pt-2 mt-2 border-t border-zinc-200/80 dark:border-white/10" />
                      {renderDrawerPropertyRow('Gradient Hue', 'bg2H', 0, 360, 1, '')}
                      {renderDrawerPropertyRow('Gradient Saturation', 'bg2S', 0, 100, 1, '%')}
                      {renderDrawerPropertyRow('Gradient Lightness', 'bg2L', 0, 100, 1, '%')}
                      {renderDrawerPropertyRow('Gradient Alpha', 'bg2A', 0, 1, 0.05, '')}
                      {renderDrawerPropertyRow('Gradient Angle', 'bgAngle', 0, 360, 1, 'deg')}
                      {renderDrawerPropertyRow('BG Position X', 'bgPosX', -200, 200, 1, 'px')}
                      {renderDrawerPropertyRow('BG Position Y', 'bgPosY', -200, 200, 1, 'px')}
                    </div>
                  )}
                </div>

                {/* SHADOWS SECTION */}
                <div className="border border-zinc-200/50 dark:border-white/[0.04] rounded-2xl overflow-hidden bg-zinc-50/50 dark:bg-black/10">
                  <button
                    type="button"
                    onClick={() => setOpenSections((s) => ({ ...s, shadow: !s.shadow }))}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-white/[0.02]"
                  >
                    <span className="flex items-center gap-2">👥 Box Shadows</span>
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", openSections.shadow && "rotate-180")} />
                  </button>
                  {openSections.shadow && (
                    <div className="px-3.5 pb-3.5 pt-1 space-y-1">
                      {renderDrawerPropertyRow('Shadow X Offset', 'shadowX', -100, 100, 1, 'px')}
                      {renderDrawerPropertyRow('Shadow Y Offset', 'shadowY', -100, 100, 1, 'px')}
                      {renderDrawerPropertyRow('Shadow Blur', 'shadowBlur', 0, 150, 1, 'px')}
                      {renderDrawerPropertyRow('Shadow Spread', 'shadowSpread', -50, 50, 1, 'px')}
                      {renderDrawerPropertyRow('Shadow Opacity', 'shadowOpacity', 0, 1, 0.02, '')}
                    </div>
                  )}
                </div>

                {/* CLIP-PATHS SECTION */}
                <div className="border border-zinc-200/50 dark:border-white/[0.04] rounded-2xl overflow-hidden bg-zinc-50/50 dark:bg-black/10">
                  <button
                    type="button"
                    onClick={() => setOpenSections((s) => ({ ...s, clip: !s.clip }))}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-white/[0.02]"
                  >
                    <span className="flex items-center gap-2">✂️ Clip Insets</span>
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", openSections.clip && "rotate-180")} />
                  </button>
                  {openSections.clip && (
                    <div className="px-3.5 pb-3.5 pt-1 space-y-1">
                      {renderDrawerPropertyRow('Clip Inset Top', 'clipTop', 0, 100, 1, '%')}
                      {renderDrawerPropertyRow('Clip Inset Right', 'clipRight', 0, 100, 1, '%')}
                      {renderDrawerPropertyRow('Clip Inset Bottom', 'clipBottom', 0, 100, 1, '%')}
                      {renderDrawerPropertyRow('Clip Inset Left', 'clipLeft', 0, 100, 1, '%')}
                    </div>
                  )}
                </div>

                {/* AUDIO SYNC SECTION */}
                <div className="border border-zinc-200/50 dark:border-white/[0.04] rounded-2xl overflow-hidden bg-zinc-50/50 dark:bg-black/10">
                  <button
                    type="button"
                    onClick={() => setOpenSections((s) => ({ ...s, audio: !s.audio }))}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-white/[0.02]"
                  >
                    <span className="flex items-center gap-2">🎵 Audio Synchronization</span>
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", openSections.audio && "rotate-180")} />
                  </button>
                  {openSections.audio && (
                    <div className="px-3.5 pb-3.5 pt-2 space-y-3">
                      <div>
                        <label className="text-[10px] font-extrabold uppercase text-zinc-400 select-none block mb-1">
                          Timeline Sound File
                        </label>
                        {audioUrl ? (
                          <div className="flex flex-col gap-2 p-2 bg-zinc-100 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/[0.05]">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 truncate max-w-[150px]" title={audioName || 'Audio'}>
                                📻 {audioName || 'Sync Audio'}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (audioRef.current) {
                                    audioRef.current.pause();
                                  }
                                  setAudioUrl(null);
                                  setAudioName(null);
                                }}
                                className="text-[10px] font-extrabold text-red-500 hover:text-red-600 transition-colors bg-transparent border-0 cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-extrabold uppercase text-zinc-400">Volume</span>
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                defaultValue="1"
                                onChange={(e) => {
                                  if (audioRef.current) {
                                    audioRef.current.volume = parseFloat(e.target.value);
                                  }
                                }}
                                className="flex-1 accent-purple-600 h-1 rounded-lg cursor-pointer bg-zinc-200 dark:bg-zinc-700"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="relative group flex flex-col items-center justify-center border border-dashed border-zinc-300 dark:border-white/10 rounded-2xl p-4 bg-zinc-50 dark:bg-white/[0.02] hover:bg-zinc-100/50 dark:hover:bg-white/[0.04] transition-all cursor-pointer">
                            <input
                              type="file"
                              accept="audio/*"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const url = URL.createObjectURL(file);
                                  setAudioUrl(url);
                                  setAudioName(file.name);
                                }
                              }}
                            />
                            <Music className="h-6 w-6 text-zinc-400 dark:text-zinc-500 group-hover:text-purple-500 mb-1.5 transition-colors" />
                            <span className="text-[10px] font-extrabold text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                              Upload sound track (mp3, wav)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
                    {typeof selectedKeyframe.keyframe.v === 'string' ? (
                      <input
                        type="text"
                        value={selectedKeyframe.keyframe.v}
                        onChange={(e) => {
                          updateKeyframeProps(selectedKeyframe.trackId, selectedKeyframe.keyframe.id, { v: e.target.value });
                        }}
                        className="w-40 text-left text-xs font-mono bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white rounded-lg border border-zinc-200 dark:border-white/10 p-1 truncate"
                        title={selectedKeyframe.keyframe.v}
                      />
                    ) : (
                      <input
                        type="number"
                        value={typeof selectedKeyframe.keyframe.v === 'number' ? parseFloat((selectedKeyframe.keyframe.v || 0).toFixed(3)) : 0}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val)) {
                            updateKeyframeProps(selectedKeyframe.trackId, selectedKeyframe.keyframe.id, { v: val });
                          }
                        }}
                        className="w-20 text-center text-xs font-mono font-bold bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white rounded-lg border border-zinc-200 dark:border-white/10 p-1"
                      />
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <Text className="text-xs font-semibold text-zinc-500">Curve Easing</Text>
                      <select
                        value={selectedKeyframe.keyframe.easing ?? 'linear'}
                        onChange={(e) => {
                          const newEasing = e.target.value;
                          const toUpdate = selectedKeyframeIds.includes(selectedKeyframe.keyframe.id)
                            ? selectedKeyframeIds
                            : [selectedKeyframe.keyframe.id];

                          toUpdate.forEach((id) => {
                            let foundTrackId = selectedKeyframe.trackId;
                            if (activeElement) {
                              for (const tr of activeElement.tracks) {
                                if (tr.keyframes.some((k) => k.id === id)) {
                                  foundTrackId = tr.id;
                                  break;
                                }
                              }
                            }
                            updateKeyframeProps(foundTrackId, id, { easing: newEasing });
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
                    <EasingVisualizer
                      easing={selectedKeyframe.keyframe.easing ?? 'linear'}
                      mass={selectedKeyframe.keyframe.mass}
                      stiffness={selectedKeyframe.keyframe.stiffness}
                      damping={selectedKeyframe.keyframe.damping}
                    />
                    <GraphEditor
                      track={selectedKeyframe.track}
                      keyframe={selectedKeyframe.keyframe}
                      onChange={(updates) => updateKeyframeProps(selectedKeyframe.trackId, selectedKeyframe.keyframe.id, updates)}
                    />

                    {selectedKeyframe.keyframe.easing === 'spring-custom' && (
                      <div className="mt-3.5 space-y-3.5 border-t border-zinc-200/50 dark:border-white/[0.04] pt-3.5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                            <span>Mass (Weight)</span>
                            <span className="font-mono text-purple-600 dark:text-purple-400 font-extrabold">
                              {(selectedKeyframe.keyframe.mass ?? 1).toFixed(2)}
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0.1"
                            max="10"
                            step="0.05"
                            value={selectedKeyframe.keyframe.mass ?? 1}
                            onChange={(e) => {
                              const massVal = parseFloat(e.target.value);
                              updateKeyframeProps(selectedKeyframe.trackId, selectedKeyframe.keyframe.id, { mass: massVal });
                            }}
                            className="w-full accent-purple-600 h-1 rounded-lg cursor-pointer bg-zinc-200 dark:bg-zinc-700"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                            <span>Stiffness (Tension)</span>
                            <span className="font-mono text-purple-600 dark:text-purple-400 font-extrabold">
                              {Math.round(selectedKeyframe.keyframe.stiffness ?? 100)}
                            </span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="500"
                            step="5"
                            value={selectedKeyframe.keyframe.stiffness ?? 100}
                            onChange={(e) => {
                              const stiffVal = parseFloat(e.target.value);
                              updateKeyframeProps(selectedKeyframe.trackId, selectedKeyframe.keyframe.id, { stiffness: stiffVal });
                            }}
                            className="w-full accent-purple-600 h-1 rounded-lg cursor-pointer bg-zinc-200 dark:bg-zinc-700"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                            <span>Damping (Friction)</span>
                            <span className="font-mono text-purple-600 dark:text-purple-400 font-extrabold">
                              {Math.round(selectedKeyframe.keyframe.damping ?? 10)}
                            </span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="50"
                            step="0.5"
                            value={selectedKeyframe.keyframe.damping ?? 10}
                            onChange={(e) => {
                              const dampVal = parseFloat(e.target.value);
                              updateKeyframeProps(selectedKeyframe.trackId, selectedKeyframe.keyframe.id, { damping: dampVal });
                            }}
                            className="w-full accent-purple-600 h-1 rounded-lg cursor-pointer bg-zinc-200 dark:bg-zinc-700"
                          />
                        </div>
                      </div>
                    )}
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
              </div>
            </ScrollArea>
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
        )
      )}

      {contextMenu.visible && (
        <div
          className="absolute bg-zinc-950/95 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-1.5 w-48 text-left z-[100] animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-0.5 select-none"
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
              
              <div
                className="relative w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-zinc-300 hover:text-white hover:bg-purple-600 rounded-xl transition-colors cursor-pointer group"
                onMouseEnter={() => setHoveredSubmenu('easing')}
                onMouseLeave={() => setHoveredSubmenu(null)}
              >
                <div className="flex items-center gap-2">
                  <Activity className="h-3.5 w-3.5" />
                  <span>Change Easing</span>
                </div>
                <ChevronRight className="h-3 w-3 opacity-60" />

                {hoveredSubmenu === 'easing' && (
                  <div
                    className="absolute left-full top-0 ml-1 bg-zinc-950/95 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-1.5 w-48 text-left z-[110] animate-in fade-in slide-in-from-left-2 duration-100 flex flex-col gap-0.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-2.5 py-1 text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest border-b border-white/5 mb-1">
                      Standard Timing
                    </div>
                    {['linear', 'ease-in', 'ease-out', 'ease-in-out'].map((name) => (
                      <button
                        key={name}
                        onClick={() => {
                          handleUpdateEasing(contextMenu.trackId, contextMenu.keyframeId!, name);
                          setContextMenu((prev) => ({ ...prev, visible: false }));
                          setHoveredSubmenu(null);
                        }}
                        className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-zinc-400 hover:text-white hover:bg-purple-600 rounded-lg transition-colors pl-6 relative"
                      >
                        {activeElement?.tracks.find((t) => t.id === contextMenu.trackId)?.keyframes.find((k) => k.id === contextMenu.keyframeId)?.easing === name && (
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-purple-400" />
                        )}
                        {name}
                      </button>
                    ))}

                    <div className="px-2.5 py-1 text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest border-b border-white/5 my-1">
                      Spring Curves
                    </div>
                    {['spring-wobbly', 'spring-stiff', 'spring-slow', 'elastic'].map((name) => (
                      <button
                        key={name}
                        onClick={() => {
                          handleUpdateEasing(contextMenu.trackId, contextMenu.keyframeId!, name);
                          setContextMenu((prev) => ({ ...prev, visible: false }));
                          setHoveredSubmenu(null);
                        }}
                        className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-zinc-400 hover:text-white hover:bg-purple-600 rounded-lg transition-colors pl-6 relative"
                      >
                        {activeElement?.tracks.find((t) => t.id === contextMenu.trackId)?.keyframes.find((k) => k.id === contextMenu.keyframeId)?.easing === name && (
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-purple-400" />
                        )}
                        {name}
                      </button>
                    ))}

                    <div className="px-2.5 py-1 text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest border-b border-white/5 my-1">
                      Bounce Presets
                    </div>
                    {['bounce-in', 'bounce-out', 'bounce-in-out'].map((name) => (
                      <button
                        key={name}
                        onClick={() => {
                          handleUpdateEasing(contextMenu.trackId, contextMenu.keyframeId!, name);
                          setContextMenu((prev) => ({ ...prev, visible: false }));
                          setHoveredSubmenu(null);
                        }}
                        className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-zinc-400 hover:text-white hover:bg-purple-600 rounded-lg transition-colors pl-6 relative"
                      >
                        {activeElement?.tracks.find((t) => t.id === contextMenu.trackId)?.keyframes.find((k) => k.id === contextMenu.keyframeId)?.easing === name && (
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-purple-400" />
                        )}
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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

      {/* Glassmorphic Layer Context Menu */}
      {layerContextMenu && (() => {
        const targetEl = elements.find((el) => el.id === layerContextMenu.elementId);
        if (!targetEl) return null;
        return (
          <div
            className="absolute z-50 w-64 bg-zinc-950/95 border border-white/10 rounded-2xl shadow-2xl p-4 space-y-3.5 select-none animate-in fade-in slide-in-from-top-2 duration-150"
            style={{
              top: layerContextMenu.y,
              left: layerContextMenu.x,
            }}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="h-3 w-3 text-purple-400" /> Layer Options
              </span>
              <button
                onClick={() => setLayerContextMenu(null)}
                className="text-zinc-500 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-extrabold uppercase text-zinc-500 select-none block mb-1">Rename Layer</label>
                <input
                  type="text"
                  value={targetEl.name}
                  onChange={(e) => updateElementProps(targetEl.id, { name: e.target.value })}
                  className="w-full text-xs font-bold bg-zinc-900 text-white rounded-xl border border-white/10 px-2.5 py-1.5 shadow-sm focus:ring-1 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[9px] font-extrabold uppercase text-zinc-500 select-none block mb-1">Content Text</label>
                <input
                  type="text"
                  value={targetEl.text}
                  onChange={(e) => updateElementProps(targetEl.id, { text: e.target.value })}
                  className="w-full text-xs font-bold bg-zinc-900 text-white rounded-xl border border-white/10 px-2.5 py-1.5 shadow-sm focus:ring-1 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              {targetEl.type === 'image' && (
                <div>
                  <label className="text-[9px] font-extrabold uppercase text-zinc-500 select-none block mb-1">Image URL</label>
                  <input
                    type="text"
                    value={targetEl.imageUrl || ''}
                    onChange={(e) => updateElementProps(targetEl.id, { imageUrl: e.target.value })}
                    className="w-full text-xs font-bold bg-zinc-900 text-white rounded-xl border border-white/10 px-2.5 py-1.5 shadow-sm focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              )}

              {targetEl.type !== 'text' && targetEl.type !== 'star' && (
                <div>
                  <label className="text-[9px] font-extrabold uppercase text-zinc-500 select-none block mb-1">Theme Gradient</label>
                  <select
                    value={GRADIENT_PRESETS.find(p => targetEl.color.includes(p.classes.split(' ')[0] || ''))?.id || 'purple-indigo'}
                    onChange={(e) => {
                      const preset = GRADIENT_PRESETS.find(p => p.id === e.target.value);
                      if (preset) {
                        updateElementProps(targetEl.id, { color: preset.classes });
                      }
                    }}
                    className="w-full text-xs font-bold bg-zinc-900 text-white rounded-xl border border-white/10 px-2.5 py-1.5 shadow-sm focus:ring-1 focus:ring-purple-500 focus:outline-none cursor-pointer"
                  >
                    {GRADIENT_PRESETS.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-2 flex flex-col gap-2 border-t border-white/5">
                <Button
                  variant={activeTransformMode === 'free' ? 'primary' : 'secondary'}
                  size="sm"
                  className="w-full text-[10px] py-1.5 px-2 font-extrabold rounded-lg gap-1 justify-center border border-white/5"
                  onClick={() => {
                    setActiveElementId(targetEl.id);
                    setActiveTransformMode(prev => prev === 'free' ? 'none' : 'free');
                    setLayerContextMenu(null);
                  }}
                >
                  <Maximize className="h-3 w-3" />
                  {activeTransformMode === 'free' ? 'Sair Transformação Livre' : 'Transformação Livre'}
                </Button>
                <Button
                  variant={activeTransformMode === 'clip' ? 'primary' : 'secondary'}
                  size="sm"
                  className="w-full text-[10px] py-1.5 px-2 font-extrabold rounded-lg gap-1 justify-center border border-white/5"
                  onClick={() => {
                    setActiveElementId(targetEl.id);
                    setActiveTransformMode(prev => prev === 'clip' ? 'none' : 'clip');
                    setLayerContextMenu(null);
                  }}
                >
                  <Scissors className="h-3 w-3" />
                  {activeTransformMode === 'clip' ? 'Sair Ajuste de Clip' : 'Ajustar Clip'}
                </Button>
                
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 text-[10px] py-1.5 px-2 font-extrabold rounded-lg gap-1 justify-center bg-zinc-900 text-zinc-300 hover:text-white border border-white/5"
                    onClick={() => {
                      setActiveElementId(targetEl.id);
                      bringToFront();
                    }}
                    title="Bring Layer to Front"
                  >
                    <ArrowUp className="h-3 w-3 text-purple-500" />
                    Front
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 text-[10px] py-1.5 px-2 font-extrabold rounded-lg gap-1 justify-center bg-zinc-900 text-zinc-300 hover:text-white border border-white/5"
                    onClick={() => {
                      setActiveElementId(targetEl.id);
                      sendToBack();
                    }}
                    title="Send Layer to Back"
                  >
                    <ArrowDown className="h-3 w-3 text-purple-500" />
                    Back
                  </Button>
                </div>
                {selectedElementIds.length > 1 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full text-[10px] py-1.5 px-2 font-extrabold rounded-lg gap-1 justify-center bg-zinc-900 text-zinc-300 hover:text-white border border-white/5"
                    onClick={() => {
                      groupSelectedElements();
                      setLayerContextMenu(null);
                    }}
                  >
                    <Box className="h-3 w-3 text-purple-400" />
                    Group Selection
                  </Button>
                )}
                {(() => {
                  const parentCandidate = selectedElementIds.find((id) => id !== targetEl.id) || activeElementId;
                  const canNest = parentCandidate && parentCandidate !== targetEl.id && !wouldCreateParentCycleInTree(elements, targetEl.id, parentCandidate);
                  if (!canNest) return null;
                  return (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full text-[10px] py-1.5 px-2 font-extrabold rounded-lg gap-1 justify-center bg-zinc-900 text-zinc-300 hover:text-white border border-white/5"
                      onClick={() => {
                        const nextParent = parentCandidate;
                        if (!nextParent) return;
                        setElements((prev) => prev.map((el) => {
                          if (el.id !== targetEl.id) return el;
                          const parentFrame = resolveElementFrame(prev.find((item) => item.id === nextParent) || targetEl, timeMs);
                          const childFrame = resolveElementFrame(el, timeMs);
                          return {
                            ...el,
                            parentId: nextParent,
                            tracks: el.tracks.map((tr) => {
                              if (tr.channel === 'x') {
                                return { ...tr, keyframes: tr.keyframes.map((kf) => ({ ...kf, v: Number(kf.v) - (parentFrame.globalX - childFrame.globalX) })) };
                              }
                              if (tr.channel === 'y') {
                                return { ...tr, keyframes: tr.keyframes.map((kf) => ({ ...kf, v: Number(kf.v) - (parentFrame.globalY - childFrame.globalY) })) };
                              }
                              return tr;
                            }),
                          };
                        }));
                        setLayerContextMenu(null);
                      }}
                    >
                      <Box className="h-3 w-3 text-cyan-400" />
                      Nest Inside
                    </Button>
                  );
                })()}
                {targetEl.type === 'group' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full text-[10px] py-1.5 px-2 font-extrabold rounded-lg gap-1 justify-center bg-zinc-900 text-zinc-300 hover:text-white border border-white/5"
                    onClick={() => {
                      ungroupElement(targetEl.id);
                      setLayerContextMenu(null);
                    }}
                  >
                    <Scissors className="h-3 w-3 text-cyan-400" />
                    Ungroup
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full text-[10px] py-1.5 px-2 font-extrabold rounded-lg gap-1 justify-center bg-zinc-900 text-zinc-300 hover:text-white border border-white/5"
                  onClick={() => {
                    saveComponentPreset(targetEl.id);
                    setLayerContextMenu(null);
                  }}
                >
                  <Save className="h-3 w-3 text-emerald-400" />
                  Save as Component
                </Button>
              </div>

              {/* Text Customization */}
              {(targetEl.type === 'text' || targetEl.type === 'box' || targetEl.type === 'circle') && (
                <div className="pt-2 border-t border-white/5 space-y-2">
                  <span className="text-[9px] font-extrabold uppercase text-zinc-500 block">Text & Style</span>
                  
                  {targetEl.type === 'text' && (
                    <>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="text-[8px] font-bold text-zinc-500 block mb-0.5">Size</label>
                          <input
                            type="number"
                            value={targetEl.fontSize ?? 18}
                            onChange={(e) => updateElementProps(targetEl.id, { fontSize: Number(e.target.value) })}
                            className="w-full text-xs font-bold bg-zinc-900 text-white rounded-lg border border-white/10 px-2 py-1 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                            min={8}
                            max={200}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-[8px] font-bold text-zinc-500 block mb-0.5">Weight</label>
                          <select
                            value={targetEl.fontWeight ?? 800}
                            onChange={(e) => updateElementProps(targetEl.id, { fontWeight: Number(e.target.value) })}
                            className="w-full text-xs font-bold bg-zinc-900 text-white rounded-lg border border-white/10 px-2 py-1 focus:ring-1 focus:ring-purple-500 focus:outline-none cursor-pointer"
                          >
                            <option value={100}>Thin</option>
                            <option value={300}>Light</option>
                            <option value={400}>Regular</option>
                            <option value={500}>Medium</option>
                            <option value={600}>Semibold</option>
                            <option value={700}>Bold</option>
                            <option value={800}>ExtraBold</option>
                            <option value={900}>Black</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-[8px] font-bold text-zinc-500 block mb-0.5">Font Family</label>
                        <select
                          value={targetEl.fontFamily ?? 'Inter'}
                          onChange={(e) => updateElementProps(targetEl.id, { fontFamily: e.target.value })}
                          className="w-full text-xs font-bold bg-zinc-900 text-white rounded-lg border border-white/10 px-2 py-1 focus:ring-1 focus:ring-purple-500 focus:outline-none cursor-pointer"
                        >
                          <option value="Inter">Inter</option>
                          <option value="system-ui">System UI</option>
                          <option value="monospace">Monospace</option>
                          <option value="serif">Serif</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Courier New">Courier New</option>
                          <option value="Arial">Arial</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[8px] font-bold text-zinc-500 block mb-0.5">Text Color</label>
                        <input
                          type="color"
                          value={targetEl.color.startsWith('#') ? targetEl.color : '#ffffff'}
                          onChange={(e) => updateElementProps(targetEl.id, { color: e.target.value })}
                          className="w-full h-7 rounded-lg border border-white/10 bg-zinc-900 cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {(targetEl.type === 'box' || targetEl.type === 'circle') && (
                    <div>
                      <label className="text-[8px] font-bold text-zinc-500 block mb-0.5">Background Color</label>
                      <input
                        type="color"
                        value={targetEl.backgroundColor ?? '#a1a1aa'}
                        onChange={(e) => {
                          updateElementProps(targetEl.id, { backgroundColor: e.target.value });
                          setAnimatedColorAtTime(targetEl.id, e.target.value, 'background');
                        }}
                        className="w-full h-7 rounded-lg border border-white/10 bg-zinc-900 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Nesting / Hierarchy */}
              <div className="pt-2 border-t border-white/5 space-y-2">
                <span className="text-[9px] font-extrabold uppercase text-zinc-500 block">Hierarchy</span>
                
                {/* Nest Into options */}
                {getValidParentTargets(targetEl).length > 0 && (
                  <div>
                    <label className="text-[8px] font-bold text-zinc-500 block mb-0.5">Nest Into</label>
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          setElementParentPreservingPosition(targetEl.id, e.target.value);
                          setLayerContextMenu(null);
                        }
                      }}
                      className="w-full text-xs font-bold bg-zinc-900 text-white rounded-lg border border-white/10 px-2 py-1 focus:ring-1 focus:ring-purple-500 focus:outline-none cursor-pointer"
                    >
                      <option value="">Select parent...</option>
                      {getValidParentTargets(targetEl)
                        .map(el => (
                          <option key={el.id} value={el.id}>{el.name}</option>
                        ))
                      }
                    </select>
                  </div>
                )}

                {/* Remove from Parent */}
                {targetEl.parentId && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full text-[10px] py-1.5 px-2 font-extrabold rounded-lg gap-1 justify-center border border-white/5"
                    onClick={() => {
                      const frame = resolveElementTree(elements, timeMs).get(targetEl.id);
                      updateElementsState((prev) =>
                        prev.map((el) => {
                          if (el.id !== targetEl.id) return el;
                          const currentX = Number(valueAt(el.tracks.find((tr) => tr.channel === 'x')!, timeMs) || 0);
                          const currentY = Number(valueAt(el.tracks.find((tr) => tr.channel === 'y')!, timeMs) || 0);
                          return offsetElementPositionTracks(
                            { ...el, parentId: undefined },
                            (frame?.globalX ?? currentX) - currentX,
                            (frame?.globalY ?? currentY) - currentY
                          );
                        })
                      );
                      setLayerContextMenu(null);
                    }}
                  >
                    <ArrowUp className="h-3 w-3 text-cyan-400" />
                    Remove from Parent
                  </Button>
                )}

                {/* Duplicate Layer */}
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full text-[10px] py-1.5 px-2 font-extrabold rounded-lg gap-1 justify-center bg-zinc-900 text-zinc-300 hover:text-white border border-white/5"
                  onClick={() => {
                    const newId = `el-${Date.now().toString(36)}`;
                    const clonedTracks = targetEl.tracks.map(tr => ({
                      ...tr,
                      id: `tr-${tr.channel}-${uid()}`,
                      keyframes: tr.keyframes.map(kf => ({ ...kf, id: uid() })),
                    }));
                    const clone: AnimationStudioElement = {
                      ...targetEl,
                      id: newId,
                      name: `${targetEl.name} Copy`,
                      tracks: clonedTracks,
                      parentId: targetEl.parentId,
                    };
                    updateElementsState(prev => [...prev, clone]);
                    setActiveElementId(newId);
                    setSelectedElementIds([newId]);
                    setLayerContextMenu(null);
                  }}
                >
                  <Copy className="h-3 w-3 text-purple-400" />
                  Duplicate Layer
                </Button>
              </div>

              {elements.length > 1 && (
                <button
                  onClick={() => {
                    deleteElement(targetEl.id);
                    setLayerContextMenu(null);
                  }}
                  className="w-full mt-1.5 py-2 text-xs font-extrabold bg-red-950/40 text-red-400 hover:bg-red-900/60 hover:text-white rounded-xl border border-red-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete Layer
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* Stage Canvas Settings Context Menu */}
      {stageContextMenu && (
        <div
          className="absolute z-50 w-56 bg-zinc-950/95 border border-white/10 rounded-2xl shadow-2xl p-4 space-y-3.5 select-none animate-in fade-in zoom-in-95 duration-100"
          style={{
            top: stageContextMenu.y,
            left: stageContextMenu.x,
          }}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Grid3X3 className="h-3.5 w-3.5 text-purple-400" /> Stage Settings
            </span>
            <button
              onClick={() => setStageContextMenu(null)}
              className="text-zinc-500 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-[9px] font-extrabold uppercase text-zinc-500 select-none block mb-1.5">Background</span>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { id: 'dark', label: 'Dark', color: 'bg-zinc-950 border-white/10' },
                  { id: 'light', label: 'Light', color: 'bg-zinc-100 border-zinc-300' },
                  { id: 'slate', label: 'Slate', color: 'bg-slate-900 border-white/10' },
                  { id: 'purple', label: 'Purple', color: 'bg-purple-950 border-white/10' },
                  {
                    id: 'transparent',
                    label: 'Trans',
                    color: 'bg-white border-zinc-200 checkerboard-bg',
                    style: {
                      backgroundImage: 'conic-gradient(#ccc 0.25turn, #fff 0.25turn 0.5turn, #ccc 0.5turn 0.75turn, #fff 0.75turn)',
                      backgroundSize: '8px 8px',
                    }
                  },
                ].map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => {
                      setStageBg(bg.id as any);
                      setStageContextMenu(null);
                    }}
                    style={bg.style}
                    className={cn(
                      "h-7 rounded-lg border flex items-center justify-center text-[8px] font-bold transition-all hover:scale-105 active:scale-95 shadow-sm",
                      bg.color,
                      stageBg === bg.id
                        ? "ring-2 ring-purple-500 scale-105"
                        : "opacity-80 hover:opacity-100"
                    )}
                    title={bg.label}
                  >
                    {bg.id === 'transparent' ? 'Trans' : bg.label[0]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[9px] font-extrabold uppercase text-zinc-500 select-none block mb-1.5">Grid Overlay</span>
              <div className="flex flex-col gap-1">
                {[
                  { id: 'none', label: 'No Grid', icon: EyeOff },
                  { id: 'grid', label: 'Grid Lines', icon: Grid },
                  { id: 'dots', label: 'Dot Grid', icon: Grid3X3 },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setStageGrid(item.id as any);
                        setStageContextMenu(null);
                      }}
                      className={cn(
                        "w-full text-left px-2.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-between",
                        stageGrid === item.id
                          ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                          : "text-zinc-300 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5" />
                        {item.label}
                      </span>
                      {stageGrid === item.id && <Check className="h-3.5 w-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {isExportModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-[28px] shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in-50 zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-zinc-950/20">
              <div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  🚀 Export Animation Code
                </h3>
                <p className="text-xs font-bold text-zinc-400 mt-1">
                  Choose the target export type to sync with your dev stack
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="h-8 w-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 px-6 pt-4 pb-2 bg-zinc-950/10">
              {[
                { id: 'waapi', label: 'Standalone WAAPI', desc: 'Raw JavaScript' },
                { id: 'react', label: 'Pixon React', desc: '<Animotion> wrapper' },
                { id: 'css', label: 'Vanilla CSS', desc: '@keyframes & rules' },
                { id: 'lottie', label: 'JSON Lottie', desc: 'Bodymovin player' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setExportTab(tab.id as any)}
                  className={cn(
                    "flex flex-col items-start px-4 py-2.5 rounded-xl border transition-all text-left min-w-[140px] cursor-pointer",
                    exportTab === tab.id
                      ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/20"
                      : "bg-white/5 border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.08]"
                  )}
                >
                  <span className="text-xs font-extrabold">{tab.label}</span>
                  <span className={cn("text-[9px] font-bold mt-0.5", exportTab === tab.id ? "text-purple-200" : "text-zinc-500")}>
                    {tab.desc}
                  </span>
                </button>
              ))}
            </div>

            {/* Code Body */}
            <div className="flex-1 min-h-0 bg-black/45 border border-white/5 rounded-2xl mx-6 my-3 relative flex flex-col">
              <div className="absolute right-3 top-3 z-10">
                <Button
                  variant="primary"
                  size="sm"
                  className="gap-1.5 font-extrabold rounded-lg shadow-lg"
                  onClick={() => {
                    const code =
                      exportTab === 'waapi'
                        ? generateWAAPICode()
                        : exportTab === 'react'
                        ? generateReactCode()
                        : exportTab === 'css'
                        ? generateCSSKeyframes()
                        : generateLottieJSON();
                    navigator.clipboard.writeText(code).then(() => {
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    });
                  }}
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-green-300" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </Button>
              </div>

              <div className="flex-1 overflow-auto p-5 font-mono text-xs text-zinc-300 select-all leading-relaxed whitespace-pre scrollbar-thin text-left">
                {exportTab === 'waapi' && generateWAAPICode()}
                {exportTab === 'react' && generateReactCode()}
                {exportTab === 'css' && generateCSSKeyframes()}
                {exportTab === 'lottie' && generateLottieJSON()}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/5 bg-zinc-950/20 flex items-center justify-between px-6">
              <span className="text-[10px] font-bold text-zinc-500">
                💡 High-fidelity baked animations ready for copy/paste
              </span>
              <Button
                variant="secondary"
                size="sm"
                className="font-bold rounded-xl"
                onClick={() => setIsExportModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
