import { Injectable } from '@angular/core';

import extent from 'ol/extent';
import loadingstrategy from 'ol/loadingstrategy';

import Feature from 'ol/feature';
import Map from 'ol/map';
import View from 'ol/view';

import GeoJSONFormat from 'ol/format/geojson';

import TileWMSSource from 'ol/source/tilewms';
import VectorSource from 'ol/source/vector';
import TileLayer from 'ol/layer/tile';
import VectorLayer from 'ol/layer/vector';

import Style from 'ol/style/style';

import { environment } from '../environments/environment';


@Injectable()
export class MapService {
    map: Map;
    view: View;

    constructor () {
        this.map = new Map({
            controls: [],
            view: new View()
        });
        this.view = this.map.getView();
    }

    makeFeatureLayer (layerName, options: {
        minResolution?: Number,
        maxResolution?: Number,
        style?: Style
    }) {
        return new VectorLayer({
            source: this.makeWFSSource(layerName),
            minResolution: options.minResolution,
            maxResolution: options.maxResolution,
            style: options.style
        })
    }

    makeWFSSource (layerName, projectionCode?) {
        projectionCode = projectionCode || environment.map.projectionCode;

        const wfsURL = [
            `${environment.map.server.baseURL}/campusmap/wfs`, [
                'service=WFS',
                'version=1.1.0',
                'request=GetFeature',
                `typename=campusmap:${layerName}`,
                `srsname=${projectionCode}`,
                'outputFormat=application/json'
            ].join('&')
        ].join('?');

        return new VectorSource({
            format: new GeoJSONFormat(),
            strategy: loadingstrategy.bbox,
            url: extent => `${wfsURL}&bbox=${extent.join(',')},${projectionCode}`
        });
    }

    makeTileLayer (layerName, options: { minResolution?: number, maxResolution?: number }) {
        return new TileLayer({
            source: this.makeTileSource(layerName),
            minResolution: options.minResolution,
            maxResolution: options.maxResolution
        });
    }

    makeTileSource (layerName) {
        const wmsURL = `${environment.map.server.baseURL}/campusmap/wms`;
        return new TileWMSSource({
            serverType: 'geoserver',
            url: wmsURL,
            params: {
                LAYERS: `campusmap:${layerName}`
            }
        });
    }


    zoomIn (levels: number = 1) {
        this.zoomRelative(levels);
    }

    zoomOut (levels: number = 1) {
        this.zoomRelative(-levels);
    }

    zoomRelative (delta: number) {
        const currentZoom = this.view.getZoom();
        const newZoom = currentZoom + delta;
        this.view.setZoom(newZoom);
    }

    centerMapOnFeature (feature: Feature, threshold: CenteringThreshold) {
        const map = this.map;
        const size = map.getSize();
        const width = size[0];
        const height = size[1];

        const featureExtent = feature.getGeometry().getExtent();
        const topRightCoord = extent.getTopRight(featureExtent);
        const bottomLeftCoord = extent.getBottomLeft(featureExtent);
        const featureCenter = extent.getCenter(featureExtent);

        const topRightPixel = map.getPixelFromCoordinate(topRightCoord);
        const bottomLeftPixel = map.getPixelFromCoordinate(bottomLeftCoord);
        const featureCenterPixel = map.getPixelFromCoordinate(featureCenter);
        const featureX = featureCenterPixel[0];
        const featureY = featureCenterPixel[1];

        const top = topRightPixel[1];
        const right = topRightPixel[0];
        const bottom = bottomLeftPixel[1];
        const left = bottomLeftPixel[0];

        const defaultNewX = featureX - (threshold.left - threshold.right) / 2;
        const defaultNewY = featureY - (threshold.top - threshold.bottom) / 2;

        let newX = null;
        let newY = null;

        if ((height >= threshold.top && top < threshold.top) ||
            (height >= threshold.bottom && bottom > (height - threshold.bottom))) {
            newY = defaultNewY;
        }

        if ((width >= threshold.left && left < threshold.left) ||
            (width >= threshold.right && right > (width - threshold.right))) {
            newX = defaultNewX;
        }

        if (!(newX === null && newY === null)) {
            const newCenter = map.getCoordinateFromPixel([
                newX === null ? defaultNewX : newX,
                newY === null ? defaultNewY : newY
            ]);
            map.getView().animate({
                center: newCenter,
                duration: 400
            });
        }
    }
}


class CenteringThreshold {
    top: number = 0;
    right: number = 0;
    bottom: number = 0;
    left: number = 0;
}
