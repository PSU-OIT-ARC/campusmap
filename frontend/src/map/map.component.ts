import { Component, ElementRef, OnInit } from '@angular/core';


import extent from 'ol/extent';
import condition from 'ol/events/condition';
import loadingstrategy from 'ol/loadingstrategy';
import proj from 'ol/proj';

import Map from 'ol/map';
import View from 'ol/view';

import GeoJSON from 'ol/format/geojson';

import SelectInteraction from 'ol/interaction/select';

import BingMapsSource from 'ol/source/bingmaps';
import OSMSource from 'ol/source/osm';
import TileWMSSource from 'ol/source/tilewms';
import VectorSource from 'ol/source/vector';

import TileLayer from 'ol/layer/tile';
import VectorLayer from 'ol/layer/vector';

import Fill from 'ol/style/fill';
import Stroke from 'ol/style/stroke';
import Circle from 'ol/style/circle';
import Style from 'ol/style/style';
import Text from 'ol/style/text';

import { colorsHex, colorsRGB } from '../constants';
import { environment } from '../environments/environment';

import { SidenavService } from '../sidenav/sidenav.service';
import { MapFeatureInfoComponent } from './feature-info.component';


const floorplanBaseURL = 'http://www.pdx.edu/floorplans/buildings/';
const epsg = 'EPSG:3857';
const projection = proj.get(epsg);
const mapExtent = [-13657661.739414563, 5700905.92043886, -13655116.88116592, 5702920.846916851];
const center = extent.getCenter(mapExtent);


@Component({
    selector: 'psu-campusmap-map',
    templateUrl: './map.component.html',
    styleUrls: [
        './map.component.scss'
    ]
})
export class MapComponent implements OnInit {
    map: Map;
    baseLayers: Array<any>;

    constructor (
        private host: ElementRef,
        private sidenavService: SidenavService) {
        // Pass
    }

    ngOnInit () {
        const baseLayers = this.makeBaseLayers();
        const featureLayers = this.makeFeatureLayers();
        const allLayers = baseLayers.concat(featureLayers);

        const map = new Map({
            target: this.host.nativeElement.querySelector('.map'),
            controls: [],
            layers: allLayers,
            view: new View({
                center: center,
                zoom: 16
            })
        });

        this.map = map;
        this.baseLayers = baseLayers;
        this.addEventListeners(map);
        this.addInteractions(map, baseLayers, featureLayers);

        map.getView().fit(mapExtent);
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
            this.makeFeatureLayer('buildings', {
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
            this.makeTileLayer('bicycle-routes', {maxResolution: 2}),
            this.makeFeatureLayer('bicycle-parking', {
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

    makeWFSSource (layerName) {
        const wfsURL = [
            `${environment.map.server.baseURL}/campusmap/wfs`, [
                'service=WFS',
                'version=1.1.0',
                'request=GetFeature',
                `srsname=${epsg}`,
                'outputFormat=application/json'
            ].join('&')
        ].join('?');

        return new VectorSource({
            format: new GeoJSON(),
            projection: projection,
            strategy: loadingstrategy.bbox,
            url: (extent) => {
                const bbox = `${extent.join(',')},${epsg}`;
                return `${wfsURL}&bbox=${bbox}&typename=campusmap:${layerName}`;
            }
        });
    }

    makeTileLayer (layerName, options: {
        minResolution?: Number,
        maxResolution?: Number,
    }) {
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

    makeBuildingHighlighterInteraction (layer) {
        let selectCache = {};
        return new SelectInteraction({
            condition: condition.pointerMove,
            layers: [layer],
            style: (feature) => {
                const props = feature.getProperties();
                const name = props.name;
                const code = props.code;
                let style = selectCache[props.code];
                if (typeof style === 'undefined') {
                    selectCache[code] = style = new Style({
                        fill: new Fill({
                            color: colorsHex.psuGray
                        }),
                        stroke: new Stroke({
                            color: 'white',
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
                            text: code ? `${props.name} (${code})` : name,
                            textAlign: 'center'
                        })
                    });
                }
                return [style];
            }
        });
    }

    makeBuildingSelectInteraction (layer) {
        return new SelectInteraction({
            condition: condition.pointerDown,
            layers: [layer],
            style: (feature) => {
                const props = feature.getProperties();
                const name = props.name;
                const code = props.code;
                let style = new Style({
                    fill: new Fill({
                        color: colorsHex.psuGray
                    }),
                    stroke: new Stroke({
                        color: 'white',
                        width: 4
                    }),
                });
                return [style];
            }
        });
    }

    addEventListeners (map: Map) {
        map.on('click', (event) => {
            let feature = map.forEachFeatureAtPixel(event.pixel, (feature) => {
                return feature;
            });
            if (feature && typeof feature.getId() !== 'undefined') {
                this.showFeatureInfo(feature);
            }
            else {
                this.hideFeatureInfo();
            }
        })
    }

    addInteractions (map: Map, baseLayers, featureLayers) {
        const buildingLayer = featureLayers[0];
        const buildingSelector = this.makeBuildingSelectInteraction(buildingLayer);
        const buildingHighlighter = this.makeBuildingHighlighterInteraction(buildingLayer);
        map.addInteraction(buildingSelector);
        map.addInteraction(buildingHighlighter);
    }

    switchBaseLayer (layer) {
        const label = layer.get('label');
        this.baseLayers.forEach((layer) => {
            layer.set('visible', layer.get('label') === label);
        })
    }

    zoomIn (levels: number = 1) {
        this.zoomRelative(levels);
    }

    zoomOut (levels: number = 1) {
        this.zoomRelative(-levels);
    }

    zoomRelative (delta: number) {
        const view = this.map.getView();
        const currentZoom = view.getZoom();
        const newZoom = currentZoom + delta;
        view.setZoom(newZoom);
    }

    zoomToFullExtent () {
        this.map.getView().fit(mapExtent);
    }

    showFeatureInfo (feature) {
        // XXX: Magic number
        const sidenavWidth = 400;

        const map = this.map;
        const size = map.getSize();
        const width = size[0];

        const props = feature.getProperties();
        const address = props.address;
        const buildingHref = props.code ? `${floorplanBaseURL}${props.code.toLowerCase()}` : null;

        const sidenavState = {
            content: {
                title: props.name,
                subtitle: props.code,
                bodyComponent: MapFeatureInfoComponent,
                bodyContext: {
                    name: props.name,
                    address: address,
                    buildingHref: buildingHref
                }
            },
            open: true,
            closeable: true
        };

        this.sidenavService.setState(sidenavState);

        if (width >= sidenavWidth) {
            const featureExtent = feature.getGeometry().getExtent();
            const leftPixel = map.getPixelFromCoordinate([featureExtent[0], featureExtent[1]]);
            const leftEdge = leftPixel[0];
            if (leftEdge < sidenavWidth) {
                const featureCenter = extent.getCenter(featureExtent);
                const featureCenterPixel = map.getPixelFromCoordinate(featureCenter);
                const newX = featureCenterPixel[0] - sidenavWidth / 2;
                const newCenter = map.getCoordinateFromPixel([newX, featureCenterPixel[1]]);
                map.getView().animate({
                    center: newCenter,
                    duration: 400
                });
            }
        }
    }

    hideFeatureInfo () {
        const interactions = this.map.getInteractions();
        const selected = interactions.getArray().filter(
            (interaction) => interaction instanceof SelectInteraction
        );
        selected.map((select) => select.getFeatures().clear());
        this.sidenavService.close();
    }
}
