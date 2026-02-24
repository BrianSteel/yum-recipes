const express = require('express');
const mongoose = require('mongoose');

const app = express();

const RecipeModel = require('./models/schema')
const ShoppingListModel = require('./models/shoppingListSchema')

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS, DELETE')
    next();
})

app.use(express.json())

app.post('/api/recipes', async (req, res, next) => {
    const recipe = new RecipeModel({
        name: req.body.name,
        description: req.body.desc,
        imagePath: req.body.imgPath,
        ingredients: req.body.ingredients,
    });
    try {
        const doc = await recipe.save();
        res.status(201).json({ message: 'success', recipe: doc })
    } catch (e) {
        res.status(500).json({ message: 'Error saving recipe', error: e.message })
    }
})

app.get('/api/recipes', (req, res, next) => {
    RecipeModel.find().then(docs => {
        res.status(200).json({
            message: "Success",
            recipes: docs,
        })
    }).catch((e) => {
        console.log("Error fetching recipes: ", e)
    })
})

app.put('/api/recipe/:id', async (req, res, next) => {
    let newRecipe = {
        name: req.body.name,
        description: req.body.desc,
        imagePath: req.body.imgPath,
        ingredients: req.body.ingredients,
    }
    try {
        const doc = await RecipeModel.findByIdAndUpdate(req.params.id, newRecipe, { new: true });
        res.status(200).json({ message: "Success", recipe: doc })
    } catch (e) {
        res.status(500).json({ message: 'Error updating recipe', error: e.message })
    }
})

app.delete('/api/recipe/:id', async (req, res, next) => {
    try {
        await RecipeModel.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Success' })
    } catch (e) {
        res.status(500).json({ message: 'Error deleting recipe', error: e.message })
    }
})

app.get('/api/shopping-list', (req, res) => {
    ShoppingListModel.find().then(docs => {
        res.status(200).json({ message: 'Success', ingredients: docs })
    }).catch(e => console.log('Error fetching shopping list:', e))
})

app.post('/api/shopping-list', (req, res) => {
    const ingredient = new ShoppingListModel({
        name: req.body.name,
        amount: req.body.amount
    });
    ingredient.save().then(doc => {
        res.status(201).json({ message: 'Success', ingredient: doc })
    }).catch(e => console.log('Error saving ingredient:', e))
})

app.put('/api/shopping-list/:id', (req, res) => {
    ShoppingListModel.findByIdAndUpdate(
        req.params.id,
        { name: req.body.name, amount: req.body.amount },
        { new: true }
    ).then(doc => {
        res.status(200).json({ message: 'Success', ingredient: doc })
    }).catch(e => console.log('Error updating ingredient:', e))
})

app.delete('/api/shopping-list/:id', (req, res) => {
    ShoppingListModel.findByIdAndDelete(req.params.id)
        .then(() => res.status(200).json({ message: 'Success' }))
        .catch(e => console.log('Error deleting ingredient:', e))
})

module.exports = app;
