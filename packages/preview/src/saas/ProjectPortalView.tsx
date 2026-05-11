import React, { useState } from 'react';
import { 
  Surface, 
  Heading, 
  Text, 
  Grid, 
  Stack, 
  Badge, 
  Button, 
  KbdCombo,
  AnimatedList,
  StatusDot,
  TaskTimeline,
  useTaskTimeline,
} from '@pixonui/react';
import type { TimelineGroup } from '@pixonui/react';
import { 
  Plus, 
  Calendar,
  Layers,
  Sparkles,
  Layers3,
  ListTodo,
  Check,
} from 'lucide-react';

const initialTimelineGroups: TimelineGroup[] = [
  {
    id: 'design',
    name: '🎨 Design & Glow Tokens',
    color: 'purple',
    tasks: [
      { 
        id: 'd1', 
        title: 'Estudo de Cores & HSL Estilizado', 
        startCol: 1, 
        duration: 3, 
        progress: 100, 
        status: 'completed', 
        priority: 'high',
        assignee: { name: 'Sarah Wilson', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' }
      },
      { 
        id: 'd2', 
        title: 'Efeitos Spotlight & Glassmorphism', 
        startCol: 4, 
        duration: 4, 
        progress: 60, 
        status: 'in_progress', 
        priority: 'high',
        assignee: { name: 'Sarah Wilson', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
        dependencies: ['d1']
      },
      { 
        id: 'd3', 
        title: 'Micro-Interações & Transições UI', 
        startCol: 8, 
        duration: 3, 
        progress: 0, 
        status: 'pending', 
        priority: 'medium',
        dependencies: ['d2']
      },
    ]
  },
  {
    id: 'engineering',
    name: '⚙️ Core Hooks & State System',
    color: 'blue',
    tasks: [
      { 
        id: 'e1', 
        title: 'Gravador de Áudio & useVoiceRecorder', 
        startCol: 2, 
        duration: 4, 
        progress: 100, 
        status: 'completed', 
        priority: 'critical',
        assignee: { name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' }
      },
      { 
        id: 'e2', 
        title: 'Fila de Anexos Drag & Drop', 
        startCol: 6, 
        duration: 4, 
        progress: 100, 
        status: 'completed', 
        priority: 'high',
        assignee: { name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
        dependencies: ['e1']
      },
      { 
        id: 'e3', 
        title: 'Menu de Contexto Flutuante e Reações', 
        startCol: 9, 
        duration: 4, 
        progress: 45, 
        status: 'in_progress', 
        priority: 'high',
        assignee: { name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
        dependencies: ['e2']
      },
    ]
  },
  {
    id: 'release',
    name: '🚀 Delivery & CI/CD Pipeline',
    color: 'emerald',
    tasks: [
      { 
        id: 'r1', 
        title: 'Build de Declarações DTS & tsup', 
        startCol: 3, 
        duration: 3, 
        progress: 100, 
        status: 'completed', 
        priority: 'critical',
        assignee: { name: 'Emily Chen', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' }
      },
      { 
        id: 'r2', 
        title: 'Linter Strict Typecheck & Pris', 
        startCol: 7, 
        duration: 3, 
        progress: 100, 
        status: 'completed', 
        priority: 'medium',
        assignee: { name: 'Emily Chen', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' }
      },
      { 
        id: 'r3', 
        title: 'Auditoria de Segurança & Publicação', 
        startCol: 11, 
        duration: 3, 
        progress: 10, 
        status: 'pending', 
        priority: 'high',
        dependencies: ['r1', 'r2']
      },
    ]
  }
];

export function ProjectPortalView() {
  const {
    groups,
    collapsedGroups,
    toggleGroup,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    dragState,
    startDrag,
    updateDrag,
    endDrag,
    stats,
  } = useTaskTimeline({
    initialGroups: initialTimelineGroups,
    columnsCount: 14,
  });

  const [backlogTasks, setBacklogTasks] = useState([
    { id: 1, title: 'Refatorar injeção de temas CSS no pacote UI', priority: 'high', group: 'UI Engineering', date: 'Hoje', status: 'pending' },
    { id: 2, title: 'Adicionar documentação e exemplos interativos', priority: 'medium', group: 'Docs', date: 'Amanhã', status: 'pending' },
    { id: 3, title: 'Validar build de declarações de tipo DTS', priority: 'critical', group: 'CI/CD', date: 'Hoje', status: 'completed' },
    { id: 4, title: 'Criar novas visões SaaS para a central de preview', priority: 'high', group: 'Preview App', date: 'Hoje', status: 'pending' },
    { id: 5, title: 'Remover dependências depreciadas do lerna/npm', priority: 'low', group: 'DevOps', date: '12 Mai', status: 'pending' },
  ]);

  const handleAddBacklogTask = () => {
    const newTask = {
      id: Date.now(),
      title: `Nova atividade no Backlog ${backlogTasks.length + 1}`,
      priority: 'medium' as const,
      group: 'UI Engineering',
      date: 'Hoje',
      status: 'pending'
    };
    setBacklogTasks([newTask, ...backlogTasks]);
  };

  const handleToggleBacklogStatus = (id: number) => {
    setBacklogTasks(backlogTasks.map(t => t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t));
  };

  return (
    <Stack gap={8} className="pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Heading as="h1" className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 bg-clip-text text-transparent">
            Project & Tasks Portal
          </Heading>
          <Text className="text-gray-500 dark:text-white/40 mt-1">
            Cronograma interativo estilo Gantt com solucionador de dependências em cascata e backlog ágil integrado.
          </Text>
        </div>
        <Button 
          onClick={handleAddBacklogTask}
          className="bg-purple-600 hover:bg-purple-500 text-white font-bold h-11 px-5 rounded-xl shadow-lg shadow-purple-500/20 flex items-center gap-2 group transition-all"
        >
          <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" /> Nova Tarefa Backlog (Ctrl + Shift + T)
        </Button>
      </div>

      {/* Shortcuts Guide and Sprint Progress */}
      <Grid cols={1} gap={6} className="md:grid-cols-3">
        {/* Sprint Overview stats card */}
        <Surface className="md:col-span-2 p-6 border border-gray-200 dark:border-white/5 bg-white dark:bg-zinc-900/40 rounded-2xl flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="neutral" className="bg-purple-500/10 text-purple-500 border-purple-500/10 flex items-center gap-1">
                <Sparkles className="h-3 w-3 animate-pulse text-purple-400" /> Sprint #24 • Ativa
              </Badge>
              <span className="text-xs text-zinc-400 font-bold">Taxa de Conclusão Geral: {stats.averageProgress}%</span>
            </div>
            <Heading as="h3" className="text-xl font-bold">Entrega de Novas Primitivas e Componentes</Heading>
            <Text className="text-xs text-zinc-400">Total de {stats.totalTasks} tarefas monitoradas no cronograma Gantt com {stats.completedTasks} concluídas.</Text>
          </div>

          <div className="w-full bg-zinc-100 dark:bg-white/5 h-2 rounded-full overflow-hidden mt-6">
            <div 
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 h-full transition-all duration-500" 
              style={{ width: `${stats.averageProgress}%` }}
            />
          </div>
        </Surface>

        {/* Keyboard shortcut guide card using KbdCombo */}
        <Surface className="md:col-span-1 p-6 border border-gray-200 dark:border-white/5 bg-white dark:bg-zinc-900/40 rounded-2xl flex flex-col justify-between gap-4">
          <div>
            <Heading as="h4" className="text-xs font-extrabold uppercase tracking-widest text-zinc-400">Guia de Atalhos</Heading>
            <Text className="text-[11px] text-zinc-500 mt-0.5">Utilize os atalhos abaixo para gerenciar a sprint rapidamente.</Text>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Criar Nova Tarefa</span>
              <KbdCombo keys={['ctrl', 'shift', 'T']} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Buscar / Filtrar</span>
              <KbdCombo keys={['ctrl', 'F']} />
            </div>
          </div>
        </Surface>
      </Grid>

      {/* ─── INTERACTIVE TASK TIMELINE SECTION ─── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers3 className="h-5 w-5 text-purple-500" />
          <Heading as="h3" className="text-lg font-bold">Cronograma Gantt Interativo (Monday.com)</Heading>
        </div>
        
        <Surface className="p-4 border border-gray-200 dark:border-white/5 bg-white/40 dark:bg-zinc-950/40 rounded-3xl backdrop-blur-sm overflow-hidden shadow-xl">
          <TaskTimeline 
            groups={groups}
            columnsCount={14}
            collapsedGroups={collapsedGroups}
            dragState={dragState}
            onToggleGroup={toggleGroup}
            onAddTask={(groupId) => {
              addTask(groupId, {
                title: 'Nova Tarefa no Cronograma',
                startCol: 1,
                duration: 3,
                progress: 0,
                status: 'pending',
                priority: 'medium'
              });
            }}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
            onStartDrag={startDrag}
            onUpdateDrag={updateDrag}
            onEndDrag={endDrag}
            className="w-full"
          />
        </Surface>
      </section>

      {/* Backlog List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-indigo-500" />
            <div>
              <Heading as="h3" className="text-lg font-bold">Lista de Atividades do Backlog</Heading>
              <Text className="text-xs text-zinc-400 mt-0.5">As tarefas abaixo utilizam revelação escalonada (staggered animation) de alta performance.</Text>
            </div>
          </div>
          <Badge variant="neutral" className="bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 border-transparent">
            {backlogTasks.length} Atividades no painel
          </Badge>
        </div>

        {/* Wrap in AnimatedList to get high quality stagger entrance effects! */}
        <AnimatedList stagger={70} duration={350} animation="fade-up" className="space-y-3">
          {backlogTasks.map(task => (
            <div 
              key={task.id}
              className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all bg-white dark:bg-zinc-900/20 ${
                task.status === 'completed'
                  ? 'border-gray-100 dark:border-white/5 opacity-50 bg-gray-50/50'
                  : 'border-gray-200 dark:border-white/[0.05] hover:border-purple-500/30 dark:hover:border-purple-500/20 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <button
                  onClick={() => handleToggleBacklogStatus(task.id)}
                  className={`h-6 w-6 rounded-lg flex items-center justify-center transition-all ${
                    task.status === 'completed'
                      ? 'bg-emerald-500 text-white'
                      : 'border-2 border-gray-200 dark:border-white/10 hover:border-purple-500/50 text-transparent hover:text-purple-500/30'
                  }`}
                >
                  <Check className="h-4 w-4" />
                </button>

                <div className="min-w-0">
                  <div className={`text-sm font-bold truncate ${task.status === 'completed' ? 'line-through text-zinc-500' : ''}`}>
                    {task.title}
                  </div>
                  <div className="flex items-center gap-2.5 mt-1.5">
                    <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1">
                      <Layers className="h-3 w-3" /> {task.group}
                    </span>
                    <span className="text-[11px] font-bold text-zinc-400">•</span>
                    <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {task.date}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {task.priority === 'critical' && <Badge variant="danger">Crítica</Badge>}
                {task.priority === 'high' && <Badge variant="neutral" className="bg-orange-500/10 text-orange-500 border-orange-500/20">Alta</Badge>}
                {task.priority === 'medium' && <Badge variant="neutral" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Média</Badge>}
                {task.priority === 'low' && <Badge variant="neutral" className="bg-zinc-500/10 text-zinc-500 border-zinc-500/20">Baixa</Badge>}
                
                <div className="flex items-center gap-1">
                  <StatusDot variant={task.status === 'completed' ? 'success' : 'warning'} />
                </div>
              </div>
            </div>
          ))}
        </AnimatedList>
      </section>
    </Stack>
  );
}
