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
  StatusDot
} from '@pixonui/react';
import { 
  CheckSquare, 
  Plus, 
  Clock, 
  AlertCircle, 
  User, 
  Play, 
  Check, 
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

export function ProjectPortalView() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Refatorar injeção de temas CSS no pacote UI', priority: 'high', group: 'UI Engineering', date: 'Hoje', status: 'pending' },
    { id: 2, title: 'Adicionar documentação e exemplos interativos', priority: 'medium', group: 'Docs', date: 'Amanhã', status: 'pending' },
    { id: 3, title: 'Validar build de declarações de tipo DTS', priority: 'critical', group: 'CI/CD', date: 'Hoje', status: 'completed' },
    { id: 4, title: 'Criar novas visões SaaS para a central de preview', priority: 'high', group: 'Preview App', date: 'Hoje', status: 'pending' },
    { id: 5, title: 'Remover dependências depreciadas do lerna/npm', priority: 'low', group: 'DevOps', date: '12 Mai', status: 'pending' },
  ]);

  const handleAddTask = () => {
    const newTask = {
      id: Date.now(),
      title: `Nova tarefa de desenvolvimento criada por atalho ${tasks.length + 1}`,
      priority: 'medium',
      group: 'UI Engineering',
      date: 'Hoje',
      status: 'pending'
    };
    setTasks([newTask, ...tasks]);
  };

  const handleToggleTaskStatus = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t));
  };

  return (
    <Stack gap={8} className="pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Heading as="h1" className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            Project & Tasks Portal
          </Heading>
          <Text className="text-gray-500 dark:text-white/40 mt-1">
            Plataforma de acompanhamento de sprint de desenvolvimento ágil com suporte nativo a atalhos rápidos de teclado.
          </Text>
        </div>
        <Button 
          onClick={handleAddTask}
          className="bg-purple-600 hover:bg-purple-500 text-white font-bold h-11 px-5 rounded-xl shadow-lg shadow-purple-500/20 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Nova Tarefa (Ctrl + Shift + T)
        </Button>
      </div>

      {/* Shortcuts Guide and Sprint Progress */}
      <Grid cols={1} gap={6} className="md:grid-cols-3">
        {/* Sprint Overview stats card */}
        <Surface className="md:col-span-2 p-6 border border-gray-200 dark:border-white/5 bg-white dark:bg-zinc-900/40 rounded-2xl flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="neutral" className="bg-purple-500/10 text-purple-500 border-purple-500/10">Sprint #24 • Semanal</Badge>
              <span className="text-xs text-zinc-400 font-bold">Progresso: 80%</span>
            </div>
            <Heading as="h3" className="text-xl font-bold">Entrega de Novas Primitivas e Componentes</Heading>
            <Text className="text-xs text-zinc-400">Entrega do roadmap de expansão criativa da PixonUI.</Text>
          </div>

          <div className="w-full bg-zinc-100 dark:bg-white/5 h-2 rounded-full overflow-hidden mt-6">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full w-[80%]" />
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
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Ir para Inbox</span>
              <KbdCombo keys={['alt', 'I']} />
            </div>
          </div>
        </Surface>
      </Grid>

      {/* Staggered animated task list */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Heading as="h3" className="text-lg font-bold">Lista de Atividades do Backlog</Heading>
            <Text className="text-xs text-zinc-400 mt-0.5">As tarefas abaixo utilizam revelação escalonada (staggered animation) de alta performance.</Text>
          </div>
          <Badge variant="neutral" className="bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 border-transparent">
            {tasks.length} Tarefas no painel
          </Badge>
        </div>

        {/* Wrap in AnimatedList to get high quality stagger entrance effects! */}
        <AnimatedList stagger={70} duration={350} animation="fade-up" className="space-y-3">
          {tasks.map(task => (
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
                  onClick={() => handleToggleTaskStatus(task.id)}
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
