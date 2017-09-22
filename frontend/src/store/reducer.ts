import { combineReducers, Reducer } from 'redux';
import { reducer as mapReducer } from '../map/map.actions';
import { reducer as sidenavReducer } from '../sidenav/sidenav.actions';
import { AppState } from './state';


export const rootReducer: Reducer<AppState> = (state: AppState, action): AppState => {
    return (typeof action.key === 'undefined') ? state : sliceReducer(state, action);
};


export const sliceReducer: Reducer<AppState> = combineReducers({
    busy: (s, a) => s || true,
    map: mapReducer,
    search: (s, a) => s,
    sidenav: sidenavReducer
});
