import { Action as _Action } from 'redux';
import { NgRedux } from '@angular-redux/store';

import { AppState } from './state';


export interface Action extends _Action {
    payload?: any;
}


export abstract class Actions {
    constructor (protected ngRedux: NgRedux<AppState>) {

    }
}
