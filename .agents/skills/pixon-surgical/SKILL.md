---
name: pixon-surgical
description: Use quando o usuário quer mudanças cirúrgicas no PixonUI com máxima economia de tokens, diffs mínimos, leitura seletiva, validação focada e resposta objetiva sem contexto redundante.
---

# Pixon Surgical (Token Efficient)

## Objetivo

Fazer mudanças **mínimas e corretas** no código do PixonUI, com **baixa verbosidade** e foco em **estabilidade/performance**.

## Regras de execução (sempre, em ordem)

1. **Aplicar orçamento fixo** por turno:
   - leitura: no máximo 6 arquivos,
   - comandos: no máximo 8 execuções,
   - resposta final: no máximo 8 bullets.
2. **Não reescrever** arquivos inteiros; preferir patch local por símbolo.
3. **Buscar antes de abrir**:
   - usar `rg` para localizar,
   - abrir somente janelas pequenas por trecho.
4. **Evitar repetição de contexto**:
   - não repetir stacktrace já enviado pelo usuário,
   - não repetir planos completos no chat.
5. **Parar no escopo**:
   - não mexer em código adjacente sem evidência de causa raiz.
6. **Validar no menor raio**:
   - teste de arquivo/suíte específica antes de build amplo.

## Fluxo recomendado

1. **Narrow scope**: identificar arquivo/símbolo com `rg`.
2. **Diagnóstico mínimo viável**: abrir só os blocos necessários.
3. **Patch cirúrgico**: corrigir causa raiz com menor diff possível.
4. **Validação mínima**:
   - preferir `pnpm vitest run <arquivos>` em `packages/ui`,
   - rodar build apenas se alteração tocar contrato público.
5. **Resposta compacta**:
   - mudanças,
   - validação,
   - próximo passo único.

## Regras de economia em debug de animação

- **Priorizar provas locais**: logs do console + arquivo exato + linha exata.
- **Evitar rodada cega**: não aplicar múltiplas mudanças sem hipótese explícita.
- **Não misturar frentes**: resolver `keyframe/unit` antes de `scroll/flicker`.
- **Preferir correção estrutural única**: normalizador/sanitizador central em vez de patches duplicados.

## Padrões específicos do repo

- Buscar animações/motion em:
  - `packages/ui/src/components/feedback/Motion.tsx`
  - `packages/ui/src/components/effects/Animate.tsx`
  - `packages/ui/src/hooks/usePixonAnimate.ts`
  - `packages/ui/src/utils/motion.ts`
- Preview/demos em:
  - `packages/preview/src/registry.tsx`
  - `packages/preview/src/demos/*`

