import React, { useState } from 'react';
import { Motion } from '../../../ui/src/components/feedback/Motion';

export default function SpringDemo() {
  const [active, setActive] = useState(false);

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-100 p-12 flex flex-col items-center space-y-12">
      <h1 className="text-4xl font-bold">WAAPI Spring Physics</h1>
      <button 
        onClick={() => setActive(!active)}
        className="px-6 py-3 bg-purple-600 rounded-lg font-medium hover:bg-purple-500 transition-colors"
      >
        Toggle Spring
      </button>

      <div className="flex gap-12 mt-12">
        <div className="flex flex-col items-center gap-4">
          <span className="text-zinc-400">Bouncy (stiffness: 300, damping: 10)</span>
          <Motion
            className="w-32 h-32 bg-purple-500 rounded-3xl"
            animate={{ y: active ? -100 : 0, scale: active ? 1.2 : 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 10 }}
          />
        </div>

        <div className="flex flex-col items-center gap-4">
          <span className="text-zinc-400">Stiff (stiffness: 500, damping: 30)</span>
          <Motion
            className="w-32 h-32 bg-blue-500 rounded-3xl"
            animate={{ y: active ? -100 : 0, scale: active ? 1.2 : 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </div>

        <div className="flex flex-col items-center gap-4">
          <span className="text-zinc-400">Sluggish (stiffness: 50, damping: 15)</span>
          <Motion
            className="w-32 h-32 bg-emerald-500 rounded-3xl"
            animate={{ y: active ? -100 : 0, scale: active ? 1.2 : 1 }}
            transition={{ type: 'spring', stiffness: 50, damping: 15 }}
          />
        </div>
      </div>
    </div>
  );
}
