import { Ingredients } from "../shared/ingredient.model";

export class Recipe {
    constructor(public name: string, public desc: string, public imgPath: string, public ingredients: Ingredients[], public id?: number) { }
}