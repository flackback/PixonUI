import { expect, test } from '@playwright/test';

test.describe('Motion container interactions', () => {
  test('container parallax and ref drag constraints are stable (firefox/webkit)', async ({ page, browserName }) => {
    test.skip(browserName === 'chromium', 'Dedicated cross-engine coverage for firefox/webkit.');

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

    const card = page.getByTestId('container-interaction-card');
    await card.scrollIntoViewIfNeeded();
    await expect(card).toBeVisible();

    const root = page.getByTestId('container-scroll-root');
    const orb = page.getByTestId('container-parallax-orb');

    await root.evaluate((el) => {
      (el as HTMLElement).scrollLeft = 0;
      el.dispatchEvent(new Event('scroll', { bubbles: true }));
    });
    await page.waitForTimeout(120);

    const beforeTransform = await orb.evaluate((el) => getComputedStyle(el).transform);

    await root.evaluate((el) => {
      (el as HTMLElement).scrollLeft = 560;
      el.dispatchEvent(new Event('scroll', { bubbles: true }));
    });

    await page.waitForFunction(
      ({ selector, beforeT }) => {
        const node = document.querySelector(selector) as HTMLElement | null;
        if (!node) return false;
        return getComputedStyle(node).transform !== beforeT;
      },
      { selector: '[data-testid="container-parallax-orb"]', beforeT: beforeTransform },
      { timeout: 5000 }
    );

    const dragBounds = page.getByTestId('drag-bounds-root');
    const dragHandle = page.getByTestId('drag-handle');
    const boundsBox = await dragBounds.boundingBox();
    const handleBefore = await dragHandle.boundingBox();

    expect(boundsBox).not.toBeNull();
    expect(handleBefore).not.toBeNull();

    if (!boundsBox || !handleBefore) return;

    await page.mouse.move(handleBefore.x + handleBefore.width / 2, handleBefore.y + handleBefore.height / 2);
    await page.mouse.down();
    await page.mouse.move(handleBefore.x + handleBefore.width / 2 + 460, handleBefore.y + handleBefore.height / 2, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(120);

    const handleAfter = await dragHandle.boundingBox();
    expect(handleAfter).not.toBeNull();
    if (!handleAfter) return;

    expect(handleAfter.x).toBeGreaterThanOrEqual(boundsBox.x - 1);
    expect(handleAfter.x + handleAfter.width).toBeLessThanOrEqual(boundsBox.x + boundsBox.width + 1);
    expect(criticalLogs).toEqual([]);
  });
});
