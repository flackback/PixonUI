import type { RefObject } from 'react';

export type DragConstraintBox = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};

export type DragConstraintInput = DragConstraintBox | RefObject<HTMLElement | null>;

export function isDragConstraintRef(value: DragConstraintInput | undefined): value is RefObject<HTMLElement | null> {
  return !!value && typeof value === 'object' && 'current' in value;
}

export function resolveDragConstraintBounds(
  value: DragConstraintInput | undefined,
  subjectEl: HTMLElement | null,
  currentX: number,
  currentY: number,
): DragConstraintBox | null {
  if (!value) return null;
  if (!isDragConstraintRef(value)) return value;
  const containerEl = value.current;
  if (!containerEl || !subjectEl) return null;

  const containerRect = containerEl.getBoundingClientRect();
  const subjectRect = subjectEl.getBoundingClientRect();
  return {
    left: currentX + (containerRect.left - subjectRect.left),
    right: currentX + (containerRect.right - subjectRect.right),
    top: currentY + (containerRect.top - subjectRect.top),
    bottom: currentY + (containerRect.bottom - subjectRect.bottom),
  };
}
