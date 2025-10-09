import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PageSearchComponent } from './page-search/page-search.component';
import { ProfessionalSearchComponent } from './professional-search/professional-search.component';
import { PageEditComponent } from './page-edit/page-edit.component';
import { PageEditModernComponent } from './page-edit-modern/page-edit-modern.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { ReactiveFormsModule } from "@angular/forms";
//import { SwaggerUIModule } from 'angular-swagger-ui';
import { PageIntroComponent } from './page-intro/page-intro.component';
import { ScrollSpyDirective } from './scroll-spy.directive';
////import { PageStatsComponent } from './page-stats/page-stats.component';
import { PlotlyModule } from 'angular-plotly.js';
import * as PlotlyJS from 'plotly.js-dist-min';
import { CardSectionComponent } from './card-section/card-section.component';
import { CardNavComponent } from './card-nav/card-nav.component';
import { CardTemplateComponent } from './card-template/card-template.component';
import { AuthInterceptor } from "./auth.interceptor";
import { ScrollEndDirective } from './scroll-end.directive';
import { SwaggerAPiComponent } from './swagger-api/swagger-api.component';
import { AboutPageComponent } from './about-page/about-page.component';
import { PageDashboardComponent } from './page-dashboard/page-dashboard.component';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { DSWCardComponent } from './dsw-card/dsw-card.component';
import { NgxMatomoTrackerModule } from 'ngx-matomo-client/core';
import { NgxMatomoRouterModule } from 'ngx-matomo-client/router'
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import {ToastrModule} from "ngx-toastr";
import { SmallFooterComponent } from './small-footer/small-footer.component';
import { NavbarComponent } from './navbar/navbar.component';
import { IntegrationsStandardsComponent } from './integrations-standards/integrations-standards.component';
import { PoliciesComponent } from './policies/policies.component';
import { TeamsComponent } from './teams/teams.component';
import { GovernanceComponent } from './governance/governance.component';
import { ScoreComponent } from './score/score.component';
import { ReviewService } from './review.service';
import { StatService } from './stat.service';
import { NewStateModule } from './new-state/new-state.module';
import { SharedModule } from './shared/shared.module';
import { SubmissionPageComponent } from './submission-page/submission-page.component';
import { CookieService } from 'ngx-cookie-service';

// Configure Plotly to use the locally bundled Plotly.js distribution
(PlotlyModule as any).plotlyjs = PlotlyJS;


@NgModule({
    declarations: [
        AppComponent,
        PageSearchComponent,
        ProfessionalSearchComponent,
        PageEditComponent,
        PageEditModernComponent,
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
        SmallFooterComponent,
        NavbarComponent,
        IntegrationsStandardsComponent,
        PoliciesComponent,
        TeamsComponent,
        GovernanceComponent,
        ScoreComponent,
        SubmissionPageComponent,
    ],
    imports: [
        PlotlyModule,
        BrowserModule,
        CommonModule,
        ReactiveFormsModule,
        HttpClientModule,
        NgbModule,
        NgbPaginationModule,
        BrowserAnimationsModule,
        AppRoutingModule,
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
        NewStateModule,
        SharedModule
    ],
    providers: [
        // Add authentication interceptor (set cookie)
        {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
        ReviewService,
        StatService,
        CookieService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [
    SmallFooterComponent
  ],
    bootstrap: [AppComponent,]
})
export class AppModule {
}
