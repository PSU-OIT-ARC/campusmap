import { Component, ElementRef, OnInit } from '@angular/core';

import { MdSnackBar } from '@angular/material';

import condition from 'ol/events/condition';
import extent from 'ol/extent';
import loadingstrategy from 'ol/loadingstrategy';
import proj from 'ol/proj';

import Feature from 'ol/feature';
import Map from 'ol/map';
import View from 'ol/view';

import GeoJSONFormat from 'ol/format/geojson';

import TileLayer from 'ol/layer/tile';
import VectorLayer from 'ol/layer/vector';

import SelectInteraction from 'ol/interaction/select';

import BingMapsSource from 'ol/source/bingmaps';
import OSMSource from 'ol/source/osm';
import TileWMSSource from 'ol/source/tilewms';
import VectorSource from 'ol/source/vector';

import Circle from 'ol/style/circle';
import Fill from 'ol/style/fill';
import Stroke from 'ol/style/stroke';
import Style from 'ol/style/style';
import Text from 'ol/style/text';

import {
    colorsHex,
    colorsRGB,
    defaultMapProjectionCode,
    geographicProjectionCode,
} from '../constants';

import { environment } from '../environments/environment';

import { MapActions } from './map.actions';


@Component({
    selector: 'psu-campusmap-map',
    templateUrl: './map.component.html',
    styleUrls: [
        './map.component.scss'
    ]
})
export class MapComponent implements OnInit {
    map: Map;
    view: View;

    baseLayers: TileLayer[];
    featureLayers: VectorLayer[];

    highlightInteraction: SelectInteraction;
    selectInteraction: SelectInteraction;

    geolocationEnabled = navigator.geolocation;
    gettingCurrentPosition = false;

    constructor (
        private host: ElementRef,
        private snackBar: MdSnackBar,
        public actions: MapActions) {

        this.baseLayers = this.makeBaseLayers();
        this.featureLayers = this.makeFeatureLayers();

        const buildingLayer = this.featureLayers[0];

        this.highlightInteraction = this.makeHighlightInteraction(buildingLayer);
        this.selectInteraction = this.makeSelectInteraction(buildingLayer);

        this.view = new View();

        this.map = new Map({
            controls: [],
            layers: this.baseLayers.concat(this.featureLayers),
            view: this.view
        });

        this.map.addInteraction(this.highlightInteraction);
        this.map.addInteraction(this.selectInteraction);
    }

    ngOnInit () {
        this.actions.setInstance(this.map);
        this.actions.setTarget(this.host.nativeElement.querySelector('.map'));
        this.actions.zoomToFullExtent();
    }

    makeBaseLayers () {
        return [
            new TileLayer({
                label: 'Map',
                shortLabel: 'Map',
                source: new BingMapsSource({
                    key: environment.map.bing.key,
                    imagerySet: 'CanvasLight'
                })
            }),
            new TileLayer({
                label: 'Satellite/Aerial',
                shortLabel: 'Satellite',
                visible: false,
                source: new BingMapsSource({
                    key: environment.map.bing.key,
                    imagerySet: 'Aerial'
                })
            }),
            new TileLayer({
                label: 'Hybrid',
                shortLabel: 'Hybrid',
                visible: false,
                source: new BingMapsSource({
                    key: environment.map.bing.key,
                    imagerySet: 'AerialWithLabels'
                })
            }),
            new TileLayer({
                label: 'OpenStreetMap',
                shortLabel: 'OSM',
                source: new OSMSource(),
                visible: false
            })
        ];
    }

    makeFeatureLayers () {
        return [
            makeFeatureLayer('buildings.building', {
                style: new Style({
                    fill: new Fill({
                        color: colorsRGB.psuGreen.concat([0.6])
                    }),
                    stroke: new Stroke({
                        color: [255, 255, 255, 0.8],
                        width: 2
                    })
                })
            }),
            makeTileLayer('bicycles.bicycleroute', {maxResolution: 2}),
            makeFeatureLayer('bicycles.bicycleparking', {
                style: new Style({
                    image: new Circle({
                        fill: new Fill({
                            color: 'white'
                        }),
                        stroke: new Stroke({
                            color: '#333',
                            width: 1
                        }),
                        radius: 10
                    }),
                    text: new Text({
                        font: '14px Material Icons',
                        fill: new Fill({
                            color: 'black'
                        }),
                        text: "directions_bike"
                    })
                }),
                maxResolution: 2 }
            )
        ];
    }

    makeHighlightInteraction (layer) {
        let selectCache = {};
        let interaction = new SelectInteraction({
            condition: condition.pointerMove,
            toggleCondition: condition.never,
            layers: [layer],
            style: (feature) => {
                const id = feature.getId();
                const props = feature.getProperties();
                const name = props.name;
                let style = selectCache[id];
                if (typeof style === 'undefined') {
                    selectCache[id] = style = new Style({
                        fill: new Fill({
                            color: colorsRGB.psuGray.concat([0.75])
                        }),
                        stroke: new Stroke({
                            color: colorsRGB.psuLightBlue.concat([0.8]),
                            width: 4
                        }),
                        text: new Text({
                            font: '20px sans-serif',
                            fill: new Fill({
                                color: colorsHex.psuGray
                            }),
                            stroke: new Stroke({
                                color: 'white',
                                width: 4
                            }),
                            text: name,
                            textAlign: 'center'
                        })
                    });
                }
                return [style];
            }
        });
        interaction.set('name', 'highlight');
        return interaction;
    }

    makeSelectInteraction (layer) {
        let interaction = new SelectInteraction({
            condition: condition.pointerDown,
            toggleCondition: condition.never,
            layers: [layer],
            style: new Style({
                fill: new Fill({
                    color: colorsRGB.psuGray.concat([0.75])
                }),
                stroke: new Stroke({
                    color: colorsRGB.psuLightBlue.concat([0.8]),
                    width: 4
                }),
            })
        });
        interaction.set('name', 'select');
        interaction.on('select', event => {
            if (event.selected.length) {
                this.showFeatureInfo(event.selected[0]);
            } else {
                this.hideFeatureInfo();
            }
        });
        return interaction;
    }

    switchBaseLayer (layer) {
        const label = layer.get('label');
        this.baseLayers.forEach((layer) => {
            layer.set('visible', layer.get('label') === label);
        })
    }

    /* Center */

    setCenter (center, transform=false) {
        this.actions.setCenter(center, transform);

        if (transform) {
            center = this.transform(center);
        }
        this.view.animate({ center, duration: 400 });
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

    /* Transform */

    transform (coordinate, reverse=false) {
        const projections = this._getTransformProjections(reverse);
        return proj.transform(coordinate, projections.source, projections.destination);
    }

    transformExtent (extent, reverse=false) {
        const projections = this._getTransformProjections(reverse);
        return proj.transformExtent(extent, projections.source, projections.destination);
    }

    _getTransformProjections (reverse) {
        let source = geographicProjectionCode;
        let destination = defaultMapProjectionCode;
        if (reverse) {
            let temp = source;
            source = destination;
            destination = temp;
        }
        return { source, destination };
    }

    /* Zoom */

    zoomIn (levels: number = 1) {
        this.actions.zoomIn(levels);
    }

    zoomOut (levels: number = 1) {
        this.actions.zoomOut(levels);
    }

    zoomToFullExtent () {
        this.actions.zoomToFullExtent();
    }

    /* Feature Info */

    showFeatureInfo (feature) {
        const id = feature.getId();
        // this.store.dispatch('SEARCH.SEARCH_BY_ID', { id, explicit: true });
    }

    hideFeatureInfo () {
        const interactions = this.map.getInteractions();
        const selected = interactions.getArray().filter(
            (interaction) => interaction instanceof SelectInteraction
        );
        selected.map((select) => select.getFeatures().clear());
        // this.store.dispatch('SIDENAV.CLOSE');
    }

    clearSelectedFeature () {
        const select = this.selectInteraction;
        const selectCollection = select.getFeatures();
        selectCollection.clear();
    }

    selectFeature (feature) {
        const select = this.selectInteraction;
        const selectCollection = select.getFeatures();
        if (feature) {
            selectCollection.push(feature);
        }
    }

    /* Geolocation */

    goToMyLocation () {
        this.gettingCurrentPosition = true;
        navigator.geolocation.getCurrentPosition(position => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const center = this.transform([longitude, latitude]);
            this.gettingCurrentPosition = false;
            this.view.animate({ center, duration: 400 });
        }, error => {
            this.gettingCurrentPosition = false;
            this.snackBar.open('Unable to get your current location', 'OK', {
                duration: 5000
            })
        });
    }
}


class CenteringThreshold {
    top: number = 0;
    right: number = 0;
    bottom: number = 0;
    left: number = 0;
}


function makeFeatureLayer (layerName, options: {
    minResolution?: Number,
    maxResolution?: Number,
    style?: Style
}) {
    return new VectorLayer({
        source: makeWFSSource(layerName),
        minResolution: options.minResolution,
        maxResolution: options.maxResolution,
        style: options.style
    })
}


function makeWFSSource (layerName, projectionCode=defaultMapProjectionCode) {
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


function makeTileLayer (layerName, options: { minResolution?: number, maxResolution?: number }) {
    return new TileLayer({
        source: makeTileSource(layerName),
        minResolution: options.minResolution,
        maxResolution: options.maxResolution
    });
}


function makeTileSource (layerName) {
    const wmsURL = `${environment.map.server.baseURL}/campusmap/wms`;
    return new TileWMSSource({
        serverType: 'geoserver',
        url: wmsURL,
        params: {
            LAYERS: `campusmap:${layerName}`
        }
    });
}
