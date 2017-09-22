import extent from 'ol/extent';
import Feature from 'ol/feature';
import Layer from 'ol/layer/layer';


export type MapCoordinate = [number, number];
export type MapExtent = [number, number, number, number];


const fullExent: MapExtent = [-13657661.739414563, 5700905.92043886, -13655116.88116592, 5702920.846916851];
const center: MapCoordinate = extent.getCenter(fullExent);


export interface MapState {
    baseLayer: Layer;
    center: MapCoordinate;
    extent: MapExtent;
    selectedFeature: Feature;
    zoom: number;
}


export interface SearchState {
    term: string;
}


export type SidenavContent = {
    title?: string,
    subtitle?: string,
    bodyComponent: any,
    bodyContext: any,
};


export interface SidenavState {
    open: boolean;
    content: SidenavContent;
}


export interface AppState {
    busy: boolean;
    map: MapState;
    search: SearchState;
    sidenav: SidenavState;
}


export const INITIAL_STATE: AppState = {
    busy: false,
    map: {
        baseLayer: null,
        center: center,
        extent: fullExent,
        selectedFeature: null,
        zoom: 1,
    },
    search: {
        term: null,
    },
    sidenav: {
        open: false,
        content: null,
    }
};
