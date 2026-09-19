import { test, expect } from '@playwright/test';

/**
 * Main navigation flows. These intentionally have no fallback branches:
 * a missing element fails the test instead of silently exercising a
 * different path (the previous version always passed, even with a
 * completely broken UI, because every locator had an else-goto fallback).
 *
 * Both flows run against `npm run dev` (local backend, no network), so the
 * Arena page must render its shell even though /api/arena/problem is
 * unavailable — that is asserted explicitly.
 */
test.describe('CatCoder Main Flows', () => {
  test('landing navigates to the Bug Arena via the nav link', async ({ page }) => {
    await page.goto('/');

    const arenaLink = page.getByRole('link', { name: 'Bug Arena' }).first();
    await expect(arenaLink).toBeVisible();
    await arenaLink.click();

    await expect(page).toHaveURL(/\/arena\/?$/);

    // The Arena shell renders its title even when the API has no problems
    // to serve (local dev backend).
    await expect(page.getByText('Bug Arena').first()).toBeVisible();
  });

  test('landing navigates to the login page', async ({ page }) => {
    await page.goto('/');

    // The landing nav renders Sign in as a button (SPA navigate), not an anchor.
    const signInButton = page.getByRole('button', { name: 'Sign in' }).first();
    await expect(signInButton).toBeVisible();
    await signInButton.click();

    await expect(page).toHaveURL(/\/login\/?$/);
    await expect(page.getByRole('button', { name: /sign in/i }).first()).toBeVisible();
  });

  test('/arena is a valid route rendering its shell without an API', async ({ page }) => {
    await page.goto('/arena');

    await expect(page.getByText('Bug Arena').first()).toBeVisible();
  });
});
