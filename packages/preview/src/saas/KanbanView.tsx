import React, { useState, useEffect, useRef } from 'react';
import { 
  Kanban, 
  useKanbanAnalytics,
  useToast
} from '@pixonui/react';
import type { KanbanColumnDef, KanbanTask } from '@pixonui/react';
import { Brain, ShieldAlert, Sparkles, AlertTriangle, CheckCircle2, Radio, Play, Pause, Users } from 'lucide-react';

const initialColumns: KanbanColumnDef[] = [
  { id: 'todo', title: 'To Do', limit: 4 },
  { id: 'in-progress', title: 'In Progress', limit: 2 },
  { id: 'review', title: 'Review', limit: 3 },
  { id: 'done', title: 'Done' }
];

const initialTasks: KanbanTask[] = [
  { id: '1', columnId: 'todo', title: 'Research competitor pricing', description: 'Analyze top 5 competitors and their pricing models.', priority: 'medium', tags: ['Marketing'], assignee: { id: 'sarah', name: 'Sarah Wilson', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', status: 'online' }, updatedAt: new Date() },
  { id: '2', columnId: 'todo', title: 'Update documentation', description: 'Add new API endpoints to the developer docs.', priority: 'low', tags: ['Docs'], updatedAt: new Date() },
  { id: '3', columnId: 'in-progress', title: 'Implement SSO', description: 'Add SAML support for enterprise customers.', priority: 'high', tags: ['Feature', 'Security'], assignee: { id: 'alex', name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', status: 'online' }, updatedAt: new Date() },
  { id: '4', columnId: 'review', title: 'Landing page redesign', description: 'Review the new glassmorphism design system.', priority: 'medium', tags: ['Design'], updatedAt: new Date() },
  { id: '5', columnId: 'done', title: 'Fix mobile navigation', description: 'The hamburger menu was overlapping the logo.', priority: 'high', tags: ['Bug'], assignee: { id: 'emily', name: 'Emily Chen', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', status: 'online' }, updatedAt: new Date() },
];

export function KanbanView() {
  const [columns] = useState<KanbanColumnDef[]>(initialColumns);
  const [tasks, setTasks] = useState<KanbanTask[]>(initialTasks);
  const [isBotActive, setIsBotActive] = useState(false);
  const [showToasts, setShowToasts] = useState(true);

  const { toast } = useToast();
  const channelRef = useRef<BroadcastChannel | null>(null);
  const tasksRef = useRef<KanbanTask[]>(tasks);
  const showToastsRef = useRef(showToasts);

  // Keep tasksRef synchronized safely outside of render
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  // Keep showToastsRef synchronized safely outside of render
  useEffect(() => {
    showToastsRef.current = showToasts;
  }, [showToasts]);

  // Toast notifier for collaboration events
  const triggerCollaborativeToast = (prev: KanbanTask[], next: KanbanTask[]) => {
    if (!showToastsRef.current) return;

    for (const tNext of next) {
      const tPrev = prev.find(p => p.id === tNext.id);
      if (!tPrev) continue;

      // Detect moved columns
      if (tPrev.columnId !== tNext.columnId) {
        const fromCol = initialColumns.find(c => c.id === tPrev.columnId)?.title || tPrev.columnId;
        const toCol = initialColumns.find(c => c.id === tNext.columnId)?.title || tNext.columnId;
        const author = tNext.assignee?.name || 'A team member';
        toast({
          title: 'Task Relocated 🚀',
          description: `${author} moved "${tNext.title}" from "${fromCol}" to "${toCol}".`,
          variant: 'info'
        });
        return;
      }

      // Detect changed priority
      if (tPrev.priority !== tNext.priority) {
        const author = tNext.assignee?.name || 'A team member';
        toast({
          title: 'Priority Updated ⚡',
          description: `${author} changed priority of "${tNext.title}" to ${tNext.priority?.toUpperCase()}.`,
          variant: 'info'
        });
        return;
      }

      // Detect subtasks progression
      if (JSON.stringify(tPrev.subtasks) !== JSON.stringify(tNext.subtasks)) {
        const author = tNext.assignee?.name || 'A team member';
        toast({
          title: 'Subtasks Checked off ✅',
          description: `${author} updated subtask progress on "${tNext.title}".`,
          variant: 'info'
        });
        return;
      }
    }
  };

  // Initialize BroadcastChannel for cross-tab multi-user sync
  useEffect(() => {
    const channel = new BroadcastChannel('pixonui-kanban-realtime');
    channelRef.current = channel;

    channel.onmessage = (event) => {
      const { type, taskId, toColumnId, updatedTasks } = event.data;
      if (type === 'TASK_MOVE' && taskId && toColumnId) {
        setTasks(prev => {
          const updated = prev.map(t => t.id === taskId ? { ...t, columnId: toColumnId, updatedAt: new Date() } : t);
          triggerCollaborativeToast(prev, updated);
          return updated;
        });
      } else if (type === 'STATE_SYNC' && updatedTasks) {
        setTasks(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(updatedTasks)) {
            triggerCollaborativeToast(prev, updatedTasks);
          }
          return updatedTasks;
        });
      }
    };

    // Broadcast initial state to newly opened tabs
    channel.postMessage({ type: 'STATE_SYNC', updatedTasks: tasksRef.current });

    return () => {
      channel.close();
    };
  }, []);

  // Background activity bot simulation (Simulating ultra-high speed concurrent updates)
  useEffect(() => {
    if (!isBotActive) return;

    const interval = setInterval(() => {
      setTasks(prev => {
        const next = [...prev];
        const randomIndex = Math.floor(Math.random() * next.length);
        const task = next[randomIndex];
        if (!task) return prev;

        // Random action simulation
        const actionType = Math.floor(Math.random() * 4);
        const updatedTask = { ...task, updatedAt: new Date() };

        if (actionType === 0) {
          // Action 0: Simulate moving task to another column
          const colIds = ['todo', 'in-progress', 'review', 'done'];
          const nextCol = colIds[Math.floor(Math.random() * colIds.length)] || 'todo';
          updatedTask.columnId = nextCol;
        } else if (actionType === 1) {
          // Action 1: Toggle/simulating subtask progression
          const currentSubtasks = task.subtasks || [
            { id: 's1', title: 'Initialize setup', completed: false },
            { id: 's2', title: 'Run local test audits', completed: false }
          ];
          const updatedSub = currentSubtasks.map(s => 
            Math.random() > 0.5 ? { ...s, completed: !s.completed } : s
          );
          updatedTask.subtasks = updatedSub;
        } else if (actionType === 2) {
          // Action 2: Mutating priority to simulate quick user edits
          const priorities: Array<'low' | 'medium' | 'high' | 'urgent'> = ['low', 'medium', 'high', 'urgent'];
          updatedTask.priority = priorities[Math.floor(Math.random() * priorities.length)];
        } else {
          // Action 3: Set/Simulate a random watcher or assignee status
          if (updatedTask.assignee) {
            updatedTask.assignee = {
              ...updatedTask.assignee,
              status: Math.random() > 0.5 ? 'online' : 'busy'
            };
          }
        }

        const newTasks = next.map(t => t.id === task.id ? updatedTask : t);

        // Fire toast locally for simulation feedback
        triggerCollaborativeToast(prev, newTasks);

        // Broadcast change to other browser tabs
        channelRef.current?.postMessage({ type: 'STATE_SYNC', updatedTasks: newTasks });
        return newTasks;
      });
    }, 3000); // Trigger a random collaborative change every 3 seconds

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

  const handleTaskMove = (taskId: string, toColumnId: string) => {
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, columnId: toColumnId, updatedAt: new Date() } : t);
    setTasks(updatedTasks);
    // Broadcast drag & drop event across tabs
    channelRef.current?.postMessage({ type: 'TASK_MOVE', taskId, toColumnId });
  };

  return (
    <div className="flex flex-col gap-6 h-full pb-6">
      
      {/* Real-time Simulated socket controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-[#0F172A]/40 border border-cyan-500/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <Radio className="h-3 w-3 text-cyan-400 animate-pulse" /> Native Broadcaster Tab Sync
            </div>
            <div className="text-[10px] text-white/50">Open multiple browser tabs of this preview to drag & sync real-time!</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Subtle Live Toast Toggler */}
          <label className="flex items-center gap-2 cursor-pointer select-none border-r border-white/5 pr-4">
            <input 
              type="checkbox" 
              checked={showToasts}
              onChange={(e) => setShowToasts(e.target.checked)}
              className="rounded border-cyan-500/30 text-cyan-500 focus:ring-cyan-500/20 bg-slate-900/50 h-3.5 w-3.5 transition-colors cursor-pointer"
            />
            <span className="text-[10px] text-white/60 font-medium">Activity Toasts</span>
          </label>

          {/* Active users avatar presence line */}
          <div className="flex items-center gap-1">
            <div className="text-[10px] text-white/40 font-bold uppercase tracking-wider mr-2 flex items-center gap-1">
              <Users className="h-3 w-3" /> Active Users:
            </div>
            <div className="flex -space-x-2 overflow-hidden">
              <img className="inline-block h-6 w-6 rounded-full ring-2 ring-[#0F172A]" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" alt="Sarah" title="Sarah Wilson (Online)" />
              <img className="inline-block h-6 w-6 rounded-full ring-2 ring-[#0F172A]" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" alt="Alex" title="Alex Rivera (Online)" />
              <img className="inline-block h-6 w-6 rounded-full ring-2 ring-[#0F172A]" src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100" alt="Emily" title="Emily Chen (Busy)" />
            </div>
          </div>

          {/* Collaborative bot active button */}
          <button
            onClick={() => setIsBotActive(prev => !prev)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
              isBotActive 
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20' 
                : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20'
            }`}
          >
            {isBotActive ? (
              <>
                <Pause className="h-3.5 w-3.5 fill-rose-400" /> Stop Collaboration Bot
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-cyan-400" /> Run Collaboration Bot
              </>
            )}
          </button>
        </div>
      </div>

      {/* Real-time Predictive Heuristic Analytics Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
        
        {/* Metric 1: Health & Completion */}
        <div className="flex items-center gap-4 p-3 bg-white/[0.01] rounded-2xl border border-white/[0.02]">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Flow Progress</div>
            <div className="text-lg font-black text-white">{completionRate}% <span className="text-xs text-white/50 font-normal">done</span></div>
            <div className="text-[11px] text-white/60">{completedTasks} of {activeTasks} tasks completed</div>
          </div>
        </div>

        {/* Metric 2: Smart Predictions */}
        <div className="flex items-center gap-4 p-3 bg-white/[0.01] rounded-2xl border border-white/[0.02]">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider font-bold">AI Delivery Confidence</div>
            <div className="text-lg font-black text-cyan-400">{predictions.confidenceScore}%</div>
            <div className="text-[11px] text-white/60">{predictions.estimatedHoursToComplete}h estimated to clear</div>
          </div>
        </div>

        {/* Metric 3: Bottlenecks & Risks */}
        <div className="md:col-span-2 flex items-center gap-4 p-3 bg-white/[0.01] rounded-2xl border border-white/[0.02] overflow-hidden">
          <div className={`p-3 rounded-xl ${bottlenecks.length > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-green-500/10 text-green-400'}`}>
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Predictive Risk Analysis</div>
            <div className="truncate text-xs font-semibold text-white">
              {bottlenecks.length > 0 ? (
                <span className="text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 inline" /> {bottlenecks[0]?.reason}
                </span>
              ) : (
                <span className="text-green-400 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 inline text-green-400" /> Workflows running smoothly. No bottlenecks detected!
                </span>
              )}
            </div>
            <div className="text-[11px] text-white/40 truncate">
              {overloads.length > 0 ? overloads[0]?.recommendation : "All team capacities within optimal parameters."}
            </div>
          </div>
        </div>

      </div>

      {/* Main Kanban View */}
      <div className="flex-1 min-h-0">
        <Kanban 
          columns={columns}
          tasks={tasks}
          onTaskMove={handleTaskMove}
          onColumnMove={() => {}}
          className="h-full"
        />
      </div>
    </div>
  );
}
