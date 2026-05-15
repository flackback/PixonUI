import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimationControls, Button } from '@pixonui/react';
import { Play } from 'lucide-react';

const paths = [
  "M4,80.3307481 L4,103.14209", "M12,80.3307481 L12,103.14209", "M20,80.3307481 L20,103.14209",
  "M28,79.2468955 L28,103.14209", "M36,78.1629412 L36,103.14209", "M44,75.4792747 L44,103.14209",
  "M52,72.7420239 L52,103.14209", "M60,69.5063186 L60,103.14209", "M68,66.251244 L68,103.14209",
  "M76,61.8968703 L76,103.14209", "M84,58.6428398 L84,103.14209", "M92,55.3517013 L92,103.14209",
  "M100,52.1459205 L100,103.14209", "M108,49.9758708 L108,103.14209", "M116,49.9648003 L116,103.14209",
  "M124,52.0421408 L124,103.14209", "M132,54.207588 L132,103.14209", "M140,57.4549402 L140,103.14209",
  "M148,59.7410947 L148,103.14209", "M156,60.7705138 L156,103.14209", "M164,59.6868773 L164,103.14209",
  "M172,56.4734051 L172,103.14209", "M180,49.799018 L180,103.14209", "M188,42.3419581 L188,103.14209",
  "M196,35.8617977 L196,103.14209", "M204,29.3524204 L204,103.14209", "M212,23.9352737 L212,103.14209",
  "M220,19.5951742 L220,103.14209", "M228,18.5101493 L228,103.14209", "M236,16.3400995 L236,103.14209",
  "M244,14.1700498 L244,103.14209", "M252,12 L252,103.14209"
];

const AnimePathItem = ({ d, index, controls }: { d: string; index: number, controls: any }) => {
  const pathRef = useRef<SVGPathElement>(null);
  const [length, setLength] = useState(0);

  useEffect(() => {
    if (pathRef.current) {
      setLength(pathRef.current.getTotalLength());
    }
  }, []);

  if (length === 0) return <path ref={pathRef} d={d} stroke="transparent" />;

  return (
    <motion.path
      d={d}
      strokeDasharray={length || 1000}
      animate={controls}
      staggerIdx={index}
      initial={{ 
        strokeDashoffset: -(length || 1000),
        stroke: '#FFFFFF',
        strokeWidth: 2
      }}
      transition={{
        strokeDashoffset: {
          duration: 1.2,
          delay: index * 0.06,
          easing: [0.16, 1, 0.3, 1], // easeOutExpo
          repeat: Infinity,
          repeatType: 'mirror'
        },
        stroke: {
          duration: 2.0,
          delay: index * 0.06,
          easing: 'linear',
          repeat: Infinity,
          repeatType: 'mirror'
        },
        strokeWidth: {
          duration: 0.8,
          delay: 1.2 + (index * 0.04),
          easing: 'linear',
          repeat: Infinity,
          repeatType: 'mirror'
        }
      }}
    />
  );
};

export default function AnimePathDemo() {
  const controls = useAnimationControls();

  const handlePlay = () => {
    // Reset first
    controls.set({ 
      strokeDashoffset: -200, // Large enough to hide
      stroke: '#FFFFFF',
      strokeWidth: 2
    });

    // Start animation
    controls.start((i: number) => ({
      strokeDashoffset: 0,
      stroke: `rgb(200, ${i * 8}, 150)`,
      strokeWidth: 6
    }));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black gap-12 p-8">
      <div className="relative group flex flex-col items-center gap-8">
        <Button 
          variant="cyber" 
          size="lg" 
          onClick={handlePlay}
          leftIcon={<Play className="h-5 w-5 fill-current" />}
          className="px-8 py-6 rounded-2xl text-lg font-bold tracking-widest uppercase transition-all hover:scale-105 active:scale-95"
        >
          Execute Motion
        </Button>

        {/* Cinematic Backdrop Glow */}
        <div className="absolute -inset-20 bg-gradient-to-tr from-purple-500/10 via-pink-500/5 to-transparent blur-[100px] opacity-50 group-hover:opacity-80 transition-opacity duration-1000 pointer-events-none" />
        
        <div className="relative p-12 bg-white/5 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-[0_32px_120px_-20px_rgba(0,0,0,0.5)]">
          <svg 
            width="252" 
            height="94" 
            viewBox="3 11 252 94" 
            xmlns="http://www.w3.org/2000/svg"
            className="overflow-visible"
          >
            {paths.map((d, i) => (
              <AnimePathItem key={i} d={d} index={i} controls={controls} />
            ))}
          </svg>
        </div>

        <div className="mt-8 text-center space-y-4">
          <p className="text-white/40 text-sm font-medium tracking-[0.2em] uppercase">
            Pixon Motion Engine
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-white/20" />
            <span className="text-white/60 text-xs italic">Inspired by Anime.js</span>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-white/20" />
          </div>
        </div>
      </div>

      <a 
        href="http://anime-js.com" 
        className="logo opacity-30 hover:opacity-100 transition-opacity duration-500 mb-20"
      >
        <img 
          src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/1137/anime-logo.png" 
          alt="Anime.js Logo"
          className="h-6 invert"
        />
      </a>

      {/* NEW: Kinetic Ripple Grid */}
      <div className="flex flex-col items-center gap-8 mb-20 w-full max-w-2xl">
        <div className="text-center">
          <p className="text-cyan-400/60 text-[10px] font-bold tracking-[0.3em] uppercase mb-2">Sequence 02</p>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tighter">Kinetic Ripple</h2>
          <p className="text-white/40 text-sm italic">Staggered scale & rotate orchestration</p>
        </div>

        <div className="grid grid-cols-10 gap-3 p-8 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg shadow-lg shadow-cyan-500/20"
              initial={{ scale: 1, rotate: 0 }}
              animate={{
                scale: [1, 0.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 2,
                delay: (i % 10) * 0.1 + Math.floor(i / 10) * 0.1,
                repeat: Infinity,
                repeatDelay: 1,
                easing: [0.22, 1, 0.36, 1]
              }}
            />
          ))}
        </div>
      </div>

      {/* NEW: Orbital Flux */}
      <div className="flex flex-col items-center gap-8 mb-32 w-full max-w-2xl">
        <div className="text-center">
          <p className="text-pink-400/60 text-[10px] font-bold tracking-[0.3em] uppercase mb-2">Sequence 03</p>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tighter">Orbital Flux</h2>
          <p className="text-white/40 text-sm italic">Multi-axis synchronized motion</p>
        </div>

        <div className="relative w-80 h-80 flex items-center justify-center bg-white/5 backdrop-blur-md rounded-[3rem] border border-white/5">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full shadow-[0_0_20px_rgba(236,72,153,0.5)]"
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{
                x: Math.cos((i / 12) * Math.PI * 2) * 120,
                y: Math.sin((i / 12) * Math.PI * 2) * 120,
                opacity: [0, 1, 0],
                scale: [0.5, 1.5, 0.5]
              }}
              transition={{
                duration: 3,
                delay: i * 0.15,
                repeat: Infinity,
                easing: "elite-out"
              }}
            />
          ))}
          <div className="w-16 h-16 bg-white/10 rounded-full blur-2xl opacity-20 animate-pulse" />
          <div className="absolute inset-0 border border-white/5 rounded-[3rem] animate-[spin_20s_linear_infinite]" />
        </div>
      </div>
    </div>
  );
}
