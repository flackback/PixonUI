import React from 'react';
import { cn } from '../../utils/cn';
import { X, Trash2, Forward, CheckSquare, MessageSquare, Copy } from 'lucide-react';
import { Animate } from '../../primitives/Animate';
import { Presence } from '../../primitives/Presence';

interface BulkActionBarProps {
  isVisible: boolean;
  selectedCount: number;
  onClose: () => void;
  onDelete?: () => void;
  onForward?: () => void;
  onMarkRead?: () => void;
  onCopyAll?: () => void;
}

export function BulkActionBar({ 
  isVisible, 
  selectedCount, 
  onClose, 
  onDelete, 
  onForward, 
  onMarkRead,
  onCopyAll
}: BulkActionBarProps) {
  return (
    <Presence present={isVisible} exitDuration={300}>
      <Animate 
        preset="slide-bottom"
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-lg px-4"
      >
        <div className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-2xl border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl p-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 pl-2">
              <button 
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-zinc-400 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white transition-all"
              >
                <X size={18} />
              </button>
              <div className="flex flex-col">
                <span className="text-zinc-900 dark:text-white font-bold text-sm">{selectedCount} selecionados</span>
                <span className="text-zinc-400 dark:text-white/40 text-[10px] font-bold uppercase tracking-widest">Ações em massa</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <ActionButton 
                icon={<Forward size={18} />} 
                label="Encaminhar" 
                onClick={onForward} 
                variant="ghost"
              />
              <ActionButton 
                icon={<Copy size={18} />} 
                label="Copiar" 
                onClick={onCopyAll} 
                variant="ghost"
              />
              <ActionButton 
                icon={<MessageSquare size={18} />} 
                label="Lido" 
                onClick={onMarkRead} 
                variant="ghost"
              />
              <div className="w-px h-8 bg-zinc-200 dark:bg-white/10 mx-1" />
              <ActionButton 
                icon={<Trash2 size={18} />} 
                label="Excluir" 
                onClick={onDelete} 
                variant="danger"
              />
            </div>
          </div>
        </Animate>
      </Presence>
    );
}

function ActionButton({ 
  icon, 
  label, 
  onClick, 
  variant = 'ghost' 
}: { 
  icon: React.ReactNode; 
  label: string; 
  onClick?: () => void;
  variant?: 'ghost' | 'danger';
}) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all group active:scale-95",
        variant === 'ghost' 
          ? "text-zinc-600 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5" 
          : "text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 dark:hover:bg-rose-500/15"
      )}
    >
      {icon}
      <span className="text-[10px] mt-1 font-medium scale-90 group-hover:scale-100 transition-transform">
        {label}
      </span>
    </button>
  );
}
