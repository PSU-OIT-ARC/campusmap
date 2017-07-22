import { Component, Input, OnInit } from '@angular/core';

import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { SidenavService } from '../sidenav/sidenav.service';
import { SearchResult, SearchService } from './search.service';
import { SidenavBodyComponent } from '../sidenav/sidenav-body.component';


@Component({
    selector: 'psu-campusmap-search',
    templateUrl: './search.component.html',
    styleUrls: [
        './search.component.scss'
    ],
    providers: [
        SearchService
    ]
})
export class SearchComponent implements OnInit {
    private searchTerms = new Subject<string>();

    results: Observable<SearchResult[]>;

    error: {
        status: number,
        message: string
    };

    constructor (
        private sidenavService: SidenavService,
        private searchService: SearchService) {

    }

    ngOnInit (): void {
        this.results = this.searchTerms
            .debounceTime(300)
            .distinctUntilChanged()
            .switchMap(term => {
                if (term) {
                    return this.searchService.search(term)
                        .map(results => {
                            this.error = null;
                            this.sidenavService.setState({
                                content: {
                                    bodyComponent: SearchResultsComponent,
                                    bodyContext: {
                                        results: results,
                                        ess: results.length === 1 ? '' : 's'
                                    }
                                },
                                open: true,
                                closeable: false
                            });
                            return results;
                        })
                        .catch(error => {
                            this.error = error;
                            this.sidenavService.setState({
                                content: {
                                    bodyComponent: SearchErrorComponent,
                                    bodyContext: {
                                        error: error
                                    }
                                },
                                open: true,
                                closeable: false
                            });
                            return [];
                        });
                }
                this.error = null;
                return [];
            });
        this.results.subscribe();
    }

    search (term: string): void {
        this.searchTerms.next(term);
    }

    reset () {
        this.searchTerms.next(null);
        this.sidenavService.close();
    }
}


@Component({
    selector: 'psu-campusmap-search-results',
    templateUrl: './search.results.html'
})
export class SearchResultsComponent implements SidenavBodyComponent {
    @Input() context: any;
}


@Component({
    selector: 'psu-campusmap-search-error',
    template: '<div class="error">{{ context.error.message }}</div>',
    styles: [
        '.error { color: red; }'
    ]
})
export class SearchErrorComponent implements SidenavBodyComponent {
    @Input() context: any;
}
