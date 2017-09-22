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

import { NgReduxModule, NgRedux } from '@angular-redux/store';

import { AppComponent } from './app.component';
import { AppToolbarComponent } from './toolbar.component';
import { MapComponent } from '../map/map.component';
import {
    SearchComponent,
    SearchResultComponent
} from '../search/search.component';
import { SidenavComponent } from '../sidenav/sidenav.component';

import { SidenavBodyDirective } from '../sidenav/sidenav-body.directive';

import { rootReducer } from '../store/reducer';
import { AppState, INITIAL_STATE } from '../store/state';

import { MapActions } from '../map/map.actions';
import { SidenavActions } from '../sidenav/sidenav.actions';


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
        MdToolbarModule,

        // Redux
        NgReduxModule
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
        MapActions,
        SidenavActions
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {
    constructor (ngRedux: NgRedux<AppState>) {
        ngRedux.configureStore(rootReducer, INITIAL_STATE);
    }
}
