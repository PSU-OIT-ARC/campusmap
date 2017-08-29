import Feature from 'ol/feature';

export type MapCenter = [number, number];
export type MapExtent = [number, number, number, number];


interface MapState {
    zoom: number;
    center: MapCenter;
    extent: MapExtent;
    fullExtent: MapExtent;
    selectedFeature: Feature;
}


interface SearchState {
    term: string;
}


interface SidenavState {
    open: boolean;
    content: {
        title?: string;
        subtitle?: string;
        bodyComponent: any;
        bodyContext: any;
    };
}


export interface AppState {
    busy: boolean;
    map: MapState;
    search: SearchState;
    sidenav: SidenavState;
}
