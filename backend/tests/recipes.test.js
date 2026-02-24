const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    // Clear all collections between tests
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});

describe('GET /api/recipes', () => {
    it('should return 200 with empty recipes array when no recipes exist', async () => {
        const res = await request(app).get('/api/recipes');
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Success');
        expect(res.body.recipes).toEqual([]);
    });

    it('should return seeded recipes', async () => {
        // Seed a recipe first
        await request(app).post('/api/recipes').send({
            name: 'Test Recipe',
            desc: 'A test description',
            imgPath: 'http://example.com/image.jpg',
            ingredients: [{ name: 'Salt', amount: 1, unit: 'tsp' }]
        });

        const res = await request(app).get('/api/recipes');
        expect(res.status).toBe(200);
        expect(res.body.recipes.length).toBe(1);
        expect(res.body.recipes[0].name).toBe('Test Recipe');
    });
});

describe('POST /api/recipes', () => {
    it('should create a recipe and return 201', async () => {
        const res = await request(app).post('/api/recipes').send({
            name: 'Spaghetti Bolognese',
            desc: 'A classic Italian dish',
            imgPath: 'http://example.com/spaghetti.jpg',
            ingredients: [
                { name: 'Spaghetti', amount: 200, unit: 'g' },
                { name: 'Ground Beef', amount: 300, unit: 'g' }
            ]
        });

        expect(res.status).toBe(201);
        expect(res.body.message).toBe('success');
    });

    it('should persist the recipe to the database', async () => {
        await request(app).post('/api/recipes').send({
            name: 'Caesar Salad',
            desc: 'Fresh salad',
            imgPath: 'http://example.com/salad.jpg',
            ingredients: [{ name: 'Lettuce', amount: 1, unit: 'head' }]
        });

        const res = await request(app).get('/api/recipes');
        expect(res.body.recipes.length).toBe(1);
        expect(res.body.recipes[0].name).toBe('Caesar Salad');
    });
});
