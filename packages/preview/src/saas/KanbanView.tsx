import React, { useState, useEffect, useRef } from 'react';
import { 
  Kanban, 
  useKanbanAnalytics,
  useToast,
  Surface,
  Heading,
  Text,
  Badge,
  Button
} from '@pixonui/react';
import type { KanbanColumnDef, KanbanTask, KanbanUser, Subtask, KanbanDropZoneDef } from '@pixonui/react';
import { 
  Brain, 
  ShieldAlert, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Radio, 
  Play, 
  Pause, 
  Users, 
  X, 
  Trash2, 
  Plus, 
  Check, 
  Clock, 
  Tag, 
  MessageSquare,
  Sparkle,
  MessageCircle,
  Briefcase,
  Receipt,
  Pencil,
  Activity,
  Send,
  ArrowRight,
  Phone,
  Video,
  FileText,
  DollarSign,
  TrendingUp,
  Award
} from 'lucide-react';

// Helper outside component to avoid purity check warnings
function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

const initialColumns: KanbanColumnDef[] = [
  { id: 'todo', title: 'To Do', limit: 4 },
  { id: 'in-progress', title: 'In Progress', limit: 2 },
  { id: 'review', title: 'Review', limit: 3 },
  { id: 'done', title: 'Done' }
];

const teamMembers: KanbanUser[] = [
  { id: 'sarah', name: 'Sarah Wilson', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', status: 'online' },
  { id: 'alex', name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', status: 'online' },
  { id: 'emily', name: 'Emily Chen', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', status: 'online' },
];

const initialTasks: KanbanTask[] = [
  { 
    id: '1', 
    columnId: 'todo', 
    title: 'Research competitor pricing', 
    description: 'Analyze top 5 competitors and their pricing models to establish our pricing positioning.', 
    priority: 'medium', 
    tags: ['Marketing'], 
    assignee: teamMembers[0], 
    updatedAt: new Date(),
    subtasks: [
      { id: 's1-1', title: 'Gather competitor pricing sheets', completed: true },
      { id: 's1-2', title: 'Analyze enterprise tier features', completed: false },
      { id: 's1-3', title: 'Draft value proposition deck', completed: false }
    ],
    progress: 33
  },
  { 
    id: '2', 
    columnId: 'todo', 
    title: 'Update documentation', 
    description: 'Add new voice recording and drag and drop API endpoints to the developer docs.', 
    priority: 'low', 
    tags: ['Docs'], 
    updatedAt: new Date(),
    subtasks: [
      { id: 's2-1', title: 'Draft useVoiceRecorder usage guide', completed: false },
      { id: 's2-2', title: 'Create interactive code sandbox examples', completed: false }
    ],
    progress: 0
  },
  { 
    id: '3', 
    columnId: 'in-progress', 
    title: 'Implement SSO & SAML Support', 
    description: 'Add SAML support for enterprise authentication and integrate with third party IdPs.', 
    priority: 'high', 
    tags: ['Feature', 'Security'], 
    assignee: teamMembers[1], 
    updatedAt: new Date(),
    effect: 'spinning-border',
    subtasks: [
      { id: 's3-1', title: 'Configure authentication strategies', completed: true },
      { id: 's3-2', title: 'Establish cert validation protocols', completed: false }
    ],
    progress: 50
  },
  { 
    id: '4', 
    columnId: 'review', 
    title: 'Landing page redesign', 
    description: 'Review the new glassmorphic aesthetics, floating lights and interactive hero components.', 
    priority: 'medium', 
    tags: ['Design'], 
    updatedAt: new Date(),
    subtasks: [
      { id: 's4-1', title: 'Audit contrast ratios', completed: true },
      { id: 's4-2', title: 'Collect developer feedback on CSS injection', completed: true }
    ],
    progress: 100
  },
  { 
    id: '5', 
    columnId: 'done', 
    title: 'Fix mobile navigation bug', 
    description: 'The glowing hamburger drawer menu was overlapping the logo on mobile screens.', 
    priority: 'high', 
    tags: ['Bug'], 
    assignee: teamMembers[2], 
    updatedAt: new Date(),
    subtasks: [
      { id: 's5-1', title: 'Identify overlay z-index bug', completed: true },
      { id: 's5-2', title: 'Push fix to hotfix branch', completed: true }
    ],
    progress: 100
  },
];

interface CommentItem {
  id: string;
  author: KanbanUser;
  content: string;
  timestamp: string;
}

interface HistoryItem {
  id: string;
  actor: string;
  action: string;
  timestamp: string;
}

interface LeadMessage {
  id: string;
  sender: 'you' | 'lead';
  text: string;
  time: string;
}

interface LeadDetails {
  name: string;
  avatar: string;
  email: string;
  phone: string;
  value: string;
  company: string;
}

export function KanbanView() {
  const { toast } = useToast();

  // Core Kanban states
  const [columns] = useState<KanbanColumnDef[]>(initialColumns);
  const [tasks, setTasks] = useState<KanbanTask[]>(initialTasks);
  const [isBotActive, setIsBotActive] = useState(false);
  const [showToasts, setShowToasts] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [maxVisibleCards, setMaxVisibleCards] = useState<number | undefined>(2);

  // Selection and Bulk Actions state
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  // Time Tracker state
  const [activeTimerTaskId, setActiveTimerTaskId] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const timerIntervalRef = useRef<any>(null);

  // Keyboard Shortcuts modal state
  const [activeKeyboardHelp, setActiveKeyboardHelp] = useState(false);

  // Sorting states
  const [sortBy, setSortBy] = useState<'order' | 'priority' | 'dueDate' | 'title'>('order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Drawer core states
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newTagInput, setNewTagInput] = useState('');

  // Tab management inside drawer to eliminate double overlay modal issues
  const [activeTab, setActiveTab] = useState<'details' | 'chat' | 'crm' | 'erp'>('details');

  // Spotlight effect for lead/task drawer
  const [drawerCoords, setDrawerCoords] = useState({ x: 0, y: 0 });
  const [drawerHovered, setDrawerHovered] = useState(false);

  const handleDrawerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDrawerCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Inline editing states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState('');

  // ─── CRM MOCK DATA ───
  const [leadStageMap, setLeadStageMap] = useState<Record<string, string>>({
    '1': 'Negociação',
    '2': 'Contato Inicial',
    '3': 'Qualificação',
    '4': 'Apresentação',
    '5': 'Ganho (Finalizado)'
  });

  const leadProfiles: Record<string, LeadDetails> = {
    '1': { name: 'Anderson Alencar', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', email: 'anderson@pixonui.com', phone: '+55 (11) 98765-4321', value: 'R$ 85.000,00', company: 'PixonUI Premium' },
    '2': { name: 'Marcus Silva', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100', email: 'marcus@docsintegrator.io', phone: '+55 (21) 99123-4567', value: 'R$ 12.400,00', company: 'Docs API Integrator' },
    '3': { name: 'Eduardo Santos', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', email: 'eduardo@securitypartner.net', phone: '+55 (31) 98111-2222', value: 'R$ 150.000,00', company: 'Security Partner' },
    '4': { name: 'Mariana Costa', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100', email: 'mariana@glowdesign.studio', phone: '+55 (41) 97555-8888', value: 'R$ 48.000,00', company: 'GlowDesign Studio' },
    '5': { name: 'Thiago Oliveira', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', email: 'thiago@mobilebetabuilder.com', phone: '+55 (81) 96333-4444', value: 'R$ 35.000,00', company: 'Mobile Beta Builder' }
  };

  // ─── ERP MOCK DATA ───
  const [erpStatusMap, setErpStatusMap] = useState<Record<string, 'pending' | 'success'>>({
    '1': 'pending',
    '2': 'pending',
    '3': 'pending',
    '4': 'success',
    '5': 'success'
  });

  // ─── INTEGRATED CHAT WITH SPECIFIC LEADS ───
  const [chatInputMessage, setChatInputMessage] = useState('');
  const [isLeadTyping, setIsLeadTyping] = useState(false);
  const [leadChats, setLeadChats] = useState<Record<string, LeadMessage[]>>({
    '1': [
      { id: 'm1', sender: 'lead', text: 'Olá Anderson! Vi que o card está na fase To Do. Conseguiu analisar a planilha de preços?', time: '09:30' },
      { id: 'm2', sender: 'you', text: 'Oi Anderson! Sim, a Sarah está compilando os preços dos concorrentes agora mesmo. Vamos atualizar hoje.', time: '09:35' },
      { id: 'm3', sender: 'lead', text: 'Excelente! Fico no aguardo, isso nos ajudará muito a justificar o valor da proposta.', time: '09:37' }
    ],
    '2': [
      { id: 'm4', sender: 'lead', text: 'Marcus aqui. Preciso de suporte para entender o useVoiceRecorder nas novas rotas.', time: 'Ontem' },
      { id: 'm5', sender: 'you', text: 'Olá Marcus! Estamos atualizando a documentação e já vamos incluir guias interativos para te ajudar.', time: 'Ontem' }
    ],
    '3': [
      { id: 'm6', sender: 'lead', text: 'Olá time! Conseguem garantir a entrega do suporte SSO/SAML até sexta-feira?', time: '10:00' },
      { id: 'm7', sender: 'you', text: 'Com certeza Eduardo, o Alex Rivera já iniciou a integração SAML corporativa.', time: '10:15' }
    ]
  });

  // Rich Comments Feed (Internal Collaboration on the Card)
  const [commentsMap, setCommentsMap] = useState<Record<string, CommentItem[]>>({
    '1': [
      { id: 'c1', author: teamMembers[0] as KanbanUser, content: 'Compilei os relatórios de preço dos concorrentes A e B. Vou anexar a planilha de comparação logo mais!', timestamp: '15 minutos atrás' },
      { id: 'c2', author: teamMembers[1] as KanbanUser, content: 'Perfeito, Sarah! Foque em mapear se eles oferecem planos corporativos sob consulta.', timestamp: '10 minutos atrás' }
    ],
    '3': [
      { id: 'c3', author: teamMembers[2] as KanbanUser, content: 'Os metadados para teste SAML já foram configurados e homologados no ambiente de staging.', timestamp: '1 hora atrás' }
    ]
  });

  // Rich Activity Timeline Logs
  const [historyMap, setHistoryMap] = useState<Record<string, HistoryItem[]>>({
    '1': [
      { id: 'h1', actor: 'Alex Rivera', action: 'criou esta tarefa', timestamp: 'Ontem às 14:32' },
      { id: 'h2', actor: 'Sarah Wilson', action: 'completou a subtarefa "Gather competitor pricing sheets"', timestamp: 'Hoje às 09:15' },
      { id: 'h3', actor: 'Sarah Wilson', action: 'adicionou um comentário', timestamp: 'Hoje às 09:20' }
    ],
    '3': [
      { id: 'h4', actor: 'Alex Rivera', action: 'definiu a prioridade como ALTA', timestamp: 'Ontem às 11:20' },
      { id: 'h5', actor: 'Emily Chen', action: 'completou a subtarefa "Configure authentication strategies"', timestamp: 'Ontem às 14:15' }
    ]
  });

  const [commentInput, setCommentInput] = useState('');

  const channelRef = useRef<BroadcastChannel | null>(null);
  const tasksRef = useRef<KanbanTask[]>(tasks);
  const showToastsRef = useRef(showToasts);

  // Sync tasksRef & showToastsRef outside of render bounds
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  useEffect(() => {
    showToastsRef.current = showToasts;
  }, [showToasts]);

  // Helper log activity to timeline
  const logActivity = (taskId: string, actor: string, action: string) => {
    const newHistory: HistoryItem = {
      id: generateUniqueId(),
      actor,
      action,
      timestamp: 'Agora mesmo'
    };
    setHistoryMap(prev => ({
      ...prev,
      [taskId]: [newHistory, ...(prev[taskId] || [])]
    }));
  };

  // Collaborative change toasts
  const triggerCollaborativeToast = (prev: KanbanTask[], next: KanbanTask[]) => {
    if (!showToastsRef.current) return;

    for (const tNext of next) {
      const tPrev = prev.find(p => p.id === tNext.id);
      if (!tPrev) continue;

      if (tPrev.columnId !== tNext.columnId) {
        const fromCol = initialColumns.find(c => c.id === tPrev.columnId)?.title || tPrev.columnId;
        const toCol = initialColumns.find(c => c.id === tNext.columnId)?.title || tNext.columnId;
        const author = tNext.assignee?.name || 'Membro do Time';
        toast({
          title: 'Tarefa Remanejada 🚀',
          description: `${author} moveu "${tNext.title}" de "${fromCol}" para "${toCol}".`,
          variant: 'info'
        });
        return;
      }

      if (tPrev.priority !== tNext.priority) {
        const author = tNext.assignee?.name || 'Membro do Time';
        toast({
          title: 'Prioridade Alterada ⚡',
          description: `${author} mudou a prioridade de "${tNext.title}" para ${tNext.priority?.toUpperCase()}.`,
          variant: 'info'
        });
        return;
      }
    }
  };

  // Task timer ticker
  useEffect(() => {
    if (activeTimerTaskId) {
      const currentTask = tasks.find(t => t.id === activeTimerTaskId);
      Promise.resolve().then(() => {
        setTimerSeconds(currentTask?.timeSpent || 0);
      });

      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          const nextVal = prev + 1;
          setTasks(prevTasks => prevTasks.map(t => t.id === activeTimerTaskId ? { ...t, timeSpent: nextVal } : t));
          setSelectedTask(prevSel => prevSel && prevSel.id === activeTimerTaskId ? { ...prevSel, timeSpent: nextVal } : prevSel);
          return nextVal;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [activeTimerTaskId]);

  // Global keyboard shortcut dispatcher for Cheat Sheet (?)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        const activeEl = document.activeElement;
        const isTyping = activeEl && (
          activeEl.tagName === 'INPUT' || 
          activeEl.tagName === 'TEXTAREA' || 
          activeEl.getAttribute('contenteditable') === 'true'
        );
        if (!isTyping) {
          e.preventDefault();
          setActiveKeyboardHelp(prev => !prev);
        }
      } else if (e.key === 'Escape') {
        if (activeKeyboardHelp) {
          setActiveKeyboardHelp(false);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activeKeyboardHelp]);

  // Broadcast setup
  useEffect(() => {
    const channel = new BroadcastChannel('pixonui-kanban-realtime');
    channelRef.current = channel;

    channel.onmessage = (event) => {
      const { type, taskId, toColumnId, updatedTasks } = event.data;
      if (type === 'TASK_MOVE' && taskId && toColumnId) {
        setTasks(prev => {
          const updated = prev.map(t => t.id === taskId ? { ...t, columnId: toColumnId, updatedAt: new Date() } : t);
          triggerCollaborativeToast(prev, updated);
          
          setSelectedTask(prevSel => prevSel && prevSel.id === taskId ? { ...prevSel, columnId: toColumnId } : prevSel);
          
          // Log to timeline
          logActivity(taskId, 'Broadcaster', `remanejava a tarefa para a coluna "${toColumnId}" via sinc de abas`);
          return updated;
        });
      } else if (type === 'STATE_SYNC' && updatedTasks) {
        setTasks(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(updatedTasks)) {
            triggerCollaborativeToast(prev, updatedTasks);
          }
          
          setSelectedTask(prevSel => {
            if (!prevSel) return null;
            const updatedSel = updatedTasks.find((t: KanbanTask) => t.id === prevSel.id);
            return updatedSel ? updatedSel : prevSel;
          });

          return updatedTasks;
        });
      }
    };

    channel.postMessage({ type: 'STATE_SYNC', updatedTasks: tasksRef.current });

    return () => {
      channel.close();
    };
  }, []);

  // Bot Simulator
  useEffect(() => {
    if (!isBotActive) return;

    const interval = setInterval(() => {
      setTasks(prev => {
        const next = [...prev];
        const randomIndex = Math.floor(Math.random() * next.length);
        const task = next[randomIndex];
        if (!task) return prev;

        const actionType = Math.floor(Math.random() * 3);
        const updatedTask = { ...task, updatedAt: new Date() };

        if (actionType === 0) {
          const colIds = ['todo', 'in-progress', 'review', 'done'];
          const nextCol = colIds[Math.floor(Math.random() * colIds.length)] || 'todo';
          updatedTask.columnId = nextCol;
          logActivity(task.id, 'Bot Simulador', `moveu a tarefa para a coluna "${nextCol}"`);
        } else if (actionType === 1) {
          const currentSubtasks = task.subtasks || [
            { id: 's1', title: 'Iniciar auditoria de build', completed: false },
            { id: 's2', title: 'Corrigir dependências de CSS', completed: false }
          ];
          const updatedSub = currentSubtasks.map(s => 
            Math.random() > 0.5 ? { ...s, completed: !s.completed } : s
          );
          updatedTask.subtasks = updatedSub;
          
          const total = updatedSub.length;
          const completed = updatedSub.filter(s => s.completed).length;
          updatedTask.progress = total > 0 ? Math.round((completed / total) * 100) : 0;
          logActivity(task.id, 'Bot Simulador', `atualizou o checklist de subtarefas (${completed}/${total})`);
        } else {
          const priorities: Array<'low' | 'medium' | 'high' | 'urgent'> = ['low', 'medium', 'high', 'urgent'];
          const prio = priorities[Math.floor(Math.random() * priorities.length)] || 'medium';
          updatedTask.priority = prio;
          logActivity(task.id, 'Bot Simulador', `redefiniu a prioridade para "${prio}"`);
        }

        const newTasks = next.map(t => t.id === task.id ? updatedTask : t);
        setSelectedTask(prevSel => prevSel && prevSel.id === task.id ? updatedTask : prevSel);
        triggerCollaborativeToast(prev, newTasks);

        channelRef.current?.postMessage({ type: 'STATE_SYNC', updatedTasks: newTasks });
        return newTasks;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isBotActive]);

  const {
    completionRate,
    activeTasks,
    completedTasks,
    bottlenecks,
    overloads,
    predictions
  } = useKanbanAnalytics(tasks, columns);

  const handleTaskSelectionChange = (toggledIds: string[]) => {
    if (toggledIds.length === 0) return;
    const toggledId = toggledIds[0]!;
    setSelectedTaskIds(prev => 
      prev.includes(toggledId) 
        ? prev.filter(id => id !== toggledId) 
        : [...prev, toggledId]
    );
  };

  const handleTaskMove = (taskId: string, toColumnId: string) => {
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, columnId: toColumnId, updatedAt: new Date() } : t);
    setTasks(updatedTasks);
    setSelectedTask(prevSel => prevSel && prevSel.id === taskId ? { ...prevSel, columnId: toColumnId } : prevSel);
    
    logActivity(taskId, 'Você', `moveu a tarefa para a coluna "${toColumnId}"`);
    channelRef.current?.postMessage({ type: 'TASK_MOVE', taskId, toColumnId });
  };

  const dropZones: KanbanDropZoneDef[] = [
    {
      id: 'delete',
      label: 'Excluir Lead / Descartar',
      variant: 'danger',
      icon: <Trash2 className="h-4 w-4 shrink-0" />
    },
    {
      id: 'win',
      label: 'Lead Ganho / Converter',
      variant: 'success',
      icon: <Check className="h-4 w-4 shrink-0" />
    },
    {
      id: 'cold',
      label: 'Mover para Banco de Leads',
      variant: 'info',
      icon: <Briefcase className="h-4 w-4 shrink-0" />
    }
  ];

  const handleDropInZone = (taskId: string, zoneId: string) => {
    if (zoneId === 'delete') {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast({
        title: 'Lead Descartado 🗑️',
        description: 'O lead foi excluído e arquivado com sucesso.',
        variant: 'destructive'
      });
    } else if (zoneId === 'win') {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, columnId: 'done', progress: 100 } : t));
      toast({
        title: 'Lead Ganho! 🎉',
        description: 'Parabéns! O lead foi convertido com sucesso para Ganho!',
        variant: 'success'
      });
    } else if (zoneId === 'cold') {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, columnId: 'todo', priority: 'low' } : t));
      toast({
        title: 'Movido para Banco de Leads ❄️',
        description: 'O lead foi colocado em banho maria no Banco de Leads.',
        variant: 'info'
      });
    }
  };

  const saveTaskUpdates = (updatedTask: KanbanTask) => {
    const updatedTasks = tasks.map(t => t.id === updatedTask.id ? { ...updatedTask, updatedAt: new Date() } : t);
    setTasks(updatedTasks);
    setSelectedTask(updatedTask);
    channelRef.current?.postMessage({ type: 'STATE_SYNC', updatedTasks });
  };

  const handleTaskClick = (task: KanbanTask) => {
    setSelectedTask(task);
    setIsEditingTitle(false);
    setIsEditingDesc(false);
    setEditingSubtaskId(null);
    setActiveTab('details'); // Reset smoothly to details tab on opening
  };

  // Subtasks
  const handleToggleSubtask = (subId: string) => {
    if (!selectedTask) return;
    const currentSubtasks = selectedTask.subtasks || [];
    const subtask = currentSubtasks.find(s => s.id === subId);
    const updatedSubtasks = currentSubtasks.map(s => s.id === subId ? { ...s, completed: !s.completed } : s);
    
    const total = updatedSubtasks.length;
    const completed = updatedSubtasks.filter(s => s.completed).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    saveTaskUpdates({
      ...selectedTask,
      subtasks: updatedSubtasks,
      progress
    });

    if (subtask) {
      logActivity(selectedTask.id, 'Você', `${subtask.completed ? 'desmarcou' : 'marcou'} a subtarefa "${subtask.title}"`);
    }
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newSubtaskTitle.trim()) return;
    
    const currentSubtasks = selectedTask.subtasks || [];
    const newSub: Subtask = {
      id: generateUniqueId(),
      title: newSubtaskTitle.trim(),
      completed: false
    };
    const updatedSubtasks = [...currentSubtasks, newSub];

    const total = updatedSubtasks.length;
    const completed = updatedSubtasks.filter(s => s.completed).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    saveTaskUpdates({
      ...selectedTask,
      subtasks: updatedSubtasks,
      progress
    });
    
    logActivity(selectedTask.id, 'Você', `adicionou a subtarefa "${newSub.title}"`);
    setNewSubtaskTitle('');
  };

  const handleDeleteSubtask = (subId: string) => {
    if (!selectedTask) return;
    const currentSubtasks = selectedTask.subtasks || [];
    const subtask = currentSubtasks.find(s => s.id === subId);
    const updatedSubtasks = currentSubtasks.filter(s => s.id !== subId);

    const total = updatedSubtasks.length;
    const completed = updatedSubtasks.filter(s => s.completed).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    saveTaskUpdates({
      ...selectedTask,
      subtasks: updatedSubtasks,
      progress
    });

    if (subtask) {
      logActivity(selectedTask.id, 'Você', `removeu a subtarefa "${subtask.title}"`);
    }
  };

  const handleStartEditingSubtask = (sub: Subtask) => {
    setEditingSubtaskId(sub.id);
    setEditingSubtaskTitle(sub.title);
  };

  const handleSaveSubtaskTitle = (subId: string) => {
    if (!selectedTask || !editingSubtaskTitle.trim()) return;
    const currentSubtasks = selectedTask.subtasks || [];
    const updated = currentSubtasks.map(s => s.id === subId ? { ...s, title: editingSubtaskTitle.trim() } : s);
    saveTaskUpdates({ ...selectedTask, subtasks: updated });
    logActivity(selectedTask.id, 'Você', `renomeou subtarefa para "${editingSubtaskTitle.trim()}"`);
    setEditingSubtaskId(null);
  };

  // Tags
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newTagInput.trim()) return;
    
    const currentTags = selectedTask.tags || [];
    if (currentTags.includes(newTagInput.trim())) return;

    saveTaskUpdates({
      ...selectedTask,
      tags: [...currentTags, newTagInput.trim()]
    });
    logActivity(selectedTask.id, 'Você', `vinculou a etiqueta "${newTagInput.trim()}"`);
    setNewTagInput('');
  };

  const handleDeleteTag = (tagToRemove: string) => {
    if (!selectedTask) return;
    const currentTags = selectedTask.tags || [];
    saveTaskUpdates({
      ...selectedTask,
      tags: currentTags.filter(t => t !== tagToRemove)
    });
    logActivity(selectedTask.id, 'Você', `desvinculou a etiqueta "${tagToRemove}"`);
  };

  // Post Internal Comment on Card
  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !commentInput.trim()) return;

    const newComment: CommentItem = {
      id: generateUniqueId(),
      author: { id: 'you', name: 'Você (Anderson)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
      content: commentInput.trim(),
      timestamp: 'Agora mesmo'
    };

    setCommentsMap(prev => ({
      ...prev,
      [selectedTask.id]: [...(prev[selectedTask.id] || []), newComment]
    }));

    logActivity(selectedTask.id, 'Você', 'comentou na tarefa');
    setCommentInput('');

    // Simulated internal team member reply in 1.5s
    setTimeout(() => {
      const bots = [
        { member: teamMembers[0] as KanbanUser, reply: 'Excelente observação, Anderson! Vou ajustar os próximos passos aqui.' },
        { member: teamMembers[1] as KanbanUser, reply: 'Combinado! Comentário anotado no escopo do sprint.' },
        { member: teamMembers[2] as KanbanUser, reply: 'Show! Concordo totalmente com o ponto.' }
      ];

      const chosenBot = bots[Math.floor(Math.random() * bots.length)] || bots[0]!;
      const botComment: CommentItem = {
        id: generateUniqueId(),
        author: chosenBot.member,
        content: chosenBot.reply,
        timestamp: '1 segundo atrás'
      };

      setCommentsMap(prev => ({
        ...prev,
        [selectedTask.id]: [...(prev[selectedTask.id] || []), botComment]
      }));

      logActivity(selectedTask.id, chosenBot.member.name, 'comentou na tarefa');
    }, 1500);
  };

  // Send Direct Message to Lead (Bate-papo)
  const handleSendLeadMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !chatInputMessage.trim()) return;

    const currentLead = leadProfiles[selectedTask.id] || { name: 'Lead Geral', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' };
    const newMsg: LeadMessage = {
      id: generateUniqueId(),
      sender: 'you',
      text: chatInputMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setLeadChats(prev => ({
      ...prev,
      [selectedTask.id]: [...(prev[selectedTask.id] || []), newMsg]
    }));

    setChatInputMessage('');
    setIsLeadTyping(true);

    // Dynamic response simulation from Lead Client
    setTimeout(() => {
      const answers = [
        `Oi, obrigado pelo retorno! Estarei disponível para alinhar os detalhes às 15:00.`,
        `Muito bom! Isso atende perfeitamente ao que nossa equipe jurídica solicitou.`,
        `Entendido. Vou subir essas informações para o nosso comitê executivo.`,
        `Excelente resposta! Vou repassar os dados para o faturamento.`
      ];
      const randomAnswer = answers[Math.floor(Math.random() * answers.length)] || answers[0]!;

      const leadReply: LeadMessage = {
        id: generateUniqueId(),
        sender: 'lead',
        text: randomAnswer,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setLeadChats(prev => ({
        ...prev,
        [selectedTask.id]: [...(prev[selectedTask.id] || []), leadReply]
      }));

      setIsLeadTyping(false);

      toast({
        title: `Mensagem de ${currentLead.name}`,
        description: randomAnswer,
        variant: 'success'
      });
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-6 h-full pb-6 relative text-zinc-900 dark:text-white">
      
      {/* Real-time Simulated socket controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-[#0F172A]/40 border border-zinc-200 dark:border-cyan-500/10 shadow-sm dark:shadow-none backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
          </div>
          <div>
            <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <Radio className="h-3 w-3 text-cyan-550 dark:text-cyan-400 animate-pulse" /> Broadcaster Kanban Tab Sync
            </div>
            <div className="text-[10px] text-zinc-500 dark:text-white/50">Abra o Kanban em duas abas e clique nos cards para testar a sincronia do Painel Bitrix!</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer select-none border-r border-zinc-200 dark:border-white/5 pr-4">
            <input 
              type="checkbox" 
              checked={showToasts}
              onChange={(e) => setShowToasts(e.target.checked)}
              className="rounded border-cyan-500/30 text-cyan-500 focus:ring-cyan-500/20 bg-slate-900/50 h-3.5 w-3.5 transition-colors cursor-pointer"
            />
            <span className="text-[10px] text-zinc-600 dark:text-white/60 font-medium">Notificações</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none border-r border-zinc-200 dark:border-white/5 pr-4">
            <input 
              type="checkbox" 
              checked={isLoading}
              onChange={(e) => setIsLoading(e.target.checked)}
              className="rounded border-cyan-500/30 text-cyan-500 focus:ring-cyan-500/20 bg-slate-900/50 h-3.5 w-3.5 transition-colors cursor-pointer"
            />
            <span className="text-[10px] text-zinc-600 dark:text-white/60 font-bold flex items-center gap-1">
              ✨ Skeleton Loader
            </span>
          </label>

          <div className="flex items-center gap-2 border-r border-zinc-200 dark:border-white/5 pr-4">
            <span className="text-[10px] text-zinc-500 dark:text-white/40 font-bold uppercase tracking-wider flex items-center gap-1">
              Scroll limite:
            </span>
            <select
              value={maxVisibleCards || ''}
              onChange={(e) => setMaxVisibleCards(e.target.value ? Number(e.target.value) : undefined)}
              className="bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-full px-3 py-1 text-[11px] text-zinc-800 dark:text-white font-bold cursor-pointer focus:outline-none"
            >
              <option value="" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">Sem limite</option>
              <option value="1" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">1 Card</option>
              <option value="2" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">2 Cards</option>
              <option value="3" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">3 Cards</option>
              <option value="4" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">4 Cards</option>
            </select>
          </div>

          <div className="flex items-center gap-2 border-r border-zinc-200 dark:border-white/5 pr-4">
            <span className="text-[10px] text-zinc-500 dark:text-white/40 font-bold uppercase tracking-wider flex items-center gap-1">
              Ordenar:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-full px-3 py-1 text-[11px] text-zinc-800 dark:text-white font-semibold cursor-pointer focus:outline-none"
            >
              <option value="order" className="bg-white dark:bg-slate-900 text-zinc-900 dark:text-white">Padrão</option>
              <option value="priority" className="bg-white dark:bg-slate-900 text-zinc-900 dark:text-white">Prioridade</option>
              <option value="dueDate" className="bg-white dark:bg-slate-900 text-zinc-900 dark:text-white">Vencimento</option>
              <option value="title" className="bg-white dark:bg-slate-900 text-zinc-900 dark:text-white">Título</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-1 rounded-full bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-600 dark:text-white/70 hover:text-zinc-900 dark:hover:text-white transition-all text-[10px] w-6 h-6 flex items-center justify-center font-bold"
              title={sortOrder === 'asc' ? 'Ordem Crescente' : 'Ordem Decrescente'}
            >
              {sortOrder === 'asc' ? '▲' : '▼'}
            </button>
          </div>

          <div className="flex items-center gap-1">
            <div className="text-[10px] text-zinc-500 dark:text-white/40 font-bold uppercase tracking-wider mr-2 flex items-center gap-1">
              <Users className="h-3 w-3" /> Membros Ativos:
            </div>
            <div className="flex -space-x-2 overflow-hidden">
              <img className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-[#0F172A]" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" alt="Sarah" title="Sarah Wilson (Online)" />
              <img className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-[#0F172A]" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" alt="Alex" title="Alex Rivera (Online)" />
              <img className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-[#0F172A]" src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100" alt="Emily" title="Emily Chen (Busy)" />
            </div>
          </div>

          <button
            onClick={() => setIsBotActive(prev => !prev)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
              isBotActive 
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20 shadow-lg shadow-rose-500/5' 
                : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20 shadow-lg shadow-cyan-500/5'
            }`}
          >
            {isBotActive ? (
              <>
                <Pause className="h-3.5 w-3.5 fill-rose-500 dark:fill-rose-400 animate-pulse" /> Pausar Bot Simulador
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-cyan-500 dark:fill-cyan-400" /> Rodar Bot Simulador
              </>
            )}
          </button>
        </div>
      </div>

      {/* Real-time Predictive Heuristic Analytics Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-3xl bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 backdrop-blur-md shadow-sm dark:shadow-none">
        <div className="flex items-center gap-4 p-3 bg-zinc-50/50 dark:bg-white/[0.01] rounded-2xl border border-zinc-200/60 dark:border-white/[0.02]">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 dark:text-blue-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 dark:text-white/40 uppercase tracking-wider font-bold">Progresso Kanban</div>
            <div className="text-lg font-black text-zinc-900 dark:text-white">{completionRate}% <span className="text-xs text-zinc-500 dark:text-white/50 font-normal">concluído</span></div>
            <div className="text-[11px] text-zinc-600 dark:text-white/60">{completedTasks} de {activeTasks} tarefas entregues</div>
          </div>
        </div>

        <div className="flex items-center gap-4 p-3 bg-zinc-50/50 dark:bg-white/[0.01] rounded-2xl border border-zinc-200/60 dark:border-white/[0.02]">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 dark:text-white/40 uppercase tracking-wider font-bold">Confiança IA da Entrega</div>
            <div className="text-lg font-black text-cyan-600 dark:text-cyan-400">{predictions.confidenceScore}%</div>
            <div className="text-[11px] text-zinc-600 dark:text-white/60">{predictions.estimatedHoursToComplete}h estimadas para concluir</div>
          </div>
        </div>

        <div className="md:col-span-2 flex items-center gap-4 p-3 bg-zinc-50/50 dark:bg-white/[0.01] rounded-2xl border border-zinc-200/60 dark:border-white/[0.02] overflow-hidden">
          <div className={`p-3 rounded-xl ${bottlenecks.length > 0 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-green-500/10 text-green-600 dark:text-green-400'}`}>
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-zinc-500 dark:text-white/40 uppercase tracking-wider font-bold">Análise Heurística de Risco</div>
            <div className="truncate text-xs font-semibold text-zinc-800 dark:text-white">
              {bottlenecks.length > 0 ? (
                <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 inline" /> {bottlenecks[0]?.reason}
                </span>
              ) : (
                <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 inline text-green-500 dark:text-green-400" /> Fluxos saudáveis. Nenhum gargalo previsto!
                </span>
              )}
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-white/40 truncate">
              {overloads.length > 0 ? overloads[0]?.recommendation : "Capacidades operacionais dentro dos limites ideais."}
            </div>
          </div>
        </div>
      </div>

      {/* Main Kanban View */}
      <div className="flex-1 min-h-0 bg-zinc-100/70 dark:bg-white/[0.01] rounded-3xl border border-zinc-200 dark:border-white/5 overflow-hidden shadow-inner p-2">
        <Kanban 
          columns={columns}
          tasks={tasks}
          onTaskMove={handleTaskMove}
          onTaskClick={handleTaskClick}
          onColumnMove={() => {}}
          className="h-full"
          selectable={true}
          selectedTaskIds={selectedTaskIds}
          onTaskSelectionChange={handleTaskSelectionChange}
          activeTimerTaskId={activeTimerTaskId}
          onTaskTimerToggle={(taskId) => {
            const isStarting = activeTimerTaskId !== taskId;
            setActiveTimerTaskId(isStarting ? taskId : null);
            logActivity(taskId, 'Anderson Alencar', isStarting ? 'iniciou o rastreador de tempo (timer ativo)' : 'pausou o temporizador de horas');
            toast({
              title: isStarting ? 'Timer Iniciado! ⏱️' : 'Timer Pausado! ⏸️',
              description: isStarting ? `Iniciada a contagem ativa de horas trabalhadas.` : `Rastreador de tempo interrompido.`,
              variant: 'info'
            });
          }}
          sortBy={sortBy}
          sortOrder={sortOrder}
          isLoading={isLoading}
          maxVisibleCards={maxVisibleCards}
          dropZones={dropZones}
          onDropInZone={handleDropInZone}
        />
      </div>

      {/* ─── INTERACTIVE BITRIX-STYLE TASK WORK CENTER (DRAWER) ─── */}
      {selectedTask && (() => {
        const lead = leadProfiles[selectedTask.id] || { 
          name: 'Lead Geral', 
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
          email: 'contato@cliente.com',
          phone: '+55 (11) 90000-0000',
          value: 'R$ 0,00',
          company: 'Empresa do Card'
        };

        const activeLeadMessages = leadChats[selectedTask.id] || [];

        return (
          <>
            {/* Backdrop Overlay */}
            <div 
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 transition-all duration-300"
              onClick={() => setSelectedTask(null)}
            />

            {/* Drawer Box */}
            <div 
              onMouseMove={handleDrawerMouseMove}
              onMouseEnter={() => setDrawerHovered(true)}
              onMouseLeave={() => setDrawerHovered(false)}
              className="fixed right-0 top-0 bottom-0 w-full md:w-[860px] bg-white/80 dark:bg-[#070709]/75 border-l border-zinc-200 dark:border-white/10 z-50 shadow-2xl backdrop-blur-3xl flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden text-zinc-900 dark:text-white"
            >
              {/* Spotlight Glow Effect */}
              <div
                className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 ease-in-out"
                style={{
                  opacity: drawerHovered ? 1 : 0,
                  background: `radial-gradient(800px circle at ${drawerCoords.x}px ${drawerCoords.y}px, rgba(147, 51, 234, 0.05) 0%, rgba(6, 182, 212, 0.05) 50%, transparent 80%)`,
                }}
              />
              
              {/* Top Dynamic Tab Header - Inspired by modern CRM workspace tabs */}
              <div className="relative z-10 flex items-center justify-between px-6 py-4 bg-zinc-50/40 dark:bg-zinc-900/30 border-b border-zinc-200 dark:border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-purple-500 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Card #{selectedTask.id}</span>
                </div>

                {/* Seamless Tab Switches to eliminate modal overlay issues */}
                <div className="flex items-center gap-1.5 bg-zinc-100/50 dark:bg-black/40 p-1 rounded-xl border border-zinc-200 dark:border-white/5">
                  <button 
                    onClick={() => setActiveTab('details')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === 'details' 
                        ? 'bg-purple-600/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 shadow-md shadow-purple-500/5' 
                        : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white border border-transparent'
                    }`}
                  >
                    <Activity className="h-3.5 w-3.5" /> Tarefa
                  </button>
                  <button 
                    onClick={() => setActiveTab('chat')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === 'chat' 
                        ? 'bg-cyan-600/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shadow-md shadow-cyan-500/5' 
                        : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white border border-transparent'
                    }`}
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> Bate-papo c/ Lead
                  </button>
                  <button 
                    onClick={() => setActiveTab('crm')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === 'crm' 
                        ? 'bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-md shadow-blue-500/5' 
                        : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white border border-transparent'
                    }`}
                  >
                    <Briefcase className="h-3.5 w-3.5" /> CRM Ficha
                  </button>
                  <button 
                    onClick={() => setActiveTab('erp')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === 'erp' 
                        ? 'bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-md shadow-emerald-500/5' 
                        : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white border border-transparent'
                    }`}
                  >
                    <Receipt className="h-3.5 w-3.5" /> ERP Fiscal
                  </button>
                </div>

                <button 
                  onClick={() => setSelectedTask(null)}
                  className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 text-zinc-500 dark:text-white/50 hover:text-zinc-950 dark:hover:text-white transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* MAIN CONTENT PORTAL (BASED ON ACTIVE TAB) */}
              <div className="relative z-10 flex-1 min-h-0 overflow-hidden flex flex-col md:flex-row">

                {/* TAB 1: DETAILS (Macro, comments, subtasks) */}
                {activeTab === 'details' && (
                  <>
                    {/* Left Panel: Core Data */}
                    <div className="flex-1 p-6 overflow-y-auto space-y-6 border-r border-zinc-200 dark:border-white/5 flex flex-col h-full scrollbar-thin">
                      
                      {/* Title Inline Edit */}
                      <div className="space-y-1">
                        {isEditingTitle ? (
                          <input 
                            type="text" 
                            value={selectedTask.title}
                            autoFocus
                            onBlur={() => setIsEditingTitle(false)}
                            onChange={(e) => saveTaskUpdates({ ...selectedTask, title: e.target.value })}
                            onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingTitle(false); }}
                            className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-purple-500/40 rounded-xl px-3 py-1.5 text-xl text-zinc-900 dark:text-white font-black focus:outline-none transition-all"
                          />
                        ) : (
                          <h2 
                            onDoubleClick={() => setIsEditingTitle(true)}
                            className="group text-2xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5 cursor-pointer hover:bg-zinc-100 dark:hover:bg-white/5 p-1 rounded-lg transition-all"
                            title="Duplo clique para editar o título"
                          >
                            <span>{selectedTask.title}</span>
                            <Pencil className="h-3.5 w-3.5 text-zinc-400 dark:text-white/20 group-hover:text-purple-400 opacity-0 group-hover:opacity-100 transition-all" />
                            <span className="text-[10px] text-zinc-400 dark:text-white/30 font-normal select-none opacity-0 group-hover:opacity-100 transition-all">(duplo clique para editar)</span>
                          </h2>
                        )}
                      </div>

                      {/* Description Inline Edit */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-zinc-500 dark:text-white/40 uppercase tracking-widest block">Descrição Detalhada</span>
                        {isEditingDesc ? (
                          <textarea 
                            rows={4}
                            value={selectedTask.description || ''}
                            autoFocus
                            onBlur={() => setIsEditingDesc(false)}
                            onChange={(e) => saveTaskUpdates({ ...selectedTask, description: e.target.value })}
                            className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-purple-500/40 rounded-xl px-3 py-2 text-xs text-zinc-850 dark:text-white/90 focus:outline-none transition-all resize-none"
                          />
                        ) : (
                          <div 
                            onDoubleClick={() => setIsEditingDesc(true)}
                            className="group p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/[0.04] cursor-pointer transition-all text-xs text-zinc-700 dark:text-white/80 leading-relaxed relative"
                            title="Duplo clique para editar a descrição"
                          >
                            <p>{selectedTask.description || 'Nenhuma descrição adicionada. Dê duplo clique para incluir uma descrição detalhada da atividade...'}</p>
                            <Pencil className="absolute right-3 top-3 h-3.5 w-3.5 text-zinc-400 dark:text-white/10 group-hover:text-purple-400 opacity-0 group-hover:opacity-100 transition-all" />
                          </div>
                        )}
                      </div>

                      {/* Subtasks Checklist */}
                      <div className="space-y-3 bg-zinc-50/50 dark:bg-white/[0.01] p-4 rounded-2xl border border-zinc-200 dark:border-white/5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-zinc-500 dark:text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                            📌 Subtarefas Checklist ({selectedTask.subtasks?.length || 0})
                          </span>
                          <span className="text-xs font-black text-purple-600 dark:text-purple-400">{selectedTask.progress || 0}% Concluído</span>
                        </div>

                        <div className="w-full bg-zinc-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden mb-2">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-300"
                            style={{ width: `${selectedTask.progress || 0}%` }}
                          />
                        </div>

                        <div className="space-y-2 max-h-[160px] overflow-y-auto scrollbar-thin">
                          {selectedTask.subtasks && selectedTask.subtasks.map(sub => (
                            <div 
                              key={sub.id} 
                              className="flex items-center justify-between p-2 rounded-xl bg-zinc-50/50 dark:bg-white/[0.01] hover:bg-zinc-100/50 dark:hover:bg-white/[0.02] border border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10 transition-all gap-3 group"
                            >
                              <button 
                                onClick={() => handleToggleSubtask(sub.id)}
                                className={`h-4.5 w-4.5 rounded border flex items-center justify-center transition-all ${
                                  sub.completed 
                                    ? 'bg-purple-500 border-purple-500 text-white' 
                                    : 'border-zinc-300 dark:border-white/20 text-transparent hover:border-purple-500/50 hover:text-purple-500/20'
                                }`}
                              >
                                <Check className="h-3 w-3" />
                              </button>

                              {editingSubtaskId === sub.id ? (
                                <input 
                                  type="text"
                                  value={editingSubtaskTitle}
                                  autoFocus
                                  onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                                  onBlur={() => handleSaveSubtaskTitle(sub.id)}
                                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveSubtaskTitle(sub.id); }}
                                  className="flex-1 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-purple-500/40 rounded px-2 py-0.5 text-xs text-zinc-900 dark:text-white focus:outline-none"
                                />
                              ) : (
                                <span 
                                  onDoubleClick={() => handleStartEditingSubtask(sub)}
                                  className={`text-xs flex-1 truncate cursor-pointer hover:text-purple-500 transition-colors ${sub.completed ? 'line-through text-zinc-400 dark:text-white/30' : 'text-zinc-800 dark:text-white/80'}`}
                                  title="Duplo clique para renomear"
                                >
                                  {sub.title}
                                </span>
                              )}

                              <button 
                                onClick={() => handleDeleteSubtask(sub.id)}
                                className="p-1 text-zinc-400 dark:text-white/40 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        <form onSubmit={handleAddSubtask} className="flex gap-2 pt-2">
                          <input 
                            type="text" 
                            placeholder="Nova subtarefa (Enter)..."
                            value={newSubtaskTitle}
                            onChange={(e) => setNewSubtaskTitle(e.target.value)}
                            className="flex-1 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:border-purple-500/50 focus:ring-0 focus:outline-none transition-all"
                          />
                          <button 
                            type="submit"
                            className="px-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-bold text-xs flex items-center gap-1 transition-all"
                          >
                            <Plus className="h-3.5 w-3.5" /> Adicionar
                          </button>
                        </form>
                      </div>

                      {/* Internal Task Comments */}
                      <div className="space-y-4 border-t border-zinc-200 dark:border-white/5 pt-4">
                        <span className="text-[10px] font-bold text-zinc-500 dark:text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                          <MessageSquare className="h-3.5 w-3.5 text-purple-500 dark:text-purple-400" /> Comentários Internos da Tarefa ({commentsMap[selectedTask.id]?.length || 0})
                        </span>

                        <div className="space-y-3 max-h-[190px] overflow-y-auto pr-1 scrollbar-thin">
                          {(commentsMap[selectedTask.id] || []).map(comment => (
                            <div key={comment.id} className="flex gap-3 bg-zinc-50/50 dark:bg-white/[0.01] border border-zinc-200 dark:border-white/5 p-3 rounded-2xl">
                              <img 
                                src={comment.author.avatar} 
                                alt={comment.author.name} 
                                className="h-8 w-8 rounded-full object-cover shrink-0 ring-1 ring-zinc-200 dark:ring-white/10"
                              />
                              <div className="space-y-1 flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-black text-zinc-900 dark:text-white">{comment.author.name}</span>
                                  <span className="text-[10px] text-zinc-400 dark:text-white/40 flex items-center gap-1"><Clock className="h-3 w-3" /> {comment.timestamp}</span>
                                </div>
                                <p className="text-xs text-zinc-700 dark:text-white/80 leading-relaxed break-words">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                          {(!commentsMap[selectedTask.id] || commentsMap[selectedTask.id]!.length === 0) && (
                            <div className="text-center py-6 text-zinc-400 dark:text-white/20 text-xs flex flex-col items-center gap-2">
                              <MessageCircle className="h-8 w-8 text-zinc-300 dark:text-white/10" />
                              <span>Nenhum comentário associado. Envie uma nota de alinhamento abaixo!</span>
                            </div>
                          )}
                        </div>

                        <form onSubmit={handlePostComment} className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Adicione observações internas..."
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            className="flex-1 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-purple-500/50 focus:ring-0 focus:outline-none transition-all"
                          />
                          <button 
                            type="submit"
                            className="p-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-white transition-all flex items-center justify-center h-9 w-9 shrink-0"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        </form>
                      </div>

                      {/* Detailed Activity Timeline */}
                      <div className="space-y-3 border-t border-zinc-200 dark:border-white/5 pt-4 mt-auto">
                        <span className="text-[10px] font-bold text-zinc-500 dark:text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                          <Activity className="h-3.5 w-3.5 text-purple-500 dark:text-purple-400" /> Timeline de Atividades do Card
                        </span>

                        <div className="relative border-l border-zinc-200 dark:border-white/10 pl-4 ml-2.5 space-y-4 max-h-[140px] overflow-y-auto scrollbar-thin">
                          {(historyMap[selectedTask.id] || []).map((history) => (
                            <div key={history.id} className="relative text-[11px]">
                              <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50 border border-white dark:border-zinc-950" />
                              <div className="flex justify-between items-start gap-4">
                                <span className="text-zinc-700 dark:text-white/80">
                                  <strong className="text-purple-600 dark:text-purple-400 font-bold">{history.actor}</strong> {history.action}
                                </span>
                                <span className="text-zinc-400 dark:text-white/30 text-[10px] shrink-0">{history.timestamp}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Right Panel: Side attributes and shortcuts */}
                    <div className="w-full md:w-[280px] p-6 bg-zinc-50/60 dark:bg-zinc-950/40 overflow-y-auto space-y-6 flex flex-col justify-between border-t md:border-t-0 border-zinc-200 dark:border-white/5 h-full scrollbar-thin">
                      <div className="space-y-6">
                        
                        <div className="space-y-4">
                          <Heading as="h4" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-white/5 pb-2">Status & Atributos</Heading>
                          
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-zinc-500 dark:text-white/40 uppercase tracking-widest">Responsável</label>
                            <select 
                              value={selectedTask.assignee?.id || ''}
                              onChange={(e) => {
                                const member = teamMembers.find(m => m.id === e.target.value) || undefined;
                                saveTaskUpdates({ ...selectedTask, assignee: member });
                                logActivity(selectedTask.id, 'Você', `redefiniu o responsável para "${member?.name || 'Sem responsável'}"`);
                              }}
                              className="w-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-purple-500/50 focus:ring-0 focus:outline-none transition-all font-semibold cursor-pointer"
                            >
                              <option value="" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">Sem Responsável</option>
                              {teamMembers.map(member => (
                                <option key={member.id} value={member.id} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                                  {member.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-zinc-500 dark:text-white/40 uppercase tracking-widest">Prioridade</label>
                            <select 
                              value={selectedTask.priority || 'medium'}
                              onChange={(e) => {
                                saveTaskUpdates({ ...selectedTask, priority: e.target.value as any });
                                logActivity(selectedTask.id, 'Você', `alterou a prioridade para "${e.target.value}"`);
                              }}
                              className="w-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-purple-500/50 focus:ring-0 focus:outline-none transition-all font-semibold cursor-pointer"
                            >
                              <option value="low" className="bg-white dark:bg-zinc-900 text-zinc-400">Baixa</option>
                              <option value="medium" className="bg-white dark:bg-zinc-900 text-blue-500 dark:text-blue-400">Média</option>
                              <option value="high" className="bg-white dark:bg-zinc-900 text-orange-500 dark:text-orange-400">Alta</option>
                              <option value="urgent" className="bg-white dark:bg-zinc-900 text-rose-500 dark:text-rose-400 font-bold">Urgente</option>
                            </select>
                          </div>
                        </div>

                        {/* Shortcuts to tabs inside sidebar */}
                        <div className="space-y-3">
                          <Heading as="h4" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-white/5 pb-2">Atalhos Rápidos</Heading>
                          <div className="space-y-2">
                            <button 
                              onClick={() => setActiveTab('chat')}
                              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 transition-all text-left group"
                            >
                              <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
                                <MessageCircle className="h-4 w-4" /> Bate-papo c/ Lead
                              </span>
                              <ArrowRight className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button 
                              onClick={() => setActiveTab('crm')}
                              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-all text-left group"
                            >
                              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                                <Briefcase className="h-4 w-4" /> CRM Ficha Lead
                              </span>
                              <ArrowRight className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button 
                              onClick={() => setActiveTab('erp')}
                              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all text-left group"
                            >
                              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                <Receipt className="h-4 w-4" /> Faturamento ERP
                              </span>
                              <ArrowRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="space-y-3">
                          <Heading as="h4" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-white/5 pb-2">Etiquetas & Tags</Heading>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedTask.tags && selectedTask.tags.map(tag => (
                              <span 
                                key={tag}
                                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-white/5 text-zinc-700 dark:text-white/70 border border-zinc-200 dark:border-white/10"
                              >
                                {tag}
                                <button onClick={() => handleDeleteTag(tag)} className="text-zinc-400 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white transition-colors">
                                  <X className="h-2 w-2" />
                                </button>
                              </span>
                            ))}
                          </div>

                          <form onSubmit={handleAddTag} className="flex gap-1.5 pt-1">
                            <input 
                              type="text" 
                              placeholder="Nova tag..."
                              value={newTagInput}
                              onChange={(e) => setNewTagInput(e.target.value)}
                              className="flex-1 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-xs text-zinc-900 dark:text-white focus:border-purple-500/50 focus:ring-0 focus:outline-none transition-all"
                            />
                            <button type="submit" className="px-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 rounded-lg text-zinc-700 dark:text-white font-bold text-xs">+</button>
                          </form>
                        </div>

                      </div>

                      <div className="space-y-3 border-t border-zinc-200 dark:border-white/5 pt-4 mt-auto">
                        <Button 
                          onClick={() => setSelectedTask(null)}
                          className="w-full bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-white font-bold h-10 rounded-xl"
                        >
                          Fechar Work Center
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {/* TAB 2: CHAT WITH SPECIFIC LEAD (Immersive WhatsApp style client chat) */}
                {activeTab === 'chat' && (
                  <div className="flex-1 flex flex-col h-full bg-zinc-100 dark:bg-zinc-950">
                    {/* Chat Header showing Lead Profile */}
                    <div className="px-6 py-4 border-b border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/40 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img 
                            src={lead.avatar} 
                            alt={lead.name} 
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-cyan-500/20"
                          />
                          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-950 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-zinc-900 dark:text-white">{lead.name}</h4>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            {isLeadTyping ? (
                              <span className="animate-pulse">digitando...</span>
                            ) : (
                              'cliente online • Whatsapp'
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button className="p-2 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-700 dark:text-white/70 transition-all">
                          <Phone className="h-4 w-4" />
                        </button>
                        <button className="p-2 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-700 dark:text-white/70 transition-all">
                          <Video className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Chat Message List */}
                    <div className="flex-1 p-6 overflow-y-auto space-y-4 scrollbar-thin bg-zinc-100/50 dark:bg-black/10">
                      {activeLeadMessages.map((msg) => {
                        const isYou = msg.sender === 'you';
                        return (
                          <div 
                            key={msg.id} 
                            className={`flex ${isYou ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                              isYou 
                                ? 'bg-cyan-500/10 dark:bg-cyan-600/20 text-cyan-700 dark:text-cyan-200 border border-cyan-500/20 rounded-tr-none' 
                                : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-white/5 rounded-tl-none shadow-sm dark:shadow-none'
                            }`}>
                              <p className="whitespace-pre-wrap">{msg.text}</p>
                              <div className="text-[9px] text-zinc-400 dark:text-white/30 text-right mt-1.5 font-semibold">
                                {msg.time}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {activeLeadMessages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400 dark:text-white/30 gap-2.5 py-12">
                          <MessageCircle className="h-10 w-10 text-zinc-200 dark:text-white/10" />
                          <div className="text-xs font-bold">Nenhum histórico com {lead.name}</div>
                          <p className="text-[10px] max-w-xs text-zinc-400 dark:text-white/20">Envie uma mensagem abaixo para iniciar o bate-papo de vendas oficial!</p>
                        </div>
                      )}
                    </div>

                    {/* Chat Input form */}
                    <form onSubmit={handleSendLeadMessage} className="p-4 border-t border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/20 flex gap-2 shrink-0">
                      <input 
                        type="text" 
                        placeholder={`Digite uma mensagem direta para ${lead.name}...`}
                        value={chatInputMessage}
                        onChange={(e) => setChatInputMessage(e.target.value)}
                        className="flex-1 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-cyan-500/50 focus:ring-0 focus:outline-none transition-all"
                      />
                      <button 
                        type="submit"
                        className="p-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-white font-bold text-xs transition-all flex items-center justify-center shrink-0 shadow-lg shadow-cyan-600/10"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                )}

                {/* TAB 3: CRM DETAILS FILE (Funnel progression) */}
                {activeTab === 'crm' && (
                  <div className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-thin">
                    <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/5 pb-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5" /> Bitrix CRM Plus
                        </span>
                        <Heading as="h3" className="text-xl font-bold text-zinc-900 dark:text-white">Ficha de Negócio Comercial</Heading>
                      </div>
                      <Badge variant="neutral" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 font-black text-xs uppercase px-3 py-1">
                        OS #{selectedTask.id}
                      </Badge>
                    </div>

                    {/* Deal Value Widget */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-zinc-50/50 dark:bg-white/[0.01] border border-zinc-200 dark:border-white/5 space-y-1">
                        <span className="text-[10px] text-zinc-500 dark:text-white/40 uppercase font-bold tracking-wider">Valor do Negócio</span>
                        <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{lead.value}</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-zinc-50/50 dark:bg-white/[0.01] border border-zinc-200 dark:border-white/5 space-y-1">
                        <span className="text-[10px] text-zinc-500 dark:text-white/40 uppercase font-bold tracking-wider">Empresa</span>
                        <div className="text-sm font-black text-zinc-800 dark:text-white truncate">{lead.company}</div>
                      </div>
                    </div>

                    {/* Funnel pipeline stage tracker */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-bold text-zinc-500 dark:text-white/40 uppercase tracking-widest block">Progresso do Funil (Clique para alterar)</span>
                      
                      <div className="grid grid-cols-5 gap-1.5 bg-zinc-100 dark:bg-black/40 p-1.5 rounded-2xl border border-zinc-200 dark:border-white/5">
                        {['Descoberta', 'Qualificação', 'Proposta', 'Negociação', 'Ganho'].map((stage, i) => {
                          const currentStage = leadStageMap[selectedTask.id] || 'Descoberta';
                          const isCurrent = currentStage.toLowerCase().includes(stage.toLowerCase());
                          return (
                            <button 
                              key={stage}
                              onClick={() => {
                                setLeadStageMap(prev => ({ ...prev, [selectedTask.id]: stage }));
                                logActivity(selectedTask.id, 'Você', `moveu o Lead no CRM para a fase "${stage}"`);
                                toast({
                                  title: 'Funil Atualizado! 💼',
                                  description: `Lead alterado para a etapa "${stage}".`,
                                  variant: 'info'
                                });
                              }}
                              className={`py-2 rounded-xl text-[10px] font-black tracking-tight text-center transition-all border ${
                                isCurrent 
                                  ? 'bg-blue-500/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border-blue-500/40 shadow-inner' 
                                  : 'bg-transparent text-zinc-400 dark:text-white/30 border-transparent hover:text-zinc-600 dark:hover:text-white/55'
                              }`}
                            >
                              {stage}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Customer Profile Card */}
                    <div className="p-5 rounded-2xl bg-zinc-50/50 dark:bg-white/[0.01] border border-zinc-200 dark:border-white/5 space-y-4">
                      <span className="text-[10px] font-bold text-zinc-500 dark:text-white/40 uppercase tracking-widest block">Dados do Comprador</span>
                      
                      <div className="flex items-center gap-4">
                        <img 
                          src={lead.avatar} 
                          alt={lead.name} 
                          className="h-12 w-12 rounded-full object-cover ring-2 ring-blue-500/20"
                        />
                        <div>
                          <h4 className="text-sm font-black text-zinc-900 dark:text-white">{lead.name}</h4>
                          <p className="text-xs text-zinc-500 dark:text-white/50">{lead.company}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2 border-t border-zinc-200 dark:border-white/5">
                        <div className="space-y-0.5">
                          <span className="text-zinc-500 dark:text-white/40 block">E-mail Corporativo:</span>
                          <span className="font-semibold text-zinc-800 dark:text-white/90">{lead.email}</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-zinc-500 dark:text-white/40 block">Telefone Comercial:</span>
                          <span className="font-semibold text-zinc-800 dark:text-white/90">{lead.phone}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* TAB 4: ERP FISCAL STATUS AND ACTIONS */}
                {activeTab === 'erp' && (
                  <div className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-thin">
                    <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/5 pb-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                          <Receipt className="h-3.5 w-3.5" /> Pixon ERP Faturamento
                        </span>
                        <Heading as="h3" className="text-xl font-bold text-zinc-900 dark:text-white">Ordem de Compra & Nota Fiscal</Heading>
                      </div>
                      <Badge variant="neutral" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-black text-xs uppercase px-3 py-1">
                        OC-#{selectedTask.id}910
                      </Badge>
                    </div>

                    {/* ERP Info Block */}
                    <div className="p-5 rounded-2xl bg-zinc-50/50 dark:bg-white/[0.01] border border-zinc-200 dark:border-white/5 space-y-4">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500 dark:text-white/40">Status do Faturamento ERP:</span>
                        {erpStatusMap[selectedTask.id] === 'success' ? (
                          <Badge variant="success" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-black text-[10px]">Pago & Liquido</Badge>
                        ) : (
                          <Badge variant="neutral" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-black text-[10px]">Aguardando Liquidação</Badge>
                        )}
                      </div>

                      <div className="space-y-2 border-t border-b border-zinc-200 dark:border-white/5 py-4">
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-500 dark:text-white/40">Faturamento Bruto:</span>
                          <span className="font-semibold text-zinc-900 dark:text-white">{lead.value}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-500 dark:text-white/40">Desconto Comercial:</span>
                          <span className="font-semibold text-zinc-400 dark:text-zinc-500">R$ 0,00</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-500 dark:text-white/40">Impostos Federais (8.5%):</span>
                          <span className="font-semibold text-rose-600 dark:text-rose-400/80">- R$ 1.250,00</span>
                        </div>
                        <div className="flex justify-between text-sm font-black pt-2 border-t border-zinc-200 dark:border-white/[0.02]">
                          <span className="text-emerald-600 dark:text-emerald-400">Total Líquido:</span>
                          <span className="text-emerald-600 dark:text-emerald-400">{lead.value}</span>
                        </div>
                      </div>

                      <div className="flex gap-2.5">
                        {erpStatusMap[selectedTask.id] !== 'success' ? (
                          <Button 
                            onClick={() => {
                              setErpStatusMap(prev => ({ ...prev, [selectedTask.id]: 'success' }));
                              logActivity(selectedTask.id, 'Você', 'confirmou liquidação fiscal no ERP');
                              toast({
                                title: 'Pagamento Liquidado! 💳',
                                description: 'Ordem de compra emitida e liquidada no banco de dados ERP.',
                                variant: 'success'
                                                          });
                            }}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-10 rounded-xl"
                          >
                            Confirmar Liquidação
                          </Button>
                        ) : (
                          <Button 
                            disabled
                            className="flex-1 bg-zinc-150 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-400 dark:text-white/40 font-bold h-10 rounded-xl"
                          >
                            ✓ ERP Liquidado PJ
                          </Button>
                        )}

                        <Button 
                          onClick={() => {
                            toast({
                              title: 'PDF Gerado! 📄',
                              description: 'Iniciando download do mock de Nota Fiscal Eletrônica...',
                              variant: 'info'
                            });
                          }}
                          className="px-4 bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-white font-bold h-10 rounded-xl flex items-center justify-center"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                  </div>
                )}

              </div>

            </div>
          </>
        );
      })()}

      {/* ─── ENTERPRISE BULK ACTIONS HUD ─── */}
      {selectedTaskIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-4 px-6 py-3.5 rounded-3xl bg-zinc-950/90 border border-cyan-500/30 shadow-[0_10px_30px_rgba(6,182,212,0.15)] backdrop-blur-2xl text-white">
            <div className="flex items-center gap-2 border-r border-white/10 pr-4">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 font-black text-xs">
                {selectedTaskIds.length}
              </span>
              <span className="text-xs font-semibold text-white/80">selecionadas</span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              {/* Change Assignee */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Responsável:</span>
                <select 
                  value=""
                  onChange={(e) => {
                    if (!e.target.value) return;
                    const assignee = teamMembers.find(m => m.id === e.target.value);
                    setTasks(prev => prev.map(t => selectedTaskIds.includes(t.id) ? { ...t, assignee } : t));
                    toast({
                      title: 'Atribuição em Lote! 👥',
                      description: `Alterado o responsável de ${selectedTaskIds.length} tarefas para "${assignee?.name}".`,
                      variant: 'success'
                    });
                    setSelectedTaskIds([]);
                  }}
                  className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="" className="bg-zinc-900">Alterar...</option>
                  {teamMembers.map(m => (
                    <option key={m.id} value={m.id} className="bg-zinc-900">{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Change Priority */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Prioridade:</span>
                <select 
                  value=""
                  onChange={(e) => {
                    if (!e.target.value) return;
                    const priority = e.target.value as any;
                    setTasks(prev => prev.map(t => selectedTaskIds.includes(t.id) ? { ...t, priority } : t));
                    toast({
                      title: 'Prioridade em Lote! ⚡',
                      description: `Prioridade de ${selectedTaskIds.length} tarefas alterada para "${priority.toUpperCase()}".`,
                      variant: 'success'
                    });
                    setSelectedTaskIds([]);
                  }}
                  className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="" className="bg-zinc-900">Alterar...</option>
                  <option value="low" className="bg-zinc-900">Baixa</option>
                  <option value="medium" className="bg-zinc-900">Média</option>
                  <option value="high" className="bg-zinc-900">Alta</option>
                  <option value="urgent" className="bg-zinc-900">Urgente</option>
                </select>
              </div>

              {/* Delete Selection */}
              <button
                onClick={() => {
                  setTasks(prev => prev.filter(t => !selectedTaskIds.includes(t.id)));
                  toast({
                    title: 'Excluído em Lote! 🗑️',
                    description: `${selectedTaskIds.length} tarefas foram removidas com sucesso.`,
                    variant: 'error'
                  });
                  setSelectedTaskIds([]);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all font-bold"
              >
                <Trash2 className="h-3.5 w-3.5" /> Excluir
              </button>

              {/* Clear Selection */}
              <button
                onClick={() => setSelectedTaskIds([])}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all ml-1"
                title="Desmarcar todas"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── KEYBOARD SHORTCUTS CHEAT SHEET MODAL ─── */}
      {activeKeyboardHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-cyan-500/30 shadow-2xl dark:shadow-[0_20px_50px_rgba(6,182,212,0.25)] text-zinc-900 dark:text-white animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Sparkle className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />
                <Heading as="h3" className="text-lg font-bold text-zinc-900 dark:text-white">Atalhos de Teclado PixonUI</Heading>
              </div>
              <button 
                onClick={() => setActiveKeyboardHelp(false)}
                className="p-1.5 rounded-full bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-500 dark:text-white/50 hover:text-zinc-800 dark:hover:text-white transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-600 dark:text-white/60">Focar na busca de tarefas</span>
                <kbd className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-white/10 border border-zinc-200 dark:border-white/10 font-mono font-bold text-[11px] text-cyan-600 dark:text-cyan-400">Ctrl + F</kbd>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-600 dark:text-white/60">Criar nova tarefa rápida</span>
                <kbd className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-white/10 border border-zinc-200 dark:border-white/10 font-mono font-bold text-[11px] text-cyan-600 dark:text-cyan-400">N</kbd>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-600 dark:text-white/60">Desfazer última movimentação</span>
                <kbd className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-white/10 border border-zinc-200 dark:border-white/10 font-mono font-bold text-[11px] text-cyan-600 dark:text-cyan-400">Ctrl + Z</kbd>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-600 dark:text-white/60">Refazer movimentação de card</span>
                <kbd className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-white/10 border border-zinc-200 dark:border-white/10 font-mono font-bold text-[11px] text-cyan-600 dark:text-cyan-400">Ctrl + Y</kbd>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-600 dark:text-white/60">Abrir painel de atalhos (este menu)</span>
                <kbd className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-white/10 border border-zinc-200 dark:border-white/10 font-mono font-bold text-[11px] text-cyan-600 dark:text-cyan-400">?</kbd>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-600 dark:text-white/60">Fechar painel lateral ou modal</span>
                <kbd className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-white/10 border border-zinc-200 dark:border-white/10 font-mono font-bold text-[11px] text-cyan-600 dark:text-cyan-400">ESC</kbd>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-white/10 text-center">
              <span className="text-[10px] text-zinc-400 dark:text-white/30 uppercase tracking-widest font-black">PixonUI Supremo Kanban Engine</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
