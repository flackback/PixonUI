#!/usr/bin/env node
import fs from 'node:fs';
import zlib from 'node:zlib';
import { spawnSync } from 'node:child_process';

const root = process.cwd();

const steps = [
  {
    name: 'UI motion unit/integration tests',
    cmd: 'pnpm',
    args: [
      '-F',
      '@pixonui/react',
      'exec',
      'vitest',
      'run',
      'src/__tests__/motion.timeAndPresets.test.ts',
      'src/__tests__/motion.interaction.integration.test.tsx',
      'src/__tests__/usePixonScroll.motionValue.test.tsx',
    ],
  },
  {
    name: 'UI build',
    cmd: 'pnpm',
    args: ['-F', '@pixonui/react', 'build'],
  },
  {
    name: 'Preview build',
    cmd: 'pnpm',
    args: ['-F', '@pixonui/preview', 'exec', 'vite', 'build'],
  },
  {
    name: 'Motion E2E gate (chromium)',
    cmd: 'pnpm',
    args: [
      'exec',
      'playwright',
      'test',
      'e2e/motion-presets.spec.ts',
      'e2e/timeline-scope-composer.spec.ts',
      'e2e/motion-container-interactions.spec.ts',
      '--project=chromium',
      '--workers=1',
    ],
  },
];

const runStep = ({ name, cmd, args }) => {
  process.stdout.write(`\n[gate] ${name}\n`);
  const out = spawnSync(cmd, args, {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (out.status !== 0) {
    throw new Error(`Step failed: ${name}`);
  }
};

const assertBundleBudget = () => {
  const entry = 'packages/ui/dist/index.mjs';
  if (!fs.existsSync(entry)) {
    throw new Error(`Missing bundle entry: ${entry}`);
  }

  const raw = fs.readFileSync(entry);
  const gzip = zlib.gzipSync(raw);
  const brotli = zlib.brotliCompressSync(raw);

  const maxRawBytes = 340 * 1024;
  const maxGzipBytes = 90 * 1024;
  const maxBrotliBytes = 75 * 1024;

  const metrics = {
    rawBytes: raw.length,
    gzipBytes: gzip.length,
    brotliBytes: brotli.length,
  };

  process.stdout.write(
    `[gate] bundle metrics: raw=${metrics.rawBytes}B gzip=${metrics.gzipBytes}B brotli=${metrics.brotliBytes}B\n`
  );

  if (metrics.rawBytes > maxRawBytes) {
    throw new Error(`Bundle budget exceeded (raw): ${metrics.rawBytes} > ${maxRawBytes}`);
  }
  if (metrics.gzipBytes > maxGzipBytes) {
    throw new Error(`Bundle budget exceeded (gzip): ${metrics.gzipBytes} > ${maxGzipBytes}`);
  }
  if (metrics.brotliBytes > maxBrotliBytes) {
    throw new Error(`Bundle budget exceeded (brotli): ${metrics.brotliBytes} > ${maxBrotliBytes}`);
  }
};

const main = () => {
  for (const step of steps) runStep(step);
  assertBundleBudget();
  process.stdout.write('\n[gate] Motion production gate passed.\n');
};

main();
