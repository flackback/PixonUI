# PixonUI Native-First Motion System

PixonUI introduces a breakthrough, zero-dependency, high-performance animation engine that merges the physical precision of spring mechanics with the hardware-accelerated rendering performance of the browser's Web Animations API (WAAPI).

By pre-calculating physical spring curves on initiation and feeding them directly into standard `@keyframes` rules or browser `.animate()` methods, PixonUI offloads animation computations completely to the **Compositor Thread (GPU)**. This ensures standard animations run at a buttery-smooth 120fps even if the JavaScript main thread blocks completely.

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

The PixonUI timeline scheduler allows you to orchestrate sequences of complex, multi-target, staggered animations with ease. It supports absolute offsets, delays, relative overrides (`+=`, `-=`), and spring curves.

### 1. Basic Chained Sequence
Animations execute in order, starting instantly as soon as the previous element completes:

```typescript
import { timeline } from '@pixonui/react';

timeline()
  .add({
    target: '#hero-title',
    keyframes: [
      { opacity: 0, transform: 'scale(0.95)' },
      { opacity: 1, transform: 'scale(1)' }
    ],
    duration: 600,
    easing: 'apple'
  })
  .add({
    target: '#hero-sub',
    keyframes: [
      { opacity: 0, transform: 'translate3d(0, 16px, 0)' },
      { opacity: 1, transform: 'translate3d(0, 0, 0)' }
    ],
    duration: 400
  })
  .play();
```

### 2. Physical Spring Sequence & Overlap Offsets
Combine custom physical springs and relative offsets (`-=200` to start 200ms before the previous one ends) for cinematic entries:

```typescript
timeline()
  .add({
    target: '.sidebar-item',
    keyframes: [
      { transform: 'translate3d(-50px, 0, 0)', opacity: 0 },
      { transform: 'translate3d(0px, 0, 0)', opacity: 1 }
    ],
    spring: { stiffness: 250, damping: 15 },
    delay: 50 // Staggers each element matched by selector by 50ms
  })
  .add({
    target: '.main-content-card',
    keyframes: [
      { transform: 'scale(0.8)', opacity: 0 },
      { transform: 'scale(1)', opacity: 1 }
    ],
    spring: { stiffness: 300, damping: 12 },
    offset: '-=400' // High overlapping transition
  })
  .play();
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

## Best Practices & Performance Optimization

1. **Leverage Composite-safe Properties**: Only animate `transform`, `opacity`, and `filter`. These properties do not trigger browser layouts or repaints, running entirely off-thread on the GPU.
2. **Reuse Keyframes**: For heavily repeated elements, use a single `<MotionGroup>` (or reuse physical spring curves) to reduce DOM injection footprint.
3. **Set `once={true}`**: Entrance animations on viewport intersection should generally only trigger once to prevent unnecessary DOM mutations when scrolling.
4. **Respect User Systems**: PixonUI automatically respects `prefers-reduced-motion` configurations. If a user has animations disabled in their OS, the system will render the final animation state instantly.
