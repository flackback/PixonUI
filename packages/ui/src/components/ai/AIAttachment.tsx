import React from 'react';
import { cn } from '../../utils/cn';
import { FileText, FileSpreadsheet, Film, Image as ImageIcon, Music, Code2, X, Download, RefreshCw } from 'lucide-react';

export interface AIAttachmentItem {
  id: string;
  name: string;
  size?: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'spreadsheet' | 'code' | 'other';
  progress?: number; // 0 to 100 representing upload progression
  status?: 'uploading' | 'completed' | 'error';
  url?: string;
}

export interface AIAttachmentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Attachment item data */
  item: AIAttachmentItem;
  /** Callback fired when removing/dismissing the attachment card */
  onRemove?: (id: string) => void;
  /** Callback fired when clicking download icon */
  onDownload?: (item: AIAttachmentItem) => void;
  /** Visual variation */
  variant?: 'card' | 'badge';
}

const fileTypeConfig = {
  document: {
    icon: FileText,
    color: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30',
    label: 'Document'
  },
  spreadsheet: {
    icon: FileSpreadsheet,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30',
    label: 'Sheet'
  },
  video: {
    icon: Film,
    color: 'bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-950/20 dark:text-pink-400 dark:border-pink-900/30',
    label: 'Video'
  },
  image: {
    icon: ImageIcon,
    color: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30',
    label: 'Image'
  },
  audio: {
    icon: Music,
    color: 'bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-950/20 dark:text-cyan-400 dark:border-cyan-900/30',
    label: 'Audio'
  },
  code: {
    icon: Code2,
    color: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30',
    label: 'Code'
  },
  other: {
    icon: FileText,
    color: 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-zinc-900/40 dark:text-zinc-400 dark:border-zinc-800',
    label: 'File'
  }
};

/**
 * A stunning card representing uploaded metadata or files inside chat lists.
 * Supports image previews, upload percent spinners, and download triggers.
 */
export const AIAttachment = React.forwardRef<HTMLDivElement, AIAttachmentProps>(
  ({ item, onRemove, onDownload, variant = 'card', className, ...props }, ref) => {
    const config = fileTypeConfig[item.type] || fileTypeConfig.other;
    const FileIcon = config.icon;
    const isUploading = item.status === 'uploading' || (item.progress !== undefined && item.progress < 100 && item.status !== 'error');

    if (variant === 'badge') {
      return (
        <div
          ref={ref}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium backdrop-blur-md shadow-sm transition-all relative overflow-hidden",
            config.color,
            className
          )}
          {...props}
        >
          {isUploading && (
            <div 
              className="absolute left-0 top-0 bottom-0 bg-current opacity-10 transition-all duration-300"
              style={{ width: `${item.progress || 0}%` }}
            />
          )}
          <FileIcon className="h-3 w-3 shrink-0" />
          <span className="max-w-[120px] truncate font-sans">{item.name}</span>
          {isUploading ? (
            <RefreshCw className="h-2.5 w-2.5 animate-spin shrink-0 opacity-60" />
          ) : (
            onRemove && (
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 ml-0.5 shrink-0 transition-colors"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            )
          )}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex items-center gap-3 p-3 rounded-2xl border bg-white/80 dark:bg-zinc-950/40 backdrop-blur-md shadow-sm transition-all group hover:shadow-md",
          "border-gray-200 hover:border-gray-300 dark:border-white/5 dark:hover:border-white/10",
          isUploading && "opacity-80",
          className
        )}
        {...props}
      >
        {/* Left Thumbnail icon/preview */}
        <div className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-sm relative overflow-hidden shadow-inner",
          config.color
        )}>
          {item.type === 'image' && item.url ? (
            <img src={item.url} alt={item.name} className="h-full w-full object-cover rounded-xl" />
          ) : (
            <FileIcon className="h-5 w-5" />
          )}

          {/* Upload progress circle mask overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <svg className="w-6 h-6 transform -rotate-90">
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" strokeWidth="2" fill="none" />
                <circle 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="white" 
                  strokeWidth="2" 
                  fill="none" 
                  strokeDasharray={62.8}
                  strokeDashoffset={62.8 - (62.8 * (item.progress || 0)) / 100}
                />
              </svg>
            </div>
          )}
        </div>

        {/* Filename and extension */}
        <div className="flex-1 min-w-0 flex flex-col">
          <span className="text-xs font-bold text-gray-800 dark:text-zinc-200 truncate pr-4">
            {item.name}
          </span>
          <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-light mt-0.5 flex items-center gap-1.5 uppercase font-semibold">
            <span>{config.label}</span>
            {item.size && (
              <>
                <span className="h-1 w-1 rounded-full bg-gray-200 dark:bg-zinc-800" />
                <span>{item.size}</span>
              </>
            )}
          </span>
        </div>

        {/* Absolute right overlay action buttons */}
        <div className="flex items-center gap-1">
          {!isUploading && onDownload && (
            <button
              type="button"
              onClick={() => onDownload(item)}
              className="opacity-0 group-hover:opacity-100 flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white transition-all duration-200 shrink-0"
              title="Download File"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          )}

          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-rose-50 hover:text-rose-600 dark:text-zinc-500 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 transition-colors shrink-0"
              title="Remove File"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

AIAttachment.displayName = 'AIAttachment';
