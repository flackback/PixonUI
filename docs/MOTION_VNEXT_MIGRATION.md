# Pixon Motion vNext Migration (breaking)

## Status de freeze (P0)
- Contrato público vNext congelado em `MOTION_VNEXT_VERSION = 1.0.0`.
- Referência de API/deprecações:
  - `C:\PROJETOS\PixonUI\packages\ui\src\motion\vnext-api.ts`
- Deprecações planejadas para remoção: **após 2026-09-30**.

## 1) Tempo numérico é **ms-only**

- Antes (legado): alguns fluxos aceitavam segundos e convertiam.
- Agora (vNext): **não há conversão automática**.

Exemplos:
- `duration: 0.6` ❌
- `duration: 600` ✅
- `stagger: 0.08` ❌
- `stagger: 80` ✅

## 2) `usePixonTransform` removido da API pública

- Antes:
  - `import { usePixonTransform } from '@pixonui/react'`
- Agora:
  - `import { useTransform } from '@pixonui/react'`

Exemplo:

```tsx
const y = useTransform(scrollYProgress, [0, 1], [0, -120]);
```

## 3) Scroll sem re-render por frame

- `usePixonScroll` segue como adapter de compatibilidade retornando `MotionValue`.
- Fluxo recomendado:
  - `useScroll` + `useTransform` + bind em `style`.

### `dragConstraints` (paridade Framer)
- vNext aceita constraints por objeto numérico **e** por `RefObject`:
  - `dragConstraints={{ left, right, top, bottom }}`
  - `dragConstraints={boundsRef}`
- A variante por `RefObject` calcula limites no `pointerdown` e compõe no canal `drag` (`--px-*-d`) sem conflito com base/hover/scroll.
- Paridade aplicada também nos componentes legados:
  - `Drag` (`components/interactions/Drag.tsx`)
  - `ReorderItem` (`components/interactions/Reorder.tsx`)

## 4) Timeline vNext (API curta)

Builder:
- `.to`, `.from`, `.fromTo`, `.set`
- `.label`, `.sync`, `.call`, `.then`, `.chain`
- `.scope(root)` para resolver seletores localmente

Controller retornado por `.play()`:
- `play`, `pause`, `resume`, `reverse`, `seek`, `finish`, `cancel`
- `setTimeScale`, `getTimeScale`, `scrub(progress)`, `getDuration`
- `bindScrub(motionValue, options?)`
- `finished` (Promise)

Factory options:
- `timeScale` (default `1`)
- `scrub` (default `false`, inicia pausada em `0`)
- `autoplay` (default `true`, ou `false` quando `scrub: true`)

Nested timeline:
- `addTimeline(child, { at, timeScale })`
- `nest((child) => { ... }, { at })`
- labels aninhadas propagáveis (`labelPrefix` / `propagateLabels`)

Scroll scrub oficial:
- `useScrubOnScroll(controller, { from, to, axis })`
- `controller.bindScrub(motionValue, { from, to })`

## 5) Scope automático React

Use `useTimelineScope` para animar seletores dentro de um container:

```tsx
const { ref, createTimeline } = useTimelineScope<HTMLDivElement>();

useEffect(() => {
  const run = createTimeline()
    .to('.title', [{ opacity: 0 }, { opacity: 1 }], { duration: 520 })
    .play();
  return () => run.cancel();
}, [createTimeline]);
```

## 6) Presets compostos por domínio

Use `createTimelineComposer`:

```tsx
const motion = createTimelineComposer({ easing: 'elite-out' });
const hero = motion.hero();
const cards = motion.cards({ stagger: 90 });
```

## 7) Preset unificado para timeline scroll-driven

Quando quiser contrato curto para timeline + scrub no mesmo objeto:

```tsx
const flow = scrollTimelinePreset('staggerSection', {
  duration: 620,
  stagger: 90,
  from: 0.15,
  to: 0.9,
});

const ctrl = timeline({ scrub: true })
  .add('.card', flow.timeline.keyframes, flow.timeline.options)
  .play();

useScrubOnScroll(ctrl, flow.scrub);
```
