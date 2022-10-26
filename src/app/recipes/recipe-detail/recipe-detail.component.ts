import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Recipe } from '../recipe.model';
import { RecipeService } from '../recipe.service';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css']
})
export class RecipeDetailComponent implements OnInit, OnDestroy {

  recipe: Recipe;
  id: number;
  paramsSubscription: Subscription;
  constructor(private recipeService: RecipeService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.paramsSubscription = this.route.params.subscribe( (params: Params) => {
      this.id = +params.id;
      this.recipe = this.recipeService.getRecipeByID(this.id)
    })
  }

  ngOnDestroy(){
    this.paramsSubscription.unsubscribe();
  }

  onAddToShoppingList(){
    this.recipeService.addIngredientsToShoppingList(this.recipe.ingredients)
  }

  onEditRecipe(){
    //this.router.navigate(['edit'], {relativeTo: this.route})
    this.router.navigate(['../', this.id, 'edit'], {relativeTo: this.route})
  }

  onDeleteRecipe(){
    this.recipeService.deleteRecipe(this.id);
    this.router.navigate(['/recipe'])
  }

}
