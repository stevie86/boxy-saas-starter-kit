// tests/e2e/auth/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('should allow a user to log in successfully', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle'); // Wait for network to be idle
    await page.getByRole('button', { name: 'Log in' }).waitFor({ state: 'visible' }); // Wait for the button to be visible and enabled

    await page.fill('input[name="email"]', 'admin@hostelpulse.com');
    await page.fill('input[name="password"]', 'password');
    await page.getByRole('button', { name: 'Log in' }).click();

    // Expect to be redirected to the root/dashboard after login
    await page.waitForURL('/');
    await expect(page.locator('text=Signed in as')).toBeVisible();
    await expect(page.locator('text=admin@hostelpulse.com')).toBeVisible();
  });

  test('should show an error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle'); // Wait for network to be idle
    await page.getByRole('button', { name: 'Log in' }).waitFor({ state: 'visible' }); // Wait for the button to be visible and enabled

    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.getByRole('button', { name: 'Log in' }).click();

    // Expect to see an error message
    await expect(page.locator('text=Invalid credentials.')).toBeVisible();
  });
});
