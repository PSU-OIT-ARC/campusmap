import { Component, ComponentFactoryResolver, OnDestroy, ViewChild } from '@angular/core';
import { MdSidenav } from '@angular/material';

import { SidenavBodyComponent } from './sidenav-body.component';
import { SidenavBodyDirective } from './sidenav-body.directive';
import { SidenavService } from './sidenav.service';
import { SidenavState } from './sidenav-state';


@Component({
    selector: 'psu-campusmap-sidenav',
    templateUrl: './sidenav.component.html',
    styleUrls: [
        './sidenav.component.scss'
    ],
})
export class SidenavComponent implements OnDestroy {
    private stateSubscription;
    private openStateSubscription;

    @ViewChild('sidenav')
    private sidenav: MdSidenav;

    @ViewChild(SidenavBodyDirective) bodyHost: SidenavBodyDirective;

    title: string;
    subtitle: string;
    context: any;

    constructor (
        private componentFactoryResolver: ComponentFactoryResolver,
        public sidenavService: SidenavService) {

        this.stateSubscription = sidenavService.state.subscribe(
            (state: SidenavState) => {
                this.updateContent(state.content);
                if (state.open) {
                    this.open();
                } else {
                    this.close();
                }
        });

        this.openStateSubscription = sidenavService.openState.subscribe(open => {
            if (open) {
                this.open();
            } else {
                this.close();
            }
        });
    }

    ngOnDestroy () {
        this.stateSubscription.unsubscribe();
        this.openStateSubscription.unsubscribe();
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
