import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

import { Ingredients } from '../shared/ingredient.model';

@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {

  changableIngredients = new Subject<Ingredients[]>();
  startedEditting = new Subject<number>();

  ingredients: Ingredients[] = [];

  constructor(private http: HttpClient) {}

  fetchIngredients() {
    this.http.get<{ message: string, ingredients: any[] }>('/api/shopping-list')
      .subscribe(res => {
        this.ingredients = res.ingredients.map(i => new Ingredients(i.name, i.amount, i._id));
        this.changableIngredients.next(this.ingredients.slice());
      });
  }

  getIngredient(index: number) {
    return this.ingredients[index];
  }

  getIngredients() {
    return Array.from(this.ingredients);
  }

  addIngredient(ingredient: Ingredients) {
    this.http.post<{ message: string, ingredient: any }>('/api/shopping-list', {
      name: ingredient.name,
      amount: ingredient.amount
    }).subscribe(res => {
      this.ingredients.push(new Ingredients(res.ingredient.name, res.ingredient.amount, res.ingredient._id));
      this.changableIngredients.next(this.ingredients.slice());
    });
  }

  addIngredients(ingredients: Ingredients[]) {
    ingredients.forEach(i => this.addIngredient(i));
  }

  updateIngredient(index: number, newIngredient: Ingredients) {
    const id = this.ingredients[index].id;
    this.http.put<{ message: string, ingredient: any }>(`/api/shopping-list/${id}`, {
      name: newIngredient.name,
      amount: newIngredient.amount
    }).subscribe(res => {
      this.ingredients[index] = new Ingredients(res.ingredient.name, res.ingredient.amount, res.ingredient._id);
      this.changableIngredients.next(this.ingredients.slice());
    });
  }

  deleteIngredient(index: number) {
    const id = this.ingredients[index].id;
    this.http.delete(`/api/shopping-list/${id}`).subscribe(() => {
      this.ingredients.splice(index, 1);
      this.changableIngredients.next(this.ingredients.slice());
    });
  }
}
