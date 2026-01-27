const express = require('express');
const mongoose = require('mongoose');

const app = express();

const RecipeModel = require('./models/schema')

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS, DELETE')
    next();
})

app.use(express.json())

app.post('/api/recipes', (req, res, next) => {
    const recipe = new RecipeModel({
        name: req.body.name,
        description: req.body.desc,
        imagePath: req.body.imgPath,
        ingredients: req.body.ingredients,
    });
    recipe.save();
    res.status(201).json({
        message: 'success'
    })
})

app.get('/api/recipes', (req, res, next) => {
    RecipeModel.find().then(docs => {
        res.status(201).json({
            message: "Success",
            recipes: docs,
        })
    }).catch((e) => {
        console.log("Error fetching recipes: ", e)
    })
})

app.put('/api/recipe', (req, res, next) => {
    let newRecipe = {
        name: req.body.name,
        description: req.body.desc,
        imagePath: req.body.imgPath,
        ingredients: req.body.ingredients,
    }
    RecipeModel.findByIdAndUpdate(req.body.id, newRecipe, (err, docs) => {
        if (err) {
            console.log("Error updating recipe: ", err)
        } else {
            res.status(201).json({
                message: "Success",
                recipes: docs,
            })
        }
    })
})

module.exports = app;
