import { Component, ElementRef, Input, OnInit } from '@angular/core';

import 'rxjs/add/operator/do';
import 'rxjs/add/operator/debounceTime';
import { Subject } from 'rxjs/Subject';

import GeoJSONFormat from 'ol/format/geojson';

import { MapService } from '../map/map.service';
import { SidenavService } from '../sidenav/sidenav.service';
import { SearchError, SearchResult, SearchService } from './search.service';
import { SidenavBodyComponent } from '../sidenav/sidenav-body.component';

import { environment } from '../environments/environment';


@Component({
    selector: 'psu-campusmap-search',
    templateUrl: './search.component.html',
    styleUrls: [
        './search.component.scss'
    ]
})
export class SearchComponent implements OnInit {
    private searchTerms = new Subject<string>();

    private geoJSONFormatter = new GeoJSONFormat({
        defaultDataProjection: 'EPSG:4326',
        featureProjection: environment.map.projectionCode
    });

    public searchTerm = null;

    public error: SearchError;
    public results: SearchResult[];
    public showResults = false;


    constructor (
        private host: ElementRef,
        private mapService: MapService,
        private sidenavService: SidenavService,
        private searchService: SearchService) {

    }

    ngOnInit (): void {
        this.searchService.error.subscribe(error => {
            this.error = error;
            this.results = null;
        });

        this.searchService.results.subscribe(results => {
            this.error = null;
            this.results = results;
            if (this.searchService.explicit && results.length === 1) {
                this.showResult(results[0]);
            }
        });

        this.searchService.term.subscribe(term => this.searchTerm = term);

        this.searchTerms
            .debounceTime(200)
            .do(term => this.search(term, false))
            .subscribe();

        document.addEventListener('click', event => {
            this.showResults = this.host.nativeElement.contains(event.target);
        });
    }

    handleKeyUp (term): void {
        this.searchTerms.next(term);
    }

    search (term, explicit=false) {
        this.error = null;
        this.results = null;
        if (term) {
            this.searchService.search(term, explicit);
        }
    }

    reset () {
        this.error = null;
        this.results = null;
        this.showResults = false;
        this.searchTerms.next(null);
        this.sidenavService.close();
        this.mapService.selectFeature('select', null);
    }

    showResult (result) {
        const feature = this.geoJSONFormatter.readFeature(result.geom)
        this.results = [result];
        this.showResults = false;
        this.searchService.setTerm(result.name);

        this.sidenavService.setState({
            content: {
                title: result.name,
                subtitle: result.code,
                bodyComponent: SearchResultComponent,
                bodyContext: result
            },
            open: true
        });

        this.mapService.centerMapOnFeature(feature, { top: 50, right: 50, bottom: 50, left: 450 });
        this.mapService.selectFeature('select', feature);
    }
}


@Component({
    selector: 'psu-campusmap-search-result',
    templateUrl: './search.result.html',
    styles: [`
        .search-result {
            padding: 0 16px;
        }
    `]
})
export class SearchResultComponent implements SidenavBodyComponent {
    @Input() context: any;
}
