import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";


import { Ingredients } from "../shared/ingredient.model";
import { Recipe } from "./recipe.model";
import { ShoppingListService } from "../shopping-list/shopping-list.service"
import { HttpClient } from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})
export class RecipeService {
    
    recipesChanged = new Subject<Recipe[]>()

    private Recipes: Recipe[] = [];

    constructor(private slService: ShoppingListService, private http: HttpClient){}
    getRecipes(){
        this.http.get<{ message: string, recipes: any}>('http://localhost:3000/api/recipes')
        .pipe(map(recipeData => {
            return recipeData.recipes.map( recipe => {
                return {
                    name: recipe.name,
                    desc: recipe.description,
                    imgPath: recipe.imagePath,
                    ingredients: recipe.ingredients,
                    id: recipe._id
                }
            })
        }))
        .subscribe( (recipeData) => {
            this.Recipes = recipeData;
            this.recipesChanged.next(this.Recipes)
        });
    }

    getRecipeByID(index: number){
        return this.Recipes[index]
    }

    addIngredientsToShoppingList(ingredients: Ingredients[]){
        this.slService.addIngredients(ingredients);
    }

    addRecipe( recipe: Recipe) {
        this.http.post<{message: string}>('http://localhost:3000/api/recipes', recipe).subscribe(()=> {
        this.Recipes.push(recipe)
        this.recipesChanged.next(this.Recipes.slice())
        })
    }

    updateRecipe( index: number, new_recipe: Recipe ){
        this.http.put<{message: string}>('http://localhost:3000/api/recipe', new_recipe).subscribe((data) => {
            console.log(data)
            this.Recipes[index] = new_recipe;
            this.recipesChanged.next(this.Recipes.slice())
        })
    }

    deleteRecipe( index:number ) {
        this.Recipes.splice(index, 1);
        this.recipesChanged.next(this.Recipes.slice());
    }
}