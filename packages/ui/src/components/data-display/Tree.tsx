import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, File, FolderOpen } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface TreeNode {
  id: string;
  label: string;
  icon?: React.ReactNode;
  children?: TreeNode[];
}

export interface TreeProps {
  data: TreeNode[];
  className?: string;
  onSelect?: (node: TreeNode) => void;
}

const TreeNodeItem = ({ node, depth = 0, onSelect }: { node: TreeNode; depth?: number; onSelect?: (node: TreeNode) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
    onSelect?.(node);
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/[0.03] cursor-pointer",
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleToggle}
      >
        {hasChildren ? (
          <span className="text-gray-400 dark:text-white/40">
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
        ) : (
          <span className="w-4" /> 
        )}
        
        {node.icon ? (
          <span className="text-gray-500 dark:text-white/50">{node.icon}</span>
        ) : (
          <span className="text-blue-500 dark:text-blue-400">
            {hasChildren ? (isOpen ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />) : <File className="h-4 w-4" />}
          </span>
        )}
        
        <span className="truncate">{node.label}</span>
      </div>
      
      {isOpen && hasChildren && (
        <div className="animate-in slide-in-from-top-1 fade-in duration-200">
          {node.children!.map((child) => (
            <TreeNodeItem key={child.id} node={child} depth={depth + 1} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
};

export const Tree = ({ data, className, onSelect }: TreeProps) => {
  return (
    <div className={cn("w-full select-none", className)}>
      {data.map((node) => (
        <TreeNodeItem key={node.id} node={node} onSelect={onSelect} />
      ))}
    </div>
  );
};
