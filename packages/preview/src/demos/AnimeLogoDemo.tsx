import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { timeline } from '@pixonui/react';

const PATH_DATA = {
  m: {
    d1: 'M240,220 L240,60 C240,28.954305 231.344172,20 220.666667,20 C171.555556,20 254.832031,20 170,20 C85.1679688,20 168.444444,20 119.333333,20 C108.655828,20 100,28.954305 100,60 L100,220',
    d2: 'M310,220 L310,60 C310,28.954305 301.344172,20 290.666667,20 C241.555556,20 254.832031,110 170,110 C85.1679688,110 98.4444444,20 49.3333333,20 C38.6558282,20 30,28.954305 30,60 L30,220',
    d3: 'M310,220 L310,60 C310,28.954305 301.344172,20 290.666667,20 C241.555556,20 254.832031,20 170,20 C85.1679688,20 98.4444444,20 49.3333333,20 C38.6558282,20 30,28.954305 30,60 L30,220',
  },
  i: {
    d1: 'M30 20v200',
    d2: 'M30 100v120',
  },
};

function buildPathKeyframes(path: SVGPathElement, samples = 56) {
  const len = path.getTotalLength();
  const frames: Array<{ translateX: number; translateY: number; offset: number }> = [];
  for (let i = 0; i <= samples; i += 1) {
    const offset = i / samples;
    const p = path.getPointAtLength(len * offset);
    frames.push({ translateX: p.x, translateY: p.y, offset });
  }
  return frames;
}

export function AnimeLogoDemo() {
  const scopeRef = useRef<HTMLDivElement | null>(null);
  const logoAnimRef = useRef<HTMLDivElement | null>(null);
  const bounceSvgRef = useRef<SVGSVGElement | null>(null);

  useLayoutEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const fitElementToParent = () => {
      const el = logoAnimRef.current;
      const exception = bounceSvgRef.current;
      if (!el || !el.parentElement) return;

      if (timer) clearTimeout(timer);
      el.style.transform = 'scale(1)';
      if (exception) exception.style.transform = 'scale(1)';

      const parent = el.parentElement;
      const ratio = parent.offsetWidth / Math.max(1, el.offsetWidth);
      const inverse = el.offsetWidth / Math.max(1, parent.offsetWidth);

      timer = setTimeout(() => {
        el.style.transform = `scale(${ratio})`;
        if (exception) exception.style.transform = `scale(${inverse})`;
      }, 10);
    };

    fitElementToParent();
    window.addEventListener('resize', fitElementToParent);
    return () => {
      window.removeEventListener('resize', fitElementToParent);
      if (timer) clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const root = scopeRef.current;
    if (!root) return;

    const lettersANIE = Array.from(
      root.querySelectorAll<HTMLElement>('.letter-a, .letter-n, .letter-i, .letter-e')
    );
    const bouncedEls = Array.from(root.querySelectorAll<HTMLElement>('.bounced'));
    const logoLetters = Array.from(root.querySelectorAll<HTMLElement>('.logo-letter'));
    const lineEls = Array.from(root.querySelectorAll<SVGPathElement>('.line'));
    const lineI = root.querySelector<SVGPathElement>('.letter-i .line');
    const lineM = root.querySelector<SVGPathElement>('.letter-m .line');
    const bouncePath = root.querySelector<SVGPathElement>('.bounce path');
    const dot = root.querySelector<HTMLElement>('.dot');
    const logoText = root.querySelector<HTMLElement>('.logo-text');

    if (!lineI || !lineM || !bouncePath || !dot || !logoText) return;

    lineEls.forEach((line) => {
      const length = line.getTotalLength();
      line.style.strokeDasharray = `${length}`;
      line.style.strokeDashoffset = `${length}`;
    });

    lineI.removeAttribute('stroke-dasharray');

    const tl = timeline({ easing: 'ease-out' });

    tl.add(
      lettersANIE,
      { translateX: [70, 70], opacity: [1, 1] },
      { duration: 1, offset: 0, fill: 'forwards' }
    );
    tl.add(root.querySelector('.letter-e'), { translateX: [-70, -70] }, { duration: 1, offset: 0, fill: 'forwards' });
    tl.add(dot, { translateX: [630, 630], translateY: [-200, -200], opacity: [0.001, 0.001] }, { duration: 1, offset: 0, fill: 'forwards' });
    tl.add(bouncedEls, { translateY: [200, 200], scaleX: [0.55, 0.55], scaleY: [0.8, 0.8] }, { duration: 1, offset: 0, fill: 'forwards' });

    tl.add(
      bouncedEls,
      [
        { translateY: 150, scaleX: 0.25, scaleY: 0.3, offset: 0 },
        { translateY: -160, scaleX: 0.85, scaleY: 0.8, offset: 0.38 },
        { translateY: 4, scaleX: 1.08, scaleY: 0.35, offset: 0.66 },
        { translateY: 0, scaleX: 1, scaleY: 0.5, offset: 1 },
      ],
      { duration: 560, offset: 1000, stagger: 80, easing: 'cubic-bezier(0.225, 1, 0.915, 0.98)', fill: 'forwards' }
    );

    tl.add(
      dot,
      [
        { opacity: 0.001, translateY: -200, scaleX: 1, scaleY: 1, offset: 0 },
        { opacity: 1, translateY: 250, scaleX: 1.3, scaleY: 0.7, offset: 1 },
      ],
      { duration: 280, offset: 1640, easing: 'cubic-bezier(0.35, 0.56, 0.305, 1)', fill: 'forwards' }
    );

    tl.add(lineM, { d: PATH_DATA.m.d2 }, { duration: 620, offset: 1780, easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', fill: 'forwards' });
    tl.add(lettersANIE, { translateX: 0 }, { duration: 820, offset: 1860, stagger: 40, fill: 'forwards' });
    tl.add(lineM, { d: PATH_DATA.m.d3 }, { duration: 560, offset: 2280, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)', fill: 'forwards' });

    tl.add(
      dot,
      buildPathKeyframes(bouncePath),
      { duration: 800, offset: 2320, easing: 'cubic-bezier(0, 0.74, 1, 0.255)', fill: 'forwards' }
    );

    tl.add(
      dot,
      [
        { translateX: 630, translateY: 240, scaleX: 1, scaleY: 1, offset: 0 },
        { translateX: 430, translateY: 244, scaleX: 1, scaleY: 0.5, offset: 0.38 },
        { translateX: 430, translateY: 204, scaleX: 1, scaleY: 1.5, offset: 0.7 },
        { translateX: 430, translateY: 224, scaleX: 1, scaleY: 1, offset: 1 },
      ],
      { duration: 560, offset: 3000, easing: 'ease-out', fill: 'forwards' }
    );

    tl.add(lineI, { d: PATH_DATA.i.d2 }, { duration: 80, offset: 3020, easing: 'cubic-bezier(0.4, 0.53, 0.07, 1)', fill: 'forwards' });

    tl.add(
      logoLetters,
      [
        { translateY: 40, offset: 0 },
        { translateY: 0, offset: 1 },
      ],
      { duration: 900, offset: 3200, stagger: 60, fill: 'forwards' }
    );
    tl.add(
      lineEls,
      { strokeDashoffset: [0, 0] },
      { duration: 700, offset: 3200, stagger: 60, fill: 'forwards' }
    );
    tl.add(
      bouncedEls,
      [
        { scaleY: 0.4, offset: 0 },
        { scaleY: 0.5, offset: 1 },
      ],
      { duration: 900, offset: 3200, stagger: 60, fill: 'forwards' }
    );
    tl.add(
      logoText,
      [
        { opacity: 0.001, translateY: 20, offset: 0 },
        { opacity: 1, translateY: 0, offset: 1 },
      ],
      { duration: 500, offset: 3500, fill: 'forwards' }
    );

    const run = tl.play();
    return () => run.cancel();
  }, []);

  return (
    <div ref={scopeRef} className="pixon-logo-pen relative flex w-full justify-center">
      <style>{`
        .pixon-logo-pen .main-logo{position:relative;display:flex;flex-direction:column;width:100%;max-width:1000px;height:420px;color:#fff;}
        .pixon-logo-pen .logo-animation-wrapper{position:relative;width:100%;height:100%;}
        .pixon-logo-pen .logo-animation{pointer-events:none;overflow:visible;display:flex;flex-shrink:0;flex-direction:column;justify-content:center;align-items:center;position:absolute;top:50%;left:50%;width:1000px;height:240px;margin:-120px 0 0 -500px;transform:scale(.633333);}
        .pixon-logo-pen .anime-logo{overflow:visible;position:relative;display:flex;flex-direction:column;width:1000px;height:120px;}
        .pixon-logo-pen .anime-logo-signs{overflow:visible;display:flex;align-items:flex-end;position:relative;width:100%;height:512px;margin-top:-352px;}
        .pixon-logo-pen .logo-letter{display:flex;align-items:flex-end;overflow:hidden;height:100%;}
        .pixon-logo-pen .bounced{transform-origin:50% 100% 0;transform:translateY(200px) scaleX(.55) scaleY(.8);}
        .pixon-logo-pen .bounce{overflow:visible;position:absolute;left:0;bottom:70px;}
        .pixon-logo-pen .dot{opacity:.001;position:absolute;z-index:10;top:0;left:0;width:40px;height:40px;margin:-20px 0 0 -20px;background-color:currentColor;transform:translate3d(0,0,0);}
        .pixon-logo-pen .logo-animation .logo-letter svg{overflow:visible;fill:none;fill-rule:evenodd;}
        .pixon-logo-pen .line{fill:none;fill-rule:evenodd;stroke-linecap:square;stroke-width:40;stroke:currentColor;}
        .pixon-logo-pen .logo-text{opacity:.001;margin-top:.25em;font-weight:400;font-size:11px;line-height:1;letter-spacing:.125em;text-align:justify;word-break:keep-all;}
        .pixon-logo-pen .logo-text:after{content:"";display:inline-block;width:100%;height:0;font-size:0;line-height:0;}
      `}</style>

      <div className="main-logo">
        <div className="logo-animation-wrapper">
          <div ref={logoAnimRef} className="logo-animation">
            <div className="anime-logo">
              <div className="anime-logo-signs">
                <div className="logo-letter letter-a">
                  <svg className="bounced" viewBox="0 0 200 240" width="200" height="240">
                    <path className="line" d="M30 20h130c9.996 0 10 40 10 60v140H41c-11.004 0-11-40-11-60s-.004-60 10-60h110" />
                  </svg>
                </div>
                <div className="logo-letter letter-n">
                  <svg className="bounced" viewBox="0 0 200 240" width="200" height="240">
                    <path className="line" d="M170 220V60c0-31.046-8.656-40-19.333-40H49.333C38.656 20 30 28.954 30 60v160" />
                  </svg>
                </div>
                <div className="logo-letter letter-i">
                  <svg className="bounced" viewBox="0 0 60 240" width="60" height="240">
                    <path className="line" d={PATH_DATA.i.d1} />
                  </svg>
                </div>
                <div className="logo-letter letter-m">
                  <svg className="bounced" viewBox="0 0 340 240" width="340" height="240" fill="none" fillRule="evenodd">
                    <path className="line" d={PATH_DATA.m.d1} />
                  </svg>
                </div>
                <div className="logo-letter letter-e">
                  <svg className="bounced" viewBox="0 0 200 240" width="200" height="240">
                    <path className="line" d="M50 140h110c10 0 10-40 10-60s0-60-10-60H40c-10 0-10 40-10 60v80c0 20 0 60 10 60h130" />
                  </svg>
                </div>

                <div className="bounce">
                  <svg ref={bounceSvgRef} viewBox="0 0 1000 260" width="1000" height="260" fill="none">
                    <path d="M630,240 C630,111.154418 608.971354,40 530.160048,40 C451.348741,40 430,127.460266 430,210" />
                  </svg>
                  <div className="dot" />
                </div>
              </div>
            </div>
            <div className="logo-text">PixonUI Motion Engine</div>
          </div>
        </div>
      </div>
    </div>
  );
}
