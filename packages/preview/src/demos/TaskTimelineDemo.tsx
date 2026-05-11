import React, { useState } from 'react';
import { 
  Surface, 
  Heading, 
  Text, 
  Grid, 
  Stack, 
  Badge, 
  TaskTimeline, 
  useTaskTimeline, 
  TimelineGroup,
  TaskItem,
  Slider,
} from '@pixonui/react';
import { 
  CalendarDays, 
  CheckCircle2, 
  TrendingUp, 
  AlertTriangle, 
  Info, 
  Settings2,
  Sparkles,
  Zap,
  ShieldCheck,
  Cpu
} from 'lucide-react';

export function TaskTimelineDemo() {
  const initialGroups: TimelineGroup[] = [
    {
      id: 'group-sprint-backlog',
      name: 'Sprint #25: Core UI Features',
      color: 'purple',
      tasks: [
        {
          id: 't1',
          title: 'Implementar injeção de temas CSS no pacote UI',
          status: 'in_progress' as const,
          priority: 'critical' as const,
          startCol: 1,
          duration: 3,
          progress: 60,
          dependencies: [],
          assignee: { name: 'Anderson Silveira', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' }
        },
        {
          id: 't2',
          title: 'Adicionar documentação de componentes no Storybook',
          status: 'pending' as const,
          priority: 'medium' as const,
          startCol: 4,
          duration: 4,
          progress: 0,
          dependencies: ['t1'], // t2 depends on t1 finishing
          assignee: { name: 'Juliana Santos', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' }
        },
        {
          id: 't3',
          title: 'Validar build de declarações de tipo DTS',
          status: 'completed' as const,
          priority: 'low' as const,
          startCol: 2,
          duration: 2,
          progress: 100,
          dependencies: [],
          assignee: { name: 'Robson Lima', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' }
        }
      ]
    },
    {
      id: 'group-marketing',
      name: 'Marketing Launch Assets',
      color: 'emerald',
      tasks: [
        {
          id: 't4',
          title: 'Criar vídeo promocional de lançamento SaaS',
          status: 'in_progress' as const,
          priority: 'high' as const,
          startCol: 6,
          duration: 5,
          progress: 35,
          dependencies: [],
          assignee: { name: 'Beatriz Costa', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' }
        },
        {
          id: 't5',
          title: 'Homologar canais de distribuição de anúncios',
          status: 'on_hold' as const,
          priority: 'medium' as const,
          startCol: 11,
          duration: 3,
          progress: 15,
          dependencies: ['t4'], // t5 depends on t4 finishing
          assignee: { name: 'Robson Lima', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' }
        }
      ]
    }
  ];

  // Initialize the hook with 14 timeline columns (days)
  const columnsCount = 14;
  const {
    groups,
    collapsedGroups,
    toggleGroup,
    addTask,
    updateTask,
    deleteTask,
    dragState,
    startDrag,
    updateDrag,
    endDrag,
    stats,
    workloadStats, // Advanced Workload stats retrieved in real-time
  } = useTaskTimeline({
    initialGroups,
    columnsCount,
  });

  const [selectedTaskId, setSelectedTaskId] = useState<string>('t1');

  // Find currently selected task details for inspection/editing
  const selectedTask = groups
    .flatMap((g: TimelineGroup) => g.tasks)
    .find((t: TaskItem) => t.id === selectedTaskId);

  // Custom column header names for the timeline days representation
  const columnHeaders = Array.from({ length: columnsCount }).map((_, i) => `Dia ${i + 1}`);

  // Define critical project milestones to show on the vertical axis
  const milestones = [
    { day: 4, label: 'Planning', color: 'purple' as const },
    { day: 8, label: 'Feature Freeze', color: 'rose' as const },
    { day: 13, label: 'Release Prod', color: 'emerald' as const },
  ];

  return (
    <Stack gap={8} className="pb-12 animate-fade-in">
      
      {/* Header section with glow badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="shimmer" className="bg-purple-500/10 text-purple-500 border-purple-500/20 font-black text-[10px] tracking-wider uppercase flex items-center gap-1.5 py-1 px-2.5">
              <Sparkles className="h-3.5 w-3.5 text-purple-400" /> Enterprise Gantt Scheduler Engine
            </Badge>
          </div>
          <Heading as="h1" className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent mt-1">
            Task Timeline & Scheduler Grid
          </Heading>
          <Text className="text-gray-500 dark:text-white/40 mt-1">
            Planejamento visual de sprints em cascata. Arraste as barras para reprogramar e as dependências resolverão o cronograma sozinhas!
          </Text>
        </div>
      </div>

      {/* Futuristic Enterprise Badges Row */}
      <Grid cols={1} gap={4} className="md:grid-cols-3">
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/20 border border-gray-100 dark:border-white/[0.02] flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-black block">Resolução em Cascata (Auto-Push)</span>
            <span className="text-[10px] text-zinc-400">Tarefas dependentes são realocadas recursivamente ao mover o card pai.</span>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/20 border border-gray-100 dark:border-white/[0.02] flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-black block">Resource Heatmapping</span>
            <span className="text-[10px] text-zinc-400">Verificação diária e visual de sobrecarga dos responsáveis com avisos inteligentes.</span>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/20 border border-gray-100 dark:border-white/[0.02] flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-black block">Type-Safety Estrito Garantido</span>
            <span className="text-[10px] text-zinc-400">Código modularizado com prevenção total de loops de render e circular references.</span>
          </div>
        </div>
      </Grid>

      {/* Aggregate metrics dashboards updated in real time */}
      <Grid cols={1} gap={6} className="md:grid-cols-4">
        <Surface className="p-5 border border-gray-200 dark:border-white/5 bg-white dark:bg-zinc-900/40 rounded-2xl">
          <div className="flex items-center justify-between text-zinc-400">
            <Text className="text-xs font-black uppercase tracking-wider">Atividades Totais</Text>
            <CalendarDays className="h-5 w-5 text-purple-500" />
          </div>
          <Heading as="h3" className="text-3xl font-black mt-2">{stats.totalTasks}</Heading>
          <Text className="text-[11px] text-zinc-400 mt-1">Tarefas ativas nos canais</Text>
        </Surface>

        <Surface className="p-5 border border-gray-200 dark:border-white/5 bg-white dark:bg-zinc-900/40 rounded-2xl">
          <div className="flex items-center justify-between text-zinc-400">
            <Text className="text-xs font-black uppercase tracking-wider">Média de Progresso</Text>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <Heading as="h3" className="text-3xl font-black">{stats.averageProgress}%</Heading>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full" style={{ width: `${stats.averageProgress}%` }} />
          </div>
        </Surface>

        <Surface className="p-5 border border-gray-200 dark:border-white/5 bg-white dark:bg-zinc-900/40 rounded-2xl">
          <div className="flex items-center justify-between text-zinc-400">
            <Text className="text-xs font-black uppercase tracking-wider">Concluídas</Text>
            <CheckCircle2 className="h-5 w-5 text-blue-500" />
          </div>
          <Heading as="h3" className="text-3xl font-black mt-2">
            {stats.completedTasks} <span className="text-xs font-medium text-zinc-400">/ {stats.totalTasks}</span>
          </Heading>
          <Text className="text-[11px] text-zinc-400 mt-1">Tarefas finalizadas no cronograma</Text>
        </Surface>

        <Surface className="p-5 border border-gray-200 dark:border-white/5 bg-white dark:bg-zinc-900/40 rounded-2xl">
          <div className="flex items-center justify-between text-zinc-400">
            <Text className="text-xs font-black uppercase tracking-wider">Avisos Críticos</Text>
            <AlertTriangle className="h-5 w-5 text-rose-500" />
          </div>
          <Heading as="h3" className={stats.criticalTasksCount > 0 ? "text-3xl font-black text-rose-500 mt-2" : "text-3xl font-black mt-2"}>
            {stats.criticalTasksCount}
          </Heading>
          <Text className="text-[11px] text-zinc-400 mt-1">Gargalos prioritários</Text>
        </Surface>
      </Grid>

      {/* Main timeline content split layout */}
      <Grid cols={1} gap={6} className="lg:grid-cols-4">
        
        {/* Large timeline area (Grid, Heatmap, and Dependencies Arrow Drawer) */}
        <div className="lg:col-span-3">
          <TaskTimeline
            groups={groups}
            columnsCount={columnsCount}
            columnHeaders={columnHeaders}
            collapsedGroups={collapsedGroups}
            dragState={dragState}
            onToggleGroup={toggleGroup}
            onAddTask={addTask}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
            onStartDrag={startDrag}
            onUpdateDrag={updateDrag}
            onEndDrag={endDrag}
            colWidth={55}
            workloadStats={workloadStats} // Pass workload metrics!
            milestones={milestones} // Pass vertical milestones!
          />
        </div>

        {/* Selected Task details inspector sidebar panel */}
        <div className="lg:col-span-1">
          <Surface className="p-6 border border-gray-200 dark:border-white/5 bg-white dark:bg-zinc-900/40 rounded-2xl h-full flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <Heading as="h3" className="text-sm font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Settings2 className="h-4 w-4" /> Detalhes da Atividade
              </Heading>

              {selectedTask ? (
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Título</label>
                    <input 
                      value={selectedTask.title}
                      onChange={(e) => updateTask(selectedTask.id, { title: e.target.value })}
                      className="w-full text-xs font-bold bg-zinc-50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Progresso ({selectedTask.progress}%)</label>
                    <div className="pt-1.5">
                      <Slider
                        value={selectedTask.progress}
                        onChange={(val) => updateTask(selectedTask.id, { progress: val })}
                        min={0}
                        max={100}
                        step={5}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Início (Dia)</label>
                      <input 
                        type="number"
                        min={1}
                        max={columnsCount}
                        value={selectedTask.startCol}
                        onChange={(e) => updateTask(selectedTask.id, { startCol: parseInt(e.target.value) || 1 })}
                        className="w-full text-xs font-mono font-bold bg-zinc-50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-xl py-2 px-3 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Duração (Dias)</label>
                      <input 
                        type="number"
                        min={1}
                        max={columnsCount}
                        value={selectedTask.duration}
                        onChange={(e) => updateTask(selectedTask.id, { duration: parseInt(e.target.value) || 1 })}
                        className="w-full text-xs font-mono font-bold bg-zinc-50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-xl py-2 px-3 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Responsável</label>
                    <div className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-100 dark:border-white/[0.03] bg-zinc-50/50 dark:bg-white/[0.01]">
                      {selectedTask.assignee?.avatar ? (
                        <img src={selectedTask.assignee.avatar} className="h-7 w-7 rounded-full object-cover" />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold text-xs">U</div>
                      )}
                      <div className="text-xs font-bold">{selectedTask.assignee?.name || 'Não atribuído'}</div>
                    </div>
                  </div>

                  {selectedTask.dependencies && selectedTask.dependencies.length > 0 && (
                    <div>
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5">Bloqueado Por (Dependências)</label>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedTask.dependencies.map((depId: string) => (
                          <Badge key={depId} variant="neutral" className="bg-purple-500/10 text-purple-400 text-[9px] border border-purple-500/25 py-0.5 px-2 font-black">
                            {depId.toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 text-xs text-zinc-400">
                  Nenhuma atividade selecionada. Clique ou interaja para inspecionar.
                </div>
              )}
            </div>

            {/* Selection help note */}
            <div className="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/10 text-[11px] text-purple-500 dark:text-purple-400 font-medium leading-relaxed flex gap-2">
              <Info className="h-4.5 w-4.5 shrink-0 text-purple-500" />
              <div>
                <strong>Dica de Fluxo:</strong> Tente arrastar a tarefa pai <code>t1</code> para a direita e veja a tarefa filha <code>t2</code> ser empurrada em tempo real de forma automática!
              </div>
            </div>

          </Surface>
        </div>

      </Grid>

      {/* Select task focus trigger */}
      <div className="flex items-center gap-2.5 justify-end mt-4">
        <span className="text-[11px] text-zinc-400 font-bold">Focar Inspetor Rápido:</span>
        <div className="flex gap-1.5">
          {groups.flatMap((g: TimelineGroup) => g.tasks).map((t: TaskItem) => (
            <button
              key={t.id}
              onClick={() => setSelectedTaskId(t.id)}
              className={`text-[10px] font-black px-2.5 py-1 rounded-lg border transition-all ${
                selectedTaskId === t.id
                  ? 'bg-purple-500/10 border-purple-500/20 text-purple-500'
                  : 'bg-zinc-100 dark:bg-white/5 border-transparent text-zinc-400 hover:text-zinc-600'
              }`}
            >
              {t.id.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

    </Stack>
  );
}
