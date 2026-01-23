/* 
 *
 *Directives affect the way the HTML DOM, change the properties of the element like color or any css etc.
 *
*/

import { Directive, ElementRef, HostListener, Input, Renderer2 } from "@angular/core";

@Directive({
    selector: '[appDropdown]'
})
export class DropDownDirective {

    //this is the way to have property binding values or what we call props in vue.
    //in this way we pass down the value for usage here.
    @Input('appDropdown') index: number;

    //elementRef gives us access to the HTML Element like the tags and the complete reference to their tree of children.
    constructor(private elementRef: ElementRef, private theRenderer: Renderer2) { }

    @HostListener('click') toggleOpen(eventData: Event) {
        // console.log(eventData) //comes undefined
        const elements = this.elementRef.nativeElement.querySelectorAll('.show')
        if (elements.length > 0) {
            this.theRenderer.removeClass(this.elementRef.nativeElement.children[this.index], "show");
        } else {
            this.theRenderer.addClass(this.elementRef.nativeElement.children[this.index], "show");
        }
    }

  
   
}