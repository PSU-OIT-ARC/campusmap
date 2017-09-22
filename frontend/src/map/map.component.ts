import { Component, ElementRef, OnInit } from '@angular/core';

import { MdSnackBar } from '@angular/material';

import condition from 'ol/events/condition';
import extent from 'ol/extent';

import Feature from 'ol/feature';

import Layer from 'ol/layer/layer';

import SelectInteraction from 'ol/interaction/select';

import Circle from 'ol/style/circle';
import Fill from 'ol/style/fill';
import Stroke from 'ol/style/stroke';
import Style from 'ol/style/style';
import Text from 'ol/style/text';

import { colorsHex, colorsRGB } from '../constants';

import { Map } from './map';
import { MapActions } from './map.actions';


@Component({
    selector: 'psu-campusmap-map',
    templateUrl: './map.component.html',
    styleUrls: [
        './map.component.scss'
    ],
    providers: [
        Map
    ]
})
export class MapComponent implements OnInit {
    highlightInteraction: SelectInteraction;
    selectInteraction: SelectInteraction;
    gettingCurrentPosition = false;

    constructor (
        private host: ElementRef,
        private snackBar: MdSnackBar,
        private map: Map,
        protected actions: MapActions) {

        const buildingLayerStyle = new Style({
            fill: new Fill({
                color: colorsRGB.psuGreen.concat([0.6])
            }),
            stroke: new Stroke({
                color: [255, 255, 255, 0.8],
                width: 2
            })
        });

        const bikeParkingLayerStyle = new Style({
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
        });

        map.addBaseLayers(
            map.makeBingTileLayer('Map', 'CanvasLight'),
            map.makeBingTileLayer('Satellite/Aerial', 'Satellite', 'Aerial'),
            map.makeBingTileLayer('Hybrid', 'AerialWithLabels'),
            map.makeOSMTileLayer('OpenStreetMap', 'OSM')
        )

        map.addFeatureLayers(
            map.makeWFSLayer('buildings.building', { style: buildingLayerStyle }),
            map.makeWMSLayer('bicycles.bicycleroute', {maxResolution: 2}),
            map.makeWFSLayer('bicycles.bicycleparking', { style: bikeParkingLayerStyle }),
        );

        const buildingLayer = map.featureLayers[0];

        this.highlightInteraction = this.makeHighlightInteraction(buildingLayer);
        this.selectInteraction = this.makeSelectInteraction(buildingLayer);

        this.map.addInteractions(this.highlightInteraction, this.selectInteraction);
    }

    ngOnInit () {
        this.map.setTarget(this.host.nativeElement);
        this.actions.setBaseLayer(this.map.baseLayers[0]);
        this.actions.zoomToFullExtent();
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

    // centerMapOnFeature (feature: Feature, threshold=new CenteringThreshold(), zoomIn=true,
    //                     zoomThreshold=50, maxZoom=18) {
    //     const map = this.map;
    //     const view = this.view;
    //     const size = map.getSize();
    //     const width = size[0];
    //     const height = size[1];
    //     const currentZoom = view.getZoom();
    //
    //     const featureExtent = feature.getGeometry().getExtent();
    //     const topRightCoord = extent.getTopRight(featureExtent);
    //     const bottomLeftCoord = extent.getBottomLeft(featureExtent);
    //     const featureCenter = extent.getCenter(featureExtent);
    //
    //     const topRightPixel = map.getPixelFromCoordinate(topRightCoord);
    //     const bottomLeftPixel = map.getPixelFromCoordinate(bottomLeftCoord);
    //     const featureCenterPixel = map.getPixelFromCoordinate(featureCenter);
    //     const featureX = featureCenterPixel[0];
    //     const featureY = featureCenterPixel[1];
    //
    //     const top = topRightPixel[1];
    //     const right = topRightPixel[0];
    //     const bottom = bottomLeftPixel[1];
    //     const left = bottomLeftPixel[0];
    //     const featureWidth = right - left;
    //     const featureHeight = bottom - top;
    //
    //     const defaultNewX = featureX - (threshold.left - threshold.right) / 2;
    //     const defaultNewY = featureY - (threshold.top - threshold.bottom) / 2;
    //
    //     let newX = null;
    //     let newY = null;
    //     let newCenter = null;
    //
    //     if ((height >= threshold.top && top < threshold.top) ||
    //         (height >= threshold.bottom && bottom > (height - threshold.bottom))) {
    //         newY = defaultNewY;
    //     }
    //
    //     if ((width >= threshold.left && left < threshold.left) ||
    //         (width >= threshold.right && right > (width - threshold.right))) {
    //         newX = defaultNewX;
    //     }
    //
    //     if (!(newX === null && newY === null)) {
    //         newCenter = map.getCoordinateFromPixel([
    //             newX === null ? defaultNewX : newX,
    //             newY === null ? defaultNewY : newY
    //         ]);
    //     }
    //
    //     let animations = [];
    //     let anchor = featureCenter;
    //     let duration = 400;
    //
    //     if (newCenter !== null) {
    //         animations.push({ center: newCenter, duration });
    //     }
    //
    //     if (zoomIn &&
    //         currentZoom < maxZoom &&
    //         (featureWidth < zoomThreshold || featureHeight < zoomThreshold)) {
    //         let w = featureWidth;
    //         let h = featureHeight;
    //         let zoom = currentZoom;
    //         while (zoom < maxZoom && (w < zoomThreshold || h < zoomThreshold)) {
    //             zoom += 1; w *= 2; h *= 2;
    //         }
    //         animations.push({ zoom, anchor, duration });
    //     }
    //
    //     if (animations.length) {
    //         view.animate.apply(view, animations);
    //     }
    // }



    /* Feature Info */

    showFeatureInfo (feature) {
        // const id = feature.getId();
        // this.store.dispatch('SEARCH.SEARCH_BY_ID', { id, explicit: true });
    }

    hideFeatureInfo () {
        // const interactions = this.map.getInteractions();
        // const selected = interactions.getArray().filter(
        //     (interaction) => interaction instanceof SelectInteraction
        // );
        // selected.map((select) => select.getFeatures().clear());
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
}


class CenteringThreshold {
    top: number = 0;
    right: number = 0;
    bottom: number = 0;
    left: number = 0;
}
