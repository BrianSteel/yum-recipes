import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Ingredients } from 'src/app/shared/ingredient.model';
import { ShoppingListService } from '../shopping-list.service';

@Component({
  selector: 'app-shopping-edit',
  templateUrl: './shopping-edit.component.html',
  styleUrls: ['./shopping-edit.component.css']
})
export class ShoppingEditComponent implements OnInit, OnDestroy {

  @ViewChild('f') slListForm: NgForm
  subscriptionForEdit: Subscription;
  editMode = false;
  editedItemIndex: number;
  editedItem: Ingredients;

  constructor(private shoppingListService: ShoppingListService) { }

  ngOnInit(): void {
    this.subscriptionForEdit = this.shoppingListService.startedEditting.subscribe( (index: number) => {
      this.editedItemIndex = index
      this.editMode = true;
      this.editedItem = this.shoppingListService.getIngredient(index)
      this.slListForm.setValue({
        name: this.editedItem.name,
        amount: this.editedItem.amount
      })
    })
  }

  ngOnDestroy():void {
    this.subscriptionForEdit.unsubscribe();
  }

  onSubmitItem( form:NgForm ):void {
    const value = form.value;
    const newIngredient = new Ingredients(value.name, value.amount);
    if(this.editMode) {
      this.shoppingListService.updateIngredient(this.editedItemIndex, newIngredient)
    } else {
      this.shoppingListService.addIngredient(newIngredient)
    }
    this.editMode = false;
    form.reset();
  }


  clearInputs(){
    this.slListForm.reset();
    this.editMode = false;
  }

  onDeleteItem(){
    console.log(this.editedItemIndex)
    this.shoppingListService.deleteIngredient(this.editedItemIndex)
    this.clearInputs()
  }

}
