# PixonUI Native-First Motion System

> Canonical docs vNext:
> - `C:\PROJETOS\PixonUI\docs\MOTION_VNEXT_QUICKSTART.md`
> - `C:\PROJETOS\PixonUI\docs\MOTION_VNEXT_MIGRATION.md`
> - `C:\PROJETOS\PixonUI\docs\MOTION_VNEXT_RECIPES.md`

PixonUI introduces a breakthrough, zero-dependency, high-performance animation engine that merges the physical precision of spring mechanics with the hardware-accelerated rendering performance of the browser's Web Animations API (WAAPI).

By pre-calculating physical spring curves on initiation and feeding them directly into standard `@keyframes` rules or browser `.animate()` methods, PixonUI offloads animation computations completely to the **Compositor Thread (GPU)**. This ensures standard animations run at a buttery-smooth 120fps even if the JavaScript main thread blocks completely.

---

## Status (May 16, 2026)

### Verified now
- `timeline()` is working in both modes:
  - Factory mode: `timeline(tracks).play()`
  - Builder mode: `timeline().add(...).play()`
- Motion-value core is running without React re-render loops by default.
- Transform channels are stable and memoized at runtime:
  - Custom-property registration runs once.
  - Transform template injection runs once.
- `staggerIdx` precedence is fixed at engine level (`prop` wins over inherited context), preventing stacked particles in dense demos.
- `motion.*` now supports `revealOnScroll` preset to reduce boilerplate and avoid common in-view flicker setups.

### Unit conventions (important)
- Canonical numeric timing unit is **milliseconds (ms)** across motion APIs.
- vNext is **strict ms-only** (no silent seconds conversion).
- `motion.*` transitions: `duration`, `delay`, `repeatDelay`, `staggerChildren`, `delayChildren` in **ms**.
- `usePixonAnimate` options: `duration` / `delay` in **ms**.
- `timeline()` track/add options: `duration`, `delay`, `offset`, `stagger` in **ms**.
- `SSRAnimate` / `SSRStagger` transition `duration` / `delay` / `stagger` in **ms**.

Migration guide: `docs/MOTION_VNEXT_MIGRATION.md`

### `revealOnScroll` preset (Framer-like one-liner)

Use this when you want "appear on scroll" without repeating `initial + whileInView + viewport` setup:

```tsx
<motion.div revealOnScroll />
```

Optional tuning:

```tsx
<motion.div revealOnScroll={{ delay: 120, distance: 40, scale: 0.95, amount: 0.3 }} />
```

Defaults:
- `once: true`
- `amount: 0.25`
- `distance: 32`
- `scale: 0.96`
- `delay: 0`

Important behavior:
- Preset uses `initial.opacity = 0` + `whileInView.opacity = 1`, with `once: true` by default, to avoid scroll flicker regressions.

### Official presets (vNext)
- `revealOnScroll(options?)`
- `parallax(options?)`
- `staggerChildren(options?)`
- `scrubOnScroll(options?)`
- `scrollTimelinePreset(name, options?)`

Example:
```tsx
<motion.div revealOnScroll />
<motion.div parallax={{ axis: 'y', from: 0, to: -120 }} />
<motion.div staggerChildren={{ stagger: 80, delayChildren: 0, from: 'center' }} />
```

### Rules for high-density interactive scenes
- Prefer `transform` + `opacity` for per-frame updates.
- Avoid animating heavy string props per frame (`boxShadow`, complex `filter`, etc.).
- For pointer-reactive grids/particles, prefer instant control updates (`controls.set`) instead of spawning new WAAPI animations on every pointer event.

---

## Architectural Comparison

| Feature | Framer Motion | Anime.js | PixonUI Motion Engine |
| :--- | :--- | :--- | :--- |
| **Dependency Size** | ~35kB | ~16kB | **0kB (Zero-Dependency)** |
| **Animation Loop** | JS Thread (rAF) | JS Thread (rAF) | **Compositor Thread (GPU / WAAPI)** |
| **Main-Thread Blocking** | Frame drop | Frame drop | **Silky Smooth 120fps (Off-Thread)** |
| **Spring Equations** | Runtime physics | Cubic Beziers | **Analytically Solved Springs** |
| **Timeline Chaining** | Declarative orchestration | Manual ticks | **Dynamic WAAPI Scheduler** |
| **Multidimensional Staggers** | Linear only | Complex calculations | **Radial Grid Euclidean Staggers** |

---

## Technical Core Concepts

### 1. Damped Harmonic Oscillator (Spring Solver)
Standard spring animation engines run a JavaScript `requestAnimationFrame` loop to calculate velocity, friction, and displacement on every single frame. If a heavy user operation blocks the JS engine, your animation drops frames and stutters.

PixonUI solves the differential equations of a damped harmonic oscillator *once* when the animation starts:
$$\text{Displacement }(x(t)) = \begin{cases} 
-e^{-\zeta \omega_0 t} \cos(\omega_d t) & \text{Underdamped } (\zeta < 1) \\
-(1 + \omega_0 t) e^{-\omega_0 t} & \text{Critically Damped } (\zeta = 1) \\
c_1 e^{r_1 t} + c_2 e^{r_2 t} & \text{Overdamped } (\zeta > 1)
\end{cases}$$

It samples this analytical solution for high-refresh rates (up to 120fps) and compiles it into a normalized keyframes progress array (`0.0` to `1.0`), which is fed directly into standard WAAPI.

---

## Declarative Motion Component (`<Motion>`)

The `<Motion>` component acts as a high-performance wrapper that can animate between any two style states (`from` ↔ `to`) using physical springs or standard cubic beziers.

### Basic Usage with Spring Easing
Setting `easing="spring"` automatically invokes the pre-compiler, converting your simple custom states into physical spring curves on the GPU:

```tsx
import { Motion } from '@pixonui/react';

export default function MyComponent() {
  return (
    <Motion
      from={{ opacity: 0, y: 50, scale: 0.9 }}
      to={{ opacity: 1, y: 0, scale: 1 }}
      easing="spring"
    >
      <div className="p-6 bg-glass border border-white/10 rounded-2xl">
        High Performance Spring Content
      </div>
    </Motion>
  );
}
```

### Advanced Spring Settings
Pass a custom `spring` configuration to control mass, stiffness, and friction:

```tsx
<Motion
  from={{ scale: 0.5, rotate: -15 }}
  to={{ scale: 1, rotate: 0 }}
  spring={{
    stiffness: 300,  // Higher stiffness = snappier bounce
    damping: 15,     // Lower damping = more bouncy oscillation
    mass: 0.8,       // Virtual weight of the element
    precision: 0.001 // Accuracy threshold to declare settled state
  }}
>
  <button className="px-6 py-3 bg-purple-600 rounded-xl">
    Elastic Click Me
  </button>
</Motion>
```

---

## Imperative Animations (`usePixonAnimate`)

Use `usePixonAnimate` to trigger on-demand physical spring animations imperatively. It returns full playback controls (`play`, `pause`, `reverse`, `cancel`, `isAnimating`) mapped to native WAAPI hooks.

```tsx
import { usePixonAnimate } from '@pixonui/react';

export default function CardReveal() {
  const { ref, animate, pulse, shake, isAnimating } = usePixonAnimate<HTMLDivElement>();

  const triggerCustomBounce = () => {
    animate(
      [
        { transform: 'translate3d(0px, 0, 0)' },
        { transform: 'translate3d(200px, -50px, 0)' }
      ],
      {
        spring: { stiffness: 200, damping: 10 },
      }
    );
  };

  return (
    <div ref={ref} className="p-4 bg-slate-900 rounded-xl">
      <p>Status: {isAnimating ? "Animating on GPU..." : "Static"}</p>
      
      <div className="flex gap-2 mt-4">
        <button onClick={() => pulse(1.15)}>Pulse Spring</button>
        <button onClick={() => shake(12)}>Shake Spring</button>
        <button onClick={triggerCustomBounce}>Dynamic Path</button>
      </div>
    </div>
  );
}
```

---

## Chronological WAAPI Timelines (`timeline`)

The PixonUI timeline scheduler orchestrates multi-target sequences with labels, relative positions, callbacks and stagger in ms.

### 1. Builder mode with labels and callbacks

```typescript
import { timeline } from '@pixonui/react';

const tl = timeline({ easing: 'ease-out' });

tl
  .label('intro', 120)
  .add('#hero-title', [
    { opacity: 0, transform: 'scale(0.95)' },
    { opacity: 1, transform: 'scale(1)' }
  ], { duration: 600, at: 'intro' })
  .add('#hero-sub', [
    { opacity: 0, transform: 'translate3d(0, 16px, 0)' },
    { opacity: 1, transform: 'translate3d(0, 0, 0)' }
  ], { duration: 420, at: 'intro+=240' })
  .call(() => console.log('intro complete'), 'intro+=700')
  .play();
```

Builder aliases disponíveis:
- `.to(target, keyframes, opts)` → alias de `.add(...)`
- `.from(target, keyframes, opts)` → alias de `.add(...)`
- `.fromTo(target, from, to, opts)` → cria keyframes `[from, to]`
- `.addTimeline(child, opts)` / `.nest((tl) => ..., opts)` → compõe timeline aninhada
- `.set(target, keyframes, at?)` → aplica estado com `duration: 0`
- `.scope(root)` → limita seletores string ao container informado
- `.sync(at?)` → reposiciona o cursor para sincronizar próximos segmentos
- `.then(callback, at?)` → alias semântico de callback temporal
- `.chain((tl) => ...)` → compõe trechos reutilizáveis sem quebrar fluência

Controle de playback retornado por `.play()`:
- `.pause()` / `.resume()` / `.play()`
- `.seek(ms)` e `.finish()`
- `.reverse()` e `.cancel()`
- `.setTimeScale(rate)` / `.getTimeScale()`
- `.scrub(progress)` (0..1) para dirigir a timeline manualmente
- `.bindScrub(motionValue, opts?)` para conectar progresso externo (scroll/MotionValue)
- `.getDuration()` para duração total resolvida
- `.getAnimations()` (WAAPI handles nativos)
- `.finished` (Promise) e `.then(...)` para encadear pós-timeline sem polling

Opções de fábrica da timeline:
- `timeScale` (default `1`) para acelerar/reduzir playback
- `scrub` (default `false`) para iniciar pausada em `0` (uso típico com scroll)
- `autoplay` (default `true`, ou `false` quando `scrub: true`)

```typescript
timeline()
  .label('intro', 100)
  .timeScale(1.25)
  .scope('#hero')
  .add('.title', [{ opacity: 0 }, { opacity: 1 }], { duration: 320, at: 'intro' })
  .sync('intro')
  .to('.badge', [{ scale: 0.8 }, { scale: 1 }], { duration: 260, delay: 40 })
  .to('.cta', [{ y: 20, opacity: 0 }, { y: 0, opacity: 1 }], { duration: 320, scope: '#hero-actions' })
  .set('.chip', { opacity: 1 }, 'intro+=20')
  .call(() => console.log('sync point reached'), 'intro+=160')
  .play();
```

### 4. Nested timelines (composição real)

```typescript
const child = timeline()
  .to('.chip', [{ opacity: 0 }, { opacity: 1 }], { duration: 300, at: 80 })
  .to('.chip', [{ y: 16 }, { y: 0 }], { duration: 220, at: '+=40' });

timeline()
  .addTimeline(child, { at: 120, timeScale: 1.5 })
  .play();
```

### 5. Preset pronto para timeline (`timelinePreset`)

```typescript
import { timeline, timelinePreset } from '@pixonui/react';

const cardIn = timelinePreset('staggerFadeUp', { duration: 560, stagger: 70 });

timeline()
  .label('intro', 120)
  .add('.card', cardIn.keyframes, { ...cardIn.options, at: 'intro' })
  .then(() => console.log('cards ready'), 'intro+=700')
  .play();
```

### 6. Scope automático em React (`useTimelineScope`)

```tsx
import { useTimelineScope } from '@pixonui/react';

function Hero() {
  const { ref, createTimeline } = useTimelineScope<HTMLDivElement>();

  useEffect(() => {
    const run = createTimeline()
      .to('.title', [{ opacity: 0 }, { opacity: 1 }], { duration: 520 })
      .to('.cta', [{ y: 20, opacity: 0 }, { y: 0, opacity: 1 }], { at: '-=240', duration: 420 })
      .play();
    return () => run.cancel();
  }, [createTimeline]);

  return <section ref={ref}>{/* .title / .cta */}</section>;
}
```

### 7. Composer por domínio (`createTimelineComposer`)

```tsx
import { createTimelineComposer } from '@pixonui/react';

const motion = createTimelineComposer({ easing: 'elite-out' });
const hero = motion.hero();
const cards = motion.cards({ stagger: 90 });
```

### 8. Scrub por MotionValue (scroll-driven sem re-render)

```tsx
const progress = useMotionValue(0);
const ctrl = timeline({ scrub: true })
  .add('.hero', [{ opacity: 0 }, { opacity: 1 }], { duration: 700 })
  .play();

const stop = ctrl.bindScrub(progress, { from: 0, to: 1, clamp: true });
```

Hook React dedicado:

```tsx
useTimelineScrub(ctrl, scrollYProgress, { from: 0.1, to: 0.85 });
```

### 9. Devtools opcional de timeline

```ts
const ctrl = timeline().to('.hero', [{ opacity: 0 }, { opacity: 1 }], { duration: 600 }).play();
const detach = attachTimelineDevtools(ctrl, { title: 'Hero TL' });
```

### 2. Stagger + overlap

```typescript
timeline()
  .add('.sidebar-item', [
    { transform: 'translate3d(-50px, 0, 0)', opacity: 0 },
    { transform: 'translate3d(0px, 0, 0)', opacity: 1 }
  ], { duration: 560, stagger: 50 })
  .add('.main-content-card', [
    { transform: 'scale(0.8)', opacity: 0 },
    { transform: 'scale(1)', opacity: 1 }
  ], { duration: 520, at: '-=400' })
  .play();
```

### 3. Factory mode (`timeline(tracks)`) with labels

```typescript
timeline([
  { target: '#title', keyframes: [{ opacity: 0 }, { opacity: 1 }], duration: 320, label: 'intro', at: 120 },
  { target: '#subtitle', keyframes: [{ y: 20 }, { y: 0 }], duration: 280, at: 'intro+=140' },
  { target: '#cta', keyframes: [{ scale: 0.9 }, { scale: 1 }], duration: 260, atLabel: 'intro', at: '+=220' }
]).play();
```

---

## Multidimensional Euclidean Grid Staggering

Stagger elements dynamically along diagonal coordinates or radial distances. This brings premium motion patterns identical to Anime.js grids, but built entirely using native browser delays.

```typescript
import { calculateStagger } from '@pixonui/react';

const totalItems = 16; // 4x4 Grid
const cols = 4;

const items = Array.from({ length: totalItems }).map((_, i) => {
  // Calculate Euclidean delay from the top-left item
  const delay = calculateStagger(i, totalItems, {
    delay: 80,
    from: 'first', // can be 'first', 'last', 'center', or custom index
    grid: [cols, 4]
  });

  return (
    <Motion
      key={i}
      from={{ opacity: 0, scale: 0.3 }}
      to={{ opacity: 1, scale: 1 }}
      delay={delay}
      easing="spring"
    >
      <div className="w-16 h-16 bg-purple-500 rounded-lg" />
    </Motion>
  );
});
```

---

## Hardware-Accelerated FLIP Layout Transitions

Typical animation libraries (like Anime.js) animate layout changes by mutating properties like `width`, `height`, `top`, or `left`. This is extremely slow because it forces the browser to calculate **Reflows (Layout)** and **Repaints** on every single frame, causing heavy frame drops.

PixonUI introduces a high-performance **FLIP (First, Last, Invert, Play)** Layout engine built directly into `<Motion>`. It computes layout changes right before the browser paints (`useLayoutEffect`), and then plays the transitions using hardware-accelerated CSS `transform` properties (`translate3d`, `scale`) via the Web Animations API.

This executes **100% on the GPU compositor thread**, keeping animations at a silky-smooth 120fps.

### 1. Automatic Layout Transitions (`layout`)
Adding `layout` to any element automatically morphs its size/position smoothly when its parent layout, list items, or children states change:

```tsx
import { useState } from 'react';
import { Motion } from '@pixonui/react';

export default function LayoutDemo() {
  const [expanded, setExpanded] = useState(false);

  return (
    <Motion
      layout
      onClick={() => setExpanded(!expanded)}
      className="p-6 bg-slate-950 border border-white/10 rounded-2xl cursor-pointer"
      style={{ width: expanded ? '400px' : '200px' }}
      easing="spring"
    >
      <h3 className="font-bold text-white">Click to Expand</h3>
      {expanded && (
        <p className="mt-4 text-white/60">
          This container expanded smoothly on the GPU using FLIP!
        </p>
      )}
    </Motion>
  );
}
```

### 2. Layout Transitions Modes
You can fine-tune layout transitions to only animate position or only animate size:
- `layout={true}` (or just `layout`): Animates both size and position.
- `layout="position"`: Animates position change only (perfect for reordering lists without scaling children).
- `layout="size"`: Animates size change only.

---

## Shared Layout Transitions (`layoutId`)

Shared Layout transitions let you animate the path between completely separate, unmounting and mounting DOM elements in the tree (for example, sliding an active-tab highlighter background between different navigation tabs).

When an element with `layoutId` unmounts, its last physical position is cached in a global, fast, and secure registry. When the new element mounts, PixonUI calculates the delta and slides it seamlessly.

```tsx
import { useState } from 'react';
import { Motion } from '@pixonui/react';

const tabs = ['Home', 'SaaS', 'Inbox', 'Settings'];

export default function TabBar() {
  const [activeTab, setActiveTab] = useState('Home');

  return (
    <div className="flex gap-2 p-2 bg-slate-900 border border-white/10 rounded-2xl">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="relative px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            {isActive && (
              // The bubble background morphs and slides smoothly from tab to tab!
              <Motion
                layoutId="active-indicator"
                className="absolute inset-0 bg-purple-600 rounded-xl -z-10"
                easing="spring"
                spring={{ stiffness: 350, damping: 25 }}
              />
            )}
            {tab}
          </button>
        );
      })}
    </div>
  );
}
```

---

## Best Practices & Performance Optimization

1. **Leverage Composite-safe Properties**: Only animate `transform`, `opacity`, and `filter`. These properties do not trigger browser layouts or repaints, running entirely off-thread on the GPU.
2. **Reuse Keyframes**: For heavily repeated elements, use a single `<MotionGroup>` (or reuse physical spring curves) to reduce DOM injection footprint.
3. **Set `once={true}`**: Entrance animations on viewport intersection should generally only trigger once to prevent unnecessary DOM mutations when scrolling.
4. **Respect User Systems**: PixonUI automatically respects `prefers-reduced-motion` configurations. If a user has animations disabled in their OS, the system will render the final animation state instantly.
