import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalTitle, ModalFooter } from '../../overlay/Modal';
import { Button } from '../../button/Button';
import { TextInput } from '../../form/TextInput';
import { Textarea } from '../../form/Textarea';
import { Select } from '../../form/Select';
import { Label } from '../../form/Label';
import { FileDropzone } from '../../form/FileDropzone';
import { X, Paperclip, Tag, AlertCircle, Trash2, Copy, Archive, Clock } from 'lucide-react';
import { SubtaskList } from './components/SubtaskList';
import { Checklist } from './components/Checklist';
import { TaskActivity } from './components/TaskActivity';
import { TaskComments } from './components/TaskComments';
import { TaskAttachments } from './components/TaskAttachments';
import { LabelPicker } from './components/LabelPicker';
import { AssigneePicker } from './components/AssigneePicker';
import { DueDatePicker } from './components/DueDatePicker';
import { TimeTracker } from './components/TimeTracker';
import type { KanbanTask, KanbanColumnDef, KanbanUser, KanbanLabel } from './types';

export interface KanbanTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<KanbanTask>) => void;
  onDelete?: (taskId: string) => void;
  onDuplicate?: (task: KanbanTask) => void;
  onArchive?: (taskId: string) => void;
  task?: KanbanTask;
  columnId?: string;
  columns?: KanbanColumnDef[];
  users?: KanbanUser[];
  availableLabels?: KanbanLabel[];
  showSubtasks?: boolean;
  showChecklist?: boolean;
  showAttachments?: boolean;
  showComments?: boolean;
  showActivity?: boolean;
}

export function KanbanTaskModal({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete,
  onDuplicate,
  onArchive,
  task, 
  columnId,
  columns = [],
  users = [],
  availableLabels = [],
  showSubtasks = true,
  showChecklist = true,
  showAttachments = true,
  showComments = true,
  showActivity = true
}: KanbanTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [currentColumnId, setCurrentColumnId] = useState('');
  const [assigneeId, setAssigneeId] = useState<string | undefined>(undefined);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'medium');
      setCurrentColumnId(task.columnId || '');
      setAssigneeId(task.assignee?.id);
      setSelectedLabels(task.labels?.map(l => l.id) || []);
      setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCurrentColumnId(columnId || '');
      setAssigneeId(undefined);
      setSelectedLabels([]);
      setDueDate(undefined);
    }
  }, [task, isOpen, columnId]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      ...task,
      title,
      description,
      priority,
      columnId: currentColumnId,
      assignee: users.find(u => u.id === assigneeId),
      labels: availableLabels.filter(l => selectedLabels.includes(l.id)),
      dueDate: dueDate?.toISOString()
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader className="flex items-center justify-between pr-12">
        <ModalTitle>{task ? 'Edit Task' : 'Create New Task'}</ModalTitle>
        <div className="flex items-center gap-2">
          {task && (
            <>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white" onClick={() => onDuplicate?.(task)}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white" onClick={() => onArchive?.(task.id)}>
                <Archive className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-red-400" onClick={() => onDelete?.(task.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </ModalHeader>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-2">
            <Label htmlFor="task-title" className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Title</Label>
            <TextInput 
              id="task-title"
              placeholder="What needs to be done?" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-bold bg-transparent border-white/10 focus:border-blue-500"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-desc" className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Description</Label>
            <Textarea 
              id="task-desc"
              placeholder="Add more details..." 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="bg-white/[0.03] border-white/10 text-sm leading-relaxed"
            />
          </div>

          {showChecklist && task?.checklist && (
            <Checklist items={task.checklist} />
          )}

          {showAttachments && task?.attachments && (
            <TaskAttachments attachments={[]} />
          )}

          {showComments && (
            <TaskComments comments={[]} />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8 bg-white/[0.02] p-6 rounded-3xl border border-white/5 h-fit">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Status</Label>
            <Select 
              value={currentColumnId}
              onChange={(val) => setCurrentColumnId(val)}
              options={columns.map(c => ({ label: c.title, value: c.id }))}
              className="bg-white/5 border-white/10"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Priority</Label>
            <Select 
              value={priority}
              onChange={(val) => setPriority(val as any)}
              options={[
                { label: 'Low', value: 'low' },
                { label: 'Medium', value: 'medium' },
                { label: 'High', value: 'high' },
                { label: 'Urgent', value: 'urgent' },
              ]}
              className="bg-white/5 border-white/10"
            />
          </div>

          <AssigneePicker 
            users={users} 
            selectedId={assigneeId} 
            onSelect={setAssigneeId} 
          />

          <LabelPicker 
            labels={availableLabels} 
            selectedIds={selectedLabels} 
            onToggle={(id) => setSelectedLabels(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])} 
          />

          <DueDatePicker 
            date={dueDate} 
            onChange={setDueDate} 
          />

          <TimeTracker initialSeconds={task?.timeSpent} />
        </div>
      </div>

      <ModalFooter className="border-t border-white/5 pt-6">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} className="px-8">Save Changes</Button>
      </ModalFooter>
    </Modal>
  );
}
