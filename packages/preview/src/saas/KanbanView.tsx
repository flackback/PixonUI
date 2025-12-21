import React from 'react';
import { 
  Kanban, 
} from '@pixonui/react';

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
  return (
    <div className="h-[calc(100vh-12rem)]">
      <Kanban 
        columns={initialColumns as any}
        tasks={initialTasks as any}
        onTaskMove={(taskId, toColumnId) => console.log(`Moved ${taskId} to ${toColumnId}`)}
        onColumnMove={(columnId, toColumnId) => console.log(`Moved column ${columnId} to ${toColumnId}`)}
        className="h-full"
      />
    </div>
  );
}


