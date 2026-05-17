---
name: pixon-stack-expert
description: Use quando o usuário quer especialista no stack do PixonUI (monorepo TS/React/Vite/Vitest/Tailwind/pnpm/Playwright) e no motor WAAPI, com debugging guiado por evidência local e execução eficiente de tokens.
---

# Pixon Stack Expert

## O que este skill cobre

- Monorepo `pnpm` com workspaces (`packages/*`).
- UI library `@pixonui/react` (`packages/ui`): componentes React + TypeScript.
- Preview app (`packages/preview`): Vite + Tailwind, catálogo via `registry.tsx`.
- Testes: Vitest (UI) e Playwright (e2e).
- Animação: WAAPI compositor-first (sem loop pesado no JS), com:
  - `Motion` (entrada/viewport/keyframes/spring pré-compilado)
  - `PixonMotion` + `usePixonAnimate` (API tipo Framer / variants / layout FLIP)
  - `utils/motion.ts` (spring, stagger, timeline, viewTransition, sheet)

## Como diagnosticar rápido (ordem)

1. **Descobrir a origem**:
   - `rg -n "<termo>" packages/ui/src packages/preview/src`
2. **Conferir contrato/props**:
   - Tipos e defaults no componente (ex.: `MotionProps`, `AnimateProps`).
3. **Verificar timing/units**:
   - vNext: `duration`/`delay`/`stagger` em **ms** (contrato único)
   - investigar warning de legado quando valor parecer segundos.
4. **Cancelar/persistir corretamente**:
   - Loops infinitos: cancelar no unmount; pausar via viewport quando necessário.
   - Evitar recriar animações a cada render sem necessidade.
5. **Validar com testes focados**:
   - UI: `cd packages/ui; pnpm vitest run <arquivo>`
   - Preview build: `cd packages/preview; pnpm build`

## Mapa rápido do motor de animação

- WAAPI base:
  - `packages/ui/src/hooks/usePixonAnimate.ts`
  - `packages/ui/src/utils/motion.ts`
- Motion declarativo (viewport/spring/keyframes):
  - `packages/ui/src/components/feedback/Motion.tsx`
- Motion tipo Framer (variants/layout/FLIP):
  - `packages/ui/src/components/effects/Animate.tsx`
  - `packages/ui/src/components/effects/LayoutGroup.tsx`
  - `packages/ui/src/components/effects/VariantContext.tsx`
- Preview/catálogo:
  - `packages/preview/src/registry.tsx`
  - `packages/preview/src/demos/*`

## Padrões de implementação recomendados

- Preferir **transform/opacity/filter** (GPU compositor).
- Evitar `getBoundingClientRect()` em loops; usar batching/queues quando necessário.
- Evitar passar props "shorthand" direto pra WAAPI; converter para `transform` (ou unidades).
- Em interações (hover/click): usar animações aditivas (`composite: 'add'`) quando fizer sentido.

## Modo econômico (quando pedido de rapidez + baixo custo)

- Ler no máximo os arquivos afetados por `rg`.
- Rodar apenas teste relacionado antes de qualquer suíte ampla.
- Escrever resposta em 4 blocos curtos: causa, patch, validação, próximo passo.

