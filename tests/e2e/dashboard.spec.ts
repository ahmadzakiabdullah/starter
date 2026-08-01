import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'ahmadzaki@utem.edu.my';
const ADMIN_PASSWORD = 'password';

test.describe('Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.locator('input[name="email"]').fill(ADMIN_EMAIL);
        await page.locator('input[name="password"]').fill(ADMIN_PASSWORD);
        await page.locator('button[type="submit"]').click();
        await expect(page).toHaveURL(/\/dashboard/);
    });

    test('displays admin stats grid', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('Dashboard');
        await expect(page.locator('text=Total Profiles').or(page.locator('text=Users'))).toBeVisible();
        await expect(page.locator('text=Access Roles').or(page.locator('text=Roles'))).toBeVisible();
        await expect(page.locator('text=Backup Archives').first()).toBeVisible();
    });

    test('shows sidebar navigation', async ({ page }) => {
        await expect(page.locator('text=Overview').first()).toBeVisible();
        await expect(page.locator('text=User Directory').first()).toBeVisible();
        await expect(page.locator('text=Settings').or(page.locator('text=System Settings'))).toBeVisible();
    });
});
