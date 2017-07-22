import { Component, Input } from '@angular/core';

import { SidenavBodyComponent } from '../sidenav/sidenav-body.component';


@Component({
    selector: 'psu-campusmap-feature-info',
    template: `
        <div class="feature-info">
            <p *ngIf="context.address">{{ context.address }}</p>
            <p *ngIf="context.buildingHref">
                <a href="{{ context.buildingHref }}">Building info & floorplans</a>
            </p>
        </div>
    `,
    styles: [
        '.feature-info { padding: 0 16px; }'
    ]
})
export class MapFeatureInfoComponent implements SidenavBodyComponent {
    @Input() context: any;
}
