import { test, expect } from '@playwright/test';

test.describe('Recipe Detail', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/recipe');
    await page.waitForSelector('app-recipe-items', { timeout: 10000 });
    await page.locator('app-recipe-items').first().click();
    await page.waitForSelector('app-recipe-detail h2', { timeout: 10000 });
  });

  test('should display recipe name', async ({ page }) => {
    await expect(page.locator('app-recipe-detail h2')).not.toBeEmpty();
  });

  test('should display recipe image', async ({ page }) => {
    await expect(page.locator('app-recipe-detail img')).toBeVisible();
  });

  test('should display recipe description', async ({ page }) => {
    await expect(page.locator('app-recipe-detail p')).not.toBeEmpty();
  });

  test('should display Manage dropdown button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Manage/i })).toBeVisible();
  });

  test('should open Manage dropdown and show options', async ({ page }) => {
    await page.getByRole('button', { name: /Manage/i }).click();
    await expect(page.getByText('Add to Shopping List')).toBeVisible();
    await expect(page.getByText('Edit Recipe')).toBeVisible();
    await expect(page.getByText('Delete Recipe')).toBeVisible();
  });

  test('should navigate to edit form when Edit Recipe is clicked', async ({ page }) => {
    await page.getByRole('button', { name: /Manage/i }).click();
    await page.getByText('Edit Recipe').click();
    await expect(page).toHaveURL(/\/recipe\/\d+\/edit/);
  });

  test('should add ingredients to shopping list', async ({ page }) => {
    await page.getByRole('button', { name: /Manage/i }).click();
    await page.getByText('Add to Shopping List').click();
    await page.getByRole('link', { name: 'Shopping List' }).click();
    const items = page.locator('app-shopping-list ul li');
    await expect(items.first()).toBeVisible();
  });

  test('should show Recipe not found for invalid id', async ({ page }) => {
    await page.goto('/recipe/99999');
    await expect(page.getByText(/recipe not found/i)).toBeVisible();
  });
});
