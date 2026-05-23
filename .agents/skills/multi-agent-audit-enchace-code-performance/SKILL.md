---
name: multi-agent-audit-enchace-code-performance
description: >-
  Ultra-skill projetada para otimizar prompts cognitivos, auditar performance de código (JS/TS/React/WAAPI/CSS/HTML) e coordenar múltiplos agentes especialistas virtuais em paralelo para correções de alta qualidade com consumo mínimo de tokens.
---

# Multi-Agent Audit & Code Performance Enhancer

## Overview

Esta skill estabelece um protocolo avançado onde o agente realiza uma **Meta-Otimização de Prompt** antes de qualquer execução técnica. Uma vez expandidos os requisitos técnicos, ela orquestra múltiplos agentes especialistas virtuais (*TS/JS QA Scientist*, *React/WAAPI Performance Engineer*, *HTML/CSS Semantic Stylist*) para auditar e otimizar código em paralelo de forma cirúrgica, validando as modificações com nosso script utilitário central `orchestrator.py` para máxima correção e qualidade funcional.

---

## Dependencies

- **orquestrar-multiplos-agentes**: Protocolo base de paralelização no monorepo PixonUI.
- **pixon-token-governor**: Protocolo de economia cirúrgica de orçamento de tokens.
- **pixon-surgical**: Edições localizadas com o menor diff de código possível.

---

## Quick Start

Para ativar o fluxo de meta-otimização e auditoria avançada multiagente:

```markdown
Use a skill multi-agent-audit-enchace-code-performance para auditar a performance do arquivo X e otimizar suas transições/animações.
```

---

## Protocolo de Ação de 4 Fases (Obrigatório)

Ao receber qualquer tarefa que utilize esta skill, o agente principal **DEVE** seguir estritamente o fluxo estruturado a seguir:

```
[Prompt do Usuário]
         │
         ▼
┌──────────────────────────────────────────────┐
│ Fase 1: Meta-Prompt Optimizer (Auto-Análise) │
│ - Identifica requisitos implícitos e metas   │
│ - Preve armadilhas técnicas e gargalos       │
│ - Redige o Prompt Hiper-Otimizado            │
└──────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│ Fase 2: Alocação de Especialistas Virtuais   │
│ - TS/JS Scientist  - React/WAAPI Specialist │
│ - HTML/CSS Stylist                           │
└──────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│ Fase 3: Auditoria & Correção Paralela        │
│ - Dispara auditorias focadas                 │
│ - Executa testes e builds via orchestrator  │
└──────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│ Fase 4: Consolidação Cirúrgica e Resumo      │
│ - Integração com diff mínimo                 │
│ - Resumo de qualidade ultra-curto            │
└──────────────────────────────────────────────┘
```

---

## Fase 1: Meta-Prompt Optimizer (Guia de Execução)

Antes de alterar arquivos ou planejar, escreva na resposta final uma seção curta chamada `### 🧠 Prompt Hiper-Otimizado` contendo os seguintes pontos:
1. **Intenção de Negócio Detalhada**: O que o usuário realmente quer alcançar a longo prazo.
2. **Requisitos Técnicos Explícitos e Ocultos**: Tipagem restrita, tratamento de concorrência, etc.
3. **Casos de Borda Previstos**: O que acontece em telas lentas, conexões instáveis, transições interrompidas pela metade.
4. **Instruções Científicas Consolidadas para os Especialistas**: Um prompt conciso e ultra-eficiente voltado para as tarefas em paralelo.

---

## Domínios de Auditoria de Performance e Qualidade

Os especialistas virtuais devem aplicar as seguintes diretrizes avançadas em suas respectivas áreas:

### 1. JavaScript & TypeScript Best Practices (`TS/JS QA Scientist`)
- **Strict Typing:** Evitar o uso de `any` ou `unknown` desnecessários; tipar explicitamente callbacks e chaves genéricas.
- **Memory Leaks:** Evitar listeners globais persistentes no `window` ou `document` sem a devida limpeza de referências.
- **Async Execution:** Garantir tratamento estruturado de exceções em `try/catch` para promises, evitando chamadas concorrentes órfãs.

### 2. React Rendering Lifecycle (`React/WAAPI Performance Engineer`)
- **Re-render Minimization:** Caching preventivo usando `useMemo` para dados computados complexos e `useCallback` para funções passadas a componentes filhos memorizados (`React.memo`).
- **Ref Management:** Preferir `useRef` para armazenar variáveis mutáveis que não precisam desencadear um novo ciclo de renderização visual.
- **Cleanups:** Garantir que todo `useEffect` retorne um callback de limpeza (remover listeners, resetar timeouts, invalidar caches).

### 3. Web Animations API - WAAPI (`React/WAAPI Performance Engineer`)
- **GPU-Accelerated Properties:** Animar estritamente propriedades que não acionam re-layouts (Reflow) ou repinturas (Repaint). Utilizar apenas `transform` (para translação, rotação e escala) e `opacity`.
- **Layout Thrashing:** Nunca ler e escrever no DOM de forma intercalada durante frames de animação (evitar ler `offsetHeight` logo após alterar um estilo).
- **Physical spring dynamics:** Calibrar curvas físicas sob-amortecidas (over-shooting de mola real) usando interpolações de passos baseadas em milissegundos nas timelines customizadas.

### 4. CSS & HTML Semantic Stylist (`HTML/CSS Semantic Stylist`)
- **Fluid Layouts:** Utilizar CSS Grid e Flexbox com dimensionamento fluído (`minmax()`, `clamp()`, `calc()`) para evitar quebras visuais e overflow abrupto.
- **Scrollbar Consistency:** Integrar perfeitamente o componente `<ScrollArea>` do PixonUI em painéis de dados densos e áreas de exibição secundárias, garantindo estética elegante e scrollbars finos.
- **Semantic DOM Tree:** Manter a estrutura HTML5 semântica (`article`, `section`, `header`, `main`), minimizando a profundidade de aninhamento de `div`s vazias para melhor performance de renderização do motor do navegador.

---

## Common Mistakes

- **Otimizar Prompts sem Contexto Local:** Modificar o prompt do usuário ignorando a arquitetura atual do repositório ou bibliotecas instaladas.
- **Animações Ineficientes no WAAPI:** Utilizar o motor para animar propriedades de layout custosas como `width`, `height`, `margin`, `top` ou `left`. Animar sempre `transform` e `opacity` com hardware-acceleration.
- **Inserir Pleasantries Conversacionais:** A skill de meta-otimização deve ser extremamente objetiva e direta. O prompt otimizado deve ir direto ao assunto sem introduções ou repetições.
