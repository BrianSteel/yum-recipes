import { request } from '@playwright/test';

async function globalSetup() {
    const api = await request.newContext({ baseURL: 'http://localhost:80' });

    // clear all recipes
    const recipesRes = await api.get('/api/recipes');
    const { recipes } = await recipesRes.json();
    for (const recipe of recipes) {
        await api.delete(`/api/recipe/${recipe._id}`);
    }

    // clear all shopping list items
    const shoppingRes = await api.get('/api/shopping-list');
    const { ingredients } = await shoppingRes.json();
    for (const item of ingredients) {
        await api.delete(`/api/shopping-list/${item._id}`);
    }

    await api.dispose();
}

export default globalSetup;
