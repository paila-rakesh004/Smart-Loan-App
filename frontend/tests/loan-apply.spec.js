const { test, expect } = require('@playwright/test');

test.describe('Loan Application Page Tests', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/loan/apply');
    await expect(page).toHaveURL(/.*login/);
  });
});