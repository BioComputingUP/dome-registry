import {ActivatedRoute, Router, RouterOutlet} from '@angular/router';
import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {switchMap} from 'rxjs';
import {AuthService} from './auth.service';
import { ReviewService } from './review.service';
import { NavbarComponent } from './navbar/navbar.component';
import { SmallFooterComponent } from './small-footer/small-footer.component';


@Component({
  standalone: true,
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, NavbarComponent, SmallFooterComponent],
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
    private router: Router,
    private reviewService:ReviewService
  ) {
    // Allow component reloading
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    // Just try to login
    this.authService.login();
  }

   //public readonly pagecopm = new PageSearchComponent(this.reviewwService,this.authService);
  //public readonly rs = this.pagecopm.numberofentries();



}
