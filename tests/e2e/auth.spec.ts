import { test, expect } from '@playwright/test';

const LOGIN_URL = '/login';
const DASHBOARD_URL = '/dashboard';
const ADMIN_EMAIL = 'ahmadzaki@utem.edu.my';
const ADMIN_PASSWORD = 'password';

test.describe('Authentication', () => {
    test('redirects guest to login when accessing dashboard', async ({ page }) => {
        await page.goto(DASHBOARD_URL);
        await expect(page).toHaveURL(/\/login/);
        await expect(page.locator('h1')).toContainText('Sign in');
    });

    test('shows validation error for empty credentials', async ({ page }) => {
        await page.goto(LOGIN_URL);
        await page.locator('button[type="submit"]').click();
        await expect(page.locator('input[name="email"]')).toHaveAttribute('required', '');
    });

    test('shows error for invalid credentials', async ({ page }) => {
        await page.goto(LOGIN_URL);
        await page.locator('input[name="email"]').fill('wrong@test.com');
        await page.locator('input[name="password"]').fill('wrongpass');
        await page.locator('button[type="submit"]').click();
        await expect(page.locator('text=These credentials do not match our records.').or(page.locator('text=incorrect'))).toBeVisible();
    });

    test('logs in successfully with valid superadmin credentials', async ({ page }) => {
        await page.goto(LOGIN_URL);
        await page.locator('input[name="email"]').fill(ADMIN_EMAIL);
        await page.locator('input[name="password"]').fill(ADMIN_PASSWORD);
        await page.locator('button[type="submit"]').click();
        await expect(page).toHaveURL(/\/dashboard/);
        await expect(page.locator('h1')).toContainText('Dashboard');
    });
});
