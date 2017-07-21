import { Component, OnDestroy, ViewChild } from '@angular/core';
import { MdSidenav } from '@angular/material';

import { SidenavService } from './sidenav.service';


@Component({
    selector: 'psu-campusmap-sidenav',
    templateUrl: './sidenav.component.html',
    styleUrls: [
        './sidenav.component.scss'
    ],
})
export class SidenavComponent implements OnDestroy {
    private contentStateSubscription;
    private openStateSubscription;

    @ViewChild('sidenav')
    private sidenav: MdSidenav;

    isOpen = false;

    data: {
        title?: string;
        subtitle?: string;
        body: string;
    };

    constructor (public sidenavService: SidenavService) {
        this.contentStateSubscription = sidenavService.contentState.subscribe(state => {
            this.data = {
                title: state.title,
                subtitle: state.subtitle,
                body: state.body
            }
        });

        this.openStateSubscription = sidenavService.openState.subscribe(isOpen => {
            this.isOpen = isOpen;
            if (isOpen) {
                this.sidenav.open();
            } else {
                this.sidenav.close();
            }
        });
    }

    ngOnDestroy () {
        this.contentStateSubscription.unsubscribe();
        this.openStateSubscription.unsubscribe();
    }
}
