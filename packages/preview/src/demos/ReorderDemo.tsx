import React, { useState } from 'react';
import { Reorder, ReorderItem } from '../../../ui/src/components/interactions/Reorder';
import { Drag } from '../../../ui/src/components/interactions/Drag';

export default function ReorderDemo() {
  const [items, setItems] = useState([1, 2, 3, 4, 5]);

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-100 p-12 flex flex-col items-center space-y-12 select-none">
      <h1 className="text-4xl font-bold">Interactive Primitives</h1>

      <div className="flex gap-24">
        {/* Reorder List */}
        <div className="flex flex-col items-center gap-6">
          <h2 className="text-2xl font-semibold">Reorder List</h2>
          <Reorder 
            axis="y" 
            values={items} 
            onReorder={setItems} 
            className="flex flex-col gap-4 w-64 p-4 bg-zinc-900 rounded-2xl"
          >
            {items.map((item) => (
              <ReorderItem 
                key={item} 
                value={item} 
                className="bg-zinc-800 p-4 rounded-xl flex items-center justify-between cursor-grab active:cursor-grabbing border border-zinc-700 shadow-md"
              >
                <span className="font-medium">Item {item}</span>
                <div className="w-6 h-6 flex flex-col justify-center items-center gap-1 opacity-50">
                  <div className="w-4 h-0.5 bg-zinc-400 rounded" />
                  <div className="w-4 h-0.5 bg-zinc-400 rounded" />
                  <div className="w-4 h-0.5 bg-zinc-400 rounded" />
                </div>
              </ReorderItem>
            ))}
          </Reorder>
        </div>

        {/* Free Drag */}
        <div className="flex flex-col items-center gap-6">
          <h2 className="text-2xl font-semibold">Free Drag (Inertia + Bounds)</h2>
          <div className="w-64 h-80 bg-zinc-900 rounded-2xl p-4 border border-zinc-800 relative overflow-hidden">
            <Drag 
              dragConstraints={{ top: 0, left: 0, right: 192, bottom: 256 }} 
              dragElastic={0.2}
              className="w-16 h-16 bg-purple-500 rounded-xl shadow-lg cursor-grab active:cursor-grabbing flex items-center justify-center font-bold absolute"
            >
              Drag
            </Drag>
          </div>
        </div>
      </div>
    </div>
  );
}
