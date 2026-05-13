import React from 'react';
import { cn } from '../../utils/cn';
import { Mic, Volume2, Sparkles, AudioLines } from 'lucide-react';

export interface AIVoicePersonaProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Active communication mode of the voice assistant */
  state?: 'idle' | 'listening' | 'thinking' | 'speaking';
  /** Title of the voice entity, e.g. "Lumina" or "Assistant" */
  name?: string;
}

/**
 * A stunning, state-of-the-art voice agent visualizer.
 * Displays concentric circles, glowing gradients, and CSS scale animations
 * that morph dynamically based on voice assistant states.
 */
export const AIVoicePersona = React.forwardRef<HTMLDivElement, AIVoicePersonaProps>(
  ({ state = 'speaking', name = "Lumina AI", className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "w-full rounded-2xl border border-gray-200 bg-white dark:border-white/5 dark:bg-zinc-950/40 backdrop-blur-md p-6 shadow-md flex flex-col items-center justify-center gap-5 text-center overflow-hidden relative",
          className
        )}
        {...props}
      >
        {/* Subtle background glow layout depending on active state */}
        <div 
          className={cn(
            "absolute inset-0 w-full h-full opacity-[0.03] dark:opacity-[0.05] transition-all duration-1000 blur-2xl pointer-events-none",
            state === 'listening' && "bg-cyan-500",
            state === 'thinking' && "bg-purple-500",
            state === 'speaking' && "bg-indigo-500",
            state === 'idle' && "bg-gray-500"
          )}
        />

        <div className="relative flex items-center justify-center h-28 w-28">
          
          {/* 1. Outer Glowing concentric breathing circles */}
          {state === 'listening' && (
            <>
              <span className="absolute inline-flex h-24 w-24 animate-ping rounded-full bg-cyan-400 dark:bg-cyan-500 opacity-20 duration-[1.5s]" />
              <span className="absolute inline-flex h-20 w-20 animate-pulse rounded-full bg-cyan-300 dark:bg-cyan-400 opacity-30 duration-[2s]" />
            </>
          )}

          {state === 'speaking' && (
            <>
              <span className="absolute inline-flex h-24 w-24 animate-pulse rounded-full bg-indigo-400 dark:bg-indigo-500 opacity-25 duration-[1s]" />
              <span className="absolute inline-flex h-20 w-20 animate-ping rounded-full bg-indigo-300 dark:bg-indigo-400 opacity-20 duration-[1.8s]" />
            </>
          )}

          {state === 'thinking' && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-purple-500/40 dark:border-purple-400/30 animate-[spin_8s_linear_infinite]" />
              <div className="absolute inset-1.5 rounded-full border border-dashed border-cyan-500/30 dark:border-cyan-400/20 animate-[spin_5s_linear_infinite_reverse]" />
            </>
          )}

          {/* 2. Core Colored bubble orb */}
          <div 
            className={cn(
              "relative flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-all duration-500",
              state === 'listening' && "bg-gradient-to-tr from-cyan-400 to-cyan-600 shadow-cyan-500/25 scale-105",
              state === 'thinking' && "bg-gradient-to-tr from-purple-500 to-blue-500 shadow-purple-500/25 animate-[pulse_2s_infinite]",
              state === 'speaking' && "bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-indigo-500/25 scale-110",
              state === 'idle' && "bg-gradient-to-tr from-gray-400 to-gray-600 shadow-gray-500/20"
            )}
          >
            {/* Center state icon indicator */}
            {state === 'listening' && <Mic className="h-6 w-6 text-white animate-pulse" />}
            {state === 'speaking' && <Volume2 className="h-6 w-6 text-white animate-[pulse_1s_infinite]" />}
            {state === 'thinking' && <Sparkles className="h-6 w-6 text-white animate-spin" style={{ animationDuration: '3s' }} />}
            {state === 'idle' && <AudioLines className="h-6 w-6 text-white/80" />}
          </div>

        </div>

        {/* Text descriptions */}
        <div className="flex flex-col gap-1 z-10">
          <span className="text-sm font-bold text-gray-800 dark:text-zinc-100">
            {name}
          </span>
          <span className={cn(
            "text-xs uppercase tracking-wider font-bold transition-all duration-300",
            state === 'listening' && "text-cyan-500",
            state === 'thinking' && "text-purple-500 animate-pulse",
            state === 'speaking' && "text-indigo-500",
            state === 'idle' && "text-gray-400 dark:text-zinc-500"
          )}>
            {state === 'listening' && "Listening..."}
            {state === 'thinking' && "Thinking..."}
            {state === 'speaking' && "Speaking..."}
            {state === 'idle' && "Online"}
          </span>
        </div>
      </div>
    );
  }
);

AIVoicePersona.displayName = 'AIVoicePersona';
