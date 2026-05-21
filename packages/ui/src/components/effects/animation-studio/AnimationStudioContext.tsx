import React, { createContext, useContext } from 'react';
import type {
  AnimationStudioChannel,
  AnimationStudioKeyframe,
  AnimationStudioTrack,
  AnimationStudioClip,
  AnimationStudioElement,
  GradientPreset,
  AnimationStudioProps
} from '../AnimationStudio.types';

export interface AnimationStudioHistory {
  past: AnimationStudioElement[][];
  present: AnimationStudioElement[];
  future: AnimationStudioElement[][];
}

export interface AnimationStudioContextProps {
  // Config & Props
  clip: AnimationStudioClip;
  onClipChange: (next: AnimationStudioClip) => void;
  snapMs: number;
  pxPerSecond: number;
  showStage: boolean;
  stage?: React.ReactNode;

  // Global Time & Dimensions
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  durationMs: number;
  currentPxPerSecond: number;
  pxPerMs: number;
  sidebarWidth: number;
  setSidebarWidth: React.Dispatch<React.SetStateAction<number>>;
  previewHeight: number;
  setPreviewHeight: React.Dispatch<React.SetStateAction<number>>;

  // History & Elements State
  history: AnimationStudioHistory;
  setHistory: React.Dispatch<React.SetStateAction<AnimationStudioHistory>>;
  elements: AnimationStudioElement[];
  setElements: (
    newElements: AnimationStudioElement[] | ((prev: AnimationStudioElement[]) => AnimationStudioElement[])
  ) => void;
  updateElementsState: (
    newElements: AnimationStudioElement[] | ((prev: AnimationStudioElement[]) => AnimationStudioElement[])
  ) => void;
  undo: () => void;
  redo: () => void;

  // Active & Selected Elements
  activeElementId: string;
  setActiveElementId: React.Dispatch<React.SetStateAction<string>>;
  selectedElementIds: string[];
  setSelectedElementIds: React.Dispatch<React.SetStateAction<string[]>>;
  activeElement: AnimationStudioElement | undefined;
  activeTrackId: string | null;
  setActiveTrackId: React.Dispatch<React.SetStateAction<string | null>>;

  // Playback Control
  timeMs: number;
  setTimeMs: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  togglePlay: () => void;
  loop: boolean;
  setLoop: React.Dispatch<React.SetStateAction<boolean>>;
  yoyo: boolean;
  setYoyo: React.Dispatch<React.SetStateAction<boolean>>;
  playDirection: 'forward' | 'reverse';
  setPlayDirection: React.Dispatch<React.SetStateAction<'forward' | 'reverse'>>;

  // Keyframes State
  selectedKeyframeId: string | null;
  setSelectedKeyframeId: React.Dispatch<React.SetStateAction<string | null>>;
  selectedKeyframeIds: string[];
  setSelectedKeyframeIds: React.Dispatch<React.SetStateAction<string[]>>;
  selectKeyframe: (kfId: string | null, isMulti?: boolean) => void;
  selectionBox: { startX: number; startY: number; currentX: number; currentY: number; } | null;
  setSelectionBox: React.Dispatch<React.SetStateAction<{ startX: number; startY: number; currentX: number; currentY: number; } | null>>;
  stageSelectionBox: { startX: number; startY: number; currentX: number; currentY: number; } | null;
  setStageSelectionBox: React.Dispatch<React.SetStateAction<{ startX: number; startY: number; currentX: number; currentY: number; } | null>>;

  // Drawer / UI Panels
  isDrawerOpen: boolean;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openSections: Record<string, boolean>;
  setOpenSections: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;

  // Context Menus
  layerContextMenu: {
    visible: boolean;
    x: number;
    y: number;
    elementId: string;
  } | null;
  setLayerContextMenu: React.Dispatch<React.SetStateAction<{
    visible: boolean;
    x: number;
    y: number;
    elementId: string;
  } | null>>;
  
  contextMenu: {
    visible: boolean;
    x: number;
    y: number;
    trackId: string;
    keyframeId?: string | null;
    timeMs?: number;
  };
  setContextMenu: React.Dispatch<React.SetStateAction<{
    visible: boolean;
    x: number;
    y: number;
    trackId: string;
    keyframeId?: string | null;
    timeMs?: number;
  }>>;
  copiedKeyframe: { v: string | number; easing?: string } | null;
  setCopiedKeyframe: React.Dispatch<React.SetStateAction<{ v: string | number; easing?: string } | null>>;
  hoveredSubmenu: 'easing' | 'actions' | null;
  setHoveredSubmenu: React.Dispatch<React.SetStateAction<'easing' | 'actions' | null>>;

  stageBg: 'dark' | 'light' | 'purple' | 'slate' | 'transparent';
  setStageBg: React.Dispatch<React.SetStateAction<'dark' | 'light' | 'purple' | 'slate' | 'transparent'>>;
  stageGrid: 'grid' | 'dots' | 'none';
  setStageGrid: React.Dispatch<React.SetStateAction<'grid' | 'dots' | 'none'>>;
  stageContextMenu: { visible: boolean; x: number; y: number } | null;
  setStageContextMenu: React.Dispatch<React.SetStateAction<{ visible: boolean; x: number; y: number } | null>>;

  // Audio State
  audioUrl: string | null;
  setAudioUrl: React.Dispatch<React.SetStateAction<string | null>>;
  audioName: string | null;
  setAudioName: React.Dispatch<React.SetStateAction<string | null>>;

  // Export Modal State
  isExportModalOpen: boolean;
  setIsExportModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  exportTab: 'waapi' | 'react' | 'css' | 'lottie';
  setExportTab: React.Dispatch<React.SetStateAction<'waapi' | 'react' | 'css' | 'lottie'>>;

  // Spring Physics Config
  springMass: number;
  setSpringMass: React.Dispatch<React.SetStateAction<number>>;
  springStiffness: number;
  setSpringStiffness: React.Dispatch<React.SetStateAction<number>>;
  springDamping: number;
  setSpringDamping: React.Dispatch<React.SetStateAction<number>>;

  // Snapping & Tools
  snapLines: { type: 'h' | 'v'; val: number; label?: string }[];
  setSnapLines: React.Dispatch<React.SetStateAction<{ type: 'h' | 'v'; val: number; label?: string }[]>>;
  isPhysicsActive: boolean;
  setIsPhysicsActive: React.Dispatch<React.SetStateAction<boolean>>;
  isRecordingPhysics: boolean;
  setIsRecordingPhysics: React.Dispatch<React.SetStateAction<boolean>>;
  activeTool: 'select' | 'hand' | 'brush';
  setActiveTool: React.Dispatch<React.SetStateAction<'select' | 'hand' | 'brush'>>;
  activeTransformMode: 'none' | 'free' | 'clip';
  setActiveTransformMode: React.Dispatch<React.SetStateAction<'none' | 'free' | 'clip'>>;
  editingTrackValue: { elementId: string; trackId: string; valStr: string; channel: AnimationStudioChannel } | null;
  setEditingTrackValue: React.Dispatch<React.SetStateAction<{ elementId: string; trackId: string; valStr: string; channel: AnimationStudioChannel } | null>>;

  // Panning & Brush Draw
  panOffset: { x: number; y: number };
  setPanOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  isDrawingBrush: boolean;
  setIsDrawingBrush: React.Dispatch<React.SetStateAction<boolean>>;
  brushPoints: { x: number; y: number }[];
  setBrushPoints: React.Dispatch<React.SetStateAction<{ x: number; y: number }[]>>;

  // UI Edit States
  copied: boolean;
  setCopied: React.Dispatch<React.SetStateAction<boolean>>;
  editingElementId: string | null;
  setEditingElementId: React.Dispatch<React.SetStateAction<string | null>>;
  editingName: string;
  setEditingName: React.Dispatch<React.SetStateAction<string>>;
  saveStatus: 'idle' | 'saving' | 'saved';
  setSaveStatus: React.Dispatch<React.SetStateAction<'idle' | 'saving' | 'saved'>>;
  previewZoom: number;
  setPreviewZoom: React.Dispatch<React.SetStateAction<number>>;

  // Refs
  audioRef: React.RefObject<HTMLAudioElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  timelineRef: React.RefObject<HTMLDivElement | null>;
  playheadLineRef: React.RefObject<HTMLDivElement | null>;
  playheadTimeRef: React.MutableRefObject<number>;
  playRafRef: React.MutableRefObject<number | null>;
  lastTsRef: React.MutableRefObject<number>;
  resizeRef: React.MutableRef<{ startX: number; startWidth: number } | null>;
  previewResizeRef: React.MutableRef<{ startY: number; startHeight: number } | null>;
  previousToolRef: React.MutableRef<'select' | 'hand' | 'brush'>;
  spacePressedRef: React.MutableRef<boolean>;

  // Elements Handlers
  addNewElement: (type: 'box' | 'circle' | 'text' | 'image' | 'star' | 'group') => void;
  addNewSvgBrushElement: (points: { x: number; y: number }[]) => void;
  removeElement: (elementId: string) => void;
  duplicateElement: (elementId: string) => void;
  
  // Track & Keyframe Actions
  addKeyframeAtPlayhead: (trackId: string) => void;
  removeKeyframe: (trackId: string, kfId: string) => void;
  toggleKeyframeAtTime: (trackId: string, timeMs: number) => void;
  updateKeyframeProps: (trackId: string, kfId: string, props: Partial<AnimationStudioKeyframe>) => void;
  updateElementTrackValue: (elementId: string, channel: AnimationStudioChannel, value: number | string) => void;
  handleUpdateEasing: (trackId: string, kfId: string, easingName: string) => void;
  handleCopyKeyframe: (trackId: string, kfId: string) => void;
  handlePasteKeyframe: (trackId: string, timeMs: number) => void;
  clearTrackKeyframes: (trackId: string) => void;

  // Interactivity / Drag Gestures
  startDragTranslate: (e: React.PointerEvent, elementId: string, currentX: number, currentY: number) => void;
  startDragScale: (e: React.PointerEvent, elementId: string, currentScale: number) => void;
  startDragRotate: (e: React.PointerEvent, elementId: string, currentRotate: number) => void;
  startDragClip: (e: React.PointerEvent, elementId: string, side: 'top' | 'right' | 'bottom' | 'left', val: number) => void;
  startDragKeyframe: (e: React.MouseEvent | React.PointerEvent, trackId: string, kfId: string, initialT: number) => void;
  onTimelineTrackAreaPointerDown: (e: React.PointerEvent) => void;
  startResizePreview: (e: React.PointerEvent) => void;
  onResizePreviewMove: (e: PointerEvent) => void;
  onResizePreviewUp: () => void;

  // Motion Paths Actions
  addPathPoint: (elementId: string, x: number, y: number) => void;
  updatePathPoint: (elementId: string, pointIdx: number, x: number, y: number) => void;
  removePathPoint: (elementId: string, pointIdx: number) => void;

  // Additional Drag & Element Update Handlers
  updateElementProps: (elementId: string, updates: Partial<AnimationStudioElement>) => void;
  startDragOrigin: (e: React.PointerEvent, elementId: string) => void;
  startDragBorderRadius: (e: React.PointerEvent, elementId: string, corner: 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft') => void;
  startDragPathPoint: (e: React.PointerEvent, elementId: string, pathStr: string, commandIndex: number, argIndex: number, startX: number, startY: number) => void;
}

export const AnimationStudioContext = createContext<AnimationStudioContextProps | null>(null);

export function useAnimationStudio() {
  const ctx = useContext(AnimationStudioContext);
  if (!ctx) {
    throw new Error('useAnimationStudio must be used within an AnimationStudioProvider');
  }
  return ctx;
}
