import { test, expect } from '@playwright/test';
import * as path from 'path';

const ADMIN_EMAIL = 'ahmadzaki@utem.edu.my';
const ADMIN_PASSWORD = 'password';

test.describe('Media Management', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
        await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
        await page.locator('button[type="submit"]').click();
        await expect(page).toHaveURL(/\/dashboard/);
    });

    test('uploads a media file', async ({ page }) => {
        await page.goto('/dashboard/media');
        await expect(page.locator('h1').or(page.locator('text=Media'))).toBeVisible();

        const fileInput = page.locator('input[type="file"]').first();
        const testImage = path.resolve(__dirname, '../../tests/fixtures/test-image.png');

        await fileInput.setInputFiles(testImage);
        await expect(page.locator('text=uploaded').or(page.locator('text=success'))).toBeVisible({ timeout: 15000 });
    });

    test('deletes a media file', async ({ page }) => {
        await page.goto('/dashboard/media');
        await page.waitForTimeout(2000);

        const deleteButton = page.locator('button:has(svg.lucide-trash2), button:has(svg.lucide-trash)').first();
        if (await deleteButton.isVisible()) {
            page.once('dialog', (dialog) => dialog.accept());
            await deleteButton.click();
            await expect(page.locator('text=deleted').or(page.locator('text=success'))).toBeVisible({ timeout: 10000 });
        }
    });
});
