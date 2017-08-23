import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

import { environment } from '../environments/environment';


export class SearchResponse {
    results: any[];
    count: number;
}

export class SearchResult {
    id: number;
    name: string;
}

@Injectable()
export class SearchService {
    url = `${environment.apiURL}/search/`;

    constructor (private http: HttpClient) {

    }

    search (term): Observable<SearchResult[]> {
        let url = this.url;
        let params = new HttpParams().set('q', term);
        return this.http.get<SearchResponse>(url, { params })
            .map(response => {
                return response.results as SearchResult[];
            })
            .catch(error => {
                let message;

                if (error.status === 404) {
                    message = `No results found for "${term}"`;
                } else {
                    message = 'Unable to search at this time';
                }

                return Observable.throw({
                    status: error.status,
                    message: message
                });
            });
    }
}
