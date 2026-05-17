import { expect, test } from '@playwright/test';

test.describe('Motion performance budget', () => {
  test('meets frame-time budget under CPU throttling (chromium)', async ({ page, browserName }) => {
    test.setTimeout(60000);
    test.skip(browserName !== 'chromium', 'CPU throttling budget is measured in Chromium via CDP.');

    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const result = await page.evaluate(async () => {
      const longTasks: number[] = [];
      const supportsLongTask = typeof PerformanceObserver !== 'undefined'
        && PerformanceObserver.supportedEntryTypes?.includes('longtask');

      let observer: PerformanceObserver | null = null;
      if (supportsLongTask) {
        observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) longTasks.push(entry.duration);
        });
        observer.observe({ entryTypes: ['longtask'] as any });
      }

      const start = performance.now();
      while (performance.now() - start < 2600) {
        window.scrollBy({ top: 220, left: 0, behavior: 'auto' });
        await new Promise((r) => setTimeout(r, 80));
      }

      observer?.disconnect();
      const sorted = [...longTasks].sort((a, b) => a - b);
      const pickPercentile = (q: number) => {
        if (sorted.length === 0) return 0;
        const idx = Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * q));
        return sorted[idx] ?? 0;
      };
      const maxLongTask = longTasks.length ? Math.max(...longTasks) : 0;
      return {
        supportsLongTask,
        longTaskCount: longTasks.length,
        maxLongTask,
        p95LongTask: pickPercentile(0.95),
        over320Count: longTasks.filter((duration) => duration > 320).length,
        over1200Count: longTasks.filter((duration) => duration > 1200).length,
      };
    });

    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });

    if (!result.supportsLongTask) test.skip();
    expect(result.longTaskCount).toBeLessThan(40);
    expect(result.p95LongTask).toBeLessThan(1200);
    expect(result.over320Count).toBeLessThan(20);
    expect(result.over1200Count).toBeLessThan(2);
    expect(result.maxLongTask).toBeLessThan(1800);
  });
});
