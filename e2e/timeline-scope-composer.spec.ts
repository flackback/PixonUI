import { expect, test } from '@playwright/test';

test.describe('Timeline scope + composer', () => {
  test('animates scoped nodes without leaking to outside selector matches', async ({ page }) => {
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
        if (critical.some((needle) => text.includes(needle))) criticalLogs.push(text);
      }
    });

    await page.goto('/');

    const loader = page.locator('text=INITIALIZING PIXONUI...');
    if (await loader.isVisible().catch(() => false)) {
      await loader.waitFor({ state: 'detached', timeout: 10000 });
    }

    const showcase = page.getByTestId('timeline-scope-showcase');
    const outside = page.getByTestId('scope-outside-pill');
    await showcase.scrollIntoViewIfNeeded();

    const outsideBefore = await outside.evaluate((el) => Number.parseFloat(getComputedStyle(el).opacity || '0'));

    await page.waitForFunction(
      () => {
        const title = document.querySelector('.scope-title') as HTMLElement | null;
        const pills = Array.from(document.querySelectorAll('.scope-pill')) as HTMLElement[];
        if (!title || pills.length < 3) return false;
        const titleOpacity = Number.parseFloat(getComputedStyle(title).opacity || '0');
        const visiblePills = pills.slice(0, 3).every((pill) => Number.parseFloat(getComputedStyle(pill).opacity || '0') > 0.6);
        return titleOpacity > 0.6 && visiblePills;
      },
      { timeout: 10000 }
    );

    const outsideAfter = await outside.evaluate((el) => Number.parseFloat(getComputedStyle(el).opacity || '0'));
    expect(outsideAfter).toBeLessThanOrEqual(Math.max(0.12, outsideBefore + 0.07));
    expect(criticalLogs).toEqual([]);
  });
});

