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

## 📄 License

MIT
