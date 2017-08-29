import { Injectable } from '@angular/core';

import Feature from 'ol/feature';
import Map from 'ol/map';

import { Action, Actions, Store } from '../store';


class SetInstance extends Action {
    key = 'map.instance';

    constructor (private map: Map) {
        super({ map });
    }

    getNextState (currentState) {
        return this.map;
    }
};


class SetTarget extends Action {
    key = 'map.target';

    constructor (private target) {
        super({ target });
    }

    getNextState (currentState) {
        return this.target;
    }
}


@Injectable()
export class MapActions extends Actions {
    key = 'map';

    types = [
        SetInstance,
        SetTarget,
        // SET_TARGET: 'MAP.SET_TARGET',
        // SET_CENTER: 'MAP.SET_CENTER',
        // CENTER_ON_FEATURE: 'MAP.CENTER_ON_FEATURE',
        // SELECT_FEATURE: 'MAP.SELECT_FEATURE',
        // CLEAR_SELECTED_FEATURE: 'MAP.CLEAR_SELECTED_FEATURE',
        // ZOOM_IN: 'MAP.ZOOM_IN',
        // ZOOM_OUT: 'MAP.ZOOM_OUT',
        // ZOOM_TO_FULL_EXTENT: 'MAP.ZOOM_TO_FULL_EXTENT',
    ];

    constructor (protected store: Store) {
        super(store);
    }

    setInstance (map: Map) {
        return this.dispatch(new SetInstance(map));
    }

    setTarget (element) {
        return this.dispatch(new SetTarget(element));
    }

    setCenter (center, transform=false) {
        return this.dispatch(this.types.SET_CENTER, { center, transform });
    }

    centerOnFeature (feature: Feature, threshold?) {
        return this.dispatch(this.types.CENTER_ON_FEATURE, { feature, threshold });
    }

    selectFeature (feature: Feature) {
        return this.dispatch(this.types.SELECT_FEATURE, { feature });
    }

    clearSelectedFeature () {
        return this.dispatch(this.types.CLEAR_SELECTED_FEATURE);
    }

    zoomIn (levels=1) {
        return this.dispatch(this.types.ZOOM_IN, { levels });
    }

    zoomOut (levels=1) {
        return this.dispatch(this.types.ZOOM_OUT, { levels });
    }

    zoomToFullExtent () {
        return this.dispatch(this.types.ZOOM_TO_FULL_EXTENT);
    }

    zoomRelative (state, delta: number) {
        const view = state.instance.getView();
        const currentZoom = view.getZoom();
        const newZoom = currentZoom + delta;
        view.setZoom(newZoom);
    }
}
