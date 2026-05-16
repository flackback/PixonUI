import React, { useState } from 'react';
import {
  AnimatePresence,
  Container,
  Stack,
  Surface,
  Heading,
  Text,
  GlowButton,
  Grid,
  motion
} from '@pixonui/react';
import { Sparkles, ArrowRight, Layout, Play, RefreshCw, Zap } from 'lucide-react';

const PAGES = [
  {
    id: 'intro',
    title: 'Omni-Motion Strategy',
    description: 'Hardware-accelerated 120 FPS transitions using WAAPI and the FLIP protocol.',
    color: 'from-purple-600 to-indigo-700',
    icon: Zap
  },
  {
    id: 'physics',
    title: 'Spring Dynamics',
    description: 'Physical inertia and damping for naturally fluid interactive interfaces.',
    color: 'from-cyan-600 to-blue-700',
    icon: Sparkles
  },
  {
    id: 'continuity',
    title: 'Spatial Continuity',
    description: 'Shared-element morphing that maintains context across navigation states.',
    color: 'from-emerald-600 to-teal-700',
    icon: Layout
  }
];

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  initial: { opacity: 0, y: 30, filter: 'blur(100px)' },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 150, damping: 20 }
  }
};

export function CinematicTransitions() {
  const [pageIdx, setPageIdx] = useState(0);
  const currentPage = PAGES[pageIdx]!;

  const next = () => setPageIdx((p) => (p + 1) % PAGES.length);

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-purple-500/30 overflow-hidden">
      {/* Dynamic Ambient Glow */}
      <motion.div
        key={`glow-${pageIdx}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.4, scale: 1.2 }}
        transition={{ duration: 2, easing: 'ease-out' }}
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[160px] bg-gradient-to-br ${currentPage.color} pointer-events-none z-0`}
      />

      <Container className="py-32 max-w-5xl relative z-10">
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="w-full"
        >
          <Stack gap={16}>
            <Stack gap={6} align="center" className="text-center">
              <motion.div variants={itemVariants}>
                <div className="px-6 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                  <Text size="xs" className="font-black tracking-[0.3em] uppercase text-purple-400">
                    Supreme Motion Engine
                  </Text>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Heading as="h1" className="text-7xl font-black tracking-tighter leading-[0.9]">
                  Cinematic <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                    Continuity
                  </span>
                </Heading>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Text className="text-zinc-400 text-xl max-w-2xl font-medium leading-relaxed">
                  Experience the next generation of motion architecture. Hardened physics,
                  deterministic layouts, and zero-flicker transitions.
                </Text>
              </motion.div>
            </Stack>

            <motion.div variants={itemVariants} className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-[2.5rem] blur-xl opacity-50" />

              <AnimatePresence>
                <motion.div
                  key={currentPage.id}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.05, y: -20, filter: 'blur(20px)' }}
                  transition={{ type: 'spring', stiffness: 260, damping: 25 }}
                  className="w-full"
                >
                  <Surface className="p-16 rounded-[2.5rem] border-white/10 bg-zinc-900/40 backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden group border-t-white/20">
                    <div className={`absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br ${currentPage.color} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity blur-3xl`} />

                    <Grid cols={1} sm={2} gap={12} className="items-center">
                      <Stack gap={10}>
                        <motion.div
                          initial={{ scale: 0.8, rotate: -10 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.2, type: 'spring' }}
                          className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl"
                        >
                          <currentPage.icon className="text-white" size={40} />
                        </motion.div>

                        <Stack gap={6}>
                          <Heading as="h2" className="text-5xl font-bold text-white tracking-tight">
                            {currentPage.title}
                          </Heading>
                          <Text className="text-zinc-400 text-xl leading-relaxed">
                            {currentPage.description}
                          </Text>
                        </Stack>

                        <div className="flex gap-4">
                          <GlowButton
                            onClick={next}
                            className="px-10 py-5 bg-purple-600 text-white hover:bg-purple-500 font-bold rounded-2xl transition-all shadow-[0_20px_40px_-10px_rgba(168,85,247,0.4)]"
                          >
                            Explore Phase
                            <ArrowRight className="ml-2" size={24} />
                          </GlowButton>
                        </div>
                      </Stack>

                      <div className="relative aspect-square flex items-center justify-center">
                        <motion.div
                          animate={{
                            rotate: [0, 5, -5, 0],
                            y: [0, -10, 10, 0]
                          }}
                          transition={{ duration: 10, repeat: Infinity, easing: 'ease-in-out' }}
                        >
                          <div className={`w-64 h-64 rounded-3xl bg-gradient-to-br ${currentPage.color} shadow-2xl flex items-center justify-center`}>
                            <currentPage.icon size={120} className="text-white/20" />
                          </div>
                        </motion.div>
                      </div>
                    </Grid>
                  </Surface>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            <Grid cols={3} gap={6} className="max-w-2xl mx-auto w-full">
              {PAGES.map((p, i) => (
                <div
                  key={p.id}
                  onClick={() => setPageIdx(i)}
                  className="cursor-pointer group flex flex-col gap-4"
                >
                  <div className={`h-1 rounded-full overflow-hidden bg-white/10`}>
                    <motion.div
                      animate={{ width: i === pageIdx ? '100%' : '0%' }}
                      className="h-full bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.8)]"
                    />
                  </div>
                  <Stack gap={1}>
                    <Text size="xs" className={`font-black tracking-widest transition-colors ${i === pageIdx ? 'text-white' : 'text-zinc-600 group-hover:text-zinc-400'}`}>
                      0{i + 1}
                    </Text>
                    <Text size="sm" className={`font-bold transition-colors ${i === pageIdx ? 'text-purple-400' : 'text-zinc-600 group-hover:text-zinc-400'}`}>
                      {p.id.toUpperCase()}
                    </Text>
                  </Stack>
                </div>
              ))}
            </Grid>
          </Stack>
        </motion.div>
      </Container>
    </div>
  );
}
