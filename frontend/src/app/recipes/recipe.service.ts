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
        this.http.get<{ message: string, recipes: any}>('/api/recipes')
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
        this.http.post<{message: string, recipe: any}>('/api/recipes', recipe).subscribe((data) => {
            recipe.id = data.recipe._id;
            this.Recipes.push(recipe);
            this.recipesChanged.next(this.Recipes.slice());
        })
    }

    updateRecipe( index: number, new_recipe: Recipe ){
        this.http.put<{message: string}>(`/api/recipe/${new_recipe.id}`, new_recipe).subscribe(() => {
            this.Recipes[index] = new_recipe;
            this.recipesChanged.next(this.Recipes.slice());
        })
    }

    deleteRecipe( index:number ) {
        const id = this.Recipes[index].id;
        this.http.delete(`/api/recipe/${id}`).subscribe(() => {
            this.Recipes.splice(index, 1);
            this.recipesChanged.next(this.Recipes.slice());
        })
    }
}