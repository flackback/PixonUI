import React from 'react';
import { cn } from '../../../../utils/cn';
import { FileIcon, X, Download, Paperclip } from 'lucide-react';
import { Button } from '../../../button/Button';

interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
  thumbnail?: string;
}

interface TaskAttachmentsProps {
  attachments: Attachment[];
  onRemove?: (id: string) => void;
  onDownload?: (attachment: Attachment) => void;
  className?: string;
}

export function TaskAttachments({ attachments, onRemove, onDownload, className }: TaskAttachmentsProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Attachments</h4>
        <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-white/40 hover:text-white">
          <Paperclip className="h-3 w-3" />
          Add
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {attachments.map((file) => (
          <div 
            key={file.id} 
            className="group relative bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-all"
          >
            {file.thumbnail ? (
              <div className="aspect-video w-full overflow-hidden">
                <img src={file.thumbnail} alt={file.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="aspect-video w-full flex items-center justify-center bg-white/5">
                <FileIcon className="h-8 w-8 text-white/20" />
              </div>
            )}
            
            <div className="p-2">
              <p className="text-xs font-medium text-white truncate">{file.name}</p>
              <p className="text-[10px] text-white/30 uppercase">{file.size}</p>
            </div>

            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20"
                onClick={() => onDownload?.(file)}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400"
                onClick={() => onRemove?.(file.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
