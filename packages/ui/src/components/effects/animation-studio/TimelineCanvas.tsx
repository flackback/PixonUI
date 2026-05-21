import React, { useEffect, useMemo, useRef } from 'react';
import type { AnimationStudioElement, AnimationStudioTrack } from '../AnimationStudio.types';

export type TimelineCanvasRow =
  | { type: 'element'; element: AnimationStudioElement; track: null }
  | { type: 'track'; element: AnimationStudioElement; track: AnimationStudioTrack };

export interface TimelineCanvasProps {
  rows: TimelineCanvasRow[];
  width: number;
  height: number;
  durationMs: number;
  pxPerMs: number;
  activeElementId: string;
  activeTrackId: string | null;
  selectedKeyframeId: string | null;
  selectedKeyframeIds: string[];
  selectionBox: { startX: number; startY: number; currentX: number; currentY: number } | null;
}

const LEFT_PAD = 16;
const LABEL_X = 44;
const SUMMARY_HEIGHT = 40;
const TRACK_HEIGHT = 32;

function drawDiamond(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, fill: string, stroke: string) {
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x, y + size);
  ctx.lineTo(x - size, y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawLabel(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, uppercase = false) {
  ctx.fillStyle = color;
  ctx.font = uppercase ? '800 10px ui-sans-serif, system-ui, sans-serif' : '700 11px ui-sans-serif, system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(uppercase ? text.toUpperCase() : text, x, y);
}

export function TimelineCanvas({
  rows,
  width,
  height,
  durationMs,
  pxPerMs,
  activeElementId,
  activeTrackId,
  selectedKeyframeId,
  selectedKeyframeIds,
  selectionBox,
}: TimelineCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

  const contentWidth = useMemo(() => Math.max(width, durationMs * pxPerMs + 64), [width, durationMs, pxPerMs]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = Math.max(1, Math.floor(contentWidth * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    canvas.style.width = `${contentWidth}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, contentWidth, height);

    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(0, 0, contentWidth, height);

    for (let sec = 0; sec <= durationMs / 1000; sec += 1) {
      const x = LEFT_PAD + sec * 1000 * pxPerMs;
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    let y = 0;
    rows.forEach((row) => {
      if (row.type === 'element') {
        const el = row.element;
        ctx.fillStyle = el.id === activeElementId ? 'rgba(168,85,247,0.08)' : 'rgba(255,255,255,0.015)';
        ctx.fillRect(0, y, contentWidth, SUMMARY_HEIGHT);

        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.beginPath();
        ctx.moveTo(0, y + SUMMARY_HEIGHT + 0.5);
        ctx.lineTo(contentWidth, y + SUMMARY_HEIGHT + 0.5);
        ctx.stroke();

        ctx.fillStyle = 'rgba(168,85,247,0.8)';
        ctx.beginPath();
        ctx.moveTo(18, y + 20);
        ctx.lineTo(24, y + 26);
        ctx.lineTo(30, y + 20);
        ctx.lineTo(24, y + 14);
        ctx.closePath();
        ctx.fill();

        drawLabel(ctx, el.name, LABEL_X, y + 20, el.id === activeElementId ? '#c084fc' : '#9ca3af', true);

        const times = new Set<number>();
        el.tracks.forEach((tr) => tr.keyframes.forEach((kf) => times.add(kf.t)));
        [...times].sort((a, b) => a - b).forEach((t) => {
          const x = LEFT_PAD + t * pxPerMs;
          drawDiamond(ctx, x, y + 20, 4, '#6b7280', '#111827');
        });

        y += SUMMARY_HEIGHT;
        return;
      }

      const tr = row.track;
      const isActive = tr.id === activeTrackId;
      ctx.fillStyle = isActive ? 'rgba(168,85,247,0.05)' : 'rgba(255,255,255,0.006)';
      ctx.fillRect(0, y, contentWidth, TRACK_HEIGHT);

      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.beginPath();
      ctx.moveTo(0, y + TRACK_HEIGHT + 0.5);
      ctx.lineTo(contentWidth, y + TRACK_HEIGHT + 0.5);
      ctx.stroke();

      drawLabel(ctx, tr.label, LABEL_X, y + 16, isActive ? '#d8b4fe' : '#a1a1aa');

      if (tr.keyframes.length >= 2) {
        const sorted = [...tr.keyframes].sort((a, b) => a.t - b.t);
        const tStart = sorted[0]?.t ?? 0;
        const tEnd = sorted[sorted.length - 1]?.t ?? 0;
        const left = LEFT_PAD + tStart * pxPerMs;
        const widthPx = Math.max(0, (tEnd - tStart) * pxPerMs);
        ctx.strokeStyle = 'rgba(168,85,247,0.15)';
        ctx.fillStyle = 'rgba(168,85,247,0.08)';
        ctx.beginPath();
        ctx.roundRect(left, y + 14.5, widthPx, 3.5, 3);
        ctx.fill();
        ctx.stroke();
      }

      tr.keyframes.forEach((kf) => {
        const x = LEFT_PAD + kf.t * pxPerMs;
        const isSelected = selectedKeyframeId === kf.id || selectedKeyframeIds.includes(kf.id);
        const fill = isSelected ? '#8b5cf6' : '#f4f4f5';
        const stroke = isSelected ? '#e9d5ff' : '#3f3f46';
        drawDiamond(ctx, x, y + 16, 5, fill, stroke);
      });

      y += TRACK_HEIGHT;
    });

    if (selectionBox) {
      const x1 = Math.min(selectionBox.startX, selectionBox.currentX);
      const y1 = Math.min(selectionBox.startY, selectionBox.currentY);
      const w = Math.abs(selectionBox.startX - selectionBox.currentX);
      const h = Math.abs(selectionBox.startY - selectionBox.currentY);
      ctx.fillStyle = 'rgba(168,85,247,0.08)';
      ctx.strokeStyle = 'rgba(168,85,247,0.9)';
      ctx.lineWidth = 1;
      ctx.fillRect(x1, y1, w, h);
      ctx.strokeRect(x1, y1, w, h);
    }
  }, [contentWidth, dpr, durationMs, height, pxPerMs, rows, activeElementId, activeTrackId, selectedKeyframeId, selectedKeyframeIds, selectionBox]);

  return <canvas ref={canvasRef} aria-hidden="true" />;
}
