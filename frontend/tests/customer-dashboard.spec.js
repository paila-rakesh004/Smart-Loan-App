const { test, expect } = require('@playwright/test');

test.describe('Customer Dashboard Tests', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard/customer');
    await expect(page).toHaveURL(/.*login/);
  });
});