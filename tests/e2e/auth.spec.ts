import { test, expect } from '@playwright/test';

const LOGIN_URL = '/login';
const DASHBOARD_URL = '/dashboard';
const ADMIN_EMAIL = 'ahmadzaki@utem.edu.my';
const ADMIN_PASSWORD = 'password';

test.describe('Authentication', () => {
    test('redirects guest to login when accessing dashboard', async ({ page }) => {
        await page.goto(DASHBOARD_URL);
        await expect(page).toHaveURL(/\/login/);
        await expect(page.locator('h2')).toContainText('Sign in');
    });

    test('shows validation error for empty credentials', async ({ page }) => {
        await page.goto(LOGIN_URL);
        await page.locator('button[type="submit"]').click();
        await expect(page.locator('text=Email').or(page.locator('text=required'))).toBeVisible();
    });

    test('shows error for invalid credentials', async ({ page }) => {
        await page.goto(LOGIN_URL);
        await page.locator('input[type="email"]').fill('wrong@test.com');
        await page.locator('input[type="password"]').fill('wrongpass');
        await page.locator('button[type="submit"]').click();
        await expect(page.locator('text=Invalid').or(page.locator('text=incorrect'))).toBeVisible();
    });

    test('logs in successfully with valid superadmin credentials', async ({ page }) => {
        await page.goto(LOGIN_URL);
        await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
        await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
        await page.locator('button[type="submit"]').click();
        await expect(page).toHaveURL(/\/dashboard/);
        await expect(page.locator('h1')).toContainText('Dashboard');
    });
});
