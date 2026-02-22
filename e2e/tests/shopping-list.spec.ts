import { test, expect, request } from '@playwright/test';

const listItem = (page, name: string) =>
  page.locator('app-shopping-list ul li span').filter({ hasText: new RegExp(`^${name}$`) }).first();

test.describe('Shopping List', () => {
  async function resetDB() {
    const api = await request.newContext({ baseURL: 'http://localhost:80' });
    const res = await api.get('/api/shopping-list');
    const { ingredients } = await res.json();
    for (const item of ingredients) {
      await api.delete(`/api/shopping-list/${item._id}`);
    }
    const seeds = [
      { name: 'Apples', amount: 10 },
      { name: 'Oranges', amount: 20 },
      { name: 'Milk', amount: 2 },
      { name: 'Eggs', amount: 12 },
      { name: 'Bread', amount: 1 }
    ];
    for (const item of seeds) {
      await api.post('/api/shopping-list', { data: item });
    }
    await api.dispose();
  }

  test.beforeAll(async () => { await resetDB(); });
  test.afterAll(async () => { await resetDB(); });

  test.beforeEach(async ({ page }) => {
    await page.goto('/shopping-list');
    await page.waitForSelector('app-shopping-list ul li', { timeout: 10000 });
  });

  test('should display the shopping list page', async ({ page }) => {
    await expect(page.locator('app-shopping-list')).toBeVisible();
  });

  test('should load ingredients from the API', async ({ page }) => {
    await expect(page.locator('app-shopping-list ul li').first()).toBeVisible();
  });

  test('should show seeded ingredients (Apples and Oranges)', async ({ page }) => {
    await expect(listItem(page, 'Apples')).toBeVisible();
    await expect(listItem(page, 'Oranges')).toBeVisible();
  });

  test('should show the add ingredient form', async ({ page }) => {
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="amount"]')).toBeVisible();
  });

  test('should disable Add button when form is empty', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Add/i })).toBeDisabled();
  });

  test('should add a new ingredient', async ({ page }) => {
    await page.locator('input[name="name"]').fill('Tomatoes');
    await page.locator('input[name="amount"]').fill('5');
    await page.getByRole('button', { name: /Add/i }).click();
    await expect(listItem(page, 'Tomatoes')).toBeVisible();
  });

  test('should persist added ingredient after page reload', async ({ page }) => {
    await page.locator('input[name="name"]').fill('Persisted Item');
    await page.locator('input[name="amount"]').fill('3');
    await page.getByRole('button', { name: /Add/i }).click();
    await expect(listItem(page, 'Persisted Item')).toBeVisible();
    await page.reload();
    await page.waitForSelector('app-shopping-list ul li', { timeout: 10000 });
    await expect(listItem(page, 'Persisted Item')).toBeVisible();
  });

  test('should clear the form after adding an ingredient', async ({ page }) => {
    await page.locator('input[name="name"]').fill('Tomatoes');
    await page.locator('input[name="amount"]').fill('5');
    await page.getByRole('button', { name: /Add/i }).click();
    await expect(page.locator('input[name="name"]')).toHaveValue('');
    await expect(page.locator('input[name="amount"]')).toHaveValue('');
  });

  test('should populate form when an ingredient is clicked for editing', async ({ page }) => {
    await listItem(page, 'Apples').click();
    await expect(page.locator('input[name="name"]')).toHaveValue('Apples');
    await expect(page.locator('input[name="amount"]')).not.toHaveValue('');
  });

  test('should show Update and Delete buttons in edit mode', async ({ page }) => {
    await listItem(page, 'Apples').click();
    await expect(page.getByRole('button', { name: /Update/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Delete/i })).toBeVisible();
  });

  test('should update an ingredient and persist after reload', async ({ page }) => {
    await page.locator('input[name="name"]').fill('UpdateMe');
    await page.locator('input[name="amount"]').fill('1');
    await page.getByRole('button', { name: /Add/i }).click();
    await expect(listItem(page, 'UpdateMe')).toBeVisible();
    await listItem(page, 'UpdateMe').click();
    await page.locator('input[name="name"]').clear();
    await page.locator('input[name="name"]').fill('UpdatedItem');
    await page.getByRole('button', { name: /Update/i }).click();
    await expect(listItem(page, 'UpdatedItem')).toBeVisible();
    await page.reload();
    await page.waitForSelector('app-shopping-list ul li', { timeout: 10000 });
    await expect(listItem(page, 'UpdatedItem')).toBeVisible();
  });

  test('should delete an ingredient and not show after reload', async ({ page }) => {
    await page.locator('input[name="name"]').fill('ToDelete');
    await page.locator('input[name="amount"]').fill('1');
    await page.getByRole('button', { name: /Add/i }).click();
    await expect(listItem(page, 'ToDelete')).toBeVisible();
    await listItem(page, 'ToDelete').click();
    await page.getByRole('button', { name: /Delete/i }).click();
    await page.waitForSelector('app-shopping-list ul li', { timeout: 10000 });
    await expect(listItem(page, 'ToDelete')).not.toBeVisible();
    await page.reload();
    await page.waitForSelector('app-shopping-list ul li', { timeout: 10000 });
    await expect(listItem(page, 'ToDelete')).not.toBeVisible();
  });

  test('should clear the form when Clear button is clicked', async ({ page }) => {
    await page.locator('input[name="name"]').fill('Tomatoes');
    await page.locator('input[name="amount"]').fill('5');
    await page.getByRole('button', { name: /Clear/i }).click();
    await expect(page.locator('input[name="name"]')).toHaveValue('');
    await expect(page.locator('input[name="amount"]')).toHaveValue('');
  });

  test('should disable Add when amount is 0', async ({ page }) => {
    await page.locator('input[name="name"]').fill('Tomatoes');
    await page.locator('input[name="amount"]').fill('0');
    await expect(page.getByRole('button', { name: /Add/i })).toBeDisabled();
  });

  test('should disable Add when name is empty', async ({ page }) => {
    await page.locator('input[name="amount"]').fill('5');
    await expect(page.getByRole('button', { name: /Add/i })).toBeDisabled();
  });

  test('should exit edit mode and show Add button after Clear is clicked', async ({ page }) => {
    await listItem(page, 'Apples').click();
    await page.getByRole('button', { name: /Clear/i }).click();
    await expect(page.getByRole('button', { name: /Add/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Delete/i })).not.toBeVisible();
  });
});
