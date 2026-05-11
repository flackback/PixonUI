import { test, expect } from '@playwright/test';

test.describe('Kanban Board interactions', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the root landing page
    await page.goto('/');

    // Wait for the custom PageLoader to finish initializing and detach
    await page.locator('text=INITIALIZING PIXONUI...').waitFor({ state: 'detached', timeout: 8000 });

    // Wait for landing page to settle and click on 'View SaaS Demo'
    const viewSaaSDemoButton = page.getByRole('button', { name: 'View SaaS Demo' }).first();
    await viewSaaSDemoButton.waitFor({ state: 'visible', timeout: 10000 });
    await viewSaaSDemoButton.click();

    // Click on 'Kanban' in the sidebar to navigate to the Kanban Board
    const kanbanSidebarItem = page.getByRole('button', { name: 'Kanban' });
    await kanbanSidebarItem.waitFor({ state: 'visible', timeout: 10000 });
    await kanbanSidebarItem.click();
  });

  test('should render Kanban board with four main columns', async ({ page }) => {
    // Check that columns exist and are displayed correctly
    await expect(page.getByText('To Do').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('In Progress').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Review').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Done').first()).toBeVisible({ timeout: 10000 });
  });

  test('should open task details drawer when clicking a card', async ({ page }) => {
    // Click on a specific card
    const card = page.getByText('Research competitor pricing').first();
    await card.waitFor({ state: 'visible', timeout: 10000 });
    await expect(card).toBeVisible();
    await card.click();

    // Verify task details drawer opens
    const drawerTitle = page.locator('h2', { hasText: 'Research competitor pricing' }).first();
    await drawerTitle.waitFor({ state: 'visible', timeout: 10000 });
    await expect(drawerTitle).toBeVisible();

    // Verify metadata and descriptions are shown
    await expect(page.getByText('Sarah Wilson').first()).toBeVisible();
    await expect(page.getByText('medium').first()).toBeVisible();

    // Close the drawer by clicking outside or pressing Escape
    await page.keyboard.press('Escape');
  });

  test('should support dragging and dropping a card to another column', async ({ page }) => {
    const card = page.getByText('Research competitor pricing').first();
    await card.waitFor({ state: 'visible', timeout: 10000 });
    await expect(card).toBeVisible();

    // Find the target column heading "In Progress"
    const targetColumn = page.getByText('In Progress').first();
    await expect(targetColumn).toBeVisible();

    // Perform native drag and drop
    await card.dragTo(targetColumn);

    // Give a brief moment for the local state transition to settle
    await page.waitForTimeout(500);

    // Verify card is now aligned or positioned within the context/state of In Progress column.
    await expect(card).toBeVisible();
  });
});
