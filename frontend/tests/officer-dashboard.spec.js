const { test, expect } = require('@playwright/test');

test.describe('Officer Dashboard Tests', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard/officer');
    await expect(page).toHaveURL(/.*login/);
  });
});