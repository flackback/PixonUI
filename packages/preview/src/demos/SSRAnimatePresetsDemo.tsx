import React from 'react';
import { PixonSSRAnimate } from '../../../ui/src/components/effects/SSRAnimate';
import { SSR_ANIMATE_PRESETS } from '../../../ui/src/components/effects/SSRAnimate.presets';
import { Grid } from '../../../ui/src/components/layout/Grid';

export default function SSRAnimatePresetsDemo() {
  const presets = Object.keys(SSR_ANIMATE_PRESETS) as Array<keyof typeof SSR_ANIMATE_PRESETS>;

  return (
    <div className="p-8 space-y-8 bg-zinc-950 min-h-screen text-zinc-100">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">SSRAnimate Presets</h1>
        <p className="text-zinc-400">Zero-JS React Server Component Animations</p>
      </div>
      
      <Grid columns={{ base: 2, md: 4, lg: 6 }} gap={4}>
        {presets.map((preset) => (
          <div key={preset as string} className="relative group p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center min-h-[120px] overflow-hidden hover:border-purple-500/50 transition-colors">
            <PixonSSRAnimate preset={preset as any} trigger="load" className="text-center">
              <div className="w-10 h-10 bg-purple-500 rounded-lg mx-auto mb-2 group-hover:bg-purple-400 transition-colors" />
              <span className="text-xs font-mono text-zinc-300">{preset as string}</span>
            </PixonSSRAnimate>
          </div>
        ))}
      </Grid>
    </div>
  );
}
