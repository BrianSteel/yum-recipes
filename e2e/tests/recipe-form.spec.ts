import { test, expect, request } from '@playwright/test';

test.describe('Recipe Create Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/recipe/new');
    await expect(page).toHaveURL(/\/recipe\/new/);
  });

  test('should show the recipe form', async ({ page }) => {
    await expect(page.locator('form')).toBeVisible();
  });

  test('should disable Save button when form is empty', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  test('should enable Save button when all required fields are filled', async ({ page }) => {
    await page.locator('#name').fill('Test Recipe');
    await page.locator('#imageURL').fill('https://img.chefkoch-cdn.de/rezepte/393031127655461/bilder/1618353/crop-640x427/spaghetti-bolognese.jpg');
    await page.locator('#description').fill('A test description');
    await expect(page.getByRole('button', { name: 'Save' })).toBeEnabled();
  });

  test('should show image preview when a valid URL is entered', async ({ page }) => {
    await page.locator('#imageURL').fill('https://img.chefkoch-cdn.de/rezepte/393031127655461/bilder/1618353/crop-640x427/spaghetti-bolognese.jpg');
    await expect(page.locator('img[alt="preview"]')).toBeAttached();
  });

  test('should add an ingredient row when + Add Ingredient is clicked', async ({ page }) => {
    await page.getByRole('button', { name: '+ Add Ingredient' }).click();
    const ingredientRows = page.locator('[formArrayName="ingredients"] .row');
    await expect(ingredientRows).toHaveCount(1);
  });

  test('should add multiple ingredient rows', async ({ page }) => {
    await page.getByRole('button', { name: '+ Add Ingredient' }).click();
    await page.getByRole('button', { name: '+ Add Ingredient' }).click();
    await page.getByRole('button', { name: '+ Add Ingredient' }).click();
    const ingredientRows = page.locator('[formArrayName="ingredients"] .row');
    await expect(ingredientRows).toHaveCount(3);
  });

  test('should delete an ingredient row when trash icon is clicked', async ({ page }) => {
    await page.getByRole('button', { name: '+ Add Ingredient' }).click();
    await page.getByRole('button', { name: '+ Add Ingredient' }).click();
    await page.locator('[formArrayName="ingredients"] .row').first().locator('.bi-trash').click();
    const ingredientRows = page.locator('[formArrayName="ingredients"] .row');
    await expect(ingredientRows).toHaveCount(1);
  });

  test('should disable Save when ingredient amount is zero', async ({ page }) => {
    await page.locator('#name').fill('Test Recipe');
    await page.locator('#imageURL').fill('https://img.chefkoch-cdn.de/rezepte/393031127655461/bilder/1618353/crop-640x427/spaghetti-bolognese.jpg');
    await page.locator('#description').fill('A test description');
    await page.getByRole('button', { name: '+ Add Ingredient' }).click();
    await page.locator('[formControlName="amount"]').first().fill('0');
    await expect(page.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  test('Cancel button should navigate back to recipe list', async ({ page }) => {
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page).toHaveURL(/\/recipe/);
    await expect(page).not.toHaveURL(/\/new/);
  });

  test('should save a new recipe and show it in the list', async ({ page }) => {
    await page.locator('#name').fill('Playwright Test Recipe');
    await page.locator('#imageURL').fill('https://img.chefkoch-cdn.de/rezepte/393031127655461/bilder/1618353/crop-640x427/spaghetti-bolognese.jpg');
    await page.locator('#description').fill('Created by Playwright');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page).toHaveURL(/\/recipe/);
    await expect(page).not.toHaveURL(/\/new/);

    // cleanup: delete the created recipe
    const api = await request.newContext({ baseURL: 'http://localhost:80' });
    const res = await api.get('/api/recipes');
    const { recipes } = await res.json();
    for (const recipe of recipes.filter((r: any) => r.name === 'Playwright Test Recipe')) {
      await api.delete(`/api/recipe/${recipe._id}`);
    }
    await api.dispose();
  });
});

test.describe('Recipe Edit Form', () => {
  let editRecipeId: string;

  test.beforeAll(async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:80' });
    const res = await api.post('/api/recipes', {
      data: {
        name: 'Edit Test Recipe',
        desc: 'A recipe for edit form tests',
        imgPath: 'https://img.chefkoch-cdn.de/rezepte/393031127655461/bilder/1618353/crop-640x427/spaghetti-bolognese.jpg',
        ingredients: [{ name: 'Ingredient', amount: 1, unit: 'piece' }]
      }
    });
    const { recipe } = await res.json();
    editRecipeId = recipe._id;
    await api.dispose();
  });

  test.afterAll(async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:80' });
    await api.delete(`/api/recipe/${editRecipeId}`);
    await api.dispose();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/recipe/0');
    await page.waitForSelector('app-recipe-detail h2', { timeout: 10000 });
    await page.getByRole('button', { name: /Manage/i }).click();
    await page.getByText('Edit Recipe').click();
    await expect(page).toHaveURL(/\/recipe\/\d+\/edit/);
  });

  test('should pre-populate the form with existing recipe data', async ({ page }) => {
    await expect(page.locator('#name')).toHaveValue('Edit Test Recipe');
    await expect(page.locator('#imageURL')).not.toHaveValue('');
    await expect(page.locator('#description')).toHaveValue('A recipe for edit form tests');
  });

  test('should have Save button enabled when form is pre-populated', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Save' })).toBeEnabled();
  });

  test('should update recipe name and save', async ({ page }) => {
    await page.locator('#name').clear();
    await page.locator('#name').fill('Updated Recipe Name');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page).toHaveURL(/\/recipe\/\d+$/);
  });

  test('should disable Save when name is cleared', async ({ page }) => {
    await page.locator('#name').clear();
    await expect(page.getByRole('button', { name: 'Save' })).toBeDisabled();
  });
});
