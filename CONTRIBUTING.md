# Contributing to PixonUI

Thank you for your interest in contributing to PixonUI! We are building a modern, native-first UI library and we value your help.

## 🛠️ Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-repo/pixonui.git
   cd pixonui
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the preview app**:
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

- `packages/ui`: The core library source code.
- `packages/preview`: A Vite-based application to test and demo components.
- `packages/mcp`: The Model Context Protocol server for AI integration.

## 📜 Guidelines

### 1. Native-First
Always prefer native browser APIs over external libraries. If you need a modal, use `<dialog>`. If you need positioning, use our `useFloating` hook (which uses `getBoundingClientRect` and `ResizeObserver`).

### 2. Design System
Follow the glassmorphic aesthetic:
- Use `rounded-2xl` for containers.
- Use `bg-white/[0.03]` and `backdrop-blur-xl` for surfaces.
- Use `border-white/10` for subtle borders.

### 3. TypeScript
- No `any`. Use generics or `unknown` where appropriate.
- Export props interfaces for all components.
- Use `forwardRef` for components that wrap DOM elements.

### 4. Testing
- Add unit tests for new hooks in `src/hooks/*.test.ts`.
- Add component tests in `src/components/**/*.test.tsx`.

## 🤖 AI Context
If you are using an AI assistant to help you code, make sure to run `npm run context:generate` after making changes to update the `llms-full.txt` file, which provides the AI with the latest context of the library.
