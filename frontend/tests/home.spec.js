const { test, expect } = require('@playwright/test');

test.describe('Home Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load home page with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/.*/);
  });

  test('should display main heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Smart Loan System' })).toBeVisible();
  });

  test('should display login button', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
  });

  test('should navigate to login page when clicking login', async ({ page }) => {
    await page.getByRole('link', { name: 'Login' }).click();
    await expect(page).toHaveURL(/.*login/);
  });
});