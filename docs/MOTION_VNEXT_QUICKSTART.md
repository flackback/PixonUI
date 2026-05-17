# Motion vNext Quickstart (fonte da verdade)

## 1) Unidade de tempo
- Toda API numérica usa **ms**.
- Exemplo: `duration: 600` (não `0.6`).

## 2) API principal
- Use `motion.*` como caminho padrão.
- Use `useScroll`, `useTransform`, `useMotionValue`, `useSpring` para fluxo sem re-render por frame.

## 3) Timeline
- Criar: `timeline().add(...).play()`
- Escopo: `useTimelineScope` / `timelineScoped`
- Nested: `.addTimeline(...)` / `.nest(...)`
- Scrub: `.scrub(progress)` ou `.bindScrub(motionValue)`

## 4) Scroll scrub 1-linha
```tsx
useScrubOnScroll(ctrl, { from: 0.1, to: 0.9 });
```

## 5) Presets oficiais
- `revealOnScroll`
- `parallax`
- `staggerChildren`
- `scrubOnScroll` (config helper)

## 6) Drag / inertia (P2)
```tsx
<motion.div
  drag="x"
  dragConstraints={{ left: -120, right: 120 }}
  dragMomentum
/>
```

## 7) Parallax com container
```tsx
const containerRef = useRef<HTMLDivElement>(null);

<motion.div
  parallax={{ source: 'container', container: containerRef, axis: 'y', from: 0, to: -80 }}
/>
```

## 8) Migração
- Ver `C:\PROJETOS\PixonUI\docs\MOTION_VNEXT_MIGRATION.md`
