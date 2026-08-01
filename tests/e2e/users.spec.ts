import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'ahmadzaki@utem.edu.my';
const ADMIN_PASSWORD = 'password';

test.describe('User Management CRUD', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.locator('input[name="email"]').fill(ADMIN_EMAIL);
        await page.locator('input[name="password"]').fill(ADMIN_PASSWORD);
        await page.locator('button[type="submit"]').click();
        await expect(page).toHaveURL(/\/dashboard/);
    });

    test('lists users and navigates to create page', async ({ page }) => {
        await page.goto('/dashboard/users');
        await expect(page.locator('h1')).toContainText('User Management');
        await expect(page.getByRole('link', { name: /add user/i }).first()).toBeVisible();
    });

    test('creates a new user', async ({ page }) => {
        await page.goto('/dashboard/users');
        await page.getByRole('link', { name: /add user/i }).first().click();
        await page.waitForURL(/\/dashboard\/users\/create/);

        const email = `e2e-${Date.now()}@test.com`;
        await page.locator('#name').fill('E2E User');
        await page.locator('#username').fill(`e2euser${Date.now()}`);
        await page.locator('#email').fill(email);
        await page.locator('#password').fill('password123');

        await page.locator('button[type="submit"]').click();

        await expect(page.locator('text=created').first()).toBeVisible({ timeout: 10000 });
    });

    test('validates duplicate email', async ({ page }) => {
        await page.goto('/dashboard/users/create');
        await page.locator('#name').fill('Dupe User');
        await page.locator('#username').fill(`dupe${Date.now()}`);
        await page.locator('#email').fill(ADMIN_EMAIL);
        await page.locator('#password').fill('password123');

        await page.locator('button[type="submit"]').click();
        await expect(page.locator('text=already').or(page.locator('text=taken'))).toBeVisible({ timeout: 10000 });
    });
});
