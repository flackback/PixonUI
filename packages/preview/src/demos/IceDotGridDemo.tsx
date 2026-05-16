import React, { useEffect, useRef } from 'react';

function useDashGridCanvas({
  spacing = 26,
  dashLength = 8,
  dashThickness = 1,
  color = 'rgba(148, 163, 184, 0.55)',
  opacity = 0.55,
  parallax = 18,
}: {
  spacing?: number;
  dashLength?: number;
  dashThickness?: number;
  color?: string;
  opacity?: number;
  parallax?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, has: false });
  const offsetRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId: number | null = null;
    let w = 0;
    let h = 0;
    let dpr = 1;

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const render = () => {
      // Smooth parallax offset
      offsetRef.current.x += (targetRef.current.x - offsetRef.current.x) * 0.08;
      offsetRef.current.y += (targetRef.current.y - offsetRef.current.y) * 0.08;

      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = color;
      ctx.lineWidth = dashThickness;
      ctx.lineCap = 'round';

      const ox = offsetRef.current.x;
      const oy = offsetRef.current.y;

      // Draw grid of tiny dashes (alternating orientation for texture)
      const startX = -spacing + (ox % spacing);
      const startY = -spacing + (oy % spacing);
      let idx = 0;
      for (let x = startX; x <= w + spacing; x += spacing) {
        for (let y = startY; y <= h + spacing; y += spacing) {
          const horizontal = (idx++ % 2) === 0;
          if (horizontal) {
            ctx.beginPath();
            ctx.moveTo(x - dashLength / 2, y);
            ctx.lineTo(x + dashLength / 2, y);
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.moveTo(x, y - dashLength / 2);
            ctx.lineTo(x, y + dashLength / 2);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(render);
    };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const nx = (e.clientX - cx) / (rect.width / 2 || 1);
      const ny = (e.clientY - cy) / (rect.height / 2 || 1);
      mouseRef.current = { x: nx, y: ny, has: true };
      targetRef.current.x = -nx * parallax;
      targetRef.current.y = -ny * parallax;
    };

    const onLeave = () => {
      mouseRef.current.has = false;
      targetRef.current.x = 0;
      targetRef.current.y = 0;
    };

    resize();
    render();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseleave', onLeave);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [spacing, dashLength, dashThickness, color, opacity, parallax]);

  return canvasRef;
}

export default function IceDotGridDemo() {
  const canvasRef = useDashGridCanvas({
    spacing: 26,
    dashLength: 8,
    dashThickness: 1,
    color: 'rgba(148, 163, 184, 0.55)',
    opacity: 0.55,
    parallax: 18,
  });

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#f8fafc] text-slate-900">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* subtle ice vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(80% 60% at 50% 30%, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.85) 45%, rgba(241,245,249,0.9) 100%)',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <div className="inline-flex items-center gap-3 rounded-2xl bg-white/70 backdrop-blur-xl border border-slate-200 px-5 py-3 shadow-sm">
          <div className="h-3 w-3 rounded-full bg-slate-900/70" />
          <p className="text-sm font-semibold tracking-tight">Ice DotGrid (bilinhas) — mouse reactive</p>
        </div>

        <h1 className="mt-10 text-5xl font-black tracking-tight leading-[1.05]">
          Fundo “gelo branco” com dotgrid de bilinhas cinzas
        </h1>
        <p className="mt-4 text-slate-600 text-lg max-w-2xl">
          Move o mouse para ver o grid deslizar com parallax suave (compositor-friendly).
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-xl p-6 shadow-sm"
            >
              <div className="h-10 w-10 rounded-2xl bg-slate-900/90" />
              <h3 className="mt-5 font-bold tracking-tight">Card {i + 1}</h3>
              <p className="mt-2 text-sm text-slate-600">
                Conteúdo sobreposto ao background com boa legibilidade.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

