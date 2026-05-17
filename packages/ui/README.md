# @pixonui/react

<div align="center">
  <p align="center">
    <strong>Modern. Decoupled. Glassmorphic. Native-First.</strong>
  </p>
  <p align="center">
    The core React component library for PixonUI, built for performance and aesthetics.
  </p>
</div>

## 🚀 Key Philosophies

- **Native-First**: We prefer native browser APIs (like `<dialog>`, `IntersectionObserver`, and `ValidityState`) over heavy JavaScript polyfills.
- **Zero Dependencies**: We don't use Radix or other headless libraries. Every component is built from scratch for maximum control and minimum bundle size.
- **Ultra-Performance**: Optimized for 120fps interactions using CSS variables for mouse tracking and `content-visibility` for large datasets.
- **Full Theme Support**: Native support for Light and Dark modes with theme-aware patterns and glassmorphism.

## 📦 Installation

```bash
npm install @pixonui/react
```

## 🔧 Configuration

Add the package to your `tailwind.config.js` content array:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@pixonui/react/dist/**/*.{js,mjs}"
  ],
  theme: {
    extend: {
      // PixonUI looks best with a dark background
      colors: {
        background: '#0A0A0A',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

## 🛠️ Usage Examples

### Native Dialog (Modal)
```tsx
import { Dialog, DialogHeader, DialogTitle, Button } from '@pixonui/react';

function MyModal() {
  const [open, setOpen] = React.useState(false);
  
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Dialog</Button>
      <Dialog isOpen={open} onClose={() => setOpen(false)}>
        <DialogHeader>
          <DialogTitle>Native Dialog</DialogTitle>
        </DialogHeader>
        <p>This uses the native HTML5 &lt;dialog&gt; tag!</p>
      </Dialog>
    </>
  );
}
```

### Advanced Motion
```tsx
import { Reveal, Magnetic, NumberTicker } from '@pixonui/react';

function Hero() {
  return (
    <div>
      <Reveal direction="up">
        <h1>Welcome to the Future</h1>
      </Reveal>
      
      <Magnetic>
        <button>I follow your mouse</button>
      </Magnetic>
      
      <p>
        Users joined: <NumberTicker value={10000} />
      </p>
    </div>
  );
}
```

### Motion Engine Quick Guide
```tsx
import { motion, timeline, usePixonAnimate } from '@pixonui/react';
```

- `motion.*` (`motion.div`, `motion.span`, etc.) is the primary declarative API.
- One-line scroll reveal preset:
  - `<motion.div revealOnScroll />`
  - Optional tuning: `<motion.div revealOnScroll={{ delay: 120, distance: 40, scale: 0.95, amount: 0.3 }} />`
- One-line parallax preset:
  - `<motion.div parallax />`
  - Optional tuning: `<motion.div parallax={{ axis: 'y', from: 0, to: -120 }} />`
- Official stagger preset:
  - `<motion.div staggerChildren />`
  - Optional tuning: `<motion.div staggerChildren={{ stagger: 90, delayChildren: 40, from: 'center' }} />`
- Drag constraints com `RefObject` (Framer-like):
  - `<motion.div drag dragConstraints={boundsRef} dragMomentum />`
- Preset unificado para timeline + scrub:
  - `const flow = scrollTimelinePreset('staggerSection', { from: 0.15, to: 0.9 })`
  - `timeline({ scrub: true }).add('.card', flow.timeline.keyframes, flow.timeline.options).play()`
  - `useScrubOnScroll(ctrl, flow.scrub)`
- `timeline()` supports:
  - `timeline(tracks).play()`
  - `timeline().add(...).play()`
- Unit convention:
  - Numeric timing values use **milliseconds** (`duration`, `delay`, `repeatDelay`, `staggerChildren`, `delayChildren`)
  - Applies to `motion.*`, `usePixonAnimate`, `timeline()`, `SSRAnimate/SSRStagger`
- Scroll hook:
  - `usePixonScroll` is now a MotionValue adapter (deprecated name)
  - Prefer `useScroll` + `useTransform`
- For best performance in dense scenes, animate `transform`/`opacity` first.
- vNext implementation roadmap: `docs/MOTION_VNEXT_ROADMAP.md`.

## 📄 License

MIT
