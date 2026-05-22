import React, { useEffect, useRef, useState } from 'react';
import { Animotion } from './Animotion';
import { getChildren, getRootElements } from './AnimationStudio.utils';
import type { AnimationStudioElement } from './AnimationStudio.types';
import { cn } from '../../utils/cn';

export interface AnimatedSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  elements: AnimationStudioElement[];
  durationMs: number;
  loop?: boolean;
  autoplay?: boolean;
  yoyo?: boolean;
  animateOnView?: boolean;
  rootMargin?: string;
  threshold?: number;
}

function renderElementNode(el: AnimationStudioElement) {
  if (el.type === 'text') {
    return (
      <div
        className={cn('select-none tracking-tight', el.color?.startsWith('#') ? '' : el.color)}
        style={{
          fontSize: el.fontSize ? `${el.fontSize}px` : '18px',
          fontFamily: el.fontFamily || 'Inter',
          fontWeight: el.fontWeight || 800,
          color: el.color?.startsWith('#') ? el.color : undefined,
        }}
      >
        {el.text}
      </div>
    );
  }

  if (el.type === 'image') {
    return (
      <div className="relative h-[160px] w-[280px] overflow-hidden rounded-2xl border border-white/15 bg-zinc-900 shadow-lg">
        <img src={el.imageUrl} alt={el.name} className="h-full w-full select-none object-cover pointer-events-none" />
      </div>
    );
  }

  if (el.type === 'star') {
    return (
      <div className="flex h-[80px] w-[80px] items-center justify-center text-amber-400 select-none">
        <span className="text-4xl leading-none">★</span>
      </div>
    );
  }

  if (el.type === 'group') {
    return <div className="h-[1px] w-[1px]" />;
  }

  const baseRadius = el.type === 'circle' ? '9999px' : '18px';
  const baseSize = el.type === 'circle' ? '88px' : '220px';
  return (
    <div
      className={cn('border border-white/15 shadow-lg', el.color?.startsWith('#') ? '' : el.color)}
      style={{
        width: baseSize,
        height: el.type === 'circle' ? '88px' : '140px',
        backgroundColor: el.backgroundColor || (el.color?.startsWith('#') ? el.color : undefined),
        borderRadius: baseRadius,
      }}
    />
  );
}

function renderAnimatedElement(
  el: AnimationStudioElement,
  allElements: AnimationStudioElement[],
  durationMs: number,
  loop: boolean,
  autoplay: boolean,
  iterations: number,
  direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
) {
  if (el.visible === false || el.id === 'el-camera' || el.id === 'el-speed') return null;
  const children = getChildren(allElements, el.id).filter((child) => child.visible !== false);

  return (
    <Animotion
      key={el.id}
      tracks={el.tracks}
      durationMs={durationMs}
      loop={loop}
      iterations={iterations}
      autoplay={autoplay}
      direction={direction}
      motionPath={el.motionPath}
      motionRotate={el.motionRotate}
      className="absolute left-0 top-0"
    >
      <div className="relative h-full w-full overflow-visible">
        {renderElementNode(el)}
        {children.map((child) => renderAnimatedElement(child, allElements, durationMs, loop, autoplay, iterations, direction))}
      </div>
    </Animotion>
  );
}

export function AnimatedSection({
  elements,
  durationMs,
  loop = true,
  autoplay = true,
  yoyo = false,
  animateOnView = false,
  rootMargin = '0px 0px -10% 0px',
  threshold = 0.15,
  className,
  style,
  ...props
}: AnimatedSectionProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(!animateOnView);

  useEffect(() => {
    if (!animateOnView) {
      setIsInView(true);
      return;
    }

    const rootNode = rootRef.current;
    if (!rootNode || typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { root: null, rootMargin, threshold }
    );

    observer.observe(rootNode);
    return () => observer.disconnect();
  }, [animateOnView, rootMargin, threshold]);

  const camera = elements.find((el) => el.id === 'el-camera' && el.visible !== false);
  const roots = getRootElements(elements).filter((el) => el.id !== 'el-camera' && el.id !== 'el-speed' && el.visible !== false);
  const shouldPlay = autoplay && isInView;
  const iterations = yoyo ? (loop ? Infinity : 2) : (loop ? Infinity : 1);
  const direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse' = yoyo ? 'alternate' : 'normal';

  const content = (
    <>
      {roots.map((el) => renderAnimatedElement(el, elements, durationMs, loop, shouldPlay, iterations, direction))}
    </>
  );

  return (
    <div ref={rootRef} className={cn('relative overflow-hidden', className)} style={style} {...props}>
      {camera ? (
        <Animotion
          tracks={camera.tracks}
          durationMs={durationMs}
          loop={loop}
          iterations={iterations}
          autoplay={shouldPlay}
          direction={direction}
          camera
          className="absolute inset-0 pointer-events-none"
        >
          {content}
        </Animotion>
      ) : (
        content
      )}
    </div>
  );
}
