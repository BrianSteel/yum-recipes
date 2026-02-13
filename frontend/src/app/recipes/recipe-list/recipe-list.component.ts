import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Recipe } from '../recipe.model';
import { RecipeService } from '../recipe.service';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css']
})
export class RecipeListComponent implements OnInit, OnDestroy {

  Subscription: Subscription;
  Recipes: Recipe[];

  constructor(private RecipeService: RecipeService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.RecipeService.getRecipes();
    this.Subscription = this.RecipeService.recipesChanged.subscribe((recipes: Recipe[]) => {
      this.Recipes = recipes;
      if (recipes.length > 0 && this.router.url === '/recipe') {
        this.router.navigate(['0'], { relativeTo: this.route });
      }
    });
  }

  onNewRecipe(){
    this.router.navigate(['new'], {relativeTo: this.route})
  }

  ngOnDestroy():void {
    this.Subscription.unsubscribe()
  }

}
