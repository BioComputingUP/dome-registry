import {ActivatedRoute, NavigationEnd, NavigationStart, Router} from '@angular/router';
import {Component, EventEmitter} from '@angular/core';
import {filter, map, pluck, shareReplay, switchMap, tap} from 'rxjs';
import {AuthService} from './auth.service';
import {User} from './user.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  // Define application's title
  public readonly title = 'dome-registry';

  // Handle current token update
  public readonly token$ = this.authService.token$;

  // Retrieve user out of request
  public readonly user$ = this.token$.pipe(
    // Emit current user, if any
    switchMap(() => this.authService.user$),
  );

  constructor(
    private activeRoute: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {
    // Allow component reloading
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    // Just try to login
    this.authService.login();
  }

  // Define login URL
  public readonly login = this.authService.url;

  // Define logout function
  public logout() {
    // Just call logout function
    this.authService.logout();
    // Then, reload current page
    this.router.navigate([this.router.url]);
  }

}
