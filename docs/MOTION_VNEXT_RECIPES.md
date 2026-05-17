# Motion vNext Recipes

## Reveal on scroll
```tsx
<motion.div revealOnScroll={{ delay: 120, amount: 0.3 }} />
```

## Timeline com labels
```ts
timeline()
  .label('intro', 120)
  .to('.title', [{ opacity: 0 }, { opacity: 1 }], { duration: 520, at: 'intro' })
  .play();
```

## Nested timeline
```ts
const child = timeline().to('.chip', [{ opacity: 0 }, { opacity: 1 }], { duration: 300, at: 80 });
timeline().addTimeline(child, { at: 100, label: 'hero', timeScale: 1.5 }).play();
```

## Scrub com MotionValue
```tsx
const ctrl = timeline({ scrub: true }).add('.hero', [{ opacity: 0 }, { opacity: 1 }], { duration: 700 }).play();
useTimelineScrub(ctrl, scrollYProgress, { from: 0.1, to: 0.85 });
```

## Scrub por scroll (1-linha)
```tsx
useScrubOnScroll(ctrl, { from: 0.2, to: 0.9 });
```

