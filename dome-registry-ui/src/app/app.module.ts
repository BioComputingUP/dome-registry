import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {PageSearchComponent} from './page-search/page-search.component';
import {PageEditComponent} from './page-edit/page-edit.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {ReactiveFormsModule} from "@angular/forms";
import {PageIntroComponent} from './page-intro/page-intro.component';
import {ScrollSpyDirective} from './scroll-spy.directive';
import {PageStatsComponent} from './page-stats/page-stats.component';
import {PlotlyViaCDNModule} from 'angular-plotly.js';
import {CardSectionComponent} from './card-section/card-section.component';
import {CardNavComponent} from './card-nav/card-nav.component';
import {CardTemplateComponent} from './card-template/card-template.component';
import {AuthInterceptor} from "./auth.interceptor";
import {ScrollEndDirective} from './scroll-end.directive';
import {CookieModule} from "ngx-cookie";


// Set Plotly.js from CDN
PlotlyViaCDNModule.setPlotlyVersion('2.12.1'); // can be `latest` or any version number (i.e.: '1.40.0')
PlotlyViaCDNModule.setPlotlyBundle('cartesian'); // optional: can be null (for full) or 'basic', 'cartesian', 'geo', 'gl3d', 'gl2d', 'mapbox' or 'finance'

// // NOTE this ios required for Plotly to work properly
// PlotlyModule.plotlyjs = PlotlyJS;

@NgModule({
  declarations: [
    AppComponent,
    PageSearchComponent,
    PageEditComponent,
    PageIntroComponent,
    ScrollSpyDirective,
    PageStatsComponent,
    CardSectionComponent,
    CardNavComponent,
    CardTemplateComponent,
    ScrollEndDirective,
  ],
  imports: [
    PlotlyViaCDNModule,
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    NgbModule,
    CookieModule.forRoot(),
  ],
  providers: [
    // Add authentication interceptor (set cookie)
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
  ],
  bootstrap: [AppComponent,]
})
export class AppModule {
}
