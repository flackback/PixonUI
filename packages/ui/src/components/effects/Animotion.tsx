import React, { useEffect, useRef } from 'react';
import { valueAt } from './AnimationStudio';
import type { AnimationStudioTrack } from './AnimationStudio';

export interface AnimotionProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  tracks: AnimationStudioTrack[];
  durationMs: number;
  loop?: boolean;
  iterations?: number;
  autoplay?: boolean;
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  currentTimeMs?: number;
  className?: string;
  motionPath?: string;
  motionRotate?: string;
  camera?: boolean;
}

export function Animotion({
  children,
  tracks,
  durationMs,
  loop = false,
  iterations,
  autoplay = true,
  direction = 'normal',
  currentTimeMs = 0,
  className,
  style,
  motionPath,
  motionRotate,
  camera = false,
  ...props
}: AnimotionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationsRef = useRef<Animation[]>([]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || tracks.length === 0) return;

    // Clean up previous animations
    animationsRef.current.forEach((anim) => anim.cancel());
    animationsRef.current = [];

    // Optimize DOM node for animations with GPU acceleration
    el.style.willChange = 'transform, opacity, filter' + (motionPath ? ', offset-path, offset-distance' : '');

    // We will compile the tracks into a single Keyframe array or multiple animations
    // based on WAAPI Supreme Architect principles.
    // To ensure perfect synchronization and preserve custom easings, we bake the animation at 60fps.
    
    // 1. Generate baked times at 60fps (16.666ms)
    const FPS = 60;
    const frameMs = 1000 / FPS;
    const times: number[] = [];
    for (let t = 0; t <= durationMs; t += frameMs) {
      times.push(t);
    }
    if (times[times.length - 1] !== durationMs) {
      times.push(durationMs);
    }

    // 2. Build unified keyframes
    const keyframes: Keyframe[] = times.map((time) => {
      const frame: Keyframe = { offset: time / durationMs };
      const channels: Record<string, any> = {};

      for (const track of tracks) {
        channels[track.channel] = valueAt(track, time);
      }

      // Defaults
      const isCamera = camera || tracks.some((track) => track.channel === 'cameraZoom' || track.channel === 'cameraPanX' || track.channel === 'cameraPanY' || track.channel === 'cameraTilt');
      if (isCamera) {
        const zoom = channels.cameraZoom ?? 1;
        const panX = channels.cameraPanX ?? 0;
        const panY = channels.cameraPanY ?? 0;
        const tilt = channels.cameraTilt ?? 0;
        frame.transform = `translate3d(${-panX}px, ${-panY}px, 0px) scale(${zoom}) rotateX(${tilt}deg)`;
      } else {
        const x = channels.x ?? 0;
        const y = channels.y ?? 0;
        const scale = channels.scale ?? 1;
        const scaleX = channels.scaleX ?? 1;
        const scaleY = channels.scaleY ?? 1;
        const rotate = channels.rotate ?? 0;
        const rotateX = channels.rotateX ?? 0;
        const rotateY = channels.rotateY ?? 0;
        frame.transform = `translate3d(${x}px, ${y}px, 0px) scale(${scale * scaleX}, ${scale * scaleY}) rotate(${rotate}deg) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      }
      
      if (channels.opacity !== undefined) frame.opacity = channels.opacity;
      
      const filterParts: string[] = [];
      if (channels.blur) filterParts.push(`blur(${channels.blur}px)`);
      if (channels.brightness !== undefined && channels.brightness !== 100) filterParts.push(`brightness(${channels.brightness}%)`);
      if (channels.contrast !== undefined && channels.contrast !== 100) filterParts.push(`contrast(${channels.contrast}%)`);
      if (channels.grayscale) filterParts.push(`grayscale(${channels.grayscale}%)`);
      if (channels.hueRotate) filterParts.push(`hue-rotate(${channels.hueRotate}deg)`);
      if (channels.saturate !== undefined && channels.saturate !== 100) filterParts.push(`saturate(${channels.saturate}%)`);
      if (channels.sepia) filterParts.push(`sepia(${channels.sepia}%)`);
      
      if (filterParts.length > 0) {
        frame.filter = filterParts.join(' ');
      }

      if (channels.width !== undefined) frame.width = `${channels.width}px`;
      if (channels.height !== undefined) frame.height = `${channels.height}px`;
      
      if (channels.borderRadius !== undefined) {
        const br = channels.borderRadius;
        frame.borderTopLeftRadius = `${channels.borderRadiusTopLeft ?? br}px`;
        frame.borderTopRightRadius = `${channels.borderRadiusTopRight ?? br}px`;
        frame.borderBottomRightRadius = `${channels.borderRadiusBottomRight ?? br}px`;
        frame.borderBottomLeftRadius = `${channels.borderRadiusBottomLeft ?? br}px`;
      } else if (
        channels.borderRadiusTopLeft !== undefined ||
        channels.borderRadiusTopRight !== undefined ||
        channels.borderRadiusBottomRight !== undefined ||
        channels.borderRadiusBottomLeft !== undefined
      ) {
        frame.borderTopLeftRadius = `${channels.borderRadiusTopLeft ?? 0}px`;
        frame.borderTopRightRadius = `${channels.borderRadiusTopRight ?? 0}px`;
        frame.borderBottomRightRadius = `${channels.borderRadiusBottomRight ?? 0}px`;
        frame.borderBottomLeftRadius = `${channels.borderRadiusBottomLeft ?? 0}px`;
      }

      if (motionPath) {
        frame.offsetPath = motionPath;
        frame.offsetDistance = `${channels.offsetDistance ?? 0}%`;
        frame.offsetRotate = motionRotate || 'auto';
      }
      
      return frame;
    });

    // 4. Create WAAPI Animation
    const animation = el.animate(keyframes, {
      duration: durationMs,
      iterations: iterations ?? (loop ? Infinity : 1),
      fill: 'forwards',
      direction: direction,
      // The Supreme Architect specifies 'composite: add' for additive animations
      composite: 'replace', // For full tracks, 'replace' is generally safer unless stacking
    });

    if (!autoplay) {
      animation.cancel(); // Cancel WAAPI so React inline styles take over during scrub
    } else {
      const safeDuration = Math.max(1, durationMs);
      const safeTime = Math.min(safeDuration, Math.max(0, currentTimeMs));
      animation.currentTime = direction === 'reverse' || direction === 'alternate-reverse'
        ? safeDuration - safeTime
        : safeTime;
    }

    animationsRef.current.push(animation);

    return () => {
      animation.cancel();
    };
  }, [tracks, durationMs, loop, iterations, autoplay, direction, currentTimeMs, motionPath, motionRotate]);

  return (
    <div ref={containerRef} className={className} style={style} {...props}>
      {children}
    </div>
  );
}
