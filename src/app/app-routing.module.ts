import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { RecipeCreateComponent } from "./recipe/recipe-create/recipe-create.component";
import { RecipeEditComponent } from "./recipe/recipe-edit/recipe-edit.component";
import { RecipeDetailComponent } from "./recipes/recipe-detail/recipe-detail.component";
import { RecipesComponent } from "./recipes/recipes.component";
import { ShoppingListComponent } from "./shopping-list/shopping-list.component";

const appRoutes: Routes = [
    {path: '', redirectTo: '/recipe', pathMatch: 'full'},
    {path: 'recipe', component: RecipesComponent, children: [
        {path: '', component: RecipeCreateComponent },
        {path: 'new', component: RecipeEditComponent },
        {path: ':id', component: RecipeDetailComponent },
        {path: ':id/edit', component: RecipeEditComponent },
    ]},
    {path: 'shopping-list', component: ShoppingListComponent},
]

@NgModule({
    //need to know why am I using this shit
    imports: [RouterModule.forRoot(appRoutes)],
    exports: [RouterModule]
})

export class AppRoutingModule {

}