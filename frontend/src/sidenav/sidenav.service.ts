import { Injectable } from '@angular/core';

import { Subject } from 'rxjs/Subject';

import { SidenavState } from './sidenav-state';


@Injectable()
export class SidenavService {
    state = new Subject<SidenavState>();
    openState = new Subject<boolean>();

    constructor () {

    }

    open () {
        this.openState.next(true);
    }

    close () {
        this.openState.next(false);
    }

    setState (state: SidenavState) {
        this.state.next(state);
    }
}
