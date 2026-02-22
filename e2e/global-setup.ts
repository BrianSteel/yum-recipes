import { request } from '@playwright/test';

async function globalSetup() {
    const api = await request.newContext({ baseURL: 'http://localhost:80' });

    // fetch all shopping list items and delete them
    const res = await api.get('/api/shopping-list');
    const { ingredients } = await res.json();
    for (const item of ingredients) {
        await api.delete(`/api/shopping-list/${item._id}`);
    }

    // seed clean known state
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

export default globalSetup;
