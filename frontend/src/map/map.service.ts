import { Injectable } from '@angular/core';

import extent from 'ol/extent';
import loadingstrategy from 'ol/loadingstrategy';
import proj from 'ol/proj';

import Feature from 'ol/feature';
import Map from 'ol/map';
import View from 'ol/view';

import GeoJSONFormat from 'ol/format/geojson';

import SelectInteraction from 'ol/interaction/select';

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

    transform (coordinate, reverse=false) {
        const projections = this._getTransformProjections(reverse);
        return proj.transform(coordinate, projections.source, projections.destination);
    }

    transformExtent (extent, reverse=false) {
        const projections = this._getTransformProjections(reverse);
        return proj.transformExtent(extent, projections.source, projections.destination);
    }

    _getTransformProjections (reverse) {
        let source = 'EPSG:4326';
        let destination = environment.map.projectionCode;
        if (reverse) {
            let temp = source;
            source = destination;
            destination = temp;
        }
        return { source, destination };
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

    getInteraction (name, type) {
        const interactions = this.map.getInteractions().getArray();
        for (let interaction of interactions) {
            if (interaction instanceof type && interaction.get('name') === name) {
                return interaction;
            }
        }
        return null;
    }

    selectFeature (interactionName, feature) {
        const select = this.getInteraction(interactionName, SelectInteraction);
        const selectCollection = select.getFeatures();
        selectCollection.clear();
        if (feature) {
            selectCollection.push(feature);
        }
    }

    centerMapOnFeature (feature: Feature, threshold=new CenteringThreshold(), zoomIn=true,
                        zoomThreshold=50, maxZoom=18) {
        const map = this.map;
        const view = this.view;
        const size = map.getSize();
        const width = size[0];
        const height = size[1];
        const currentZoom = view.getZoom();

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
        const featureWidth = right - left;
        const featureHeight = bottom - top;

        const defaultNewX = featureX - (threshold.left - threshold.right) / 2;
        const defaultNewY = featureY - (threshold.top - threshold.bottom) / 2;

        let newX = null;
        let newY = null;
        let newCenter = null;

        if ((height >= threshold.top && top < threshold.top) ||
            (height >= threshold.bottom && bottom > (height - threshold.bottom))) {
            newY = defaultNewY;
        }

        if ((width >= threshold.left && left < threshold.left) ||
            (width >= threshold.right && right > (width - threshold.right))) {
            newX = defaultNewX;
        }

        if (!(newX === null && newY === null)) {
            newCenter = map.getCoordinateFromPixel([
                newX === null ? defaultNewX : newX,
                newY === null ? defaultNewY : newY
            ]);
        }

        let animations = [];
        let anchor = featureCenter;
        let duration = 400;

        if (newCenter !== null) {
            animations.push({ center: newCenter, duration });
        }

        if (zoomIn &&
            currentZoom < maxZoom &&
            (featureWidth < zoomThreshold || featureHeight < zoomThreshold)) {
            let w = featureWidth;
            let h = featureHeight;
            let zoom = currentZoom;
            while (zoom < maxZoom && (w < zoomThreshold || h < zoomThreshold)) {
                zoom += 1; w *= 2; h *= 2;
            }
            animations.push({ zoom, anchor, duration });
        }

        if (animations.length) {
            view.animate.apply(view, animations);
        }
    }
}


class CenteringThreshold {
    top: number = 0;
    right: number = 0;
    bottom: number = 0;
    left: number = 0;
}
