import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  // Handle current token update
  public readonly token$ = this.authService.token$;

  // Retrieve user out of request
  public readonly user$ = this.token$.pipe(
    // Emit current user, if any
    switchMap(() => this.authService.user$),
  );

  // Define login URL
  public readonly login = this.authService.url;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Define logout function
  public logout() {
    // Just call logout function
    this.authService.logout();
    // Then, reload current page
    this.router.navigate([this.router.url]);
  }
}
