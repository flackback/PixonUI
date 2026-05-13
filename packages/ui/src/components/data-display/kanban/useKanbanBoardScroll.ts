import { useState, useRef, useCallback } from 'react';

export function useKanbanBoardScroll() {
  const [isDraggingBoard, setIsDraggingBoard] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const boardRef = useRef<HTMLDivElement>(null);

  const handleBoardMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || 
        target.closest('[data-task-id]') || 
        target.closest('input, select, textarea') ||
        target.closest('.no-drag')) return;
    
    setIsDraggingBoard(true);
    setStartX(e.pageX - (boardRef.current?.offsetLeft || 0));
    setScrollLeft(boardRef.current?.scrollLeft || 0);
  };

  const handleBoardMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingBoard) return;
    e.preventDefault();
    const x = e.pageX - (boardRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (boardRef.current) {
      boardRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleBoardMouseUp = () => {
    setIsDraggingBoard(false);
  };

  return {
    boardRef,
    isDraggingBoard,
    handleBoardMouseDown,
    handleBoardMouseMove,
    handleBoardMouseUp
  };
}
