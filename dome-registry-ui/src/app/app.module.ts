import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PageSearchComponent } from './page-search/page-search.component';
import { PageEditComponent } from './page-edit/page-edit.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { ReactiveFormsModule } from "@angular/forms";
//import { SwaggerUIModule } from 'angular-swagger-ui';
import { PageIntroComponent } from './page-intro/page-intro.component';
import { ScrollSpyDirective } from './scroll-spy.directive';
////import { PageStatsComponent } from './page-stats/page-stats.component';
import { PlotlyViaCDNModule } from 'angular-plotly.js';
import { CardSectionComponent } from './card-section/card-section.component';
import { CardNavComponent } from './card-nav/card-nav.component';
import { CardTemplateComponent } from './card-template/card-template.component';
import { AuthInterceptor } from "./auth.interceptor";
import { ScrollEndDirective } from './scroll-end.directive';
import { CookieModule } from "ngx-cookie";
import { SwaggerAPiComponent } from './swagger-api/swagger-api.component';
import { AboutPageComponent } from './about-page/about-page.component';
import { PageDashboardComponent } from './page-dashboard/page-dashboard.component';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { DSWCardComponent } from './dsw-card/dsw-card.component';
import { NewStateComponent } from './new-state/new-state.component';
import { NgxMatomoTrackerModule } from '@ngx-matomo/tracker';
import { NgxMatomoRouterModule } from '@ngx-matomo/router'
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import {ToastrModule} from "ngx-toastr";
import { SubmitComponent } from './submit/submit.component';
import { BigFooterComponent } from './big-footer/big-footer.component';
import { SmallFooterComponent } from './small-footer/small-footer.component';
import { NavbarComponent } from './navbar/navbar.component';
import { IntegrationsStandardsComponent } from './integrations-standards/integrations-standards.component';
import { PoliciesComponent } from './policies/policies.component';
import { TeamsComponent } from './teams/teams.component';
import { GovernanceComponent } from './governance/governance.component';
import { ScoreComponent } from './score/score.component';
import { ReviewService } from './review.service';
import { StatService } from './stat.service';

// Set Plotly.js from CDN
PlotlyViaCDNModule.setPlotlyVersion('2.12.1'); // can be `latest` or any version number (i.e.: '1.40.0')
PlotlyViaCDNModule.setPlotlyBundle('cartesian'); // optional: can be null (for full) or 'basic', 'cartesian', 'geo', 'gl3d', 'gl2d', 'mapbox' or 'finance'


@NgModule({
    declarations: [
        AppComponent,
        PageSearchComponent,
        PageEditComponent,
        PageIntroComponent,
        ScrollSpyDirective,
        CardSectionComponent,
        CardNavComponent,
        CardTemplateComponent,
        ScrollEndDirective,
        SwaggerAPiComponent,
        AboutPageComponent,
        PageDashboardComponent,
        DSWCardComponent,
        NewStateComponent,
        SubmitComponent,
        BigFooterComponent,
        SmallFooterComponent,
        NavbarComponent,
        IntegrationsStandardsComponent,
        PoliciesComponent,
        TeamsComponent,
        GovernanceComponent,
        ScoreComponent,
    ],
    imports: [
        PlotlyViaCDNModule,
        BrowserModule,
        CommonModule,
        ReactiveFormsModule,
        HttpClientModule,
        NgbModule,
        NgbPaginationModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        CookieModule.forRoot(),
        NgxMatomoTrackerModule.forRoot({
            trackerUrl: 'https://matomo.biocomputingup.it/',
            siteId: '23',
            scriptUrl: 'https://matomo.biocomputingup.it/matomo.js'
        }),
        NgxMatomoRouterModule,
        BrowserModule,
        BrowserAnimationsModule, // Required for animations
        ToastrModule.forRoot({// Toastr configuration
            timeOut: 3000,        // Default auto-close time (3 sec)
            positionClass: 'toast-top-right',
            preventDuplicates: true,
            closeButton: true,
            progressBar: true
        }),
    ],
    providers: [
        // Add authentication interceptor (set cookie)
        {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
        ReviewService,
        StatService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [
    SubmitComponent,
    BigFooterComponent,
    SmallFooterComponent
  ],
    bootstrap: [AppComponent,]
})
export class AppModule {
}
