import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { Folder, FolderOpen, FileCode, FileText, ChevronRight, ChevronDown, CheckCircle2 } from 'lucide-react';

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  language?: string;
  isOpen?: boolean;
}

export interface AIFileTreeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Array of workspace nodes to display */
  data: FileNode[];
  /** Callback fired when clicking a file node */
  onFileClick?: (file: FileNode) => void;
  /** Active file selection ID */
  selectedId?: string;
}

/**
 * A beautiful visual representation of workspaces or codebase folders inside AI interfaces.
 * Emulates modern IDE files explorers with expanding animation transitions and glowing hover highlights.
 */
export const AIFileTree = React.forwardRef<HTMLDivElement, AIFileTreeProps>(
  ({ data, onFileClick, selectedId, className, ...props }, ref) => {
    
    // Manage expanded/collapsed folder node ids in local state
    const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
      'f-src': true,
      'f-components': true
    });

    const toggleFolder = (id: string) => {
      setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const renderNode = (node: FileNode, level = 0) => {
      const isFolder = node.type === 'folder';
      const isExpanded = !!expandedIds[node.id];
      const isSelected = selectedId === node.id;
      const FileIcon = isFolder 
        ? (isExpanded ? FolderOpen : Folder) 
        : (node.language === 'json' || node.language === 'css' ? FileText : FileCode);

      return (
        <div key={node.id} className="flex flex-col select-none">
          {/* Node row heading */}
          <button
            type="button"
            onClick={() => {
              if (isFolder) {
                toggleFolder(node.id);
              } else {
                onFileClick?.(node);
              }
            }}
            className={cn(
              "group flex items-center gap-2 py-1.5 px-2 rounded-lg text-left text-xs font-medium transition-all relative overflow-hidden",
              "hover:bg-gray-100/60 dark:hover:bg-white/[0.03]",
              isSelected && "bg-cyan-50/50 text-cyan-600 dark:bg-cyan-950/20 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/30"
            )}
            style={{ paddingLeft: `${Math.max(level * 16 + 8, 8)}px` }}
          >
            {/* Folder chevron */}
            {isFolder ? (
              <span className="text-gray-400 dark:text-zinc-500 shrink-0">
                {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </span>
            ) : (
              <span className="w-3.5 h-3.5 shrink-0" /> // Spacer for alignment
            )}

            {/* Icon */}
            <FileIcon className={cn(
              "h-3.5 w-3.5 shrink-0",
              isFolder 
                ? "text-amber-500 dark:text-amber-400" 
                : (isSelected ? "text-cyan-500" : "text-gray-400 dark:text-zinc-500")
            )} />

            {/* Name */}
            <span className="truncate flex-1 font-mono text-[11px] leading-none">
              {node.name}
            </span>

            {/* Select check or hover tags */}
            {!isFolder && isSelected && (
              <CheckCircle2 className="h-3 w-3 text-cyan-500 shrink-0 absolute right-2.5 animate-in fade-in" />
            )}
          </button>

          {/* Children items list */}
          {isFolder && isExpanded && node.children && (
            <div className="flex flex-col mt-0.5">
              {node.children.map(child => renderNode(child, level + 1))}
            </div>
          )}
        </div>
      );
    };

    return (
      <div
        ref={ref}
        className={cn("flex flex-col gap-0.5 w-full font-sans", className)}
        {...props}
      >
        {data.map(node => renderNode(node, 0))}
      </div>
    );
  }
);

AIFileTree.displayName = 'AIFileTree';
