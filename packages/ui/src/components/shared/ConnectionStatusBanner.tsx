import React from 'react';
import { cn } from '../../utils/cn';
import { WifiOff, RefreshCcw, AlertTriangle } from 'lucide-react';
import { Animate } from '../../primitives/Animate';

interface ConnectionStatusBannerProps {
  status: 'disconnected' | 'connecting' | 'reconnecting' | 'error';
  onRetry?: () => void;
  message?: string;
}

export function ConnectionStatusBanner({ status, onRetry, message }: ConnectionStatusBannerProps) {
  const config = {
    disconnected: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      text: 'text-rose-400',
      icon: <WifiOff size={14} />,
      label: 'Telefone Desconectado'
    },
    connecting: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
      icon: <RefreshCcw size={14} className="animate-spin" />,
      label: 'Conectando...'
    },
    reconnecting: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-400',
      icon: <RefreshCcw size={14} className="animate-spin" />,
      label: 'Tentando reconectar...'
    },
    error: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      text: 'text-rose-400',
      icon: <AlertTriangle size={14} />,
      label: 'Erro na conexão'
    }
  }[status];

  return (
    <Animate
      preset="fade-down"
      className={cn(
        "flex items-center justify-center gap-4 py-2 px-4 border-b backdrop-blur-md z-50",
        config.bg,
        config.border
      )}
    >
      <div className={cn("flex items-center gap-2 text-xs font-bold uppercase tracking-widest", config.text)}>
        {config.icon}
        {message || config.label}
      </div>
      
      {onRetry && (status === 'disconnected' || status === 'error') && (
        <button 
          onClick={onRetry}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-bold text-white transition-all active:scale-95"
        >
          Tentar agora
          <RefreshCcw size={10} />
        </button>
      )}
    </Animate>
  );
}
