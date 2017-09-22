import { Component, ElementRef, OnInit } from '@angular/core';

@Component({
    selector: 'psu-campusmap-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    constructor (private host: ElementRef) {

    }

    ngOnInit () {
        const el = this.host.nativeElement;
        const sidenavContainer = el.querySelector('md-sidenav-container.container');
        sidenavContainer.querySelector('.mat-drawer-backdrop').remove();
    }
}
