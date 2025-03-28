import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Renderer2,
  Inject,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  Observable,
  BehaviorSubject,
  switchMap,
  combineLatest,
  distinctUntilChanged,
  debounceTime,
  map,
  tap,
  startWith,
  Subject,
  takeUntil,
} from 'rxjs';
import {
  Field,
  Offset,
  Query,
  Review,
  ReviewService,
  Sort,
} from '../review.service';
import { AuthService } from '../auth.service';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { DOCUMENT } from '@angular/common';
import { take } from 'rxjs';

type Reviews = Array<Review>;

interface Score {
  // Score factors
  done: number;
  skip: number;
  // This must be computed
  percentage?: number;
}
@Component({
  selector: 'app-page-search',
  templateUrl: './page-search.component.html',
  styleUrls: ['./page-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageSearchComponent implements OnInit, OnDestroy {
  @ViewChild('input') input: ElementRef<HTMLInputElement>;
  jsonLD: any;
  //public page = 3 ;
  public readonly text$ = new BehaviorSubject<string>('');

  public readonly public$ = new BehaviorSubject<'true' | 'false'>('true');

  public readonly sort$ = new BehaviorSubject<Sort>({
    by: 'publication.year',
    asc: 'false',
  });

  private readonly offset$ = new EventEmitter<Offset>();

  public readonly query$: Observable<Query>;

  public readonly score$: Observable<Map<string, Score>>;
  private results: Reviews;
  private destroy$ = new Subject<void>();
  public readonly results$: Observable<Reviews>;
  public get auth() {
    return !!this.authService.user?.auth;
  }

  constructor(
    // Dependency injection

    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document: Document,
    private reviewService: ReviewService,
    private authService: AuthService
  ) {
    // Define text pipeline
    const text$ = this.text$.pipe(
      // Filter value
      map((text) => text.replace(/[ \t]+/, ' ').trim()),
      // Wait before emitting
      debounceTime(400),
      // Do only if final value is distinct
      distinctUntilChanged()
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
      map(([text, _public, sort]) => ({
        text,
        public: _public,
        ...sort,
        skip: 0,
        limit: 100,
      }))
    );

    // Initialize results
    this.results = [];

    // Define results pipeline
    this.results$ = this.query$.pipe(
      // On query emission, reset results
      tap(() => (this.results = [])),
      // Subscribe to offset emission
      switchMap((query) =>
        offset$.pipe(
          // Generate entire query
          map((offset) => ({ ...query, ...offset }))
        )
      ),
      // Retrieve results
      switchMap((query) => this.reviewService.searchReviews(query)),
      tap((results) => {
        console.log({ results });
      }),
      // Update results
      map((results) => (this.results = [...this.results, ...results]))
    );
  }

  public onTextChange(event: KeyboardEvent) {
    console.log((event.target as HTMLInputElement).value);
    this.text$.next((event.target as HTMLInputElement).value);
  }

  public onPublicChange(event: boolean) {
    this.public$.next(event ? 'true' : 'false');
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

  ngOnDestroy(): void {
    this.destroy$.next();
  }
  public OnClickdownloadJSonfile($event: MouseEvent) {
    const json = JSON.stringify(this.results, null, 1);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = this._document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'BulkDome.json';
    this._document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);
  }

  ngOnInit(): void {
    // let script = this._renderer2.createElement('script');
    this.reviewService
      .GetSearchPageMarkup()
      .pipe(
        tap((response) => {
          this.jsonLD = this._renderer2.createElement('script');
          this.jsonLD.type = `application/ld+json`;
          this.jsonLD.text = JSON.stringify(response);
          this._renderer2.appendChild(this._document.body, this.jsonLD);
        }),
        takeUntil(this.destroy$.asObservable())
      )
      .subscribe();

    this.destroy$
      .asObservable()
      .pipe(
        tap(() => {
          // retirer markup
          this._renderer2.removeChild(this._document.body, this.jsonLD);
        }),
        take(1)
      )
      .subscribe();
  }
}
