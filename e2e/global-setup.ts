import { request, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
    const { baseURL } = config.projects[0].use;
    const api = await request.newContext({ baseURL });

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
