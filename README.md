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

- **Native-First Architecture**: Leverages native browser APIs (`<dialog>`, `ValidityState`, `IntersectionObserver`, `ResizeObserver`) for maximum performance and stability.
- **Zero Heavy Dependencies**: No Radix, no Headless UI. Just pure React and optimized DOM logic.
- **Advanced Motion System**: High-performance animations using WAAPI and View Transitions API, without the overhead of external libraries.
- **Glassmorphism First**: Built-in support for beautiful translucent backgrounds, borders, and mouse-follow glow effects.
- **Tailwind CSS**: Fully styled with Tailwind, easily customizable via utility classes.
- **Accessible**: WAI-ARIA compliant components with native focus management.
- **TypeScript**: Written in TypeScript with strict type definitions.
- **Dark Mode Native**: Designed primarily for modern dark interfaces.

## 🧩 Components & Hooks

### 🏗️ Layout & Structure
- **Surface**: The base glassmorphic container.
- **Card & MetricCard**: Data containers with optional glow effects.
- **Kanban**: Advanced board with native Drag & Drop and continuous separators.
- **Table**: Optimized with `content-visibility` for large datasets.

### 🖱️ Overlays & Navigation
- **Dialog**: Native `<dialog>` implementation for modals.
- **DropdownMenu & Popover**: Positioned via the native-first `useFloating` hook.
- **Tooltip**: Lightweight, portal-based tooltips.
- **Sidebar & Tabs**: Flexible navigation structures.

### 🎭 Motion & Feedback
- **Motion & MotionGroup**: Preset-based entry animations.
- **Reveal**: Mask-based reveal animations for text and images.
- **Magnetic**: Cursor attraction effect for interactive elements.
- **NumberTicker**: Smoothly animated numeric counters.
- **ScrollProgress**: Page reading progress indicator.
- **PageTransition**: Support for the native View Transitions API.

### 🪝 Native Hooks
- **`useFloating`**: Robust positioning for overlays.
- **`useForm`**: Lightweight form management with native validation.
- **`useScroll`**: Real-time scroll progress tracking.
- **`useResponsive`**: `useMediaQuery`, `useBreakpoint`, and `useContainerQuery`.
- **`useIntersection`**: Easy access to `IntersectionObserver`.

## 🤖 AI & LLM Integration (MCP)

PixonUI inclui um servidor **Model Context Protocol (MCP)**, permitindo que LLMs compreendam a estrutura, componentes e melhores práticas da biblioteca. Isso garante que o código gerado por IA seja sempre idiomático e atualizado com nossa filosofia "Native-First".

### Usando com Claude Desktop
Adicione o seguinte ao seu arquivo `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "pixonui": {
      "command": "node",
      "args": ["C:/PROJETOS/PixonUI/packages/mcp/dist/index.js"]
    }
  }
}
```
*(Nota: Certifique-se de rodar `npm run mcp:build` primeiro)*

### Ferramentas Disponíveis
- `list_components`: Retorna uma lista de todos os componentes disponíveis na biblioteca.
- `get_component_info`: Fornece o código-fonte completo e definições de props para um componente específico.

### Fallback para IAs sem MCP
Se você estiver usando uma IA que não suporta MCP (como o ChatGPT Web), você pode fornecer o arquivo `llms-full.txt` (gerado via `npm run context:generate`) ou o documento `docs/PIXONUI_CONTEXT.md` para dar à IA todo o conhecimento necessário sobre a biblioteca.

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

MIT © [Anderson Fagundes]