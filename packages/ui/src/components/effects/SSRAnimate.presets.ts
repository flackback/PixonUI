import { SSRAnimateProps } from './SSRAnimate';

export type SSRAnimatePresetConfig = Pick<SSRAnimateProps, 'initial' | 'animate' | 'transition'>;

export const SSR_ANIMATE_PRESETS: Record<string, SSRAnimatePresetConfig> = {
  // Fade
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
  },
  fadeInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
  },
  fadeInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
  },

  // Slide
  slideInUp: {
    initial: { opacity: 1, y: '100%' },
    animate: { opacity: 1, y: '0%' },
  },
  slideInDown: {
    initial: { opacity: 1, y: '-100%' },
    animate: { opacity: 1, y: '0%' },
  },
  slideInLeft: {
    initial: { opacity: 1, x: '-100%' },
    animate: { opacity: 1, x: '0%' },
  },
  slideInRight: {
    initial: { opacity: 1, x: '100%' },
    animate: { opacity: 1, x: '0%' },
  },

  // Scale
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
  },
  scaleInBounce: {
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1 },
    transition: { easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
  },
  popIn: {
    initial: { opacity: 0, scale: 0.8, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    transition: { easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
  },
  zoomIn: {
    initial: { opacity: 0, scale: 1.2 },
    animate: { opacity: 1, scale: 1 },
    transition: { easing: 'ease-out' },
  },

  // Blur
  blurReveal: {
    initial: { opacity: 0, blur: 10 },
    animate: { opacity: 1, blur: 0 },
  },
  blurInUp: {
    initial: { opacity: 0, y: 20, blur: 10 },
    animate: { opacity: 1, y: 0, blur: 0 },
  },
  blurInScale: {
    initial: { opacity: 0, scale: 0.9, blur: 10 },
    animate: { opacity: 1, scale: 1, blur: 0 },
  },

  // Rotate/3D
  flipInX: {
    initial: { opacity: 0, rotateX: 90 },
    animate: { opacity: 1, rotateX: 0 },
  },
  flipInY: {
    initial: { opacity: 0, rotateY: 90 },
    animate: { opacity: 1, rotateY: 0 },
  },
  tiltIn: {
    initial: { opacity: 0, y: 20, rotate: -5 },
    animate: { opacity: 1, y: 0, rotate: 0 },
  },
  rotateIn: {
    initial: { opacity: 0, rotate: -180, scale: 0.5 },
    animate: { opacity: 1, rotate: 0, scale: 1 },
  },

  // Special
  typewriterReveal: {
    initial: { opacity: 0, x: -10, blur: 2 },
    animate: { opacity: 1, x: 0, blur: 0 },
    transition: { easing: 'steps(10)' },
  },
  glitchIn: {
    initial: { opacity: 0, skewX: 20, x: -10 },
    animate: { opacity: 1, skewX: 0, x: 0 },
    transition: { easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' },
  },
  elasticIn: {
    initial: { opacity: 0, scale: 0.3, rotate: -15 },
    animate: { opacity: 1, scale: 1, rotate: 0 },
    transition: { easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
  },
  magneticIn: {
    initial: { opacity: 0, y: -30, scale: 0.8 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
  },
};
