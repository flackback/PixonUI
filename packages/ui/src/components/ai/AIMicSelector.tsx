import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../utils/cn';
import { Mic, Check, ChevronDown, Volume2, ShieldAlert } from 'lucide-react';

export interface MicDevice {
  id: string;
  name: string;
  status: 'active' | 'available' | 'disconnected';
}

export interface AIMicSelectorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** Optional initial device selection ID */
  defaultSelectedId?: string;
  /** Callback fired when a microphone source is chosen */
  onSelect?: (device: MicDevice) => void;
}

/**
 * A beautiful, interactive microphone device selector for AI voice chats.
 * Displays bouncing gain audio dots mimicking actual real-time input gains.
 */
export const AIMicSelector = React.forwardRef<HTMLDivElement, AIMicSelectorProps>(
  ({ defaultSelectedId, onSelect, className, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const devices: MicDevice[] = [
      { id: 'mic-1', name: 'Built-in Microphone (Macbook Pro)', status: 'active' },
      { id: 'mic-2', name: 'Focusrite Scarlett Solo (USB Audio)', status: 'available' },
      { id: 'mic-3', name: 'AirPods Pro (Wireless Bluetooth)', status: 'available' },
      { id: 'mic-4', name: 'Studio Condenser Mic (Yeti)', status: 'disconnected' }
    ];

    const [selectedDevice, setSelectedDevice] = useState<MicDevice>(
      devices.find(d => d.id === defaultSelectedId) || devices[0]!
    );

    // Audio Input gain volume simulations
    const [gainValues, setGainValues] = useState<number[]>([2, 5, 3]);

    useEffect(() => {
      // Bounces the green dots only for active selection simulating voice inputs
      const interval = setInterval(() => {
        setGainValues([
          Math.floor(Math.random() * 8 + 2),
          Math.floor(Math.random() * 8 + 2),
          Math.floor(Math.random() * 8 + 2)
        ]);
      }, 150);

      return () => clearInterval(interval);
    }, []);

    // Dismiss popover on outside click
    useEffect(() => {
      const handleOutsideClick = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleOutsideClick);
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const handleChoose = (dev: MicDevice) => {
      if (dev.status === 'disconnected') return;
      setSelectedDevice(dev);
      onSelect?.(dev);
      setIsOpen(false);
    };

    return (
      <div
        ref={containerRef}
        className={cn("relative inline-block text-left w-full sm:w-[260px]", className)}
        {...props}
      >
        {/* Main Trigger Select Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center justify-between gap-3 w-full px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all shadow-sm bg-white hover:bg-gray-50 active:scale-98",
            "border-gray-200 dark:border-white/5 dark:bg-zinc-950/40 dark:hover:bg-zinc-900/50"
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Mic className="h-3.5 w-3.5 text-cyan-500 shrink-0 animate-pulse" />
            <span className="truncate text-gray-800 dark:text-zinc-200">{selectedDevice.name}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Live Gain LEDs */}
            <div className="flex gap-0.5 items-end h-3 w-4">
              {gainValues.map((val, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    "w-1 rounded-full bg-emerald-500 transition-all duration-150",
                    val > 7 ? "bg-amber-500" : "bg-emerald-500"
                  )}
                  style={{ height: `${val * 10}%` }}
                />
              ))}
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400 dark:text-zinc-500" />
          </div>
        </button>

        {/* Floating Dropdown Selector items Popover */}
        {isOpen && (
          <div className={cn(
            "absolute left-0 mt-2 w-full origin-top-left rounded-2xl border bg-white shadow-xl ring-1 ring-black/5 z-50 p-1.5 animate-in fade-in slide-in-from-top-1 duration-150",
            "border-gray-200 dark:border-white/5 dark:bg-zinc-950/95 backdrop-blur-md"
          )}>
            <div className="px-2 py-1.5 border-b border-gray-100 dark:border-white/5 mb-1.5 flex items-center justify-between text-[10px] font-bold uppercase text-gray-400 dark:text-zinc-500 tracking-wider">
              <span>Select Audio Device</span>
              <Volume2 className="h-3 w-3" />
            </div>

            <div className="space-y-0.5 max-h-[220px] overflow-y-auto scrollbar-thin">
              {devices.map((dev) => {
                const isSelected = dev.id === selectedDevice.id;
                const isDisabled = dev.status === 'disconnected';

                return (
                  <button
                    key={dev.id}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleChoose(dev)}
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-2 rounded-xl text-left text-xs font-medium transition-all",
                      isDisabled 
                        ? "opacity-40 cursor-not-allowed text-gray-400 dark:text-zinc-600" 
                        : "text-gray-700 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-white/5",
                      isSelected && "bg-cyan-50/50 text-cyan-600 hover:bg-cyan-50 dark:bg-cyan-950/20 dark:text-cyan-400"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <Mic className={cn(
                        "h-3.5 w-3.5 shrink-0",
                        isSelected ? "text-cyan-500" : "text-gray-400 dark:text-zinc-500"
                      )} />
                      <span className="truncate">{dev.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {dev.status === 'disconnected' && (
                        <span className="text-[9px] uppercase font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <ShieldAlert className="h-2 w-2" /> off
                        </span>
                      )}
                      {isSelected && <Check className="h-3.5 w-3.5 text-cyan-500" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
);

AIMicSelector.displayName = 'AIMicSelector';
