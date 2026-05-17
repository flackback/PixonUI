import { expect, test } from '@playwright/test';

const criticalNeedles = [
  'Invalid keyframe value',
  'Maximum call stack size exceeded',
  'contains conflicting star exports',
  'startsWith is not a function',
];

async function waitForPreview(page: import('@playwright/test').Page) {
  await page.goto('/');
  const loader = page.locator('text=INITIALIZING PIXONUI...');
  if (await loader.isVisible().catch(() => false)) {
    await loader.waitFor({ state: 'detached', timeout: 10000 });
  }
}

test.describe('Advanced motion replicas', () => {
  test('renders the sphere replica and keeps it animating without critical warnings', async ({ page }) => {
    const criticalLogs: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      if ((msg.type() === 'error' || msg.type() === 'warning') && criticalNeedles.some((needle) => text.includes(needle))) {
        criticalLogs.push(text);
      }
    });

    await waitForPreview(page);
    await page.getByRole('button', { name: 'Abrir galeria' }).click();
    await page.getByText('Anime.js Pen Replicas', { exact: true }).click();

    const spherePath = page.locator('[data-sphere-path]').first();
    await expect(spherePath).toBeAttached();

    const before = await spherePath.evaluate((el) => ({
      dash: getComputedStyle(el).strokeDashoffset,
      transform: getComputedStyle(el).transform,
      stroke: getComputedStyle(el).stroke,
    }));

    await page.waitForFunction(
      (prev) => {
        const node = document.querySelector('[data-sphere-path]') as SVGPathElement | null;
        if (!node) return false;
        const style = getComputedStyle(node);
        return style.strokeDashoffset !== prev.dash || style.transform !== prev.transform || style.stroke !== prev.stroke;
      },
      before,
      { timeout: 5000 }
    );

    const count = await page.locator('[data-sphere-path]').count();
    expect(count).toBeGreaterThan(20);
    expect(criticalLogs).toEqual([]);
  });
});
