const mongoose = require('mongoose');

if (!process.env.MONGO_URI) {
    console.error('MONGO_URI environment variable is not set');
    process.exit(1);
}
mongoose.connect(process.env.MONGO_URI);

const ShoppingListModel = require('../models/shoppingListSchema');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async function () {
    console.log('MongoDB connected');

    const ingredients = [
        { name: 'Apples', amount: 10 },
        { name: 'Oranges', amount: 20 },
        { name: 'Milk', amount: 2 },
        { name: 'Eggs', amount: 12 },
        { name: 'Bread', amount: 1 }
    ];

    await ShoppingListModel.deleteMany({});
    console.log('Cleared existing shopping list');

    await ShoppingListModel.insertMany(ingredients);
    console.log(`Seeded ${ingredients.length} ingredients`);

    mongoose.connection.close();
    console.log('Done');
});
