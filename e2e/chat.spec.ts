import { test, expect } from '@playwright/test';

test.describe('SaaS Chat interactions', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the root landing page
    await page.goto('/');

    // Wait for the custom PageLoader to finish initializing and detach
    await page.locator('text=INITIALIZING PIXONUI...').waitFor({ state: 'detached', timeout: 8000 });

    // Wait for landing page to settle and click on 'View SaaS Demo'
    const viewSaaSDemoButton = page.getByRole('button', { name: 'View SaaS Demo' }).first();
    await viewSaaSDemoButton.waitFor({ state: 'visible', timeout: 10000 });
    await viewSaaSDemoButton.click();

    // Click on 'Inbox' in the sidebar to navigate to the SaaS inbox/chat
    const inboxSidebarItem = page.getByRole('button', { name: 'Inbox' });
    await inboxSidebarItem.waitFor({ state: 'visible', timeout: 10000 });
    await inboxSidebarItem.click();
  });

  test('should load conversation list and active chat details', async ({ page }) => {
    // Verify Sarah Wilson exists in conversation list (which loads after skeleton)
    const sidebarContact = page.getByText('Sarah Wilson').first();
    await sidebarContact.waitFor({ state: 'visible', timeout: 10000 });
    await sidebarContact.click();

    // Verify chat header shows Sarah Wilson as the active conversation (using accessible heading role)
    const chatHeaderTitle = page.getByRole('heading', { name: 'Sarah Wilson' }).first();
    await chatHeaderTitle.waitFor({ state: 'visible', timeout: 10000 });
    await expect(chatHeaderTitle).toBeVisible();
  });

  test('should support sending a message and trigger smart typing reply', async ({ page }) => {
    // Ensure active contact is loaded and selected
    const sidebarContact = page.getByText('Sarah Wilson').first();
    await sidebarContact.waitFor({ state: 'visible', timeout: 10000 });
    await sidebarContact.click();

    const chatInput = page.getByPlaceholder('Digite sua mensagem rica aqui...');
    await chatInput.waitFor({ state: 'visible', timeout: 10000 });
    await expect(chatInput).toBeVisible();

    // Type and send a message (omit "hi" greeting to trigger SAML/SSO auto-reply rule)
    await chatInput.fill('Is SAML integration ready?');
    await page.keyboard.press('Enter');

    // Verify the sent message appears in the chat list (avoiding strict mode with sidebar preview)
    const sentMessage = page.getByText('Is SAML integration ready?').last();
    await sentMessage.waitFor({ state: 'visible', timeout: 10000 });
    await expect(sentMessage).toBeVisible();

    // Verify mock typing or auto-reply eventually fires
    // The mock reply fires typing indicator after 1.5s, then replies after 3.5s.
    // So let's wait up to 12 seconds for the reply to appear under high-latency environments.
    const replyLocator = page.getByText(/SAML, OIDC, and Okta/i).last();
    await replyLocator.waitFor({ state: 'visible', timeout: 12000 });
    await expect(replyLocator).toBeVisible();
  });

  test('should open UnifiedPreviewModal when clicking a file attachment', async ({ page }) => {
    // Ensure active contact is loaded and selected
    const sidebarContact = page.getByText('Sarah Wilson').first();
    await sidebarContact.waitFor({ state: 'visible', timeout: 10000 });
    await sidebarContact.click();

    // Locate the file attachment node "Relatorio_Performance_PixonUI.pdf" in message history
    const fileCard = page.getByText('Relatorio_Performance_PixonUI.pdf');
    await fileCard.waitFor({ state: 'visible', timeout: 10000 });
    await expect(fileCard).toBeVisible();

    // Click to open preview modal
    await fileCard.click();

    // Verify that the UnifiedPreviewModal renders the PDF preview header using its unique subtitle
    const modalHeader = page.getByText('Visualizador Supremo • PixonUI');
    await modalHeader.waitFor({ state: 'visible', timeout: 10000 });
    await expect(modalHeader).toBeVisible();

    // Click on the close button in the modal header
    const closeButton = page.locator('a[title="Baixar arquivo original"] + button').first();
    await closeButton.waitFor({ state: 'visible', timeout: 5000 });
    await closeButton.click();

    // Verify modal is closed (no longer visible at the top level or backdrop gone)
    await expect(modalHeader).not.toBeVisible({ timeout: 10000 });
  });
});
