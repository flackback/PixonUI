import React, { useState, useEffect } from 'react';
import { 
  Kanban, 
  KanbanColumn, 
  KanbanTask, 
  KanbanTaskModal,
  KanbanFilterBar,
  KanbanCalendarView,
  Heading, 
  Text, 
  Button, 
  Surface,
  Badge,
  Avatar,
  TextInput,
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  useTimer,
  cn
} from '@pixonui/react';
import { Search, Filter, Plus, Layout, List, Calendar as CalendarIcon, Settings, MoreHorizontal, UserPlus, Share2, Lock, AlertCircle, Play, Pause, Clock, Archive, Trash2, X } from 'lucide-react';

export function KanbanDemo() {
  const [columns, setColumns] = useState<KanbanColumn[]>([
    { id: 'todo', title: 'To Do', color: '#94a3b8' },
    { id: 'in-progress', title: 'In Progress', color: '#06b6d4', limit: 3 },
    { id: 'review', title: 'Review', color: '#8b5cf6', limit: 2 },
    { id: 'done', title: 'Done', color: '#10b981' }
  ]);

  const [tasks, setTasks] = useState<KanbanTask[]>([
    {
      id: '1',
      title: 'Design System Update',
      description: 'Update the glassmorphism primitives and documentation.',
      priority: 'high',
      tags: ['Design', 'UI'],
      columnId: 'todo',
      comments: 12,
      attachments: 4,
      dueDate: 'Dec 24',
      assignee: { name: 'Sarah Wilson', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
      progress: 0,
      timeSpent: 3600 * 2
    },
    {
      id: '2',
      title: 'Implement Kanban Component',
      description: 'Create a high-performance Kanban board with native DnD.',
      priority: 'urgent',
      tags: ['Dev', 'Feature'],
      columnId: 'in-progress',
      comments: 5,
      attachments: 2,
      dueDate: 'Dec 20',
      assignee: { name: 'Alex Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
      progress: 65,
      timeSpent: 3600 * 5 + 1200,
      customFields: {
        'Estimate': '12h',
        'Repository': 'https://github.com/pixonui/core',
        'Environment': 'Staging'
      }
    },
    {
      id: '3',
      title: 'Bug: Table Scroll Issue',
      description: 'Fix the sticky header alignment on mobile devices.',
      priority: 'medium',
      tags: ['Bug'],
      columnId: 'review',
      comments: 8,
      assignee: { name: 'James Martin' },
      progress: 90,
      blockedBy: ['2'],
      timeSpent: 1800
    },
    {
      id: '4',
      title: 'Radar Chart Integration',
      description: 'Add the new RadarChart to the main dashboard.',
      priority: 'low',
      tags: ['Feature'],
      columnId: 'done',
      comments: 2,
      assignee: { name: 'Sarah Wilson', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
      progress: 100,
      timeSpent: 3600 * 8
    }
  ]);

  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [groupBy, setGroupBy] = useState<keyof KanbanTask | undefined>(undefined);
  const [activeTimerTaskId, setActiveTimerTaskId] = useState<string | undefined>(undefined);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [view, setView] = useState<'board' | 'list' | 'calendar'>('board');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalColumnId, setModalColumnId] = useState<string | undefined>(undefined);
  const [editingTask, setEditingTask] = useState<KanbanTask | undefined>(undefined);

  // Timer logic for the demo
  useEffect(() => {
    let interval: any;
    if (activeTimerTaskId) {
      interval = setInterval(() => {
        setTasks(prev => prev.map(t => 
          t.id === activeTimerTaskId 
            ? { ...t, timeSpent: (t.timeSpent || 0) + 1 } 
            : t
        ));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimerTaskId]);

  const handleTimerToggle = (taskId: string) => {
    setActiveTimerTaskId(prev => prev === taskId ? undefined : taskId);
  };

  const handleTaskMove = (taskId: string, toColumnId: string, index?: number) => {
    setTasks(prev => {
      const newTasks = [...prev];
      const taskIndex = newTasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return prev;

      const [task] = newTasks.splice(taskIndex, 1);
      if (task) {
        task.columnId = toColumnId;
      }
      
      // Get tasks in the target column
      const targetColumnTasks = newTasks.filter(t => t.columnId === toColumnId);
      
      // Find the actual index in the full array to insert
      let insertIndex = newTasks.length;
      if (typeof index === 'number' && index < targetColumnTasks.length) {
        const referenceTask = targetColumnTasks[index];
        insertIndex = newTasks.findIndex(t => t.id === referenceTask?.id);
      }

      if (task) {
        newTasks.splice(insertIndex, 0, task);
      }
      return newTasks;
    });
  };

  const handleColumnMove = (columnId: string, newIndex: number) => {
    setColumns(prev => {
      const newCols = [...prev];
      const colIndex = newCols.findIndex(c => c.id === columnId);
      if (colIndex === -1) return prev;

      const [col] = newCols.splice(colIndex, 1);
      if (col) {
        newCols.splice(newIndex, 0, col);
      }
      return newCols;
    });
  };

  const handleAddTask = (columnId: string, title?: string) => {
    const newTask: KanbanTask = {
      id: Math.random().toString(36).substr(2, 9),
      title: title || 'New Task',
      columnId,
      priority: 'medium',
      progress: 0
    };
    setTasks(prev => [...prev, newTask]);
  };

  const handleTaskFullAdd = (columnId: string) => {
    setModalColumnId(columnId);
    setEditingTask(undefined);
    setIsModalOpen(true);
  };

  const handleSaveTask = (taskData: Partial<KanbanTask>) => {
    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...taskData } : t));
    } else {
      const newTask: KanbanTask = {
        id: Math.random().toString(36).substr(2, 9),
        title: taskData.title || 'New Task',
        columnId: modalColumnId || 'todo',
        priority: taskData.priority || 'medium',
        tags: taskData.tags || [],
        description: taskData.description,
        progress: 0,
        ...taskData
      };
      setTasks(prev => [...prev, newTask]);
    }
    setIsModalOpen(false);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPriority = !activeFilters['priority'] || 
      activeFilters['priority'].length === 0 ||
      activeFilters['priority'].includes(task.priority || '');
    
    const matchesTags = !activeFilters['tags'] || 
      activeFilters['tags'].length === 0 ||
      task.tags?.some(tag => activeFilters['tags']?.includes(tag));

    return matchesSearch && matchesPriority && matchesTags;
  });

  const priorityOptions = [
    { label: 'Urgent', value: 'urgent' },
    { label: 'High', value: 'high' },
    { label: 'Medium', value: 'medium' },
    { label: 'Low', value: 'low' }
  ];

  const tagOptions = Array.from(new Set(tasks.flatMap(t => t.tags || []))).map(tag => ({
    label: tag,
    value: tag
  }));

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Heading as="h2">Project Board</Heading>
          <Text className="text-gray-500">Manage your team's tasks and workflow.</Text>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" /> Share
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> New Task
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="space-y-4">
        <KanbanFilterBar 
          onSearchChange={setSearchQuery}
          onFilterChange={setActiveFilters}
          priorityOptions={priorityOptions}
          tagOptions={tagOptions}
        />
        
        <Surface className="p-2 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Text className="text-xs text-white/40 uppercase font-bold tracking-wider">Group By:</Text>
              <select 
                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                value={groupBy || ''}
                onChange={(e) => setGroupBy(e.target.value as any || undefined)}
              >
                <option value="">None</option>
                <option value="priority">Priority</option>
                <option value="assignee.name">Assignee</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/10">
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("h-8 px-3", view === 'board' ? "bg-white/10 text-cyan-400" : "text-gray-400")}
              onClick={() => setView('board')}
            >
              <Layout className="h-4 w-4 mr-2" /> Board
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("h-8 px-3", view === 'list' ? "bg-white/10 text-cyan-400" : "text-gray-400")}
              onClick={() => setView('list')}
            >
              <List className="h-4 w-4 mr-2" /> List
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("h-8 px-3", view === 'calendar' ? "bg-white/10 text-cyan-400" : "text-gray-400")}
              onClick={() => setView('calendar')}
            >
              <CalendarIcon className="h-4 w-4 mr-2" /> Calendar
            </Button>
          </div>
        </Surface>
      </div>

      {/* Main Content */}
      {view === 'board' ? (
        <Kanban 
          columns={columns}
          tasks={filteredTasks}
          onTaskMove={handleTaskMove}
          onColumnMove={handleColumnMove}
          onTaskClick={(task) => setSelectedTask(task)}
          onTaskAdd={handleAddTask}
          onTaskFullAdd={handleTaskFullAdd}
          onTaskTimerToggle={handleTimerToggle}
          onTaskSelectionChange={(ids) => setSelectedTaskIds(ids)}
          activeTimerTaskId={activeTimerTaskId}
          selectedTaskIds={selectedTaskIds}
          selectable
          groupBy={groupBy}
          showDividers
          className="mt-4"
        />
      ) : view === 'calendar' ? (
        <KanbanCalendarView 
          tasks={filteredTasks}
          onTaskClick={setSelectedTask}
          onAddTask={(date: Date) => handleAddTask('todo', `Task for ${date.toLocaleDateString()}`)}
          className="mt-4"
        />
      ) : (
        <Surface className="p-8 text-center">
          <Text className="text-gray-500">List view is coming soon...</Text>
        </Surface>
      )}

      <KanbanTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
      />

      {/* Bulk Action Bar */}
      {selectedTaskIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Surface className="flex items-center gap-6 px-6 py-3 bg-[#1a1a1a]/90 backdrop-blur-xl border-cyan-500/30 shadow-[0_0_40px_rgba(0,0,0,0.5)] rounded-2xl">
            <div className="flex items-center gap-3 pr-6 border-r border-white/10">
              <div className="h-6 w-6 rounded-full bg-cyan-500 flex items-center justify-center text-[10px] font-bold text-black">
                {selectedTaskIds.length}
              </div>
              <Text className="text-sm font-medium">Tasks Selected</Text>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-2 text-white/60 hover:text-white">
                <Archive className="h-4 w-4" /> Archive
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                onClick={() => {
                  setTasks(prev => prev.filter(t => !selectedTaskIds.includes(t.id)));
                  setSelectedTaskIds([]);
                }}
              >
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => setSelectedTaskIds([])}
              >
                Deselect All
              </Button>
            </div>
          </Surface>
        </div>
      )}

      {/* Task Detail Drawer */}
      <Drawer isOpen={!!selectedTask} onClose={() => setSelectedTask(null)}>
        <DrawerHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="neutral" className="bg-white/5 border-white/10">
              TASK-{selectedTask?.id}
            </Badge>
            <Badge variant={selectedTask?.priority === 'urgent' ? 'danger' : 'info'}>
              {selectedTask?.priority}
            </Badge>
          </div>
          <DrawerTitle className="text-2xl">{selectedTask?.title}</DrawerTitle>
          <DrawerDescription>Created by Sarah Wilson • 2 days ago</DrawerDescription>
        </DrawerHeader>

        <div className="p-6 space-y-8">
          <div className="space-y-3">
            <Heading as="h4" className="text-sm font-semibold uppercase text-white/40">Description</Heading>
            <Text className="text-gray-300 leading-relaxed">
              {selectedTask?.description || 'No description provided.'}
            </Text>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Heading as="h4" className="text-sm font-semibold uppercase text-white/40">Assignee</Heading>
              <div className="flex items-center gap-3">
                <Avatar src={selectedTask?.assignee?.avatar} fallback={selectedTask?.assignee?.name?.charAt(0) || 'U'} className="h-8 w-8" />
                <Text className="font-medium">{selectedTask?.assignee?.name}</Text>
              </div>
            </div>
            <div className="space-y-3">
              <Heading as="h4" className="text-sm font-semibold uppercase text-white/40">Due Date</Heading>
              <div className="flex items-center gap-2 text-gray-300">
                <CalendarIcon className="h-4 w-4 text-cyan-500" />
                <Text>{selectedTask?.dueDate || 'No date set'}</Text>
              </div>
            </div>
          </div>

          {selectedTask?.blockedBy && selectedTask.blockedBy.length > 0 && (
            <div className="space-y-3 p-4 rounded-2xl bg-red-500/5 border border-red-500/20">
              <div className="flex items-center gap-2 text-red-400">
                <Lock className="h-4 w-4" />
                <Heading as="h4" className="text-sm font-semibold uppercase">Blocked By</Heading>
              </div>
              <div className="flex flex-col gap-2">
                {selectedTask.blockedBy.map(blockId => {
                  const blockingTask = tasks.find(t => t.id === blockId);
                  return (
                    <div key={blockId} className="flex items-center justify-between text-xs bg-white/5 p-2 rounded-lg">
                      <span className="text-white/70">{blockingTask?.title || `Task ${blockId}`}</span>
                      <Badge variant="neutral" className="text-[10px]">{blockingTask?.columnId}</Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Heading as="h4" className="text-sm font-semibold uppercase text-white/40">Time Tracking</Heading>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-xl",
                  activeTimerTaskId === selectedTask?.id ? "bg-cyan-500/20 text-cyan-400" : "bg-white/5 text-white/40"
                )}>
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <Text className="text-lg font-mono font-bold">
                    {selectedTask?.timeSpent ? 
                      `${Math.floor(selectedTask.timeSpent / 3600)}h ${Math.floor((selectedTask.timeSpent % 3600) / 60)}m ${selectedTask.timeSpent % 60}s` 
                      : '0h 0m 0s'}
                  </Text>
                  <Text className="text-[10px] text-white/30 uppercase tracking-widest">Total Time Logged</Text>
                </div>
              </div>
              <Button 
                variant={activeTimerTaskId === selectedTask?.id ? "danger" : "primary"}
                size="sm"
                className="gap-2"
                onClick={() => selectedTask && handleTimerToggle(selectedTask.id)}
              >
                {activeTimerTaskId === selectedTask?.id ? (
                  <><Pause className="h-4 w-4" /> Stop</>
                ) : (
                  <><Play className="h-4 w-4" /> Start</>
                )}
              </Button>
            </div>
          </div>

          {selectedTask?.customFields && Object.keys(selectedTask.customFields).length > 0 && (
            <div className="space-y-3">
              <Heading as="h4" className="text-sm font-semibold uppercase text-white/40">Custom Fields</Heading>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(selectedTask.customFields).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <Text className="text-xs text-white/40 font-medium">{key}</Text>
                    <Text className="text-xs text-white/80">
                      {typeof value === 'string' && value.startsWith('http') ? (
                        <a href={value} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">
                          {value.replace('https://', '')}
                        </a>
                      ) : String(value)}
                    </Text>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Heading as="h4" className="text-sm font-semibold uppercase text-white/40">Tags</Heading>
            <div className="flex flex-wrap gap-2">
              {selectedTask?.tags?.map((tag: string) => (
                <Badge key={tag} variant="neutral" className="bg-cyan-500/10 border-cyan-500/20 text-cyan-400">
                  {tag}
                </Badge>
              ))}
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full border border-dashed border-white/20">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex gap-3">
            <Button className="flex-1">Save Changes</Button>
            <Button variant="outline" className="h-10 w-10 p-0">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
