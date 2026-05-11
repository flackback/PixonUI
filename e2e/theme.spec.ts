import { test, expect } from '@playwright/test';

test.describe('Theme Toggling', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the preview page
    await page.goto('/');

    // Wait for the custom PageLoader to finish initializing and detach
    await page.locator('text=INITIALIZING PIXONUI...').waitFor({ state: 'detached', timeout: 8000 });
    
    // Enter the gallery view using unambiguous first match (header button)
    const enterGalleryButton = page.getByRole('button', { name: 'Explore Components' }).first();
    await enterGalleryButton.waitFor({ state: 'visible', timeout: 10000 });
    await enterGalleryButton.click();
  });

  test('should toggle theme from dark to light and vice-versa', async ({ page }) => {
    // Locate the html tag
    const html = page.locator('html');

    // Get the theme toggle button (by screen reader name "Toggle theme")
    const themeToggle = page.getByRole('button', { name: 'Toggle theme' });
    await themeToggle.waitFor({ state: 'visible', timeout: 10000 });
    await expect(themeToggle).toBeVisible();

    // Toggle theme to 'light' (if currently dark) or vice-versa
    const initialThemeIsDark = await html.evaluate((el) => el.classList.contains('dark'));
    
    // Click the toggle button to switch theme
    await themeToggle.click();

    // Verify the theme class changed on the HTML element
    if (initialThemeIsDark) {
      await expect(html).toHaveClass(/light/);
      await expect(html).not.toHaveClass(/dark/);
    } else {
      await expect(html).toHaveClass(/dark/);
      await expect(html).not.toHaveClass(/light/);
    }

    // Toggle back
    await themeToggle.click();

    // Verify it reverts to original theme state
    if (initialThemeIsDark) {
      await expect(html).toHaveClass(/dark/);
      await expect(html).not.toHaveClass(/light/);
    } else {
      await expect(html).toHaveClass(/light/);
      await expect(html).not.toHaveClass(/dark/);
    }
  });
});
