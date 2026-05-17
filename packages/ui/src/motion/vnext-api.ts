export const MOTION_VNEXT_VERSION = '1.0.0';

export const MOTION_VNEXT_PUBLIC_API = Object.freeze({
  declarative: ['motion.*', 'initial', 'animate', 'exit', 'variants', 'transition', 'whileHover', 'whileTap', 'whileInView', 'drag', 'dragConstraints', 'dragMomentum'],
  hooks: ['useScroll', 'useTransform', 'useMotionValue', 'useSpring', 'useTimelineScope', 'useTimelineScrub', 'useScrubOnScroll'],
  timeline: ['timeline', 'timelineScoped', 'timelinePreset', 'scrollTimelinePreset', 'createTimelineComposer'],
  presets: ['revealOnScroll', 'parallax', 'staggerChildren', 'scrubOnScroll'],
});

export const MOTION_VNEXT_DEPRECATIONS = Object.freeze({
  Motion: 'Deprecated in vNext. Remove after 2026-09-30.',
  PixonMotion: 'Deprecated in vNext. Remove after 2026-09-30.',
  usePixonScroll: 'Legacy adapter. Prefer useScroll/useTransform.',
});
