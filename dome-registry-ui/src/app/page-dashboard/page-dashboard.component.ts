import { Field, Offset, Query, Review, ReviewService, Sort } from "../review.service";
import { AuthService } from "../auth.service";
import { computeDomeScore } from 'dome-registry-core';
import { ChangeDetectionStrategy, Component, EventEmitter, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, debounceTime, distinctUntilChanged, map, startWith, switchMap, tap } from "rxjs";
import { UserService } from "../user.service";

type Reviews = Array<Review>;


interface Score {
  // Score factors
  done: number;
  skip: number;
  // This must be computed
  percentage?: number;
}




@Component({
  selector: 'app-page-dashboard',
  templateUrl: './page-dashboard.component.html',
  styleUrls: ['./page-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageDashboardComponent {

  public readonly text$ = new BehaviorSubject<string>('');

  public readonly public$ = new BehaviorSubject<'true' | 'false'>('true');

  public readonly sort$ = new BehaviorSubject<Sort>({ by: 'publication.year', asc: 'false' });

  private readonly offset$ = new EventEmitter<Offset>();

  public readonly query$: Observable<Query>;

  public readonly score$: Observable<Map<string, Score>>
  private results: Reviews;

  public readonly results$: Observable<Reviews>;


  public get auth() {
    return !!this.authService.user?.auth;
  }
  constructor(
    private userService: UserService,
    // Dependency injection
    private reviewService: ReviewService,
    private authService: AuthService,) {

    // Define text pipeline
    const text$ = this.text$.pipe(
      // Filter value
      map((text) => text.replace(/[ \t]+/, ' ').trim()),
      // Wait before emitting
      debounceTime(400),
      // Do only if final value is distinct
      distinctUntilChanged(),
    );

    // Define offset pipeline
    const offset$ = this.offset$.pipe(
      // Compare current, previous offsets
      distinctUntilChanged((prev, curr) => prev.skip <= curr.skip),
      // Set original value
      startWith({ skip: 0, limit: 100 })
    );

    const [public$, sort$] = [this.public$, this.sort$];
    // Define query parameters pipeline
    this.query$ = combineLatest([text$, public$, sort$]).pipe(
      // Join all together in the same object
      map(([text, _public, sort]) => ({ text, public: _public, ...sort, skip: 0, limit: 100 })),
    );

    // Initialize results
    this.results = [];
    // Define results pipeline
    this.results$ = this.query$.pipe(
      // On query emission, reset results
      tap(() => this.results = []),
      // Subscribe to offset emission
      switchMap((query) => offset$.pipe(
        // Generate entire query
        map((offset) => ({ ...query, ...offset })),
      )),
      // Retrieve results
      switchMap((query) => this.reviewService.searchReviews(query)),
      tap((results) => {
        console.log({ results })
      }),
      // Update results
      map((results) => this.results = [...this.results, ...results]),
    );




  }
  public get user() {
    return this.authService.user;
  }



  public onTextChange(event: KeyboardEvent) {
    this.text$.next((event.target as HTMLInputElement).value);
  }
  

  public onPublicChange(event: boolean) {
    this.public$.next(event ? 'true' : 'false')
  }

  public onSortChange(by: Field) {
    // Get current sorting parameters
    let current = this.sort$.value;
    // Case selected field is equal to current field
    if (current.by === by) {
      // Then, just invert sorting order
      this.sort$.next({ by, asc: current.asc === 'true' ? 'false' : 'true' });
    }
    // Otherwise
    else {
      // Set new sorting parameter
      this.sort$.next({ by, asc: 'false' });
    }
  }

  public onScrollEnd() {
    // Emit new offset
    this.offset$.emit({ skip: this.results.length, limit: 100 });
  }

  public getowner(id : any  ){
    
    return this.userService.userInfo(id);

  }

  

}
