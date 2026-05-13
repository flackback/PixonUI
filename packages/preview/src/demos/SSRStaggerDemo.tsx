import React from 'react';
import { SSRStagger } from '../../../ui/src/components/effects/SSRStagger';

export default function SSRStaggerDemo() {
  const items = Array.from({ length: 6 }, (_, i) => `List Item ${i + 1}`);

  return (
    <div className="p-8 bg-zinc-950 min-h-[150vh] text-zinc-100 flex flex-col items-center">
      <div className="text-center space-y-2 mb-32">
        <h1 className="text-3xl font-bold">SSRStagger</h1>
        <p className="text-zinc-400">Scroll down to see the staggered animation</p>
      </div>

      <div className="mt-96 w-full max-w-md">
        <SSRStagger as="ul" delay={100} stagger={150} preset="slideInUp" trigger="view">
          {items.map((item, i) => (
            <li key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4 flex items-center justify-between shadow-lg">
              <span className="font-medium text-zinc-200">{item}</span>
              <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm">
                {i + 1}
              </div>
            </li>
          ))}
        </SSRStagger>
      </div>
    </div>
  );
}
