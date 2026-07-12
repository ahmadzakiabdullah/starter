import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'ahmadzaki@utem.edu.my';
const ADMIN_PASSWORD = 'password';

test.describe('Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
        await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
        await page.locator('button[type="submit"]').click();
        await expect(page).toHaveURL(/\/dashboard/);
    });

    test('displays admin stats grid', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('Dashboard');
        await expect(page.locator('text=Total Users').or(page.locator('text=Users'))).toBeVisible();
        await expect(page.locator('text=Roles').or(page.locator('text=Total Roles'))).toBeVisible();
        await expect(page.locator('text=Backups').or(page.locator('text=Backup'))).toBeVisible();
    });

    test('shows sidebar navigation', async ({ page }) => {
        await expect(page.locator('nav').or(page.locator('aside'))).toBeVisible();
        await expect(page.locator('text=Users').first()).toBeVisible();
        await expect(page.locator('text=Settings').or(page.locator('text=System Settings'))).toBeVisible();
    });
});
