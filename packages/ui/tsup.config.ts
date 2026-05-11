import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/components/button/Button.tsx',
    'src/components/button/PrimaryButton.tsx',
    'src/components/button/GlowButton.tsx',
    'src/components/card/Card.tsx',
    'src/components/card/GlowCard.tsx',
    'src/components/card/MetricCard.tsx',
    'src/components/data-display/kanban/index.ts',
    'src/components/data-display/DataTable.tsx',
    'src/components/chat/index.ts',
    'src/components/form/Slider.tsx',
    'src/theme/ThemeProvider.tsx',
    'src/hooks/index.ts'
  ],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  minify: true,
  external: ['react', 'react-dom'],
  treeshake: true,
  outDir: 'dist',
  tsconfig: 'tsconfig.build.json',
  banner: {
    js: '"use client";',
  }
});
