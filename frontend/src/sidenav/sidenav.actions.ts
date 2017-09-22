import { Injectable } from '@angular/core';

import { NgRedux } from '@angular-redux/store';

import { AppState, Action, Actions } from '../store';
import { SidenavContent, SidenavState } from '../store/state';
import { Reducer } from 'redux';


interface OpenAction extends Action {

}


interface CloseAction extends Action {

}


interface SetContentAction extends Action {
    payload: SidenavContent
}


@Injectable()
export class SidenavActions extends Actions {
    static OPEN = 'OPEN';
    static CLOSE = 'CLOSE';
    static SET_CONTENT = 'SET_CONTENT';

    constructor (protected ngRedux: NgRedux<AppState>) {
        super(ngRedux);
    }

    open (): OpenAction {
        return this.ngRedux.dispatch({
            type: SidenavActions.OPEN
        });
    }

    close (): CloseAction {
        return this.ngRedux.dispatch({
            type: SidenavActions.CLOSE
        });
    }

    setContent (bodyComponent, bodyContext, title?, subtitle?): SetContentAction {
        return this.ngRedux.dispatch({
            type: SidenavActions.SET_CONTENT,
            payload: { title, subtitle, bodyComponent, bodyContext }
        })
    }
}


export const reducer: Reducer<SidenavState> = (currentState: SidenavState, action: Action): SidenavState => {
    switch (action.type) {
        case SidenavActions.OPEN:
            return { ...currentState, open: true };
        case SidenavActions.CLOSE:
            return { ...currentState, open: false };
        case SidenavActions.SET_CONTENT:
            return { ...currentState, content: action.payload };
    }
    return currentState;
}
