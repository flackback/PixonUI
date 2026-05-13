import { execSync } from 'child_process';
import { readFileSync, statSync, writeFileSync } from 'fs';
import { join } from 'path';
import { gzipSync } from 'zlib';

const pkgRoot = process.cwd();
const distPath = join(pkgRoot, 'dist');

function getBundleSize() {
  try {
    execSync('npm run build', { cwd: pkgRoot, stdio: 'ignore' });
    const bundlePath = join(distPath, 'index.mjs');
    const content = readFileSync(bundlePath);
    const size = content.length;
    const gzipped = gzipSync(content).length;
    return { size, gzipped };
  } catch (e) {
    console.error('Build failed', e);
    return null;
  }
}

const stats = getBundleSize();
if (stats) {
  const result = {
    timestamp: new Date().toISOString(),
    ...stats,
    kb: (stats.size / 1024).toFixed(2),
    gzipKb: (stats.gzipped / 1024).toFixed(2)
  };
  console.log('Performance Metrics:', result);
  writeFileSync(join(pkgRoot, 'scripts/perf-results.json'), JSON.stringify(result, null, 2));
}
