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

test.describe('Recipe Detail', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/recipe/0');
    await page.waitForSelector('app-recipe-detail h2', { timeout: 10000 });
  });

  test('should display recipe name', async ({ page }) => {
    await expect(page.locator('app-recipe-detail h2')).toHaveText('Test Recipe');
  });

  test('should display recipe image', async ({ page }) => {
    await expect(page.locator('app-recipe-detail img')).toBeVisible();
  });

  test('should display recipe description', async ({ page }) => {
    await expect(page.locator('app-recipe-detail p')).toHaveText('A test recipe for e2e tests');
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
