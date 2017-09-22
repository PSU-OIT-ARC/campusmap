import { Component, ComponentFactoryResolver, ViewChild } from '@angular/core';
import { MdSidenav } from '@angular/material';

import { SidenavBodyComponent } from './sidenav-body.component';
import { SidenavBodyDirective } from './sidenav-body.directive';

import { SidenavActions } from './sidenav.actions';


@Component({
    selector: 'psu-campusmap-sidenav',
    templateUrl: './sidenav.component.html',
    styleUrls: [
        './sidenav.component.scss'
    ],
})
export class SidenavComponent {

    @ViewChild('sidenav')
    private sidenav: MdSidenav;

    @ViewChild(SidenavBodyDirective) bodyHost: SidenavBodyDirective;

    title: string;
    subtitle: string;
    context: any;

    constructor (
        private componentFactoryResolver: ComponentFactoryResolver,
        protected actions: SidenavActions) {

    }

    open () {
        this.actions.open();
    }

    close () {
        this.actions.close();
    }

    setContent (bodyComponent, bodyContext, title?, subtitle?) {
        this.actions.setContent(bodyComponent, bodyContext, title, subtitle);

        // const viewContainerRef = this.bodyHost.viewContainerRef;
        // viewContainerRef.clear();
        //
        // const resolver = this.componentFactoryResolver;
        // const componentFactory = resolver.resolveComponentFactory(bodyComponent);
        // const componentRef = viewContainerRef.createComponent(componentFactory);
        // const instance = <SidenavBodyComponent>componentRef.instance;
        //
        // this.title = title;
        // this.subtitle = subtitle;
        // instance.context = bodyContext;
    }
}
