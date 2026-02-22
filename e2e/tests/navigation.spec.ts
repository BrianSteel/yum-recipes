import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should load the app and redirect to /recipe', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/recipe/);
  });

  test('should show the navbar with Recipes and Shopping List links', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Recipes', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Shopping List' })).toBeVisible();
  });

  test('should navigate to Shopping List', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Shopping List' }).click();
    await expect(page).toHaveURL(/\/shopping-list/);
  });

  test('should navigate back to Recipes from Shopping List', async ({ page }) => {
    await page.goto('/shopping-list');
    await page.getByRole('link', { name: 'Recipes', exact: true }).click();
    await expect(page).toHaveURL(/\/recipe/);
  });

  test('brand link should navigate to recipes', async ({ page }) => {
    await page.goto('/shopping-list');
    await page.getByRole('link', { name: 'Yum Recipes' }).click();
    await expect(page).toHaveURL(/\/recipe/);
  });
});
