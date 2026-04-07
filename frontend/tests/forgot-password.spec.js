const { test, expect } = require('@playwright/test');

test.describe('Forgot Password Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/forgot-password');
  });

  test('should display reset password heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Reset Password' })).toBeVisible();
  });

  test('should show username input', async ({ page }) => {
    await expect(page.getByPlaceholder('Enter your username')).toBeVisible();
  });

  test('should show send OTP button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Send OTP to Email' })).toBeVisible();
  });

  test('should navigate to login page when clicking back to login', async ({ page }) => {
    await page.getByRole('button', { name: /wait, i remember/i }).click();
    await expect(page).toHaveURL(/.*login/);
  });
});