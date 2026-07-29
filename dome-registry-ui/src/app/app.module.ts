import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { ReactiveFormsModule } from "@angular/forms";
import { PlotlyModule } from 'angular-plotly.js';
import * as PlotlyJS from 'plotly.js-dist-min';
import { NgxMatomoTrackerModule } from 'ngx-matomo-client/core';
import { NgxMatomoRouterModule } from 'ngx-matomo-client/router'
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import {ToastrModule} from "ngx-toastr";
import { SmallFooterComponent } from './small-footer/small-footer.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ReviewService } from './review.service';
import { StatService } from './stat.service';
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PageEditNewComponent } from './page-edit-new/page-edit-new.component';
import { NewStateModule } from './new-state/new-state.module';
import { SharedModule } from './shared/shared.module';
import { CookieService } from 'ngx-cookie-service';
import { ReviewNewService } from './review-new.service';

// Configure Plotly to use the locally bundled Plotly.js distribution
(PlotlyModule as any).plotlyjs = PlotlyJS;


@NgModule({
  declarations: [],
  imports: [
    AppComponent,
    PlotlyModule,
    BrowserModule,
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule,
    NgbPaginationModule,
    PageEditNewComponent,
    BrowserAnimationsModule, // Required for animations
    AppRoutingModule,

    ToastrModule.forRoot({// Toastr configuration
      timeOut: 3000,        // Default auto-close time (3 sec)
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      closeButton: true,
      progressBar: true
    }),
    NewStateModule,
    SharedModule,
    SmallFooterComponent,
    NavbarComponent,
  ],
  providers: [
    // Add authentication interceptor (set cookie)
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
    ReviewNewService,
    ReviewService,
    StatService,
    CookieService,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [
    SmallFooterComponent
  ],
})
export class AppModule {}
