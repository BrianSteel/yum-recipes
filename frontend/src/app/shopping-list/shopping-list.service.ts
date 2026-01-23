import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { Ingredients } from '../shared/ingredient.model';

@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {

  changableIngredients = new Subject<Ingredients[]>();
  startedEditting = new Subject<number>();

  ingredients: Ingredients[] = [
    new Ingredients('Apples', 10),
    new Ingredients('Oranges', 20)
  ]

  constructor() { }

  getIngredient( index: number ){
    return this.ingredients[index]
  }

  getIngredients(){
    return Array.from(this.ingredients);
  }

  addIngredient(ingredient: Ingredients){
    this.ingredients.push(ingredient);
    this.changableIngredients.next(this.ingredients.slice())
  }

  addIngredients(ingredients: Ingredients[]){
    this.ingredients.push(...ingredients)
  }

  updateIngredient( index: number, newIngredient: Ingredients ) {
    this.ingredients[index] = newIngredient;
    this.changableIngredients.next(this.ingredients.slice())
  }

  deleteIngredient( index: number) {
    this.ingredients.splice( index, 1 );
    this.changableIngredients.next(this.ingredients.slice())
  }

}
