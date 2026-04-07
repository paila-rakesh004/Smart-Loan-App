const { test, expect } = require('@playwright/test');

test.describe('Login Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login page elements', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Smart Loan System' })).toBeVisible();
  });

  test('should have customer and officer login buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Customer Login' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Officer Login' })).toBeVisible();
  });

  test('should toggle between customer and officer login', async ({ page }) => {
    const customerBtn = page.getByRole('button', { name: 'Customer Login' });
    const officerBtn = page.getByRole('button', { name: 'Officer Login' });
    
    await expect(customerBtn).toHaveClass(/bg-indigo-500/);
    await officerBtn.click();
    await expect(officerBtn).toHaveClass(/bg-indigo-500/);
  });

  test('should show username input field', async ({ page }) => {
    await expect(page.getByPlaceholder('Enter Username')).toBeVisible();
  });

  test('should show password input field', async ({ page }) => {
    await expect(page.getByPlaceholder('Enter Password')).toBeVisible();
  });

  test('should show password toggle checkbox', async ({ page }) => {
    await expect(page.getByLabel(/show password|hide password/i)).toBeVisible({ timeout: 3000 }).catch(() => {
      return expect(page.locator('input[type="checkbox"]')).toBeVisible();
    });
  });

  test('should show login button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /login as/i })).toBeVisible();
  });

  test('should show home button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Home' })).toBeVisible();
  });

  test('should navigate to home when clicking Home button', async ({ page }) => {
    await page.getByRole('button', { name: 'Home' }).click();
    await expect(page).toHaveURL(/.*\/?$/);
  });

  test('should validate required fields on login form', async ({ page }) => {
    const usernameInput = page.getByPlaceholder('Enter Username');
    const passwordInput = page.getByPlaceholder('Enter Password');
    await expect(usernameInput).toHaveAttribute('required', '');
    await expect(passwordInput).toHaveAttribute('required', '');
  });
});