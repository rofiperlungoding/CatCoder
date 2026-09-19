import { test, expect } from '@playwright/test';

test.describe('CatCoder Main Flows', () => {
  test('should load landing page and navigate to Arena', async ({ page }) => {
    await page.goto('/');
    
    // Check if branding is there
    await expect(page.getByText('CatCoder', { exact: false }).first()).toBeVisible();
    
    // Navigate to Bug Arena
    const arenaLink = page.getByRole('link', { name: /Arena|Bug Arena/i }).first();
    if (await arenaLink.isVisible()) {
      await arenaLink.click();
      await expect(page).toHaveURL(/.*\/arena/);
    } else {
      // Direct navigation if link not found
      await page.goto('/arena');
      await expect(page.getByText(/Arena/i).first()).toBeVisible();
    }
  });

  test('should allow navigating to login page', async ({ page }) => {
    await page.goto('/');
    
    const loginLink = page.getByRole('link', { name: /Sign In|Login/i }).first();
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL(/.*\/login/);
      await expect(page.getByRole('button', { name: /Sign In|Login/i })).toBeVisible();
    } else {
      await page.goto('/login');
      await expect(page.getByRole('button', { name: /Sign In|Login/i })).toBeVisible();
    }
  });
});
