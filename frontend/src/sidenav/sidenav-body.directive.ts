import { Directive, ViewContainerRef } from '@angular/core';


@Directive({
    selector: '[body-host]',
})
export class SidenavBodyDirective {
    constructor(public viewContainerRef: ViewContainerRef) {

    }
}

