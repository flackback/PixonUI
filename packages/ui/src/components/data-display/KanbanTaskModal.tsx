import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalTitle, ModalFooter } from '../overlay/Modal';
import { Button } from '../button/Button';
import { TextInput } from '../form/TextInput';
import { Textarea } from '../form/Textarea';
import { Select } from '../form/Select';
import { Label } from '../form/Label';
import { FileDropzone } from '../form/FileDropzone';
import type { KanbanTask } from './Kanban';
import { X, Paperclip, Tag, AlertCircle } from 'lucide-react';

export interface KanbanTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<KanbanTask>) => void;
  task?: KanbanTask;
  columnId?: string;
}

export function KanbanTaskModal({ isOpen, onClose, onSave, task, columnId }: KanbanTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'medium');
      setTags(task.tags || []);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setTags([]);
    }
  }, [task, isOpen]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      ...task,
      title,
      description,
      priority,
      tags,
      columnId: task?.columnId || columnId
    });
    onClose();
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>{task ? 'Edit Task' : 'Create New Task'}</ModalTitle>
      </ModalHeader>
      
      <div className="space-y-6 py-4">
        <div className="space-y-2">
          <Label htmlFor="task-title">Title</Label>
          <TextInput 
            id="task-title"
            placeholder="What needs to be done?" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="task-desc">Description</Label>
          <Textarea 
            id="task-desc"
            placeholder="Add more details..." 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select 
              options={[
                { label: 'Low', value: 'low' },
                { label: 'Medium', value: 'medium' },
                { label: 'High', value: 'high' },
                { label: 'Urgent', value: 'urgent' },
              ]}
              value={priority}
              onChange={(val) => setPriority(val as any)}
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <TextInput 
                placeholder="Add tag..." 
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button variant="outline" onClick={addTag} type="button">Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 px-2 py-1 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-white/70">
                  {tag}
                  <X size={12} className="cursor-pointer hover:text-white" onClick={() => removeTag(tag)} />
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Attachments</Label>
          <FileDropzone 
            onDrop={(files: File[]) => console.log('Files selected:', files)}
            className="border-dashed border-white/10 bg-white/[0.02]"
          />
        </div>
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleSave} disabled={!title.trim()}>
          {task ? 'Save Changes' : 'Create Task'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
