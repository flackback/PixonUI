import React, { useState } from 'react';
import { cn } from '../../../../utils/cn';
import { Avatar } from '../../Avatar';
import { Button } from '../../../button/Button';
import { Textarea } from '../../../form/Textarea';
import { Send } from 'lucide-react';
import type { KanbanUser } from '../types';

interface Comment {
  id: string;
  user: KanbanUser;
  content: string;
  timestamp: Date;
}

interface TaskCommentsProps {
  comments: Comment[];
  onAddComment?: (content: string) => void;
  className?: string;
}

export function TaskComments({ comments, onAddComment, className }: TaskCommentsProps) {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    onAddComment?.(newComment);
    setNewComment('');
  };

  return (
    <div className={cn("space-y-6", className)}>
      <h4 className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Comments</h4>
      
      <div className="flex gap-3">
        <div className="flex-1">
          <Textarea 
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px] bg-white/[0.03] border-white/10 text-sm"
          />
          <div className="flex justify-end mt-2">
            <Button 
              size="sm" 
              onClick={handleSubmit}
              disabled={!newComment.trim()}
              className="gap-2"
            >
              <Send className="h-3.5 w-3.5" />
              Comment
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar src={comment.user.avatar} alt={comment.user.name} size="sm" />
            <div className="flex-1 bg-white/[0.03] border border-white/5 rounded-2xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white">{comment.user.name}</span>
                <span className="text-[10px] text-white/30">{comment.timestamp.toLocaleString()}</span>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
