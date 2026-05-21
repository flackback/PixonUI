import React, { useEffect, useMemo, useState } from 'react';
import { Activity, Maximize2, Plus, Trash2, X } from 'lucide-react';
import { cn } from '../../../utils/cn';
import type { AnimationStudioKeyframe, AnimationStudioTrack } from '../AnimationStudio.types';
import { evaluateCustomCurve, getEasingFunction, parseCubicBezierString, parseCustomCurveString, serializeCustomCurve } from '../AnimationStudio.utils';

interface GraphEditorProps {
  track: AnimationStudioTrack;
  keyframe: AnimationStudioKeyframe;
  onChange: (updates: Partial<AnimationStudioKeyframe>) => void;
}

const DEFAULT_BEZIER: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

function isNumericTrack(track: AnimationStudioTrack) {
  return track.keyframes.every((kf) => typeof kf.v === 'number');
}

function sampleCurvePoints(easingFn: (t: number) => number) {
  return Array.from({ length: 6 }, (_, idx) => {
    const x = idx / 5;
    return { x, y: easingFn(x) };
  });
}

export function GraphEditor({ track, keyframe, onChange }: GraphEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const keyframes = useMemo(() => [...track.keyframes].sort((a, b) => a.t - b.t), [track.keyframes]);
  const currentIndex = keyframes.findIndex((kf) => kf.id === keyframe.id);
  const nextKeyframe = currentIndex >= 0 ? keyframes[currentIndex + 1] : undefined;
  const isSpring = keyframe.easing === 'spring-custom';
  const bezier = parseCubicBezierString(keyframe.easing) ?? DEFAULT_BEZIER;
  const customCurve = parseCustomCurveString(keyframe.easing);
  const easingFn = getEasingFunction(keyframe);
  const [points, setPoints] = useState(() => customCurve ?? sampleCurvePoints(easingFn));
  const [selectedPoint, setSelectedPoint] = useState(1);

  useEffect(() => {
    setPoints(parseCustomCurveString(keyframe.easing) ?? sampleCurvePoints(getEasingFunction(keyframe)));
  }, [keyframe.easing, keyframe.id]);

  if (!nextKeyframe || !isNumericTrack(track)) {
    return null;
  }

  const previewPoints = Array.from({ length: 33 }, (_, idx) => {
    const t = idx / 32;
    const v = easingFn(t);
    return `${12 + t * 176},${108 - v * 88}`;
  }).join(' ');

  const updateBezier = (index: number, axis: 'x' | 'y', raw: number) => {
    const next = [...bezier] as [number, number, number, number];
    next[index] = axis === 'x' ? Math.max(0, Math.min(1, raw)) : Math.max(-1.5, Math.min(2.5, raw));
    onChange({ easing: `cubic-bezier(${next.map((value) => Number(value.toFixed(3))).join(', ')})` });
  };

  const updatePoint = (index: number, patch: Partial<{ x: number; y: number }>) => {
    const next = points.map((p, i) => (i === index ? { ...p, ...patch } : p));
    next[0] = { ...next[0]!, x: 0 };
    next[next.length - 1] = { ...next[next.length - 1]!, x: 1 };
    const prevX = next[index - 1]?.x ?? 0;
    const nextX = next[index + 1]?.x ?? 1;
    next[index] = {
      ...next[index]!,
      x: Math.max(prevX + 0.001, Math.min(nextX - 0.001, next[index]!.x)),
    };
    const sorted = [...next].sort((a, b) => a.x - b.x);
    setPoints(sorted);
    onChange({ easing: serializeCustomCurve(sorted) });
  };

  const addPoint = () => {
    const insertAt = Math.min(points.length - 1, Math.max(1, selectedPoint));
    const prev = points[insertAt - 1]!;
    const next = points[insertAt]!;
    const x = (prev.x + next.x) / 2;
    const y = evaluateCustomCurve(points, x);
    const nextPoints = [...points.slice(0, insertAt), { x, y }, ...points.slice(insertAt)];
    setPoints(nextPoints);
    setSelectedPoint(insertAt);
    onChange({ easing: serializeCustomCurve(nextPoints) });
  };

  const removePoint = (index: number) => {
    if (points.length <= 2) return;
    const nextPoints = points.filter((_, i) => i !== index);
    setPoints(nextPoints);
    setSelectedPoint(Math.max(1, Math.min(selectedPoint, nextPoints.length - 1)));
    onChange({ easing: serializeCustomCurve(nextPoints) });
  };

  return (
    <div className="mt-3 rounded-2xl border border-zinc-200/70 dark:border-white/10 bg-zinc-50/70 dark:bg-black/30 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          <Activity className="h-3.5 w-3.5 text-purple-500" />
          Graph Editor
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold text-zinc-400">{track.label} segment</span>
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="inline-flex items-center gap-1 rounded-lg border border-zinc-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-950/50 px-2 py-1 text-[10px] font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/[0.04]"
            title="Expand graph editor"
          >
            <Maximize2 className="h-3 w-3" />
            Expand
          </button>
        </div>
      </div>

      <div className="relative h-32 overflow-hidden rounded-xl bg-white dark:bg-zinc-950/80">
        <svg viewBox="0 0 200 120" className="absolute inset-0 h-full w-full">
          <line x1="12" y1="108" x2="188" y2="108" className="stroke-zinc-200 dark:stroke-white/10" />
          <line x1="12" y1="20" x2="188" y2="20" className="stroke-zinc-200 dark:stroke-white/10" />
          <polyline points={previewPoints} fill="none" className="stroke-purple-500" strokeWidth="2.5" strokeLinecap="round" />
          {!isSpring && (
            <>
              <line x1="12" y1="108" x2={12 + bezier[0] * 176} y2={108 - bezier[1] * 88} className="stroke-purple-300 dark:stroke-purple-500/50" strokeDasharray="4 4" />
              <line x1="188" y1="20" x2={12 + bezier[2] * 176} y2={108 - bezier[3] * 88} className="stroke-purple-300 dark:stroke-purple-500/50" strokeDasharray="4 4" />
            </>
          )}
        </svg>
      </div>

      {isSpring ? (
        <p className="mt-2 text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
          Spring curves use mass, stiffness and damping controls below.
        </p>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            ['P1 X', 0, 'x'],
            ['P1 Y', 1, 'y'],
            ['P2 X', 2, 'x'],
            ['P2 Y', 3, 'y'],
          ].map(([label, index, axis]) => (
            <label key={label} className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
              <span className="w-8">{label}</span>
              <input
                type="range"
                min={axis === 'x' ? 0 : -1.5}
                max={axis === 'x' ? 1 : 2.5}
                step="0.01"
                value={bezier[index as number]}
                onChange={(e) => updateBezier(index as number, axis as 'x' | 'y', Number(e.target.value))}
                className={cn("min-w-0 flex-1 accent-purple-500")}
              />
            </label>
          ))}
        </div>
      )}

      {isExpanded && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" onClick={() => setIsExpanded(false)}>
          <div
            className="w-full max-w-4xl rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <div className="text-sm font-extrabold text-white">Graph Editor</div>
                <div className="text-[10px] font-bold text-zinc-400">{track.label} segment</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={addPoint}
                  className="inline-flex items-center gap-1 rounded-xl border border-purple-500/40 bg-purple-500/10 px-3 py-2 text-xs font-bold text-purple-200 hover:bg-purple-500/20"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add point
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-zinc-300 hover:bg-white/10"
                >
                  <X className="h-3.5 w-3.5" />
                  Close
                </button>
              </div>
            </div>

            <div className="grid gap-4 p-4 lg:grid-cols-[1fr_280px]">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
                <svg viewBox="0 0 200 120" className="h-[420px] w-full touch-none">
                  <line x1="12" y1="108" x2="188" y2="108" className="stroke-white/10" />
                  <line x1="12" y1="20" x2="188" y2="20" className="stroke-white/10" />
                  <polyline points={Array.from({ length: 65 }, (_, idx) => {
                    const t = idx / 64;
                    const v = easingFn(t);
                    return `${12 + t * 176},${108 - v * 88}`;
                  }).join(' ')} fill="none" className="stroke-purple-400" strokeWidth="2.75" strokeLinecap="round" />
                  {points.map((point, index) => (
                    <g key={`${index}-${point.x}-${point.y}`}>
                      <line
                        x1={12 + point.x * 176}
                        y1={108}
                        x2={12 + point.x * 176}
                        y2={108 - point.y * 88}
                        className="stroke-purple-300/30"
                        strokeDasharray="3 3"
                      />
                      <circle
                        cx={12 + point.x * 176}
                        cy={108 - point.y * 88}
                        r={selectedPoint === index ? 5 : 4}
                        className={selectedPoint === index ? "fill-purple-400 stroke-white" : "fill-zinc-900 stroke-purple-300"}
                        strokeWidth="1.5"
                        style={{ cursor: 'grab' }}
                        onPointerDown={(e) => {
                          const svg = e.currentTarget.ownerSVGElement;
                          if (!svg) return;
                          const rect = svg.getBoundingClientRect();
                          const startX = e.clientX;
                          const startY = e.clientY;
                          const startPoint = { ...point };
                          setSelectedPoint(index);
                          (e.currentTarget as SVGCircleElement).setPointerCapture(e.pointerId);
                          const onMove = (moveEvt: PointerEvent) => {
                            const dx = moveEvt.clientX - startX;
                            const dy = moveEvt.clientY - startY;
                            const nextX = Math.max(index === 0 ? 0 : 0.001, Math.min(index === points.length - 1 ? 1 : 0.999, startPoint.x + dx / rect.width));
                            const nextY = Math.max(-2, Math.min(3, startPoint.y - dy / rect.height));
                            updatePoint(index, { x: nextX, y: nextY });
                          };
                          const onUp = () => {
                            window.removeEventListener('pointermove', onMove);
                            window.removeEventListener('pointerup', onUp);
                          };
                          window.addEventListener('pointermove', onMove);
                          window.addEventListener('pointerup', onUp);
                        }}
                      />
                    </g>
                  ))}
                  <rect
                    x="12"
                    y="20"
                    width="176"
                    height="88"
                    fill="transparent"
                    style={{ cursor: 'crosshair' }}
                    onPointerDown={(e) => {
                      if (e.button !== 0) return;
                      const svg = e.currentTarget.ownerSVGElement;
                      if (!svg) return;
                      const rect = svg.getBoundingClientRect();
                      const x = Math.max(0, Math.min(1, ((((e.clientX - rect.left) / rect.width) * 200) - 12) / 176));
                      const y = Math.max(-2, Math.min(3, (108 - (((e.clientY - rect.top) / rect.height) * 120)) / 88));
                      const nextPoints = [...points, { x, y }].sort((a, b) => a.x - b.x);
                      setPoints(nextPoints);
                      setSelectedPoint(nextPoints.findIndex((p) => Math.abs(p.x - x) < 0.0001 && Math.abs(p.y - y) < 0.0001));
                      onChange({ easing: serializeCustomCurve(nextPoints) });
                    }}
                  />
                </svg>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                  <div className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">Points</div>
                  <div className="space-y-2 max-h-[360px] overflow-auto pr-1">
                    {points.map((point, index) => (
                      <div key={`${index}`} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center rounded-xl border border-white/10 bg-white/5 px-2 py-2">
                        <label className="text-[10px] font-bold text-zinc-400">
                          X
                          <input
                            type="number"
                            step="0.001"
                            min={index === 0 ? 0 : 0.001}
                            max={index === points.length - 1 ? 1 : 0.999}
                            value={point.x}
                            onChange={(e) => updatePoint(index, { x: Number(e.target.value) })}
                            className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950 px-2 py-1 text-xs text-white"
                          />
                        </label>
                        <label className="text-[10px] font-bold text-zinc-400">
                          Y
                          <input
                            type="number"
                            step="0.001"
                            min="-2"
                            max="3"
                            value={point.y}
                            onChange={(e) => updatePoint(index, { y: Number(e.target.value) })}
                            className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950 px-2 py-1 text-xs text-white"
                          />
                        </label>
                        <button
                          type="button"
                          disabled={points.length <= 2 || index === 0 || index === points.length - 1}
                          onClick={() => removePoint(index)}
                          className="h-8 w-8 rounded-lg border border-red-500/30 bg-red-500/10 text-red-200 disabled:opacity-30"
                          title="Delete point"
                        >
                          <Trash2 className="h-3.5 w-3.5 mx-auto" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
