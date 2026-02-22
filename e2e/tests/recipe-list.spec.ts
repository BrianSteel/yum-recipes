import { test, expect } from '@playwright/test';

test.describe('Recipe List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/recipe');
    // wait for recipes to load from the API
    await page.waitForSelector('app-recipe-items', { timeout: 10000 });
  });

  test('should display at least one recipe in the list', async ({ page }) => {
    const recipeItems = page.locator('app-recipe-items');
    await expect(recipeItems.first()).toBeVisible();
  });

  test('should auto-navigate to first recipe on load', async ({ page }) => {
    await expect(page).toHaveURL(/\/recipe\/0/);
  });

  test('should navigate to recipe detail on click', async ({ page }) => {
    const firstRecipe = page.locator('app-recipe-items').first();
    await firstRecipe.click();
    await expect(page).toHaveURL(/\/recipe\/0/);
  });

  test('should show recipe name and description in list item', async ({ page }) => {
    const firstItem = page.locator('app-recipe-items').first();
    await expect(firstItem.locator('h6')).not.toBeEmpty();
    await expect(firstItem.locator('p')).not.toBeEmpty();
  });

  test('should show New Recipe button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'New Recipe' })).toBeVisible();
  });

  test('should navigate to /recipe/new when New Recipe is clicked', async ({ page }) => {
    await page.getByRole('button', { name: 'New Recipe' }).click();
    await expect(page).toHaveURL(/\/recipe\/new/);
  });
});
