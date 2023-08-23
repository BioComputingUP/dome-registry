import {NgModule} from '@angular/core';
import {ExtraOptions, Route, RouterModule, Routes} from '@angular/router';
import {PageSearchComponent} from "./page-search/page-search.component";
import {PageEditComponent} from "./page-edit/page-edit.component";
import {PageIntroComponent} from "./page-intro/page-intro.component";
import {PageStatsComponent} from "./page-stats/page-stats.component";
import {SwaggerAPiComponent} from "./swagger-api/swagger-api.component" ;
import { AboutPageComponent } from './about-page/about-page.component';

// Define default parameters
const params: Route = {
  runGuardsAndResolvers: 'always',
  // resolve: {user: AuthResolver},
};
// Definer available routes
const routes: Routes = [
  // Define path to introduction page
  {...params, path: 'intro', component: PageIntroComponent},
  // Define path to statistics page
  {...params, path: 'stats', component: PageStatsComponent},
  // Define path to search page
  {...params, path: 'search', component: PageSearchComponent},
  // Define path to edit page, with id
  {...params, path: 'review', component: PageEditComponent},
  {...params, path: 'review/:uuid', component: PageEditComponent},
  // set path to swagger page 
 /*  {...params, path:'api', redirectTo: ''}, */

  // set path to about page
  {...params,path : 'about', component:AboutPageComponent},
  // Set path to search page as default

  {...params, path: '**', redirectTo: 'intro', pathMatch: 'full'},
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
