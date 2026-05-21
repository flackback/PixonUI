import React from 'react';

export type AnimationStudioChannel =
  | 'opacity' | 'x' | 'y' | 'scale' | 'rotate'
  | 'scaleX' | 'scaleY'
  | 'blur' | 'brightness' | 'contrast' | 'grayscale' | 'hueRotate' | 'saturate' | 'sepia'
  | 'zIndex' | 'rotateX' | 'rotateY'
  | 'originX' | 'originY'
  | 'shadowX' | 'shadowY' | 'shadowBlur' | 'shadowSpread' | 'shadowOpacity'
  | 'borderRadius' | 'borderRadiusTopLeft' | 'borderRadiusTopRight' | 'borderRadiusBottomRight' | 'borderRadiusBottomLeft'
  | 'borderTopWidth' | 'borderRightWidth' | 'borderBottomWidth' | 'borderLeftWidth'
  | 'borderColorH' | 'borderColorS' | 'borderColorL' | 'borderColorA'
  | 'bgH' | 'bgS' | 'bgL' | 'bgA' | 'bg2H' | 'bg2S' | 'bg2L' | 'bg2A' | 'bgAngle' | 'bgPosX' | 'bgPosY'
  | 'clipTop' | 'clipRight' | 'clipBottom' | 'clipLeft'
  | 'width' | 'height' | 'offsetDistance' | 'offsetRotate'
  | 'cameraZoom' | 'cameraPanX' | 'cameraPanY' | 'cameraTilt' | 'd';

export interface AnimationStudioKeyframe {
  id: string;
  t: number; // ms
  v: number | string;
  easing?: string;
  mass?: number;
  stiffness?: number;
  damping?: number;
}

export interface AnimationStudioTrack {
  id: string;
  label: string;
  channel: AnimationStudioChannel;
  keyframes: AnimationStudioKeyframe[];
}

export interface AnimationStudioClip {
  durationMs: number;
  tracks: AnimationStudioTrack[];
}

export interface AnimationStudioElement {
  id: string;
  name: string;
  type: 'box' | 'circle' | 'text' | 'image' | 'star' | 'group';
  text: string;
  color: string;
  imageUrl?: string;
  tracks: AnimationStudioTrack[];
  motionPath?: string;
  motionRotate?: string;
  borderRadiusTopLeft?: number;
  borderRadiusTopRight?: number;
  borderRadiusBottomRight?: number;
  borderRadiusBottomLeft?: number;
  parentId?: string;
  collapsed?: boolean;
  componentId?: string;
  isComponentRoot?: boolean;
  locked?: boolean;
  visible?: boolean;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  backgroundColor?: string;
}

export interface AnimationStudioComponentPreset {
  id: string;
  name: string;
  rootElementId: string;
  elements: AnimationStudioElement[];
}

export interface GradientPreset {
  id: string;
  name: string;
  classes: string;
}

export const GRADIENT_PRESETS: GradientPreset[] = [
  { id: 'purple-indigo', name: 'Nebula Purple', classes: 'from-purple-500 to-indigo-600 bg-gradient-to-br text-white' },
  { id: 'cyan-blue', name: 'Ocean Breeze', classes: 'from-cyan-400 to-blue-600 bg-gradient-to-br text-white' },
  { id: 'emerald-teal', name: 'Emerald Forest', classes: 'from-emerald-400 to-teal-600 bg-gradient-to-br text-white' },
  { id: 'orange-rose', name: 'Sunset Glow', classes: 'from-amber-400 to-rose-500 bg-gradient-to-br text-white' },
  { id: 'dark-grey', name: 'Carbon Black', classes: 'from-zinc-800 to-black bg-gradient-to-br text-white border border-white/10' },
  { id: 'glass', name: 'Frosted Glass', classes: 'bg-white/10 dark:bg-black/30 backdrop-blur-md border border-white/20 dark:border-white/10 text-zinc-900 dark:text-white shadow-xl' },
];

export interface AnimationStudioProps {
  clip: AnimationStudioClip;
  onClipChange: (next: AnimationStudioClip) => void;
  className?: string;
  initialTimeMs?: number;
  snapMs?: number;
  pxPerSecond?: number;
  showStage?: boolean;
  stage?: React.ReactNode;
}
