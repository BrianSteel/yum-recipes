import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Ingredients } from '../shared/ingredient.model';
import { ShoppingListService } from './shopping-list.service';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.css'],
})
export class ShoppingListComponent implements OnInit, OnDestroy {

  ingredients: Ingredients[] = []
  private IngredientChangedSubject: Subscription;

  constructor(private shoppingListService: ShoppingListService ) { }

  ngOnInit(): void {
    this.ingredients = this.shoppingListService.getIngredients();
    this.IngredientChangedSubject = this.shoppingListService.changableIngredients.subscribe( (ingredients: Ingredients[]) => {
      this.ingredients = ingredients;
    })
  }

  ngOnDestroy(): void{
    this.IngredientChangedSubject.unsubscribe()
  }

  onEditItem( index: number){
    console.log('Working')
    this.shoppingListService.startedEditting.next(index);
  }

}
