import { Component, Input, OnInit } from '@angular/core';
import { Recipe } from '../../recipe.model';

@Component({
  selector: 'app-recipe-items',
  templateUrl: './recipe-items.component.html',
  styleUrls: ['./recipe-items.component.css']
})
export class RecipeItemsComponent implements OnInit {
  @Input() recipeItem: Recipe
  @Input() index: number;
  constructor() { }

  ngOnInit(): void {
  }
}
