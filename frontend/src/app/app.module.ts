import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
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
    MdSidenavModule,
    MdToolbarModule
} from '@angular/material';

import { AppComponent } from './app.component';
import { AppToolbarComponent } from './toolbar.component';
import { MapComponent } from '../map/map.component';
import { MapFeatureInfoComponent } from '../map/feature-info.component';
import {
    SearchComponent,
    SearchErrorComponent,
    SearchResultsComponent
} from '../search/search.component';
import { SidenavComponent } from '../sidenav/sidenav.component';

import { SidenavBodyDirective } from '../sidenav/sidenav-body.directive';

import { SearchService } from '../search/search.service';
import { SidenavService } from '../sidenav/sidenav.service';

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        HttpModule,

        // Material
        FlexLayoutModule,
        MdButtonModule,
        MdCardModule,
        MdIconModule,
        MdInputModule,
        MdListModule,
        MdMenuModule,
        MdSidenavModule,
        MdToolbarModule
    ],
    declarations: [
        AppComponent,
        AppToolbarComponent,
        MapComponent,
        MapFeatureInfoComponent,
        SearchComponent,
        SearchErrorComponent,
        SearchResultsComponent,
        SidenavBodyDirective,
        SidenavComponent
    ],
    entryComponents: [
        MapFeatureInfoComponent,
        SearchErrorComponent,
        SearchResultsComponent
    ],
    providers: [
        SearchService,
        SidenavService
    ],
    bootstrap: [
        AppComponent
    ]
})

export class AppModule { }
