import React, { useCallback, useEffect, useId, useRef } from 'react';
import { motion, timeline } from '@pixonui/react';

type TimelineHandle = {
  cancel: () => void;
};

const SPHERE_PATHS = [
  'M361.604 361.238c-24.407 24.408-51.119 37.27-59.662 28.727-8.542-8.543 4.319-35.255 28.726-59.663 24.408-24.407 51.12-37.269 59.663-28.726 8.542 8.543-4.319 35.255-28.727 59.662z',
  'M360.72 360.354c-35.879 35.88-75.254 54.677-87.946 41.985-12.692-12.692 6.105-52.067 41.985-87.947 35.879-35.879 75.254-54.676 87.946-41.984 12.692 12.692-6.105 52.067-41.984 87.946z',
  'M357.185 356.819c-44.91 44.91-94.376 68.258-110.485 52.149-16.11-16.11 7.238-65.575 52.149-110.485 44.91-44.91 94.376-68.259 110.485-52.15 16.11 16.11-7.239 65.576-52.149 110.486z',
  'M350.998 350.632c-53.21 53.209-111.579 81.107-130.373 62.313-18.794-18.793 9.105-77.163 62.314-130.372 53.209-53.21 111.579-81.108 130.373-62.314 18.794 18.794-9.105 77.164-62.314 130.373z',
  'M343.043 342.677c-59.8 59.799-125.292 91.26-146.283 70.268-20.99-20.99 10.47-86.483 70.269-146.282 59.799-59.8 125.292-91.26 146.283-70.269 20.99 20.99-10.47 86.484-70.27 146.283z',
  'M334.646 334.28c-65.169 65.169-136.697 99.3-159.762 76.235-23.065-23.066 11.066-94.593 76.235-159.762s136.697-99.3 159.762-76.235c23.065 23.065-11.066 94.593-76.235 159.762z',
  'M324.923 324.557c-69.806 69.806-146.38 106.411-171.031 81.76-24.652-24.652 11.953-101.226 81.759-171.032 69.806-69.806 146.38-106.411 171.031-81.76 24.652 24.653-11.953 101.226-81.759 171.032z',
  'M312.99 312.625c-73.222 73.223-153.555 111.609-179.428 85.736-25.872-25.872 12.514-106.205 85.737-179.428s153.556-111.609 179.429-85.737c25.872 25.873-12.514 106.205-85.737 179.429z',
  'M300.175 299.808c-75.909 75.909-159.11 115.778-185.837 89.052-26.726-26.727 13.143-109.929 89.051-185.837 75.908-75.908 159.11-115.778 185.837-89.051 26.726 26.726-13.143 109.928-89.051 185.836z',
  'M284.707 284.34c-77.617 77.617-162.303 118.773-189.152 91.924-26.848-26.848 14.308-111.534 91.924-189.15C265.096 109.496 349.782 68.34 376.63 95.188c26.849 26.849-14.307 111.535-91.923 189.151z',
  'M269.239 267.989c-78.105 78.104-163.187 119.656-190.035 92.807-26.849-26.848 14.703-111.93 92.807-190.035 78.105-78.104 163.187-119.656 190.035-92.807 26.849 26.848-14.703 111.93-92.807 190.035z',
  'M252.887 252.52C175.27 330.138 90.584 371.294 63.736 344.446 36.887 317.596 78.043 232.91 155.66 155.293 233.276 77.677 317.962 36.521 344.81 63.37c26.85 26.848-14.307 111.534-91.923 189.15z',
  'M236.977 236.61C161.069 312.52 77.867 352.389 51.14 325.663c-26.726-26.727 13.143-109.928 89.052-185.837 75.908-75.908 159.11-115.777 185.836-89.05 26.727 26.726-13.143 109.928-89.051 185.836z',
  'M221.067 220.7C147.844 293.925 67.51 332.31 41.639 306.439c-25.873-25.873 12.513-106.206 85.736-179.429C200.6 53.786 280.931 15.4 306.804 41.272c25.872 25.873-12.514 106.206-85.737 179.429z',
  'M205.157 204.79c-69.806 69.807-146.38 106.412-171.031 81.76-24.652-24.652 11.953-101.225 81.759-171.031 69.806-69.807 146.38-106.411 171.031-81.76 24.652 24.652-11.953 101.226-81.759 171.032z',
  'M189.247 188.881c-65.169 65.169-136.696 99.3-159.762 76.235-23.065-23.065 11.066-94.593 76.235-159.762s136.697-99.3 159.762-76.235c23.065 23.065-11.066 94.593-76.235 159.762z',
  'M173.337 172.971c-59.799 59.8-125.292 91.26-146.282 70.269-20.991-20.99 10.47-86.484 70.268-146.283 59.8-59.799 125.292-91.26 146.283-70.269 20.99 20.991-10.47 86.484-70.269 146.283z',
  'M157.427 157.061c-53.209 53.21-111.578 81.108-130.372 62.314-18.794-18.794 9.104-77.164 62.313-130.373 53.21-53.209 111.58-81.108 130.373-62.314 18.794 18.794-9.105 77.164-62.314 130.373z',
  'M141.517 141.151c-44.91 44.91-94.376 68.259-110.485 52.15-16.11-16.11 7.239-65.576 52.15-110.486 44.91-44.91 94.375-68.258 110.485-52.15 16.109 16.11-7.24 65.576-52.15 110.486z',
  'M125.608 125.241c-35.88 35.88-75.255 54.677-87.947 41.985-12.692-12.692 6.105-52.067 41.985-87.947C115.525 43.4 154.9 24.603 167.592 37.295c12.692 12.692-6.105 52.067-41.984 87.946z',
  'M109.698 109.332c-24.408 24.407-51.12 37.268-59.663 28.726-8.542-8.543 4.319-35.255 28.727-59.662 24.407-24.408 51.12-37.27 59.662-28.727 8.543 8.543-4.319 35.255-28.726 59.663z',
];

const ORB_CODE = `import { timeline } from '@pixonui/react';

const tl = timeline({ easing: 'ease-out' });
tl.add(paths, { strokeDashoffset: [dash, 0] }, {
  duration: 3900,
  stagger: 250,
});
tl.play();

function loop(time: number) {
  paths.forEach((path, index) => {
    const percent = (1 - Math.sin(index * 0.35 + 0.0022 * time)) / 2;
    const tx = 2 + (-6 * percent);
    const ty = 2 + (-6 * percent);
    path.style.transform = \`translate(\${tx}px, \${ty}px)\`;
  });
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);`;

function SphereNetworkReplica() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const sphereAnimationRef = useRef<HTMLDivElement | null>(null);
  const sphereRef = useRef<SVGSVGElement | null>(null);
  const gradientRef = useRef<SVGLinearGradientElement | null>(null);
  const introRef = useRef<TimelineHandle | null>(null);
  const rafRef = useRef<number | null>(null);
  const shadowStartRef = useRef<number | null>(null);
  const gradientId = useId().replace(/:/g, '');

  const fitToParent = useCallback(() => {
    const host = hostRef.current;
    const sphereAnimation = sphereAnimationRef.current;
    if (!host || !sphereAnimation) return;
    sphereAnimation.style.transform = 'scale(1)';
    const ratio = host.clientWidth / Math.max(1, sphereAnimation.offsetWidth);
    sphereAnimation.style.transform = `scale(${ratio})`;
  }, []);

  useEffect(() => {
    fitToParent();
    window.addEventListener('resize', fitToParent);
    return () => window.removeEventListener('resize', fitToParent);
  }, [fitToParent]);

  useEffect(() => {
    const sphere = sphereRef.current;
    if (!sphere) return;

    const paths = Array.from(sphere.querySelectorAll<SVGPathElement>('[data-sphere-path]'));
    if (paths.length === 0) return;

    const intro = timeline({ easing: 'ease-out' });
    paths.forEach((path, index) => {
      const pathLength = path.getTotalLength();
      path.style.strokeDasharray = `${pathLength}`;
      path.style.strokeDashoffset = `${pathLength}`;
      path.style.stroke = 'rgba(255,75,75,1)';

      intro.add(path, { strokeDashoffset: [pathLength, 0] }, {
        duration: 3900,
        delay: (paths.length - 1 - index) * 250,
        offset: 0,
        fill: 'forwards',
        easing: 'cubic-bezier(0.785, 0.135, 0.15, 0.86)',
      });
    });
    introRef.current = intro.play();

    const animate = (time: number) => {
      const gradientEl = gradientRef.current;
      if (gradientEl) {
        if (shadowStartRef.current === null) shadowStartRef.current = time;
        const t = Math.min(1, (time - shadowStartRef.current) / 30000);
        const eased = 1 - Math.pow(1 - t, 5);
        gradientEl.setAttribute('x1', `${(5 + 20 * eased).toFixed(3)}%`);
        gradientEl.setAttribute('x2', `${(5 + 20 * eased).toFixed(3)}%`);
        gradientEl.setAttribute('y1', '0%');
        gradientEl.setAttribute('y2', `${(15 + 60 * eased).toFixed(3)}%`);
      }

      paths.forEach((path, index) => {
        const percent = (1 - Math.sin(index * 0.35 + 0.0022 * time)) * 0.5;
        const eased = 1 - Math.pow(1 - percent, 2);
        const tx = 2 + (-6 * eased);
        const ty = 2 + (-6 * eased);
        const r = 255 + (80 - 255) * eased;
        const g = 75 + (80 - 75) * eased;
        const b = 75 + (80 - 75) * eased;
        const a = 1 + (0.35 - 1) * eased;

        path.style.transform = `translate(${tx}px, ${ty}px)`;
        path.style.stroke = `rgba(${r.toFixed(0)},${g.toFixed(0)},${b.toFixed(0)},${a.toFixed(3)})`;
      });

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      introRef.current?.cancel();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 90 }}
      className="rounded-3xl border border-white/10 bg-transparent p-6"
    >
      <p className="mb-1 text-[11px] font-black uppercase tracking-[0.35em] text-cyan-300/70">Pen Replica</p>
      <h3 className="mb-4 text-xl font-black text-white">Sphere Network Intro (`LMrRNW`)</h3>

      <div ref={hostRef} className="relative mx-auto h-[500px] w-full max-w-[980px] overflow-visible">
        <div className="absolute right-[-40px] top-[30px] h-[520px] w-[520px]">
          <div ref={sphereAnimationRef} className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2">
            <svg ref={sphereRef} className="h-full w-full" viewBox="0 0 440 440" stroke="rgba(80,80,80,.35)">
              <defs>
                <linearGradient ref={gradientRef} id={`sphere-gradient-${gradientId}`} x1="5%" x2="5%" y1="0%" y2="15%">
                  <stop stopColor="#373734" offset="0%" />
                  <stop stopColor="#242423" offset="50%" />
                  <stop stopColor="#0D0D0C" offset="100%" />
                </linearGradient>
              </defs>
              {SPHERE_PATHS.map((d, index) => (
                <path
                  key={`${index}-${d.slice(0, 20)}`}
                  data-sphere-path
                  d={d}
                  fill={`url(#sphere-gradient-${gradientId})`}
                  strokeWidth={0.5}
                  stroke="rgba(80,80,80,.35)"
                  style={{ backfaceVisibility: 'hidden', transformBox: 'fill-box', transformOrigin: 'center' }}
                />
              ))}
            </svg>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 w-full max-w-[980px] rounded-2xl border border-white/10 bg-black/25 p-4">
        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300/70">Código</p>
        <pre className="max-h-[320px] overflow-auto whitespace-pre text-xs leading-relaxed text-white/80">
          <code>{ORB_CODE}</code>
        </pre>
      </div>
    </motion.div>
  );
}

export default function AnimePenReplicasDemo() {
  return (
    <div className="space-y-8">
      <SphereNetworkReplica />
    </div>
  );
}
