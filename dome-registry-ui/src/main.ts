import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter, withEnabledBlockingInitialNavigation } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { PlotlyModule } from 'angular-plotly.js';
import * as PlotlyJS from 'plotly.js-dist-min';
import { ToastrModule } from 'ngx-toastr';
import { NgxMatomoTrackerModule } from 'ngx-matomo-client/core';
import { NgxMatomoRouterModule } from 'ngx-matomo-client/router';

import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { routes } from './app/app-routing.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './app/auth.interceptor';
import { SharedModule } from './app/shared/shared.module';
import { NewStateModule } from './app/new-state/new-state.module';

if (environment.production) {
  enableProdMode();
}

// Configure Plotly to use the locally bundled Plotly.js distribution
(PlotlyModule as any).plotlyjs = PlotlyJS;

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes, withEnabledBlockingInitialNavigation()),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(
      BrowserAnimationsModule,
      NgbModule,
      NgbPaginationModule,
      PlotlyModule,
      ToastrModule.forRoot({
        timeOut: 3000,
        positionClass: 'toast-top-right',
        preventDuplicates: true,
        closeButton: true,
        progressBar: true,
      }),
      NgxMatomoTrackerModule.forRoot({
        trackerUrl: 'https://matomo.biocomputingup.it/',
        siteId: '23',
        scriptUrl: 'https://matomo.biocomputingup.it/matomo.js',
      }),
      NgxMatomoRouterModule,
      SharedModule,
      NewStateModule,
    ),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
}).catch(err => console.error(err));
