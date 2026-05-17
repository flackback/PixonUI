import { expect, test } from '@playwright/test';

test.describe('Preview console hygiene', () => {
  test('loads landing without runtime warnings/errors', async ({ page }) => {
    const issues: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() !== 'warning' && msg.type() !== 'error') return;
      const text = msg.text();
      const allowlist = [
        'Will-change memory consumption is too high',
      ];
      if (!allowlist.some((ok) => text.includes(ok))) {
        issues.push(`${msg.type()}: ${text}`);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(300);
    await page.mouse.wheel(0, 1200);
    await page.waitForTimeout(200);
    await page.mouse.wheel(0, -600);
    await page.waitForTimeout(200);

    expect(issues).toEqual([]);
  });
});
