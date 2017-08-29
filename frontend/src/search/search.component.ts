import { Component, ElementRef, Input } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/debounceTime';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import GeoJSONFormat from 'ol/format/geojson';

import { SidenavBodyComponent } from '../sidenav/sidenav-body.component';

import { Store } from '../store';

import { defaultMapProjectionCode, geographicProjectionCode } from '../constants';
import { environment } from '../environments/environment';


class SearchResponse {
    results: any[];
    count: number;
}

class SearchResult {
    id: number;
    name: string;
}

class SearchError {
    status: number;
    message: string;
}


@Component({
    selector: 'psu-campusmap-search',
    templateUrl: './search.component.html',
    styleUrls: [
        './search.component.scss'
    ]
})
export class SearchComponent {
    private url = `${environment.apiURL}/search/`;
    private searchTerms = new Subject<string>();
    private currentRequest;

    private geoJSONFormatter = new GeoJSONFormat({
        defaultDataProjection: geographicProjectionCode,
        featureProjection: defaultMapProjectionCode
    });

    public searchTerm = null;

    public error: SearchError;
    public results: SearchResult[];
    public showResults = false;


    constructor (
        private host: ElementRef,
        private http: HttpClient,
        private store: Store) {

        // this.store.subscribe('SEARCH.SEARCH_BY_ID', action => {
        //     this.searchById(action.id, action.explicit);
        // });

        this.searchTerms
            .debounceTime(200)
            .do(term => {
                if (term) {
                    this.search(term, false);
                } else {
                    this.error = null;
                    this.results = null;
                }
            })
            .subscribe();

        document.addEventListener('click', event => {
            this.showResults = this.host.nativeElement.contains(event.target);
        });
    }

    handleKeyUp (term): void {
        this.searchTerms.next(term);
    }

    search (term, explicit=false) {
        let url = this.url;
        let params = new HttpParams().set('q', term);
        return this._search(url, params, explicit);
    }

    searchById (id, explicit=false) {
        const url = `${this.url}${id}`;
        return this._search(url, null, explicit);
    }

    _search (url, params=null, explicit=false) {
        if (this.currentRequest) {
            this.currentRequest.unsubscribe();
        }
        this.currentRequest = this.doSearchRequest(url, params).subscribe(
            results => {
                this.error = null;
                this.results = results;
                if (explicit && results.length === 1) {
                    this.showResult(results[0]);
                }
            },
            error => {
                this.error = error;
                this.results = null;
            }
        );
        return this.currentRequest;
    }

    doSearchRequest (url, params?): Observable<SearchResult[]> {
        return this.http.get<SearchResponse>(url, { params })
            .map(response => {
                return response.results as SearchResult[];
            })
            .catch(error => {
                let message;
                if (error.status === 404) {
                    message = 'No results found';
                } else {
                    message = 'Unable to search at this time';
                }
                return Observable.throw({
                    status: error.status,
                    message: message
                });
            });
    }

    reset () {
        this.error = null;
        this.results = null;
        this.showResults = false;
        this.searchTerms.next(null);
        this.store.dispatch('SIDENAV.CLOSE');
        this.store.dispatch('MAP.CLEAR_SELECTED_FEATURE');
    }

    showResult (result) {
        const feature = this.geoJSONFormatter.readFeature(result.geom);
        const threshold = { top: 50, right: 50, bottom: 50, left: 450 };

        this.results = [result];
        this.showResults = false;
        this.searchTerm = result.name;

        this.store.dispatch('SIDENAV.SET_CONTENT', {
            title: result.name,
            subtitle: result.code,
            bodyComponent: SearchResultComponent,
            bodyContext: result
        });
        this.store.dispatch('SIDENAV.OPEN');
        this.store.dispatch('MAP.CENTER_ON_FEATURE', { feature, threshold});
        this.store.dispatch('MAP.SELECT_FEATURE', { feature });
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
