import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Action } from './action';
import { InitialState, State } from './state';


@Injectable()
export class Store {
    private dispatcher = new BehaviorSubject<Action>(null);

    constructor (@Inject(InitialState) private state: State) {

    }

    dispatch (action: Action) {
        return this.dispatcher.next(action);
    }

    subscribe (type: Function) {
        return this.dispatcher.subscribe(action => {
            if (action instanceof type) {
                const currentState = this.getState();
                const nextState = this.getNextState(currentState, action);
                this.setState(nextState);
                action.sideEffects(nextState);
            }
        });
    }

    cloneState (state) {
        // TODO: This might not be the best way to deep-copy objects
        return JSON.parse(JSON.stringify(state));
    }

    getState (): State {
        return this.state;
    }

    setState (state: State) {
        this.state = state;
    }

    getNextState<T> (state: T, action: Action): T {
        const nextState = this.cloneState(state);
        const currentActionState = action.getCurrentState(nextState);
        const nextActionState = action.getNextState(currentActionState);
        action.setCurrentState(nextState, nextActionState);
        return nextState;
    }
}
