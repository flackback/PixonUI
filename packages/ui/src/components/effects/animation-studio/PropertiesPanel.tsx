import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sliders, 
  PanelRightClose, 
  ChevronDown, 
  Plus, 
  Music, 
  ChevronRight, 
  Play, 
  Pause 
} from 'lucide-react';
import { Surface } from '../../../primitives/Surface';
import { Text } from '../../typography/Text';
import { Button } from '../../button/Button';
import { ScrollArea } from '../../data-display/ScrollArea';
import { cn } from '../../../utils/cn';
import { useAnimationStudio } from './AnimationStudioContext';
import { 
  valueAt, 
  sortKeyframes, 
  parsePathStandalone, 
  uid 
} from '../AnimationStudio.utils';
import type { 
  AnimationStudioChannel, 
  AnimationStudioKeyframe, 
  AnimationStudioTrack 
} from '../AnimationStudio.types';

// DraggablePropertyValue component for inline property scrubbing
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

export function PropertiesPanel() {
  const {
    showStage,
    isDrawerOpen,
    setIsDrawerOpen,
    openSections,
    setOpenSections,
    activeElement,
    activeElementId,
    activeTrackId,
    selectedKeyframeId,
    selectedKeyframeIds,
    updateElementsState,
    durationMs,
    timeMs,
    snapMs,
    updateKeyframeProps,
    addPathPoint,
    removePathPoint,
    audioUrl,
    setAudioUrl,
    audioName,
    setAudioName,
    audioRef,
    toggleKeyframeAtTime
  } = useAnimationStudio() as any;

  if (!showStage || !isDrawerOpen) return null;

  // Derive active track and selected keyframe locally
  const activeTrack = useMemo(() => {
    if (!activeElement) return undefined;
    return activeElement.tracks.find((t: AnimationStudioTrack) => t.id === activeTrackId) ?? activeElement.tracks[0];
  }, [activeElement, activeTrackId]);

  const selectedKeyframe = useMemo(() => {
    if (!selectedKeyframeId || !activeElement) return null;
    for (const tr of activeElement.tracks) {
      const kf = tr.keyframes.find((k: AnimationStudioKeyframe) => k.id === selectedKeyframeId);
      if (kf) return { trackId: tr.id, keyframe: kf };
    }
    return null;
  }, [activeElement?.tracks, selectedKeyframeId]);

  // Compatibility helper for parsePath
  const parsePath = (d: string) => parsePathStandalone(d);

  // Helper to check if a track has a keyframe at the current snapped time
  const hasKeyframeAtTime = (track: AnimationStudioTrack, t: number) => {
    const snappedT = Math.round(t / snapMs) * snapMs;
    return track.keyframes.some((kf) => Math.abs(kf.t - snappedT) < 1);
  };

  // Helper to add a track for a channel
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
      timeScale: 'Time Scale',
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
      timeScale: 1,
      d: "M 10 10 L 90 10 L 90 90 L 10 90 Z",
      cameraZoom: 1,
      cameraPanX: 0,
      cameraPanY: 0,
      cameraTilt: 0,
    };
    updateElementsState((prev: any[]) =>
      prev.map((el) => {
        if (el.id !== activeElementId) return el;
        if (el.tracks.some((tr: any) => tr.channel === channel)) return el;
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

  // Helper to update track value at time
  const updateTrackValueAtTime = (trackId: string, t: number, nextV: number | string) => {
    const snappedT = Math.round(t / snapMs) * snapMs;
    updateElementsState((prev: any[]) =>
      prev.map((el) => {
        if (el.id !== activeElementId) return el;
        const nextTracks = el.tracks.map((tr: any) => {
          if (tr.id !== trackId) return tr;
          const existingIndex = tr.keyframes.findIndex((kf: any) => Math.abs(kf.t - snappedT) < 1);
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

  const renderDrawerPropertyRow = (
    label: string,
    channel: AnimationStudioChannel,
    min: number,
    max: number,
    step: number,
    unit: string = ''
  ) => {
    const track = activeElement?.tracks.find((tr: any) => tr.channel === channel);
    if (!track) {
      return (
        <div className="flex items-center justify-between py-2.5 border-b border-zinc-100 dark:border-white/[0.04] transition-colors hover:bg-zinc-50/50 dark:hover:bg-white/[0.01] px-1 rounded-lg">
          <Text className="text-xs font-bold text-zinc-400 dark:text-zinc-500">{label}</Text>
          <Button
            variant="secondary"
            size="sm"
            className="h-7 gap-1 text-[10px] py-1 px-2.5 font-extrabold rounded-lg cursor-pointer"
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

  return (
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
              className="h-8 w-8 rounded-xl cursor-pointer"
              onClick={() => setIsDrawerOpen(false)}
              title="Close properties panel"
            >
              <PanelRightClose className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {/* TRANSFORM SECTION */}
            <div className="border border-zinc-200/50 dark:border-white/[0.04] rounded-2xl overflow-hidden bg-zinc-50/50 dark:bg-black/10">
              <button
                type="button"
                onClick={() => setOpenSections((s: any) => ({ ...s, transform: !s.transform }))}
                className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-white/[0.02] cursor-pointer"
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
                onClick={() => setOpenSections((s: any) => ({ ...s, filters: !s.filters }))}
                className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-white/[0.02] cursor-pointer"
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
                onClick={() => setOpenSections((s: any) => ({ ...s, motion: !s.motion }))}
                className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-white/[0.02] cursor-pointer"
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
                            updateElementsState((prev: any[]) =>
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
                                updateElementsState((prev: any[]) =>
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
                                updateElementsState((prev: any[]) =>
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
                                updateElementsState((prev: any[]) =>
                                  prev.map((el) => {
                                    if (el.id !== activeElement.id) return el;
                                    return {
                                      ...el,
                                      motionPath: undefined,
                                      tracks: el.tracks.filter(
                                        (t: any) => t.channel !== 'offsetDistance' && t.channel !== 'offsetRotate'
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
                onClick={() => setOpenSections((s: any) => ({ ...s, borders: !s.borders }))}
                className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-white/[0.02] cursor-pointer"
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
                onClick={() => setOpenSections((s: any) => ({ ...s, background: !s.background }))}
                className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-white/[0.02] cursor-pointer"
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
                  {renderDrawerPropertyRow('BG Position X', 'bgPosX', -200, 200, 1, 'px')}
                  {renderDrawerPropertyRow('BG Position Y', 'bgPosY', -200, 200, 1, 'px')}
                </div>
              )}
            </div>

            {/* SHADOWS SECTION */}
            <div className="border border-zinc-200/50 dark:border-white/[0.04] rounded-2xl overflow-hidden bg-zinc-50/50 dark:bg-black/10">
              <button
                type="button"
                onClick={() => setOpenSections((s: any) => ({ ...s, shadow: !s.shadow }))}
                className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-white/[0.02] cursor-pointer"
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
                onClick={() => setOpenSections((s: any) => ({ ...s, clip: !s.clip }))}
                className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-white/[0.02] cursor-pointer"
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
                onClick={() => setOpenSections((s: any) => ({ ...s, audio: !s.audio }))}
                className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-white/[0.02] cursor-pointer"
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
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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

                        toUpdate.forEach((id: string) => {
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
                      className="w-[140px] text-xs font-bold bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white rounded-xl border border-zinc-200 dark:border-white/10 px-2 py-1 cursor-pointer focus:ring-1 focus:ring-purple-500 focus:outline-none"
                    >
                      <optgroup label="Standard CSS Curves">
                        <option value="linear">Linear</option>
                        <option value="ease-in">Ease-In</option>
                        <option value="ease-out">Ease-Out</option>
                        <option value="ease-in-out">Ease-In-Out</option>
                      </optgroup>
                      <optgroup label="Advanced Physics (Springs)">
                        <option value="spring-wobbly">Spring Wobbly 🌀</option>
                        <option value="spring-stiff">Spring Stiff ⚡</option>
                        <option value="spring-slow">Spring Slow 🐢</option>
                        <option value="spring-custom">Spring Engine (WAAPI) ⚙️</option>
                      </optgroup>
                      <optgroup label="Penner Equations (Easings)">
                        <option value="ease-in-sine">Sine In</option>
                        <option value="ease-out-sine">Sine Out</option>
                        <option value="ease-in-out-sine">Sine In-Out</option>
                        <option value="ease-in-quad">Quad In</option>
                        <option value="ease-out-quad">Quad Out</option>
                        <option value="ease-in-out-quad">Quad In-Out</option>
                        <option value="ease-in-cubic">Cubic In</option>
                        <option value="ease-out-cubic">Cubic Out</option>
                        <option value="ease-in-out-cubic">Cubic In-Out</option>
                        <option value="ease-in-back">Back In</option>
                        <option value="ease-out-back">Back Out</option>
                        <option value="ease-in-out-back">Back In-Out</option>
                        <option value="ease-out-bounce">Bounce Out ⚽</option>
                        <option value="elastic">Elastic Out 🏹</option>
                        <option value="elite-out">Elite Out ✨</option>
                        <option value="elite-in-out">Elite In-Out 🌟</option>
                      </optgroup>
                    </select>
                  </div>

                  {selectedKeyframe.keyframe.easing === 'spring-custom' && (
                    <div className="mt-2 space-y-2 bg-white/40 dark:bg-black/35 border border-zinc-200/50 dark:border-white/[0.04] p-2.5 rounded-xl text-left">
                      <span className="text-[10px] font-extrabold uppercase text-purple-600 dark:text-purple-400 block mb-1">
                        WAAPI Spring Engine
                      </span>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-semibold text-zinc-500">Mass:</span>
                          <input
                            type="number"
                            value={selectedKeyframe.keyframe.mass ?? 1}
                            step="0.1"
                            min="0.1"
                            onChange={(e) => {
                              updateKeyframeProps(selectedKeyframe.trackId, selectedKeyframe.keyframe.id, { mass: parseFloat(e.target.value) || 1 });
                            }}
                            className="w-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded font-mono p-0.5"
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-semibold text-zinc-500">Stiffness:</span>
                          <input
                            type="number"
                            value={selectedKeyframe.keyframe.stiffness ?? 100}
                            step="5"
                            min="1"
                            onChange={(e) => {
                              updateKeyframeProps(selectedKeyframe.trackId, selectedKeyframe.keyframe.id, { stiffness: parseFloat(e.target.value) || 100 });
                            }}
                            className="w-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded font-mono p-0.5"
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-semibold text-zinc-500">Damping:</span>
                          <input
                            type="number"
                            value={selectedKeyframe.keyframe.damping ?? 10}
                            step="1"
                            min="1"
                            onChange={(e) => {
                              updateKeyframeProps(selectedKeyframe.trackId, selectedKeyframe.keyframe.id, { damping: parseFloat(e.target.value) || 10 });
                            }}
                            className="w-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded font-mono p-0.5"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </Surface>
  );
}
