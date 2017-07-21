import { Injectable } from '@angular/core';

import { Subject } from 'rxjs/Subject';


class ContentState {
    title?: string;
    subtitle?: string;
    body: string;
    isOpen: boolean = false;
}


@Injectable()
export class SidenavService {
    contentState = new Subject<ContentState>();
    openState = new Subject<boolean>();

    constructor () {

    }

    open () {
        this.openState.next(true);
        return this.openState;
    }

    close () {
        this.openState.next(false);
        return this.openState;
    }

    setContent (data, open=true) {
        this.contentState.next({
            title: data.title,
            subtitle: data.subtitle,
            body: data.body,
            isOpen: open
        });
        if (open) {
            this.open();
        }
        return this.contentState;
    }
}
