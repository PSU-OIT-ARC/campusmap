import { Component, ElementRef, OnInit } from '@angular/core';

import condition from 'ol/events/condition';

import Map from 'ol/map';
import View from 'ol/view';

import TileLayer from 'ol/layer/tile';
import VectorLayer from 'ol/layer/vector';

import SelectInteraction from 'ol/interaction/select';

import BingMapsSource from 'ol/source/bingmaps';
import OSMSource from 'ol/source/osm';

import Circle from 'ol/style/circle';
import Fill from 'ol/style/fill';
import Stroke from 'ol/style/stroke';
import Style from 'ol/style/style';
import Text from 'ol/style/text';

import { colorsHex, colorsRGB } from '../constants';
import { environment } from '../environments/environment';

import { MapService } from './map.service';
import { SearchService } from '../search/search.service';
import { SidenavService } from '../sidenav/sidenav.service';


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

    constructor (
        private host: ElementRef,
        private mapService: MapService,
        private searchService: SearchService,
        private sidenavService: SidenavService) {

        this.map = mapService.map;
        this.view = mapService.view;

        this.baseLayers = this.makeBaseLayers();
        this.featureLayers = this.makeFeatureLayers();

        const buildingLayer = this.featureLayers[0];

        this.highlightInteraction = this.makeHighlightInteraction(buildingLayer);
        this.selectInteraction = this.makeSelectInteraction(buildingLayer);
    }

    ngOnInit () {
        const map = this.map;
        const target = this.host.nativeElement.querySelector('.map');

        this.baseLayers.forEach(layer => map.addLayer(layer));
        this.featureLayers.forEach(layer => map.addLayer(layer));

        map.addInteraction(this.selectInteraction);
        map.addInteraction(this.highlightInteraction);

        map.setTarget(target)
        this.zoomToFullExtent();
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
            this.mapService.makeFeatureLayer('buildings.building', {
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
            this.mapService.makeTileLayer('bicycles.bicycleroute', {maxResolution: 2}),
            this.mapService.makeFeatureLayer('bicycles.bicycleparking', {
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
        return new SelectInteraction({
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

    showFeatureInfo (feature) {
        const id = feature.getId();
        this.searchService.searchById(id, true);
        this.mapService.centerMapOnFeature(feature, {
            top: 30,
            right: 30,
            bottom: 30,
            left: 430
        });
    }

    hideFeatureInfo () {
        const interactions = this.map.getInteractions();
        const selected = interactions.getArray().filter(
            (interaction) => interaction instanceof SelectInteraction
        );
        selected.map((select) => select.getFeatures().clear());
        this.sidenavService.close();
    }

    zoomIn () {
        this.mapService.zoomIn();
    }

    zoomOut () {
        this.mapService.zoomOut();
    }

    zoomToFullExtent () {
        this.view.fit(environment.map.fullExtent);
    }
}
