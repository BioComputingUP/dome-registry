import {catchError, from, map, of, ReplaySubject, shareReplay, switchMap, tap} from 'rxjs';
import {EventEmitter, Injectable} from '@angular/core';
import {User, UserService} from './user.service';
import {environment as env} from '../environments/environment';
import {CookieService} from 'ngx-cookie-service';


export type Token = string;


export function isTokenExpired(token: Token): boolean {
  // Parse JWT token, get expiration time
  const exp = (JSON.parse(atob(token.split('.')[1]))).exp;
  // Get current time, to check JWT expiration time against it
  const now = (Math.floor((new Date).getTime() / 1000));
  // Check whether JWT token already expired
  return now >= exp;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Define authorization URL
  public readonly url = `${env.backend}/auth/orcid`;

  // Define current user
  // NOTE This gets updated as observable emits
  public user!: User;

  // Retrieve token from cookies
  public get token() {
    return this.cookieService.get('jwt');
  }

  // Define token emitter
  public readonly token$ = new ReplaySubject<Token>();

  // Define pipe to retrieve user on subscription
  public readonly user$ = this.token$.pipe(
    // Retrieve user data
    switchMap((token) => {
      // Case token is set
      if (token) {
        // Case token is valid
        if (!isTokenExpired(token)) {
          // Then, try retrieving user data
          return this.userService.getUser().pipe(
            // Catch any error
            catchError((error) => of(undefined))
          );
        }
      }
      // Otherwise, return undefined user
      return of(undefined);
    }),
    // Finally, define user
    map((user) => ({name: '', email: '', orcid: '', ...user, auth: !!user})),
    // Eventually, store user
    tap((user) => this.user = user),
    // Cache result
    shareReplay(1),
  );

  constructor(
    private cookieService: CookieService,
    private userService: UserService,
  ) {
  }

  // Define login function
  public login() {
    // Just emit token
    this.token$.next(this.token);
  }

  // Define logout function
  public logout() {

    // First, remove token
    this.cookieService.delete('jwt');
    sessionStorage.clear()
    // Then, emit it
    this.token$.next(this.token);
  }

}
