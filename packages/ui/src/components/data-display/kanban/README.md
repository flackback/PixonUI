# 📋 PixonUI Kanban Component Suite

O PixonUI Kanban é um sistema de quadro de gerenciamento de tarefas de altíssimo desempenho, totalmente desacoplado, responsivo e construído com a filosofia **Native-First**. Ele foi projetado para renderizar centenas de tarefas simultaneamente a 120fps, oferecendo interações fluidas, animações de alta fidelidade e análise preditiva local em tempo real.

---

## 🚀 Principais Recursos (100% Documentados)

### 1. 🖱️ Horizontal Drag-to-Scroll (Clique e Arraste Lateral)
Para quadros Kanban que possuem mais colunas do que a largura da tela, o PixonUI introduz o **Drag-to-Scroll Lateral por Clique e Arraste**:
* **Como funciona**: Ao clicar, segurar e arrastar o mouse em qualquer espaço vazio entre as colunas, no cabeçalho ou nas áreas de fundo, o quadro inteiro rola horizontalmente de forma extremamente suave.
* **Prevenção de Conflitos**: O sistema inteligente ignora o arrastar caso o clique seja feito sobre um botão, input, ou em um card de tarefa (`draggable="true"`), permitindo que o drag-and-drop tradicional de tarefas e o scroll lateral coexistam perfeitamente sem conflitos.
* **Feedback Visual**: O cursor do mouse muda dinamicamente de `cursor-grab` (mão aberta) para `cursor-grabbing` (mão fechada) e desativa a seleção de texto acidental para manter o foco na navegação.

### 2. ⚠️ Detecção de Gargalos em Tempo Real (WIP Limits)
O sistema possui suporte nativo para limites de **WIP (Work In Progress)** por coluna:
* **Configuração**: Cada coluna pode opcionalmente definir a propriedade `limit: number`.
* **Alerta Pulsante ("Gargalo Detectado")**: Se o volume de tarefas ativas na coluna ultrapassar o limite definido, a coluna ganha uma borda vermelha sutil (`border-rose-500/30`) e um banner animado de alta visibilidade: `Gargalo Detectado (X acima do limite)`. O banner possui um indicador LED pulsante em vermelho (`animate-ping`) para alertar os gestores instantaneamente.

### 3. ✨ Efeito de Borda Neon Giratória (Spinning Gradient Border)
Para destacar tarefas urgentes, novos leads gerados por IA, ou gargalos prioritários, o componente suporta o efeito estético premium `spinning-border`:
* **Como funciona**: Ao passar `effect: 'spinning-border'` nas propriedades de uma tarefa, o card correspondente é envolto em uma máscara de gradiente cônico dinâmico (**Ciano → Azul → Rosa → Ciano**) que gira infinitamente a 60fps usando aceleração de GPU.
* **Efeito Hover**: Quando o mouse passa por cima do card em rotação, a intensidade e o brilho do gradiente são destacados sutilmente.

### 4. ⚡ Carregamento Preguiçoso e Performance Extrema
O componente utiliza paginação local inteligente e carregamento sob demanda:
* Mesmo ao injetar mais de 100 tarefas por coluna de teste, o quadro carrega instantaneamente.
* A renderização é fatiada inicialmente em lotes. Conforme o usuário rola verticalmente para o final de uma coluna, um botão de **"Carregue mais X tarefas"** é exibido para continuar o fluxo sem qualquer engasgo de renderização no React.

---

## 📂 Estrutura dos Arquivos & Componentes

| Arquivo / Componente | Descrição |
| :--- | :--- |
| **`KanbanBoard.tsx`** | O contêiner orquestrador principal do quadro. Configura filtros, ordenações, swimlanes, atalhos de teclado e inicializa o scroll por clique-e-arraste. |
| **`KanbanColumn.tsx`** | Representa uma coluna individual do quadro, gerencia os limites de WIP, estados de colapso, dropzones e renderização do cabeçalho. |
| **`KanbanCard.tsx`** | O card de tarefa. Suporta contadores de subtarefas, tags estéticas, avatares, cronômetros de tempo integrado, efeitos de borda giratória e drag-and-drop nativo. |
| **`KanbanColumnContent.tsx`**| Componente interno para renderizar a lista de cards, inputs de adição rápida (Quick Add) e botões de carregamento de tarefas adicionais. |
| **`KanbanSwimlane.tsx`** | Permite agrupar tarefas horizontalmente em raias (ex: por prioridade, responsável ou projeto), ideal para visões de portfólio. |
| **`useKanbanBoardScroll.ts`**| Hook personalizado que captura eventos de mouse para rolar o viewport horizontalmente através de clique e arraste. |
| **`useKanbanDragAndDrop.ts`**| Hook que encapsula a lógica de arrastar e soltar nativa do HTML5 com suporte a touch para dispositivos móveis. |
| **`useKanbanAnalytics.ts`** | Heurística local que prevê tempo de conclusão de tarefas, identifica gargalos reais e calcula carga de trabalho por membro. |
| **`useKanbanUndo.ts`** | Gerencia a linha do tempo (histórico) do quadro, permitindo desfazer (`Ctrl+Z`) e refazer (`Ctrl+Y`) movimentos de cards instantaneamente. |

---

## 🛠️ Como Utilizar no Código

Abaixo está um exemplo completo de como inicializar o componente Kanban com limites de WIP, efeitos estáticos e dados mockados de alta escala:

```tsx
import React, { useState } from 'react';
import { Kanban, KanbanColumnDef, KanbanTask } from '@pixonui/react';

export function MeuQuadroKanban() {
  // 1. Configurando as colunas com limites de WIP (Work In Progress)
  const [columns, setColumns] = useState<KanbanColumnDef[]>([
    { id: 'todo', title: 'A Fazer', color: '#94a3b8' },
    { id: 'in-progress', title: 'Em Progresso', color: '#06b6d4', limit: 3 }, // Limite de 3 tarefas
    { id: 'review', title: 'Em Revisão', color: '#8b5cf6', limit: 2 },        // Limite de 2 tarefas
    { id: 'done', title: 'Concluído', color: '#10b981' }
  ]);

  // 2. Configurando as tarefas (incluindo o efeito dinâmico spinning-border)
  const [tasks, setTasks] = useState<KanbanTask[]>([
    {
      id: 'task-1',
      title: 'Atualizar Design System',
      description: 'Implementar as novas cores e efeitos de blur nos cards.',
      priority: 'high',
      tags: ['Design', 'UI'],
      columnId: 'todo'
    },
    {
      id: 'task-2',
      title: 'Refatoração do Componente Kanban',
      description: 'Integrar o sistema de drag-to-scroll horizontal suave.',
      priority: 'urgent',
      tags: ['Core', 'Performance'],
      columnId: 'in-progress',
      effect: 'spinning-border' // Destaca o card com gradiente dinâmico giratório!
    },
    {
      id: 'task-3',
      title: 'Testes de Carga com 100+ Tarefas',
      description: 'Garantir carregamento preguiçoso fluido e sem lags no scroll.',
      priority: 'medium',
      tags: ['QA', 'Performance'],
      columnId: 'in-progress'
    },
    {
      id: 'task-4',
      title: 'Implementar SSO & SAML',
      description: 'Garantir compatibilidade com logins empresariais corporativos.',
      priority: 'high',
      tags: ['Segurança', 'Backend'],
      columnId: 'in-progress' // Isso aciona o alerta de gargalo (In Progress agora tem 3 tarefas!)
    }
  ]);

  const handleTaskMove = (taskId: string, toColumnId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, columnId: toColumnId } : t));
  };

  return (
    <div className="h-[600px] w-full p-6">
      <Kanban
        columns={columns}
        tasks={tasks}
        onTaskMove={handleTaskMove}
        onTaskClick={(task) => console.log('Card clicado:', task)}
        selectable={true}
      />
    </div>
  );
}
```

---

## 📈 Performance & Engenharia

### Scroll Suave de Toque e Mouse (GPU Bound)
* O scroll de arrastar usa propriedades `scrollLeft` calculadas a partir da diferença de deslocamento de pixel no evento `onMouseMove`.
* A aceleração é multiplicada por um fator de `2` para dar a sensação de rolagem responsiva de aplicativo nativo (*momentum scrolling*).
* O efeito giratório nos cards (`spinning-border`) é executado exclusivamente através de `@keyframes` CSS nativo manipulando `transform: rotate` e `conic-gradient` de background, garantindo zero recalculações de layout (Layout Thrashing) e desempenho de GPU pura.
