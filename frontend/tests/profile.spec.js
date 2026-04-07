const { test, expect } = require('@playwright/test');

test.describe('Customer Profile Page Tests', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/profile/customer');
    await expect(page).toHaveURL(/.*login/);
  });
});

test.describe('Officer Profile Page Tests', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/profile/officer');
    await expect(page).toHaveURL(/.*login/);
  });
});