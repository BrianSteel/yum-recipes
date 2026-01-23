import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { RecipeService } from 'src/app/recipes/recipe.service';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.css']
})
export class RecipeEditComponent implements OnInit, OnDestroy {

  id: number;
  editMode: boolean = false;
  paramsSubscription: Subscription;
  recipeForm: FormGroup;

  constructor(private route: ActivatedRoute, private recipeService: RecipeService, private router: Router) { }

  ngOnInit(): void {
    this.paramsSubscription = this.route.params.subscribe( (params: Params) => {
      this.id = +params.id;
      this.editMode = params.id !== undefined;
      this.initForm();
    })
  }

  ngOnDestroy(){
    this.paramsSubscription.unsubscribe()
  }

  private initForm(){
    
    let recipeName = "";
    let recipeImage = "";
    let recipeDesc = "";
    let recipeIngredients = new FormArray([]);

    if(this.editMode){
      const recipe = this.recipeService.getRecipeByID(this.id)
      recipeName = recipe.name;
      recipeImage = recipe.imgPath;
      recipeDesc = recipe.desc;
      if(recipe['ingredients']) {
        for (let ingredient of recipe.ingredients){
          recipeIngredients.push(
            new FormGroup({
              'name': new FormControl(ingredient.name, Validators.required),
              'amount': new FormControl(ingredient.amount, [ Validators.required, Validators.pattern(/^[1-9]+[0-9]*$/) ]),
            })
          )
        }
      }
    }

    this.recipeForm = new FormGroup({
      'name': new FormControl(recipeName, Validators.required),
      'imgPath': new FormControl(recipeImage, Validators.required),
      'desc': new FormControl(recipeDesc, Validators.required),
      'ingredients': recipeIngredients
    })
  }

  onSubmit(){
    // const new_recipe = new Recipe (
    //   this.recipeForm.value['name'],
    //   this.recipeForm.value['desc'],
    //   this.recipeForm.value['imgPath'],
    //   this.recipeForm.value['ingredients']
    // )

    if(this.editMode) {
      //this.recipeService.updateRecipe(this.id, new_recipe)
      this.recipeService.updateRecipe(this.id, this.recipeForm.value)
    } else {
      //this.recipeService.addRecipe(new_recipe)
      this.recipeService.addRecipe(this.recipeForm.value)
    }
    this.onCancel();
  }

  onAddIngredients(){
    (<FormArray>this.recipeForm.get('ingredients')).push(
      new FormGroup ({
        name: new FormControl(null, Validators.required),
        amount: new FormControl(null, [ Validators.required, Validators.pattern(/^[1-9]+[0-9]*$/) ])
      })
    )
  }

  onCancel(){
    this.router.navigate(['../'], { relativeTo: this.route})
  }

  onDeleteIngredient( index: number ){
    (<FormArray>this.recipeForm.get('ingredients')).removeAt(index)
  }

}
