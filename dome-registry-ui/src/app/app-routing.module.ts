import { NgModule } from '@angular/core';
import { ExtraOptions, Route, RouterModule, Routes } from '@angular/router';
import { PageSearchComponent } from "./page-search/page-search.component";
import { ProfessionalSearchComponent } from "./professional-search/professional-search.component";
import { PageEditComponent } from "./page-edit/page-edit.component";
import { PageEditModernComponent } from "./page-edit-modern/page-edit-modern.component";
import { PageIntroComponent } from "./page-intro/page-intro.component";
//import { PageStatsComponent } from "./page-stats/page-stats.component";
import { SwaggerAPiComponent } from "./swagger-api/swagger-api.component";
import { AboutPageComponent } from './about-page/about-page.component';
import { PageDashboardComponent } from './page-dashboard/page-dashboard.component';
import { DSWCardComponent } from './dsw-card/dsw-card.component';
import { SubmissionPageComponent } from './submission-page/submission-page.component';
import { NewStateComponent } from './new-state/new-state.component';
import { IntegrationsStandardsComponent } from './integrations-standards/integrations-standards.component';
import { PoliciesComponent } from './policies/policies.component';
import { TeamsComponent } from './teams/teams.component';
import { GovernanceComponent } from './governance/governance.component';
import { WidgetResolverService } from './services/widget-script.guard';

// Define default parameters
const params: Route = {
  runGuardsAndResolvers: 'always',
  // resolve: {user: AuthResolver},
};
// Definer available routes
const routes: Routes = [
  // Define path to introduction page
  { ...params, path: 'intro', component: PageIntroComponent},
  // Define path to statistics page
  { ...params, path: 'stats', component: NewStateComponent,
    resolve: {
      widget: WidgetResolverService // Use the resolver to load the widget script
    }
  },
  // Define path to search page
  { ...params, path: 'search', component: ProfessionalSearchComponent },
  // Define path to list of reviews
  { ...params, path: 'review', component: SubmissionPageComponent },
  // Define path to list of reviews with modern UI
  //{ ...params, path: 'review-modern', component: PageEditModernComponent },
  // Define path to edit page, with id
  { ...params, path: 'review/:shortid', component: PageEditModernComponent },
  // Define path to modern edit page, with id
  //{ ...params, path: 'review-modern/:shortid', component: PageEditModernComponent },
  //Define path to the dashboard
  { ...params, path: 'dashboard', component: PageDashboardComponent },
  // Define a path to DSW
  {...params,path:'DSW', component: SubmissionPageComponent},
  // set path to about page
  { ...params, path: 'about', component: AboutPageComponent },
  // set path to integrations & standards page
  { ...params, path: 'integrations', component: IntegrationsStandardsComponent },
  // set path to policies page
  { ...params, path: 'policies', component: PoliciesComponent },
  // set path to teams page
  { ...params, path: 'teams', component: TeamsComponent },
  // set path to governance page
  { ...params, path: 'governance', component: GovernanceComponent },
   // set ther new statistics page



  //  // Set path to search page as default
  { ...params, path: '**', redirectTo: 'intro', pathMatch: 'full' },
];


const options: ExtraOptions = {
  useHash: false,
  anchorScrolling: 'enabled',
  onSameUrlNavigation: 'reload',
  // ...any other options you'd like to use
};


@NgModule({
  imports: [RouterModule.forRoot(routes, options)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
