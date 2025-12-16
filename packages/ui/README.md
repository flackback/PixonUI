# @pixonui/react

<div align="center">
  <p align="center">
    <strong>Modern. Decoupled. Glassmorphic.</strong>
  </p>
  <p align="center">
    The core React component library for PixonUI.
  </p>
</div>

## 📦 Installation

```bash
npm install @pixonui/react
```

## 🔧 Configuration

Add the package to your `tailwind.config.js` content array to ensure styles are generated:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@pixonui/react/dist/**/*.{js,mjs}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## 🚀 Usage

```tsx
import { Button, Surface } from '@pixonui/react';

function App() {
  return (
    <Surface className="p-4">
      <Button variant="primary">Click me</Button>
    </Surface>
  );
}
```

## 📄 License

MIT
