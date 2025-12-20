import React, { useState, useEffect } from 'react';
import { PageLoader, PageTransition, Button, Card, CardContent, Select, Divider } from '@pixonui/react';
import { RefreshCw } from 'lucide-react';

export function PageLoaderDemo() {
  const [loadingVariant, setLoadingVariant] = useState<'spinner' | 'bar' | 'dots' | 'logo' | 'glass' | null>(null);

  const showLoader = (variant: 'spinner' | 'bar' | 'dots' | 'logo' | 'glass') => {
    setLoadingVariant(variant);
    setTimeout(() => setLoadingVariant(null), 3000);
  };

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h3 className="text-lg font-medium text-white">Page Loaders</h3>
        <p className="text-sm text-white/60">Click to preview fullscreen loaders (auto-closes after 3s)</p>
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => showLoader('spinner')}>Spinner</Button>
          <Button onClick={() => showLoader('bar')}>Progress Bar</Button>
          <Button onClick={() => showLoader('dots')}>Dots</Button>
          <Button onClick={() => showLoader('logo')}>Logo Pulse</Button>
          <Button onClick={() => showLoader('glass')}>Glass Overlay</Button>
        </div>
      </section>

      {loadingVariant && (
        <PageLoader 
          variant={loadingVariant} 
          text={loadingVariant === 'glass' ? 'Loading application...' : loadingVariant === 'dots' ? 'Please wait...' : undefined} 
        />
      )}

      <Divider />

      <section className="space-y-4">
        <h3 className="text-lg font-medium text-white">Page Transitions</h3>
        <p className="text-sm text-white/60">Select a preset to see the entrance animation.</p>
        <TransitionExample />
      </section>
    </div>
  );
}

function TransitionExample() {
  const [key, setKey] = useState(0);
  const [preset, setPreset] = useState<'fade' | 'slide-up' | 'scale' | 'blur'>('fade');

  const reload = () => setKey(prev => prev + 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <select 
          className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
          value={preset}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            setPreset(e.target.value as any);
            reload();
          }}
        >
          <option value="fade">Fade</option>
          <option value="slide-up">Slide Up</option>
          <option value="scale">Scale</option>
          <option value="blur">Blur</option>
        </select>
        <Button variant="secondary" onClick={reload} leftIcon={<RefreshCw size={16} />}>
          Replay Animation
        </Button>
      </div>

      <div className="h-[300px] w-full border border-white/10 rounded-lg overflow-hidden bg-white/[0.02] relative">
        <PageTransition key={key} preset={preset} className="p-8 h-full w-full flex items-center justify-center">
          <Card className="w-full max-w-md mx-auto bg-white/10 border-white/10">
            <CardContent className="p-6 text-center">
              <h4 className="text-xl font-bold text-white mb-2">Animated Content</h4>
              <p className="text-white/60">
                This content animates in using the <span className="text-blue-400 font-mono">{preset}</span> preset.
              </p>
            </CardContent>
          </Card>
        </PageTransition>
      </div>
    </div>
  );
}
