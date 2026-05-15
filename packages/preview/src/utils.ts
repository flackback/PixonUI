export function lerp(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  const t = Math.max(0, Math.min(1, (value - inMin) / (inMax - inMin)));
  return outMin + (outMax - outMin) * t;
}

export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export const cleanupAnimation = (a: Animation, e: HTMLElement) => {
  a.finished.then(() => {
    if (a.playState === 'finished' && e.isConnected) {
      a.commitStyles();
      a.cancel();
    }
  }).catch(() => {});
};
