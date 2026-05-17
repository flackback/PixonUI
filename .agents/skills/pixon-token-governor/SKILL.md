---
name: pixon-token-governor
description: Use quando o usuário pedir economia agressiva de tokens, respostas curtas, execução objetiva, ou quando o histórico estiver longo e o custo de contexto estiver alto.
---

# Pixon Token Governor

## Objetivo

Executar tarefas no PixonUI com o menor custo de tokens possível sem perder correção técnica.

## Protocolo obrigatório

1. **Fixar orçamento por turno**:
   - até 5 arquivos lidos,
   - até 6 comandos de shell,
   - até 6 bullets na resposta final.
2. **Comprimir contexto antes de agir**:
   - resumir estado em 3 linhas internas,
   - ignorar histórico repetido já resolvido.
3. **Executar uma hipótese por vez**:
   - formular causa provável,
   - aplicar 1 patch,
   - validar no menor escopo.
4. **Evitar tool-call redundante**:
   - não reabrir arquivo recém-lido sem necessidade,
   - não rodar build global sem tocar contrato público.
5. **Encerrar com handoff curto**:
   - o que mudou,
   - como validar,
   - único próximo passo.

## Estratégia de comandos

- Preferir `rg` para localizar e reduzir leitura.
- Preferir testes pontuais:
  - `pnpm -F @pixonui/react exec vitest run <arquivo>`
  - `pnpm -F @pixonui/preview exec vitest run <arquivo>`
- Evitar comandos de saída volumosa (`-w -r test`, logs amplos) sem necessidade.

## Estratégia de código

- Corrigir na raiz com utilitário central quando houver repetição.
- Evitar refatoração ampla no mesmo turno de bugfix.
- Evitar alterações cosméticas não solicitadas.

## Critérios de sucesso

- Sem regressão funcional no escopo alterado.
- Menos comandos, menos arquivos tocados, diff pequeno.
- Resposta final curta, sem repetir contexto do usuário.

