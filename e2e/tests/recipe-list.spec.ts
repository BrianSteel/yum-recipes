import { test, expect, request } from '@playwright/test';

let recipeId: string;

test.beforeAll(async () => {
  const api = await request.newContext({ baseURL: 'http://localhost:80' });
  const res = await api.post('/api/recipes', {
    data: {
      name: 'Test Recipe',
      desc: 'A test recipe for e2e tests',
      imgPath: 'https://img.chefkoch-cdn.de/rezepte/393031127655461/bilder/1618353/crop-640x427/spaghetti-bolognese.jpg',
      ingredients: [{ name: 'Ingredient', amount: 1, unit: 'piece' }]
    }
  });
  const { recipe } = await res.json();
  recipeId = recipe._id;
  await api.dispose();
});

test.afterAll(async () => {
  const api = await request.newContext({ baseURL: 'http://localhost:80' });
  await api.delete(`/api/recipe/${recipeId}`);
  await api.dispose();
});

test.describe('Recipe List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/recipe');
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
    await page.locator('app-recipe-items').first().click();
    await expect(page).toHaveURL(/\/recipe\/0/);
  });

  test('should show recipe name and description in list item', async ({ page }) => {
    const firstItem = page.locator('app-recipe-items').first();
    await expect(firstItem.locator('h6')).toHaveText('Test Recipe');
    await expect(firstItem.locator('p')).toHaveText('A test recipe for e2e tests');
  });

  test('should show New Recipe button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'New Recipe' })).toBeVisible();
  });

  test('should navigate to /recipe/new when New Recipe is clicked', async ({ page }) => {
    await page.getByRole('button', { name: 'New Recipe' }).click();
    await expect(page).toHaveURL(/\/recipe\/new/);
  });
});
