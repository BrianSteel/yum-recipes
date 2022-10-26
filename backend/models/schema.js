const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    id: {type: Number, required: false},
    name: {type: String, required: true},
    description: { type: String, required: true },
    imagePath: { type: String, required: true },
    ingredients: { type: Array, required: true }
})

module.exports = mongoose.model('Recipe', recipeSchema);