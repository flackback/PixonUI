# PixonUI

<div align="center">

  <h1 align="center">PixonUI</h1>

  <p align="center">
    <strong>Modern. Decoupled. Glassmorphic.</strong>
  </p>

  <p align="center">
    A high-performance React UI library built with Tailwind CSS. <br />
    Designed for modern dark-mode applications with a focus on aesthetics and developer experience.
  </p>

  <p align="center">
    <a href="https://react.dev">
      <img src="https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react" alt="React" />
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript" alt="TypeScript" />
    </a>
    <a href="https://tailwindcss.com/">
      <img src="https://img.shields.io/badge/Tailwind_CSS-3.0-38bdf8?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
    </a>
    <a href="#">
      <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
    </a>
  </p>

</div>

<br />

## ✨ Features

- **Zero Heavy Dependencies**: No Radix, no Headless UI. Just pure React and DOM logic.
- **Glassmorphism First**: Built-in support for beautiful translucent backgrounds and borders.
- **Tailwind CSS**: Fully styled with Tailwind, easily customizable via utility classes.
- **Accessible**: WAI-ARIA compliant components.
- **TypeScript**: Written in TypeScript with strict type definitions.
- **Dark Mode Native**: Designed primarily for dark interfaces.

## 📦 Installation

Install the package via your preferred package manager:

```bash
npm install @pixonui/react
# or
pnpm add @pixonui/react
# or
yarn add @pixonui/react
```

## 🔧 Configuration

Since PixonUI uses Tailwind CSS, you need to update your `tailwind.config.js` to scan the package files for classes:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    // Add PixonUI to content
    "./node_modules/@pixonui/react/dist/**/*.{js,mjs}"
  ],
  theme: {
    extend: {
      // Optional: Add custom colors or fonts here
    },
  },
  plugins: [],
}
```

## 🚀 Usage

Import components directly from the package:

```tsx
import { Button, Surface, Text } from '@pixonui/react';

function App() {
  return (
    <Surface className="p-8 max-w-md mx-auto mt-10 flex flex-col gap-4">
      <Text variant="h3" className="text-white">
        Welcome to PixonUI
      </Text>
      
      <Text className="text-white/60">
        Building modern interfaces has never been easier.
      </Text>

      <div className="flex gap-3 mt-4">
        <Button variant="primary">Get Started</Button>
        <Button variant="ghost">Documentation</Button>
      </div>
    </Surface>
  );
}
```

## 🧩 Components

PixonUI comes with a comprehensive set of components:

| Category | Components |
|----------|------------|
| **Primitives** | `Surface`, `Box`, `Divider`, `Badge` |
| **Form** | `TextInput`, `Select`, `Combobox`, `DatePicker`, `Switch`, `Slider`, `Checkbox` |
| **Feedback** | `Toast`, `Alert`, `Progress`, `Skeleton` |
| **Overlay** | `Modal`, `Drawer`, `Popover`, `Tooltip`, `DropdownMenu` |
| **Navigation** | `Tabs`, `Breadcrumb` |
| **Data Display** | `Card`, `Avatar`, `Accordion`, `Calendar` |

## 🎨 Design Philosophy

PixonUI follows a strict set of design principles:

1.  **Decoupled**: Components are standalone whenever possible.
2.  **Predictable**: No hidden global side effects.
3.  **Performance**: Minimal re-renders and lightweight DOM footprint.
4.  **Aesthetics**: Subtle borders (`border-white/10`), backdrop blurs, and smooth transitions.

## 🛠️ Local Development

To contribute or modify the library locally:

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/pixonui.git
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Start the preview app**:
    ```bash
    npm run dev
    ```

## 📄 License

MIT © [Your Name]