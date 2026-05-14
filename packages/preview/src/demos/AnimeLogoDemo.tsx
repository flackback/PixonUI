import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { timeline, path } from '@pixonui/react';
import { RefreshCw } from 'lucide-react';

const PATH_DATA = {
  m: {
    d1: "M240,220 L240,60 C240,28.954305 231.344172,20 220.666667,20 C171.555556,20 254.832031,20 170,20 C85.1679688,20 168.444444,20 119.333333,20 C108.655828,20 100,28.954305 100,60 L100,220",
    d2: "M310,220 L310,60 C310,28.954305 301.344172,20 290.666667,20 C241.555556,20 254.832031,110 170,110 C85.1679688,110 98.4444444,20 49.3333333,20 C38.6558282,20 30,28.954305 30,60 L30,220",
    d3: "M310,220 L310,60 C310,28.954305 301.344172,20 290.666667,20 C241.555556,20 254.832031,20 170,20 C85.1679688,20 98.413,20 49.301,20 C38.624,20 29.968,28.954 29.968,60 L29.968,220"
  },
  i: {
    d1: "M30 20v200",
    d2: "M30 100v120"
  }
};

function ReactiveGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -1000, y: -1000 });
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId: number;
    let width: number, height: number;
    const spacing = 40;
    const dots: { x: number; y: number; ox: number; oy: number }[] = [];
    const resize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      dots.length = 0;
      for (let x = spacing / 2; x < width; x += spacing) {
        for (let y = spacing / 2; y < height; y += spacing) {
          dots.push({ x, y, ox: x, oy: y });
        }
      }
    };
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#D1D1D1';
      dots.forEach(dot => {
        const dx = mouse.current.x - dot.ox;
        const dy = mouse.current.y - dot.oy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 120;
        if (dist < maxDist) {
          const angle = Math.atan2(dy, dx);
          const force = (maxDist - dist) / maxDist;
          dot.x = dot.ox - Math.cos(angle) * force * 15;
          dot.y = dot.oy - Math.sin(angle) * force * 15;
        } else {
          dot.x += (dot.ox - dot.x) * 0.1;
          dot.y += (dot.oy - dot.y) * 0.1;
        }
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(render);
    };
    window.addEventListener('resize', resize);
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    window.addEventListener('mousemove', handleMouseMove);
    resize();
    render();
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30 pointer-events-none z-0" />;
}

export function AnimeLogoDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const logoAnimRef = useRef<HTMLDivElement>(null);
  const [key, setKey] = useState(0);

  useLayoutEffect(() => {
    function resize() {
      if (!logoAnimRef.current || !wrapperRef.current) return;
      const el = logoAnimRef.current;
      const parent = wrapperRef.current;
      el.style.transform = 'scale(1)';
      const elWidth = 1000;
      const parentWidth = parent.offsetWidth;
      const ratio = Math.min(parentWidth / elWidth, 0.7);
      el.style.transform = `scale(${ratio})`;
    }
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    if (!logoAnimRef.current) return;

    const tl = timeline({ easing: 'ease-out' });

    // 0. Setup Inicial
    tl
      .add('.letter-a, .letter-n, .letter-i', { translateX: 70, opacity: 0 }, { duration: 0 })
      .add('.letter-e', { translateX: -70, opacity: 0 }, { duration: 0, offset: 0 })
      .add('.dot', { translateX: 630, translateY: -700, opacity: 0 }, { duration: 0, offset: 0 })
      .add('.main-logo-circle', { opacity: 0, scale: 0.7, translateY: 60 }, { duration: 0, offset: 0 })
      .add('.line', { strokeDasharray: '1000', strokeDashoffset: '1000' }, { duration: 0, offset: 0 });

    // 1. O SALTO DO LOGO (Restaurado)
    tl.add('.bounced', [
      { translateY: 150, opacity: 1, offset: 0 },
      { translateY: -160, offset: 0.42, easing: 'cubic-bezier(0.225, 1, 0.915, 0.980)' },
      { translateY: 4, offset: 0.73, easing: 'ease-in' },
      { translateY: 0, offset: 1, easing: 'ease-out' }
    ], { duration: 450, offset: 0, stagger: 80 });

    tl.add('.bounced', [
      { scaleX: 0.25, offset: 0 },
      { scaleX: 0.85, offset: 0.28, easing: 'ease-out' },
      { scaleX: 1.08, offset: 0.58, easing: 'ease-in-out' },
      { scaleX: 1, offset: 1, easing: 'ease-out' }
    ], { duration: 680, offset: 0, stagger: 80 });

    tl.add('.bounced', [
      { scaleY: 0.3, offset: 0 },
      { scaleY: 0.8, offset: 0.17, easing: 'ease-out' },
      { scaleY: 0.35, offset: 0.45, easing: 'ease-in-out' },
      { scaleY: 0.57, offset: 0.73, easing: 'ease-out' },
      { scaleY: 0.5, offset: 1, easing: 'ease-out' }
    ], { duration: 715, offset: 0, stagger: 80 });

    tl.add('.main-logo-circle', { opacity: 1, scale: 1, translateY: 0 }, { duration: 1500, offset: 0 });

    // 2. QUEDA DA BOLINHA (Foco no M)
    tl.add('.dot', {
      opacity: 1,
      translateX: 630,
      translateY: 415,
    }, { duration: 500, offset: 300, easing: 'ease-in' });

    // 3. SALTO DO "M" PARA O "I"
    tl.add('.dot', [
      { translateX: 630, translateY: 415, offset: 0 },
      { translateX: 530, translateY: 150, offset: 0.5 },
      { translateX: 430, translateY: 415, offset: 1 }
    ], { duration: 600, offset: 1100, easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' });

    // 4. MORPH E ESPALHAMENTO
    tl.add('.letter-m .line', { d: PATH_DATA.m.d2 }, { duration: 600, offset: 400 });
    tl.add('.letter-a, .letter-n, .letter-i, .letter-e', { translateX: 0, opacity: 1 }, { duration: 800, offset: 600, stagger: 40 });
    tl.add('.letter-m .line', { d: PATH_DATA.m.d3 }, { duration: 600, offset: 800 });

    tl.add('.line', { strokeDashoffset: 0 }, { duration: 1200, offset: 800, stagger: 100 });
    tl.add('.logo-text', { opacity: [0, 1], translateY: [20, 0] }, { duration: 600, offset: 2000 });

    tl.play();
    return () => tl.cancel();
  }, [key]);

  return (
    <div ref={containerRef} className="w-full h-[600px] flex items-center justify-center bg-[#F6F4F2] rounded-3xl relative overflow-hidden border border-zinc-200 shadow-2xl">
      <ReactiveGrid />
      <div className="main-logo-circle absolute w-[550px] h-[550px] rounded-full bg-white z-0 flex items-center justify-center"
        style={{
          boxShadow: '0 10px 80px rgba(0,0,0,0.02)',
          background: 'linear-gradient(-135deg, #FFFFFF 0%, #FBFBFB 50%, #F5F5F5 100%)',
          opacity: 0
        }}
      />
      <div className="main-logo w-full max-w-[600px] flex flex-col z-10 items-center justify-center h-full">
        <div ref={wrapperRef} className="logo-animation-wrapper relative w-full h-[150px]">
          <div ref={logoAnimRef} className="logo-animation absolute top-1/2 left-1/2 w-[1000px] h-[240px] -mt-[120px] -ml-[500px] flex flex-col justify-center items-center pointer-events-none overflow-visible">
            <style>{`
              .anime-logo-signs { display: flex; align-items: flex-end; height: 512px; margin-top: -352px; overflow: visible; position: relative; width: 1000px; }
              .logo-letter { display: flex; align-items: flex-end; height: 100%; overflow: hidden; }
              .bounced { transform-origin: 50% 100% 0px; transform: translateY(200px); }
              .line { fill: none; stroke: #333; stroke-width: 40; stroke-linecap: square; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.05)); }
              .dot { position: absolute; top: 0; left: 0; width: 40px; height: 40px; margin: -20px 0 0 -20px; background-color: #333; border-radius: 4px; z-index: 10; pointer-events: none; }
              .logo-text { opacity: 0; margin-top: 30px; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 13px; letter-spacing: .3em; color: #333; text-transform: uppercase; text-align: center; width: 100%; }
            `}</style>
            <div className="anime-logo w-full h-[120px]">
              <div className="anime-logo-signs">
                {['a', 'n', 'i', 'm', 'e'].map((l, i) => (
                  <div key={l + i} className={`logo-letter letter-${l}`}>
                    <svg className="bounced" viewBox={`0 0 ${l === 'i' ? 60 : (l === 'm' ? 340 : 200)} 240`} width={l === 'i' ? 60 : (l === 'm' ? 340 : 200)} height="240">
                      <path className="line" d={l === 'a' ? "M30 20h130c9.996 0 10 40 10 60v140H41c-11.004 0-11-40-11-60s-.004-60 10-60h110" :
                        l === 'n' ? "M170 220V60c0-31.046-8.656-40-19.333-40H49.333C38.656 20 30 28.954 30 60v160" :
                          l === 'i' ? PATH_DATA.i.d1 :
                            l === 'm' ? PATH_DATA.m.d1 :
                              "M50 140h110c10 0 10-40 10-60s0-60-10-60H40c-10 0-10 40-10 60v80c0 20 0 60 10 60h130"} />
                    </svg>
                  </div>
                ))}
                <div className="dot" style={{ opacity: 0 }} />
              </div>
              <div className="logo-text">PixonUI Motion Engine</div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute top-8 right-8 z-20">
        <button onClick={() => setKey(k => k + 1)} className="p-4 rounded-full bg-white shadow-lg hover:shadow-xl hover:scale-105 transition-all text-zinc-600 active:scale-95">
          <RefreshCw className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
