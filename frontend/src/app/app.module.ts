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

import { MapService } from '../map/map.service';
import { SearchService } from '../search/search.service';
import { SidenavService } from '../sidenav/sidenav.service';


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
        MapService,
        SearchService,
        SidenavService
    ],
    bootstrap: [
        AppComponent
    ]
})

export class AppModule { }
