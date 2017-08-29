import { Store } from './store';


type ActionArgs = {[key: string]: any};


export abstract class Action {
    abstract key: string;

    constructor (protected args: ActionArgs) {

    }

    getArgs (): ActionArgs {
        return this.args;
    }

    getPath () {
        return this.key.split('.');
    }

    getCurrentState (appState): any {
        let state = appState;
        for (let segment of this.getPath()) {
            state = state[segment];
        }
        return state;
    }

    setCurrentState (appState, state) {
        const segments = this.getPath();
        const lastSegment = segments[-1];

        let subState = appState;

        for (let segment of segments.slice(0, -1)) {
            subState = subState[segment];
        }

        subState[lastSegment] = state;
    }

    getNextState<T> (currentState: T): T {
        return currentState;
    };

    sideEffects<T> (currentState: T): void {

    }
}


export abstract class Actions {
    abstract key: string;
    abstract types: any[];

    constructor (protected store: Store) {
        for (let type of this.types) {
            store.subscribe(type);
        }
    }

    dispatch (action: Action) {
        return this.store.dispatch(action);
    }
}
