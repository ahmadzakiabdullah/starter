import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { test, expect } from '@playwright/test';
import * as path from 'path';

const ADMIN_EMAIL = 'ahmadzaki@utem.edu.my';
const ADMIN_PASSWORD = 'password';

test.describe('Media Management', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.locator('input[name="email"]').fill(ADMIN_EMAIL);
        await page.locator('input[name="password"]').fill(ADMIN_PASSWORD);
        await page.locator('button[type="submit"]').click();
        await expect(page).toHaveURL(/\/dashboard/);
    });

    test('uploads a media file', async ({ page }) => {
        await page.goto('/dashboard/media');
        await expect(page.locator('h1').first()).toBeVisible();

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
            await deleteButton.click();
            await page.getByRole('button', { name: 'Delete' }).click();
            await expect(page.locator('text=deleted').first()).toBeVisible({ timeout: 10000 });
        }
    });
});
