import { Injectable } from '@angular/core';

import { NgRedux } from '@angular-redux/store';

import Layer from 'ol/layer/layer';

import { AppState, Action, Actions } from '../store';
import { MapState, MapCoordinate, MapExtent } from '../store/state';
import { Reducer } from 'redux';


interface SetBaseLayerAction extends Action {
    payload: {
        layer: Layer
    };
}


interface SetCenterAction extends Action {
    payload: {
        center: MapCoordinate,
        transform: boolean
    };
}


interface SetZoomAction extends Action {
    payload: {
        zoom: number;
    };
}


interface ZoomInAction extends Action {
    payload: {
        levels: number;
    };
}


interface ZoomOutAction extends Action {
    payload: {
        levels: number;
    };
}


interface ZoomToFullExtentAction extends Action {
    payload: {
        extent: MapExtent;
    }
}


@Injectable()
export class MapActions extends Actions {
    static SET_BASE_LAYER = 'SET_BASE_LAYER';
    static SET_CENTER = 'SET_CENTER';
    static SET_ZOOM = 'SET_ZOOM';
    static ZOOM_IN = 'ZOOM_IN';
    static ZOOM_OUT = 'ZOOM_OUT';
    static ZOOM_TO_FULL_EXTENT = 'ZOOM_TO_FULL_EXTENT';

    constructor (protected ngRedux: NgRedux<AppState>) {
        super(ngRedux);
    }

    setBaseLayer (layer: Layer): SetBaseLayerAction {
        return this.ngRedux.dispatch({
            type: MapActions.SET_BASE_LAYER,
            payload: { layer }
        });
    }

    setCenter (center: MapCoordinate, transform=false): SetCenterAction {
        return this.ngRedux.dispatch({
            type: MapActions.SET_CENTER,
            payload: { center, transform }
        });
    }

    setZoom (zoom: number): SetZoomAction {
        return this.ngRedux.dispatch({
            type: MapActions.SET_ZOOM,
            payload: { zoom }
        });
    }

    zoomIn (levels: number = 1): ZoomInAction {
        return this.ngRedux.dispatch({
            type: MapActions.ZOOM_IN,
            payload: { levels }
        });
    }

    zoomOut (levels: number = 1): ZoomOutAction {
        return this.ngRedux.dispatch({
            type: MapActions.ZOOM_OUT,
            payload: { levels }
        });
    }

    zoomToFullExtent (extent?: MapExtent): ZoomToFullExtentAction {
        return this.ngRedux.dispatch({
            type: MapActions.ZOOM_TO_FULL_EXTENT,
            payload: { extent }
        });
    }
}


export const reducer: Reducer<MapState> = (currentState: MapState, action: Action): MapState => {
    switch (action.type) {
        case MapActions.SET_BASE_LAYER:
            return { ...currentState, baseLayer: action.payload.layer };
        case MapActions.SET_CENTER:
            return { ...currentState, center: action.payload.center };
        case MapActions.SET_ZOOM:
            return { ...currentState, zoom: action.payload.zoom };
        case MapActions.ZOOM_IN:
            return { ...currentState, zoom: currentState.zoom + action.payload.levels };
        case MapActions.ZOOM_OUT:
            return { ...currentState, zoom: currentState.zoom - action.payload.levels };
        case MapActions.ZOOM_TO_FULL_EXTENT:
            return { ...currentState, extent: action.payload.extent };
    }
    return currentState;
}
