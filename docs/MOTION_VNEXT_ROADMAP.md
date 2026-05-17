# Pixon Motion vNext Roadmap

## Goal
Make `motion.*` the simplest path for production-grade animation with:
- one time unit contract (`ms`)
- zero frame re-render by default
- stable presets for scroll/reveal/stagger

## Status
- **P0 completed**: time unification applied in `motion.*`, timeline and `usePixonAnimate` runtime normalization.
- **P1 completed**: timeline labels/callbacks, composition and motion E2E gate active.
- `usePixonScroll` already returns MotionValues (`useScroll` adapter), no `useState` loop per frame.
- **P2 completed**:
  - drag/inertia primitive disponível em `motion.*` via `drag`, `dragConstraints` (objeto e `RefObject`) e `dragMomentum`.
  - `parallax.source='container'` com `container` ref sem fallback silencioso para page.
  - canal adicional `drag` nos transform channels (`--px-*-d`) para composição aditiva sem conflito.

## P0 — Contract and Stability
### 1) Time unit unification (breaking)
- Canonical numeric timing unit is `ms` across `motion.*`, timeline and presets.
- Legacy second-like numbers (`0 < value < 20`) are dev-warned and auto-converted by `normalizeTimeMs`.
- Migration message format: `0.6 -> 600`.

### 2) Zero re-render scroll path
- `usePixonScroll` is a MotionValue adapter over `useScroll`.
- `useMotionValueValue` remains opt-in for render-bridge use cases.

### 3) Official presets (stable contract)
- `revealOnScroll({ distance, scale, duration, delay, amount, once, easing, rootMargin })`
- `parallax({ axis, from, to, speed, range, smooth, source, clamp })`
- `staggerChildren({ stagger, delayChildren, from, grid })`

### 4) Acceptance criteria
- No unit ambiguity in docs/examples for motion APIs.
- No per-frame React rerender in scroll/motion hooks by default.
- No keyframe unit warnings in preset-driven demos.

## P1 — Power Features
- Timeline labels (`label`, `atLabel`) and callbacks (`call`) for orchestration parity.
- Preset composition (`revealOnScroll + whileHover + animate`) with deterministic precedence.
- Playwright visual checks for flicker/regression on reveal/parallax/stagger flows.

## P2 — Advanced Interaction
- Drag/inertia primitives.
- Scroll container targeting parity for all preset paths.
- Extended additive transform channels for gesture/layout/scroll composition.

## Migration Checklist (vNext)
1. Replace second-based numbers with `ms` in transitions/presets.
2. Prefer `useScroll` + `useTransform`; keep `usePixonScroll` only for compatibility.
3. Use presets first, custom keyframes second.
4. Bridge MotionValues to React state only when UI text must update.
