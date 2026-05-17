import { expect, test } from '@playwright/test';

test.describe('Motion presets (vNext)', () => {
  test('reveal, parallax and stagger behave without critical warnings', async ({ page }) => {
    const criticalLogs: string[] = [];

    page.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'error' || msg.type() === 'warning') {
        const critical = [
          'Invalid keyframe value',
          'Maximum call stack size exceeded',
          'contains conflicting star exports',
          'startsWith is not a function',
        ];
        if (critical.some((needle) => text.includes(needle))) {
          criticalLogs.push(text);
        }
      }
    });

    await page.goto('/');

    const loader = page.locator('text=INITIALIZING PIXONUI...');
    if (await loader.isVisible().catch(() => false)) {
      await loader.waitFor({ state: 'detached', timeout: 10000 });
    }

    const featureCard = page.getByTestId('feature-card-0');
    await page.evaluate(() => window.scrollTo(0, 0));
    await featureCard.scrollIntoViewIfNeeded();
    await expect(featureCard).toBeAttached();
    await page.waitForTimeout(240);

    const parallaxCard = page.getByTestId('parallax-card');
    await parallaxCard.scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, -400);
    await page.waitForTimeout(120);

    const progressLabel = parallaxCard.locator('span').first();
    const beforeProgress = (await progressLabel.textContent())?.trim();
    const orb = parallaxCard.locator('.h-12.w-12.rounded-full').first();
    const beforeTransform = await orb.evaluate((el) => getComputedStyle(el).transform);

    await page.mouse.wheel(0, 900);
    await page.waitForFunction(
      ({ selector, labelSelector, beforeT, beforeP }) => {
        const node = document.querySelector(selector) as HTMLElement | null;
        const label = document.querySelector(labelSelector) as HTMLElement | null;
        if (!node || !label) return false;
        const transform = getComputedStyle(node).transform;
        const text = (label.textContent || '').trim();
        return transform !== beforeT || text !== beforeP;
      },
      {
        selector: '[data-testid="parallax-card"] .h-12.w-12.rounded-full',
        labelSelector: '[data-testid="parallax-card"] span',
        beforeT: beforeTransform,
        beforeP: beforeProgress ?? '',
      },
      { timeout: 5000 }
    );
    const afterProgress = (await progressLabel.textContent())?.trim();
    const afterTransform = await orb.evaluate((el) => getComputedStyle(el).transform);

    expect(afterTransform !== beforeTransform || afterProgress !== beforeProgress).toBe(true);
    expect(criticalLogs).toEqual([]);
  });

  test('reveal cards do not flicker back to hidden after first in-view', async ({ page }) => {
    await page.goto('/');

    const loader = page.locator('text=INITIALIZING PIXONUI...');
    if (await loader.isVisible().catch(() => false)) {
      await loader.waitFor({ state: 'detached', timeout: 10000 });
    }

    const card = page.getByTestId('parallax-card');
    let initialOpacity = 0;
    let becameVisible = false;
    for (let i = 0; i < 24; i += 1) {
      await page.mouse.wheel(0, 220);
      await page.waitForTimeout(70);
      initialOpacity = await card.evaluate((el) => Number.parseFloat(getComputedStyle(el).opacity || '0'));
      if (initialOpacity > 0.9) {
        becameVisible = true;
        break;
      }
    }
    expect(becameVisible).toBe(true);
    expect(initialOpacity).toBeGreaterThan(0.9);

    const minOpacityDuringCycles = await page.evaluate(async () => {
      const node = document.querySelector('[data-testid="parallax-card"]') as HTMLElement | null;
      if (!node) return 0;
      let minOpacity = Number.POSITIVE_INFINITY;
      const sample = () => {
        const v = Number.parseFloat(getComputedStyle(node).opacity || '0');
        if (Number.isFinite(v)) minOpacity = Math.min(minOpacity, v);
      };

      for (let i = 0; i < 8; i += 1) {
        window.scrollBy({ top: i % 2 === 0 ? 380 : -300, left: 0, behavior: 'auto' });
        await new Promise((resolve) => requestAnimationFrame(resolve));
        sample();
        await new Promise((resolve) => setTimeout(resolve, 80));
        sample();
      }

      sample();
      return Number.isFinite(minOpacity) ? minOpacity : 0;
    });

    const finalOpacity = await card.evaluate((el) => Number.parseFloat(getComputedStyle(el).opacity || '0'));
    expect(minOpacityDuringCycles).toBeGreaterThan(0.85);
    expect(finalOpacity).toBeGreaterThan(0.9);
  });
});
