import React, { useMemo, useState } from 'react';
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Repeat, 
  ArrowLeftRight, 
  Type, 
  Square, 
  Disc, 
  Star, 
  Image as ImageIcon, 
  Activity, 
  Undo, 
  Redo, 
  Save, 
  Upload, 
  Download, 
  MousePointer2, 
  Hand, 
  Paintbrush, 
  ZoomIn, 
  ZoomOut, 
  Code,
  Sliders,
  PanelRightClose
} from 'lucide-react';
import { Surface } from '../../../primitives/Surface';
import { Text } from '../../typography/Text';
import { Button } from '../../button/Button';
import { ScrollArea } from '../../data-display/ScrollArea';
import { cn } from '../../../utils/cn';
import { useAnimationStudio } from './AnimationStudioContext';
import { Animotion } from '../Animotion';
import { 
  valueAt, 
  parsePathStandalone as parsePath, 
  serializePathStandalone as serializePath, 
  formatTime 
} from '../AnimationStudio.utils';
import type { 
  AnimationStudioChannel, 
  AnimationStudioKeyframe, 
  AnimationStudioTrack,
  AnimationStudioElement
} from '../AnimationStudio.types';

interface PathCommand {
  type: string;
  args: number[];
}

interface DraggablePoint {
  commandIndex: number;
  argIndex: number;
  x: number;
  y: number;
  label: string;
  isControlPoint: boolean;
}

export function StagePanel() {
  const {
    showStage,
    previewHeight,
    stageBg,
    stageGrid,
    setStageBg,
    setStageGrid,
    stageContextMenu,
    setStageContextMenu,
    activeTool,
    setActiveTool,
    previewZoom,
    setPreviewZoom,
    panOffset,
    setPanOffset,
    stage,
    elements,
    setElements,
    activeElementId,
    setActiveElementId,
    selectedElementIds,
    setSelectedElementIds,
    timeMs,
    setTimeMs,
    snapMs,
    durationMs,
    loop,
    setLoop,
    isPlaying,
    setIsPlaying,
    yoyo,
    playDirection,
    setPlayDirection,
    onClipChange,
    clip,
    copied,
    setCopied,
    editingElementId,
    setEditingElementId,
    saveStatus,
    setSaveStatus,
    snapLines,
    activeTransformMode,
    isDrawingBrush,
    setIsDrawingBrush,
    brushPoints,
    setBrushPoints,
    containerRef,
    audioUrl,
    audioRef,
    history,
    undo,
    redo,
    jumpToPrevKeyframe,
    jumpToNextKeyframe,
    setIsExportModalOpen,
    isPhysicsActive,
    setIsPhysicsActive,
    isRecordingPhysics,
    setIsRecordingPhysics,
    addNewSvgBrushElement,
    setSelectedKeyframeId,
    setLayerContextMenu,
    addPathPoint,
    updatePathPoint,
    removePathPoint,
    startDragTranslate,
    startDragScale,
    startDragRotate,
    startDragClip,
    startResizePreview,
    onResizePreviewMove,
    onResizePreviewUp,
    startDragPathPoint,
    startDragOrigin,
    startDragBorderRadius,
    updateElementProps,
    fileInputRef,
  } = useAnimationStudio() as any;

  if (!showStage) return null;

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

  const pointsToSvgPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0]?.x ?? 0} ${pts[0]?.y ?? 0}`;
    for (let i = 1; i < pts.length; i++) {
      d += ` L ${pts[i]?.x ?? 0} ${pts[i]?.y ?? 0}`;
    }
    return d;
  };

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

  const onStagePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;

    if (activeTool === 'hand') {
      e.stopPropagation();
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

    const initialSelectionBox = {
      startX,
      startY,
      currentX: startX,
      currentY: startY,
    };
    useAnimationStudio().setStageSelectionBox(initialSelectionBox);

    setSelectedElementIds([]);
    setActiveElementId('');

    const onPointerMove = (moveEvt: PointerEvent) => {
      const currentX = (moveEvt.clientX - rect.left) / previewZoom;
      const currentY = (moveEvt.clientY - rect.top) / previewZoom;
      useAnimationStudio().setStageSelectionBox((prev: any) => prev ? { ...prev, currentX, currentY } : null);
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      useAnimationStudio().setStageSelectionBox((box: any) => {
        if (!box) return null;
        const x1 = Math.min(box.startX, box.currentX);
        const x2 = Math.max(box.startX, box.currentX);
        const y1 = Math.min(box.startY, box.currentY);
        const y2 = Math.max(box.startY, box.currentY);
        const w = x2 - x1;
        const h = y2 - y1;

        if (w > 2 || h > 2) {
          const matchedElIds: string[] = [];

          elements.forEach((el: any) => {
            if (el.id === 'el-camera') return;
            const trackX = el.tracks.find((t: any) => t.channel === 'x');
            const trackY = el.tracks.find((t: any) => t.channel === 'y');
            const trackWidth = el.tracks.find((t: any) => t.channel === 'width');
            const trackHeight = el.tracks.find((t: any) => t.channel === 'height');
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

  const handleSaveToLocalStorage = () => {
    setSaveStatus('saving');
    try {
      localStorage.setItem('pixon_animation_studio_clip', JSON.stringify(clip));
      localStorage.setItem('pixon_animation_studio_elements', JSON.stringify(elements));
      setTimeout(() => setSaveStatus('saved'), 600);
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
      setSaveStatus('idle');
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        if (data.clip && data.elements) {
          onClipChange(data.clip);
          setElements(data.elements);
        }
      } catch (err) {}
    };
    reader.readAsText(file);
  };

  const handleExportJSON = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ clip, elements }, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `pixon-animation-${clip.name || 'unnamed'}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {}
  };

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
            onClick={() => setPlayDirection((d: any) => (d === 'forward' ? 'reverse' : 'forward'))}
            title="Toggle reverse playback"
          >
            <ArrowLeftRight className={cn('h-4 w-4 transition-transform', playDirection === 'reverse' && 'rotate-180 text-purple-300')} />
            {playDirection === 'forward' ? 'Forward' : 'Reverse'}
          </Button>

          <Button
            variant={loop ? 'primary' : 'secondary'}
            size="sm"
            className="gap-1.5 font-bold rounded-xl"
            onClick={() => setLoop((l: any) => !l)}
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

  return (
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
              setPreviewZoom((z: number) => Math.max(0.25, Math.min(2.0, z - e.deltaY * 0.001)));
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
                {elements.map((el: any) => {
                  if (!el.motionPath) return null;
                  const match = el.motionPath.match(/path\(['"]?([^'"]+)['"]?\)/);
                  const d = match ? match[1] : '';
                  if (!d) return null;
                  const isElSelected = el.id === activeElementId;
                  const commands = parsePath(d);
                  const draggablePoints = getDraggablePoints(commands);

                  const trackX = el.tracks.find((t: any) => t.channel === 'x');
                  const trackY = el.tracks.find((t: any) => t.channel === 'y');
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
                {snapLines.map((line: any, idx: number) => {
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
                const cameraEl = elements.find((el: any) => el.id === 'el-camera');
                const cameraTrackZoom = cameraEl?.tracks.find((t: any) => t.channel === 'cameraZoom');
                const cameraTrackPanX = cameraEl?.tracks.find((t: any) => t.channel === 'cameraPanX');
                const cameraTrackPanY = cameraEl?.tracks.find((t: any) => t.channel === 'cameraPanY');
                const cameraTrackTilt = cameraEl?.tracks.find((t: any) => t.channel === 'cameraTilt');

                const camZoom = cameraTrackZoom ? Number(valueAt(cameraTrackZoom, timeMs)) : 1;
                const camPanX = cameraTrackPanX ? Number(valueAt(cameraTrackPanX, timeMs)) : 0;
                const camPanY = cameraTrackPanY ? Number(valueAt(cameraTrackPanY, timeMs)) : 0;
                const camTilt = cameraTrackTilt ? Number(valueAt(cameraTrackTilt, timeMs)) : 0;

                const renderElementBody = (el: AnimationStudioElement) => {
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
                  const childElements = elements.filter((c: any) => c.parentId === el.id);

                  const renderChildren = () => childElements.map((child: any) => {
                    const cTrackX = child.tracks.find((t: any) => t.channel === 'x');
                    const cTrackY = child.tracks.find((t: any) => t.channel === 'y');
                    const cTrackScale = child.tracks.find((t: any) => t.channel === 'scale');
                    const cTrackScaleX = child.tracks.find((t: any) => t.channel === 'scaleX');
                    const cTrackScaleY = child.tracks.find((t: any) => t.channel === 'scaleY');
                    const cTrackRotate = child.tracks.find((t: any) => t.channel === 'rotate');
                    const cTrackOpacity = child.tracks.find((t: any) => t.channel === 'opacity');
                    const cTrackWidth = child.tracks.find((t: any) => t.channel === 'width');
                    const cTrackHeight = child.tracks.find((t: any) => t.channel === 'height');
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
                    const trackBorderRadius = el.tracks.find((t) => t.channel === 'borderRadius');
                    const trackBorderTopLeft = el.tracks.find((t) => t.channel === 'borderRadiusTopLeft');
                    const trackBorderTopRight = el.tracks.find((t) => t.channel === 'borderRadiusTopRight');
                    const trackBorderBottomRight = el.tracks.find((t) => t.channel === 'borderRadiusBottomRight');
                    const trackBorderBottomLeft = el.tracks.find((t) => t.channel === 'borderRadiusBottomLeft');
                    const valBorderRadius = trackBorderRadius ? valueAt(trackBorderRadius, timeMs) : 0;
                    const hasBorderRadiusTrack = !!trackBorderRadius || !!trackBorderTopLeft || !!trackBorderTopRight || !!trackBorderBottomRight || !!trackBorderBottomLeft || el.borderRadiusTopLeft !== undefined || el.borderRadiusTopRight !== undefined || el.borderRadiusBottomRight !== undefined || el.borderRadiusBottomLeft !== undefined;
                    const valBorderTopLeft = Number(trackBorderTopLeft ? valueAt(trackBorderTopLeft, timeMs) : (el.borderRadiusTopLeft !== undefined ? el.borderRadiusTopLeft : valBorderRadius));
                    const valBorderTopRight = Number(trackBorderTopRight ? valueAt(trackBorderTopRight, timeMs) : (el.borderRadiusTopRight !== undefined ? el.borderRadiusTopRight : valBorderRadius));
                    const valBorderBottomRight = Number(trackBorderBottomRight ? valueAt(trackBorderBottomRight, timeMs) : (el.borderRadiusBottomRight !== undefined ? el.borderRadiusBottomRight : valBorderRadius));
                    const valBorderBottomLeft = Number(trackBorderBottomLeft ? valueAt(trackBorderBottomLeft, timeMs) : (el.borderRadiusBottomLeft !== undefined ? el.borderRadiusBottomLeft : valBorderRadius));

                    const childStyle = {
                      borderTopLeftRadius: `${valBorderTopLeft}px`,
                      borderTopRightRadius: `${valBorderTopRight}px`,
                      borderBottomRightRadius: `${valBorderBottomRight}px`,
                      borderBottomLeftRadius: `${valBorderBottomLeft}px`,
                    };

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
                    const trackBorderRadius = el.tracks.find((t) => t.channel === 'borderRadius');
                    const trackBorderTopLeft = el.tracks.find((t) => t.channel === 'borderRadiusTopLeft');
                    const trackBorderTopRight = el.tracks.find((t) => t.channel === 'borderRadiusTopRight');
                    const trackBorderBottomRight = el.tracks.find((t) => t.channel === 'borderRadiusBottomRight');
                    const trackBorderBottomLeft = el.tracks.find((t) => t.channel === 'borderRadiusBottomLeft');
                    const valBorderRadius = trackBorderRadius ? valueAt(trackBorderRadius, timeMs) : 0;
                    const hasBorderRadiusTrack = !!trackBorderRadius || !!trackBorderTopLeft || !!trackBorderTopRight || !!trackBorderBottomRight || !!trackBorderBottomLeft || el.borderRadiusTopLeft !== undefined || el.borderRadiusTopRight !== undefined || el.borderRadiusBottomRight !== undefined || el.borderRadiusBottomLeft !== undefined;
                    const valBorderTopLeft = Number(trackBorderTopLeft ? valueAt(trackBorderTopLeft, timeMs) : (el.borderRadiusTopLeft !== undefined ? el.borderRadiusTopLeft : valBorderRadius));
                    const valBorderTopRight = Number(trackBorderTopRight ? valueAt(trackBorderTopRight, timeMs) : (el.borderRadiusTopRight !== undefined ? el.borderRadiusTopRight : valBorderRadius));
                    const valBorderBottomRight = Number(trackBorderBottomRight ? valueAt(trackBorderBottomRight, timeMs) : (el.borderRadiusBottomRight !== undefined ? el.borderRadiusBottomRight : valBorderRadius));
                    const valBorderBottomLeft = Number(trackBorderBottomLeft ? valueAt(trackBorderBottomLeft, timeMs) : (el.borderRadiusBottomLeft !== undefined ? el.borderRadiusBottomLeft : valBorderRadius));

                    const childStyle = {
                      borderTopLeftRadius: `${valBorderTopLeft}px`,
                      borderTopRightRadius: `${valBorderTopRight}px`,
                      borderBottomRightRadius: `${valBorderBottomRight}px`,
                      borderBottomLeftRadius: `${valBorderBottomLeft}px`,
                    };

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
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      transform: `scale(${camZoom}) translate(${-camPanX}px, ${-camPanY}px) rotateX(${camTilt}deg)`,
                      transformOrigin: 'center',
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    {elements.filter((el: any) => !el.parentId).map((el: any) => {
                      if (el.id === 'el-camera') return null; // Hide camera layer visually!
                      const isElActive = el.id === activeElementId;
                      const isElSelected = selectedElementIds.includes(el.id);
                      const isSelected = isElSelected;
                      const trackX = el.tracks.find((t: any) => t.channel === 'x');
                      const trackY = el.tracks.find((t: any) => t.channel === 'y');
                      const trackScale = el.tracks.find((t: any) => t.channel === 'scale');
                      const trackScaleX = el.tracks.find((t: any) => t.channel === 'scaleX');
                      const trackScaleY = el.tracks.find((t: any) => t.channel === 'scaleY');
                      const trackRotate = el.tracks.find((t: any) => t.channel === 'rotate');
                      const trackOpacity = el.tracks.find((t: any) => t.channel === 'opacity');

                      const valX = Number(trackX ? valueAt(trackX, timeMs) : 0);
                      const valY = Number(trackY ? valueAt(trackY, timeMs) : 0);
                      const valScale = Number(trackScale ? valueAt(trackScale, timeMs) : 1);
                      const valScaleX = Number(trackScaleX ? valueAt(trackScaleX, timeMs) : 1);
                      const valScaleY = Number(trackScaleY ? valueAt(trackScaleY, timeMs) : 1);
                      const valRotate = Number(trackRotate ? valueAt(trackRotate, timeMs) : 0);
                      const valOpacity = Number(trackOpacity ? valueAt(trackOpacity, timeMs) : 1);

                      const trackBlur = el.tracks.find((t: any) => t.channel === 'blur');
                      const trackBrightness = el.tracks.find((t: any) => t.channel === 'brightness');
                      const trackContrast = el.tracks.find((t: any) => t.channel === 'contrast');
                      const trackGrayscale = el.tracks.find((t: any) => t.channel === 'grayscale');
                      const trackHueRotate = el.tracks.find((t: any) => t.channel === 'hueRotate');
                      const trackSaturate = el.tracks.find((t: any) => t.channel === 'saturate');
                      const trackSepia = el.tracks.find((t: any) => t.channel === 'sepia');

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
                      const trackZIndex = el.tracks.find((t: any) => t.channel === 'zIndex');
                      const trackRotateX = el.tracks.find((t: any) => t.channel === 'rotateX');
                      const trackRotateY = el.tracks.find((t: any) => t.channel === 'rotateY');
                      const trackOriginX = el.tracks.find((t: any) => t.channel === 'originX');
                      const trackOriginY = el.tracks.find((t: any) => t.channel === 'originY');
                      const trackShadowX = el.tracks.find((t: any) => t.channel === 'shadowX');
                      const trackShadowY = el.tracks.find((t: any) => t.channel === 'shadowY');
                      const trackShadowBlur = el.tracks.find((t: any) => t.channel === 'shadowBlur');
                      const trackShadowSpread = el.tracks.find((t: any) => t.channel === 'shadowSpread');
                      const trackShadowOpacity = el.tracks.find((t: any) => t.channel === 'shadowOpacity');
                      const trackBorderRadius = el.tracks.find((t: any) => t.channel === 'borderRadius');
                      const trackBorderTopWidth = el.tracks.find((t: any) => t.channel === 'borderTopWidth');
                      const trackBorderRightWidth = el.tracks.find((t: any) => t.channel === 'borderRightWidth');
                      const trackBorderBottomWidth = el.tracks.find((t: any) => t.channel === 'borderBottomWidth');
                      const trackBorderLeftWidth = el.tracks.find((t: any) => t.channel === 'borderLeftWidth');
                      const trackBorderColorH = el.tracks.find((t: any) => t.channel === 'borderColorH');
                      const trackBorderColorS = el.tracks.find((t: any) => t.channel === 'borderColorS');
                      const trackBorderColorL = el.tracks.find((t: any) => t.channel === 'borderColorL');
                      const trackBorderColorA = el.tracks.find((t: any) => t.channel === 'borderColorA');
                      const trackBgH = el.tracks.find((t: any) => t.channel === 'bgH');
                      const trackBgS = el.tracks.find((t: any) => t.channel === 'bgS');
                      const trackBgL = el.tracks.find((t: any) => t.channel === 'bgL');
                      const trackBgA = el.tracks.find((t: any) => t.channel === 'bgA');
                      const trackBgPosX = el.tracks.find((t: any) => t.channel === 'bgPosX');
                      const trackBgPosY = el.tracks.find((t: any) => t.channel === 'bgPosY');
                      const trackClipTop = el.tracks.find((t: any) => t.channel === 'clipTop');
                      const trackClipRight = el.tracks.find((t: any) => t.channel === 'clipRight');
                      const trackClipBottom = el.tracks.find((t: any) => t.channel === 'clipBottom');
                      const trackClipLeft = el.tracks.find((t: any) => t.channel === 'clipLeft');

                      // NEW CHANNELS
                      const trackWidth = el.tracks.find((t: any) => t.channel === 'width');
                      const trackHeight = el.tracks.find((t: any) => t.channel === 'height');
                      const trackOffsetDistance = el.tracks.find((t: any) => t.channel === 'offsetDistance');
                      const trackOffsetRotate = el.tracks.find((t: any) => t.channel === 'offsetRotate');

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
                      const valBgPosX = trackBgPosX ? valueAt(trackBgPosX, timeMs) : 0;
                      const valBgPosY = trackBgPosY ? valueAt(trackBgPosY, timeMs) : 0;
                      const valClipTop = Number(trackClipTop ? valueAt(trackClipTop, timeMs) : 0);
                      const valClipRight = Number(trackClipRight ? valueAt(trackClipRight, timeMs) : 0);
                      const valClipBottom = Number(trackClipBottom ? valueAt(trackClipBottom, timeMs) : 0);
                      const valClipLeft = Number(trackClipLeft ? valueAt(trackClipLeft, timeMs) : 0);

                      // NEW VALUES
                      const valWidth = Number(trackWidth ? valueAt(trackWidth, timeMs) : (el.type === 'box' || el.type === 'circle' ? 100 : el.type === 'image' ? 120 : el.type === 'star' ? 80 : 0));
                      const valHeight = Number(trackHeight ? valueAt(trackHeight, timeMs) : (el.type === 'box' || el.type === 'circle' ? 100 : el.type === 'image' ? 80 : el.type === 'star' ? 80 : 0));
                      const valOffsetDistance = trackOffsetDistance ? valueAt(trackOffsetDistance, timeMs) : 0;
                      const valOffsetRotate = trackOffsetRotate ? valueAt(trackOffsetRotate, timeMs) : 0;

                      const trackBorderTopLeft = el.tracks.find((t: any) => t.channel === 'borderRadiusTopLeft');
                      const trackBorderTopRight = el.tracks.find((t: any) => t.channel === 'borderRadiusTopRight');
                      const trackBorderBottomRight = el.tracks.find((t: any) => t.channel === 'borderRadiusBottomRight');
                      const trackBorderBottomLeft = el.tracks.find((t: any) => t.channel === 'borderRadiusBottomLeft');

                      const hasBgTrack = trackBgH || trackBgS || trackBgL || trackBgA || trackBgPosX || trackBgPosY;
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
                          offsetRotate: el.motionRotate || 'auto',
                        } : {}),
                      };

                      const visualStyle: React.CSSProperties = {
                        opacity: valOpacity,
                        filter: filterString,
                        ...(hasBgTrack ? {
                          backgroundColor: `hsla(${valBgH}, ${valBgS}%, ${valBgL}%, ${valBgA})`,
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
                        backgroundColor: visualStyle.backgroundColor,
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

                      return (
                        <Animotion
                          key={el.id}
                          tracks={el.tracks}
                          durationMs={durationMs}
                          loop={loop}
                          autoplay={isPlaying}
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
                              {renderElementBody(el)}
                            </div>
                          ) : (
                            renderElementBody(el)
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
            </div>
          )}
        </div>
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
      {renderBottomToolbar()}
    </Surface>
  );
}
