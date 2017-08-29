import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FlexLayoutModule } from '@angular/flex-layout';
import {
    MdButtonModule,
    MdCardModule,
    MdIconModule,
    MdInputModule,
    MdListModule,
    MdMenuModule,
    MdProgressSpinnerModule,
    MdSidenavModule,
    MdSnackBarModule,
    MdToolbarModule
} from '@angular/material';

import { AppComponent } from './app.component';
import { AppToolbarComponent } from './toolbar.component';
import { MapComponent } from '../map/map.component';
import {
    SearchComponent,
    SearchResultComponent
} from '../search/search.component';
import { SidenavComponent } from '../sidenav/sidenav.component';

import { SidenavBodyDirective } from '../sidenav/sidenav-body.directive';

import { AppState } from './state';
import { InitialState, Store } from '../store';

import { MapActions } from '../map/map.actions';


const initialState: AppState = {
    busy: false,
    map: {
        zoom: 1,
        center: [0, 0],
        extent: null,
        fullExtent: [-13657661.739414563, 5700905.92043886, -13655116.88116592, 5702920.846916851],
        selectedFeature: null,
    },
    search: {
        term: null,
    },
    sidenav: {
        open: false,
        content: null,
    }
};


@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        HttpClientModule,

        // Material
        FlexLayoutModule,
        MdButtonModule,
        MdCardModule,
        MdIconModule,
        MdInputModule,
        MdListModule,
        MdMenuModule,
        MdProgressSpinnerModule,
        MdSidenavModule,
        MdSnackBarModule,
        MdToolbarModule
    ],
    declarations: [
        AppComponent,
        AppToolbarComponent,
        MapComponent,
        SearchComponent,
        SearchResultComponent,
        SidenavBodyDirective,
        SidenavComponent
    ],
    entryComponents: [
        SearchResultComponent
    ],
    providers: [
        {
            provide: InitialState,
            useValue: initialState
        },
        MapActions,
        Store
    ],
    bootstrap: [
        AppComponent
    ]
})

export class AppModule { }
