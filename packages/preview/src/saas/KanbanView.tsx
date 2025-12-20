import React, { useState } from 'react';
import { 
  Kanban, 
  Heading, 
  Text, 
  Button, 
  Badge,
  Avatar,
  Surface,
  Stack
} from '@pixonui/react';
import { 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Search,
  LayoutGrid,
  List,
  Calendar as CalendarIcon
} from 'lucide-react';

const initialColumns = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' }
];

const initialTasks = [
  { id: '1', columnId: 'todo', title: 'Research competitor pricing', description: 'Analyze top 5 competitors and their pricing models.', priority: 'medium', tags: ['Marketing'], assignee: { name: 'Sarah', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' } },
  { id: '2', columnId: 'todo', title: 'Update documentation', description: 'Add new API endpoints to the developer docs.', priority: 'low', tags: ['Docs'] },
  { id: '3', columnId: 'in-progress', title: 'Implement SSO', description: 'Add SAML support for enterprise customers.', priority: 'high', tags: ['Feature', 'Security'], assignee: { name: 'Alex', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' } },
  { id: '4', columnId: 'review', title: 'Landing page redesign', description: 'Review the new glassmorphism design system.', priority: 'medium', tags: ['Design'] },
  { id: '5', columnId: 'done', title: 'Fix mobile navigation', description: 'The hamburger menu was overlapping the logo.', priority: 'high', tags: ['Bug'], assignee: { name: 'Emily', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' } },
];

export function KanbanView() {
  const [view, setView] = useState<'board' | 'list' | 'calendar'>('board');

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Heading as="h2" className="text-3xl font-bold tracking-tight">Project Board</Heading>
          <Text className="text-gray-500 dark:text-white/40 mt-1">Manage your team's tasks and workflows.</Text>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 dark:bg-white/5 p-1 rounded-xl border border-gray-200 dark:border-white/10">
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("h-8 px-3 rounded-lg text-xs font-bold", view === 'board' && "bg-white dark:bg-white/10 shadow-sm")}
              onClick={() => setView('board')}
            >
              <LayoutGrid className="h-3.5 w-3.5 mr-2" />
              Board
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("h-8 px-3 rounded-lg text-xs font-bold", view === 'list' && "bg-white dark:bg-white/10 shadow-sm")}
              onClick={() => setView('list')}
            >
              <List className="h-3.5 w-3.5 mr-2" />
              List
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("h-8 px-3 rounded-lg text-xs font-bold", view === 'calendar' && "bg-white dark:bg-white/10 shadow-sm")}
              onClick={() => setView('calendar')}
            >
              <CalendarIcon className="h-3.5 w-3.5 mr-2" />
              Calendar
            </Button>
          </div>
          <Button className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl h-10 px-4 font-bold">
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between bg-white/40 dark:bg-white/[0.02] backdrop-blur-md border border-gray-200 dark:border-white/10 p-4 rounded-2xl">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="w-full pl-10 pr-4 py-2 bg-transparent border-none text-sm focus:ring-0"
            />
          </div>
          <div className="h-4 w-px bg-gray-200 dark:bg-white/10" />
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7 border-2 border-white dark:border-black" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" />
            <Avatar className="h-7 w-7 border-2 border-white dark:border-black -ml-4" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" />
            <Avatar className="h-7 w-7 border-2 border-white dark:border-black -ml-4" src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100" />
            <div className="h-7 w-7 rounded-full bg-gray-100 dark:bg-white/10 border-2 border-white dark:border-black -ml-4 flex items-center justify-center text-[10px] font-bold">
              +5
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-9 px-3 rounded-lg text-xs font-bold border border-gray-200 dark:border-white/10">
            <Filter className="h-3.5 w-3.5 mr-2" />
            Filter
          </Button>
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg border border-gray-200 dark:border-white/10">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="h-[600px]">
        <Kanban 
          columns={initialColumns as any}
          tasks={initialTasks as any}
          onTaskMove={(taskId, targetColumnId) => console.log(`Moved ${taskId} to ${targetColumnId}`)}
          className="h-full"
        />
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
