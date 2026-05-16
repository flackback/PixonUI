---
name: pixon-surgical
description: Use quando o usuário quer mudanças cirúrgicas no PixonUI com máxima eficiência de tokens: diffs mínimos, leitura seletiva de arquivos, validação focada e comunicação objetiva.
---

# Pixon Surgical (Token Efficient)

## Objetivo

Fazer mudanças **mínimas e corretas** no código do PixonUI, com **baixa verbosidade** e foco em **estabilidade/performance**.

## Regras de execução (sempre)

- **Não reescreva** componentes/arquivos inteiros; preferir patches pequenos.
- **Preferir confirmação por evidência local**: `rg` antes de abrir arquivos grandes.
- **Leia só o necessário**: `Get-Content ... | Select-Object -Skip/-First` (janelas pequenas).
- **Evite contexto repetido**: não cole trechos longos; referencie `path:line`.
- **Sem “gold plating”**: não corrigir coisas não relacionadas ao pedido.
- **Saída curta**: no final, 3–6 bullets com o que mudou + paths.

## Fluxo recomendado

1. **Narrow scope**: identificar o arquivo/símbolo responsável via `rg`.
2. **Repro curto** (se aplicável): localizar teste existente; se não houver, criar um teste pequeno.
3. **Patch cirúrgico**: corrigir causa raiz; evitar efeitos colaterais.
4. **Validação mínima**:
   - Preferir `pnpm vitest run <arquivos>` no `packages/ui`.
   - Se o problema for de build/TS, rodar `pnpm -w -r test` só se necessário.
5. **Resumo final objetivo**: o que foi alterado e como testar.

## Padrões específicos do repo

- Buscar animações/motion em:
  - `packages/ui/src/components/feedback/Motion.tsx`
  - `packages/ui/src/components/effects/Animate.tsx`
  - `packages/ui/src/hooks/usePixonAnimate.ts`
  - `packages/ui/src/utils/motion.ts`
- Preview/demos em:
  - `packages/preview/src/registry.tsx`
  - `packages/preview/src/demos/*`

