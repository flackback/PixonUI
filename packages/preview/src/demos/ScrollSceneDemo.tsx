import React from 'react';
import { ScrollScene } from '../../../ui/src/components/effects/ScrollScene';

export default function ScrollSceneDemo() {
  return (
    <div className="bg-zinc-950 min-h-[300vh] text-zinc-100 flex flex-col relative">
      <div className="h-screen flex items-center justify-center sticky top-0 overflow-hidden">
        
        {/* Parallax Background */}
        <ScrollScene 
          from={{ scale: 1, blur: 0 }}
          to={{ scale: 1.5, blur: 10 }}
          timeline="scroll"
          className="absolute inset-0 z-0 opacity-30"
        >
          <div className="w-full h-full bg-gradient-to-br from-purple-900 to-zinc-900" />
        </ScrollScene>

        {/* Hero Text */}
        <div className="z-10 text-center space-y-4">
          <ScrollScene
            from={{ y: 0, opacity: 1 }}
            to={{ y: -100, opacity: 0 }}
            timeline="scroll"
            range={{ start: '0%', end: '500px' }}
          >
            <h1 className="text-6xl font-bold">Scroll Scene</h1>
          </ScrollScene>
          
          <ScrollScene
            from={{ opacity: 1 }}
            to={{ opacity: 0 }}
            timeline="scroll"
            range={{ start: '0%', end: '300px' }}
          >
            <p className="text-xl text-zinc-400">Scroll down to see the magic</p>
          </ScrollScene>
        </div>
      </div>

      <div className="h-screen flex items-center justify-center z-10 relative mt-[50vh]">
        <ScrollScene
          from={{ opacity: 0, scale: 0.5, rotateX: 90 }}
          to={{ opacity: 1, scale: 1, rotateX: 0 }}
          timeline="view"
          range={{ start: 'entry 0%', end: 'cover 50%' }}
          className="w-96 h-64 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex items-center justify-center"
        >
          <span className="text-2xl font-bold text-zinc-300">View Timeline Card</span>
        </ScrollScene>
      </div>
    </div>
  );
}
