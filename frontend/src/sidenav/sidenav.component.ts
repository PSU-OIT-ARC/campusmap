import { Component, ComponentFactoryResolver, ViewChild } from '@angular/core';
import { MdSidenav } from '@angular/material';

import { Store } from '../store';

import { SidenavBodyComponent } from './sidenav-body.component';
import { SidenavBodyDirective } from './sidenav-body.directive';


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
        private store: Store) {

        // store.subscribe('SIDENAV.OPEN', action => this.open());
        // store.subscribe('SIDENAV.CLOSE', action => this.close());
        // store.subscribe('SIDENAV.SET_CONTENT', action => this.updateContent(action.content));
    }

    open () {
        this.sidenav.open();
    }

    close () {
        this.sidenav.close();
    }

    getComponentFactory (component) {
        return this.componentFactoryResolver.resolveComponentFactory(component);
    }

    updateContent (content) {
        const bodyComponent = content.bodyComponent;
        const bodyContext = content.bodyContext;

        const viewContainerRef = this.bodyHost.viewContainerRef;
        viewContainerRef.clear();

        const componentFactory = this.getComponentFactory(bodyComponent);
        const componentRef = viewContainerRef.createComponent(componentFactory);
        const instance = <SidenavBodyComponent>componentRef.instance;

        this.title = content.title;
        this.subtitle = content.subtitle;
        instance.context = bodyContext;
    }
}
