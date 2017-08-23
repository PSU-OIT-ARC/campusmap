import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retry';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { environment } from '../environments/environment';


export class SearchResponse {
    results: any[];
    count: number;
}

export class SearchResult {
    id: number;
    name: string;
}

export class SearchError {
    status: number;
    message: string;
}


@Injectable()
export class SearchService {
    private currentRequest;
    private url = `${environment.apiURL}/search/`;

    public explicit = false;
    public error = new Subject<SearchError>();
    public results = new Subject<SearchResult[]>();
    public term = new Subject<string>();

    constructor (private http: HttpClient) {

    }

    search (term, explicit=false) {
        let url = this.url;
        let params = new HttpParams().set('q', term);
        this.explicit = explicit;
        return this._search(url, params);
    }

    searchById (id, explicit=false) {
        const url = `${this.url}${id}`;
        this.explicit = explicit;
        return this._search(url);
    }

    _search (url, params?) {
        if (this.currentRequest) {
            this.currentRequest.unsubscribe();
        }
        this.currentRequest = this.doSearchRequest(url, params).subscribe(
            results => this.results.next(results),
            error => this.error.next(error)
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

    setTerm (term) {
        this.term.next(term);
    }
}
