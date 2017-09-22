import { Injectable } from '@angular/core';

import loadingstrategy from 'ol/loadingstrategy';
import proj from 'ol/proj';

import GeoJSONFormat from 'ol/format/geojson';

import OLMap from 'ol/map';
import View from 'ol/view';

import Control from 'ol/control/control';

import Interaction from 'ol/interaction/interaction';

import Layer from 'ol/layer/layer';
import TileLayer from 'ol/layer/tile';
import VectorLayer from 'ol/layer/vector';

import BingMapsSource from 'ol/source/bingmaps';
import OSMSource from 'ol/source/osm';
import TileWMSSource from 'ol/source/tilewms';
import VectorSource from 'ol/source/vector';

import Style from 'ol/style/style';

import { environment } from '../environments/environment';

type Coordinate = [number, number];
type Extent = [number, number, number, number];

type WMSLayerOptions = {
    minResolution?: number,
    maxResolution?: number,
};

type WFSLayerOptions = {
    minResolution?: number,
    maxResolution?: number,
    style?: Style,
};


@Injectable()
export class Map {
    map: OLMap;
    view: View;

    baseLayers: Layer[] = [];
    featureLayers: Layer[] = [];

    constructor () {
        this.map = new OLMap({
            controls: [],
            view: new View({
                center: [0, 0],
                zoom: 1
            })
        });
        this.view = this.map.getView();
    }

    setTarget (element) {
        this.map.setTarget(element);
    }

    /* Controls */

    addControls (...controls: Control[]) {
        controls.forEach(control => this.map.addControl(control));
    }

    /* Interactions */

    addInteractions (...interactions: Interaction[]) {
        interactions.forEach(interaction => this.map.addInteraction(interaction));
    }

    /* Layers */

    addBaseLayers (...layers: Layer[]) {
        this.baseLayers.push(...layers);
        this.addLayers(...layers);
    }

    addFeatureLayers (...layers: Layer[]) {
        this.featureLayers.push(...layers);
        this.addLayers(...layers);
    }

    addLayers (...layers: Layer[]) {
        layers.forEach(layer => this.map.addLayer(layer));
    }

    setBaseLayer (layer) {
        for (let baseLayer of this.baseLayers) {
            layer.set('visible', layer === layer);
        }
    }

    makeBingTileLayer (label: string, imagerySet: string, shortLabel?: string): TileLayer {
        return new TileLayer({
            label: label,
            shortLabel: shortLabel || label,
            visible: false,
            source: new BingMapsSource({
                key: environment.bing.key,
                imagerySet: imagerySet
            })
        });
    }

    makeOSMTileLayer (label: string='OpenStreetMap', shortLabel: string='OSM'): TileLayer {
        return new TileLayer({
            label: label,
            shortLabel: label || shortLabel,
            source: new OSMSource(),
            visible: false
        })
    }

    makeWMSLayer (layerName, options: WMSLayerOptions = {}) {
        const { baseURL, workspace } = environment.map.server;
        const source = new TileWMSSource({
            serverType: 'geoserver',
            url: `${baseURL}/${workspace}/wms`,
            params: {
                LAYERS: `${workspace}:${layerName}`
            }
        });
        return new TileLayer({ source, ...options });
    }

    makeWFSLayer (layerName, options: WFSLayerOptions = {}) {
        const { baseURL, workspace } = environment.map.server;
        const projection = this.view.getProjection();
        const url = [
            `${baseURL}/${workspace}/wfs`, [
                'service=WFS',
                'version=1.1.0',
                'request=GetFeature',
                `typename=${workspace}:${layerName}`,
                `srsname=${projection}`,
                'outputFormat=application/json'
            ].join('&')
        ].join('?');
        const source = new VectorSource ({
            format: new GeoJSONFormat(),
            strategy: loadingstrategy.bbox,
            url: extent => `${url}&bbox=${extent.join(',')},${projection}`
        });
        return new VectorLayer({ source, ...options });
    }

    /* Center */

    setCenter (center, transform = false, animate = true) {
        if (transform) {
            center = this.transform(center);
        }
        if (animate) {
            this.view.animate({ center, duration: 400 });
        } else {
            this.view.setCenter(center);
        }
    }

    getCurrentPosition (onSuccess, onError) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => onSuccess([position.coords.latitude, position.coords.longitude]),
                error => onError(error)
            );
        } else {
            onError({
                message: 'Browser does not support location services'
            });
        }
    }

    /* Zoom */

    setZoom (zoom, animate = true) {
        if (animate) {
            this.view.animate({ zoom, duration: 400});
        } else {
            this.view.setZoom(zoom);
        }
    }

    zoomIn (levels = 1) {
        return this.zoomRelative(levels);
    }

    zoomOut (levels = -1) {
        return this.zoomRelative(levels);
    }

    zoomRelative(levels: number) {
        this.view.setZoom(this.view.getZoom() + levels);
    }

    /* Transform */

    transform (coordinate: Coordinate, reverse = false): Coordinate {
        const { source, destination } = this._getTransformProjections(reverse);
        return proj.transform(coordinate, source, destination);
    }

    transformExtent (extent: Extent, reverse = false): Extent {
        const { source, destination } = this._getTransformProjections(reverse);
        return proj.transformExtent(extent, source, destination);
    }

    _getTransformProjections (reverse = false, source = 'EPSG:4326', destination = 'EPSG:3857') {
        return reverse ? { destination, source } : { source, destination };
    }
}
