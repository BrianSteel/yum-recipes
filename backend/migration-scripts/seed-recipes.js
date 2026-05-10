const mongoose = require('mongoose');

if (!process.env.MONGO_URI) {
    console.error('MONGO_URI environment variable is not set');
    process.exit(1);
}
mongoose.connect(process.env.MONGO_URI);

const RecipeModel = require('../models/schema');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async function () {
    console.log('MongoDB connected');

    const recipes = [
        {
            name: 'Spaghetti Bolognese',
            description: 'A classic Italian pasta dish with a rich meat sauce.',
            imagePath: 'https://img.chefkoch-cdn.de/rezepte/393031127655461/bilder/1618353/crop-640x427/spaghetti-bolognese.jpg',
            ingredients: [
                { name: 'Spaghetti', amount: 200, unit: 'g' },
                { name: 'Ground Beef', amount: 300, unit: 'g' },
                { name: 'Tomato Sauce', amount: 200, unit: 'ml' },
                { name: 'Onion', amount: 1, unit: 'piece' },
                { name: 'Garlic', amount: 2, unit: 'cloves' }
            ]
        },
        {
            name: 'Chicken Stir Fry',
            description: 'A quick and healthy stir fry with vegetables and chicken.',
            imagePath: 'https://www.allrecipes.com/thmb/xvlRRhK5ldXuGcXad8XDM5tTAfE=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/223382_chicken-stir-fry_Rita-1x1-1-b6b835ccfc714bb6a8391a7c47a06a84.jpg',
            ingredients: [
                { name: 'Chicken Breast', amount: 400, unit: 'g' },
                { name: 'Bell Pepper', amount: 2, unit: 'pieces' },
                { name: 'Broccoli', amount: 200, unit: 'g' },
                { name: 'Soy Sauce', amount: 3, unit: 'tbsp' },
                { name: 'Vegetable Oil', amount: 2, unit: 'tbsp' }
            ]
        },
        {
            name: 'Caesar Salad',
            description: 'A fresh salad with romaine lettuce, croutons and Caesar dressing.',
            imagePath: 'https://img.chefkoch-cdn.de/rezepte/956701201250684/bilder/1616492/crop-640x427/caesar-salad.jpg',
            ingredients: [
                { name: 'Romaine Lettuce', amount: 1, unit: 'head' },
                { name: 'Parmesan Cheese', amount: 50, unit: 'g' },
                { name: 'Croutons', amount: 100, unit: 'g' },
                { name: 'Caesar Dressing', amount: 4, unit: 'tbsp' }
            ]
        }
    ];

    await RecipeModel.deleteMany({});
    console.log('Cleared existing recipes');

    await RecipeModel.insertMany(recipes);
    console.log(`Seeded ${recipes.length} recipes`);

    mongoose.connection.close();
    console.log('Done');
});
