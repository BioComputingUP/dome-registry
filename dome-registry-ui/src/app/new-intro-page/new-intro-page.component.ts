import {
  Component,
  OnDestroy,
  OnInit,
  Inject,
  Renderer2,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { AuthService } from '../auth.service';
import { PageSearchComponent } from '../page-search/page-search.component';
import { ReviewService,Review } from '../review.service';
import { HttpClient } from '@angular/common/http';
import { result } from 'lodash';
import {
  Observable,
  Subject,
  Subscription,
  interval,
  map,
  share,
  shareReplay,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { UserService } from '../user.service';
import { DOCUMENT } from '@angular/common';
type Reviews = Array<Review>;
@Component({
  selector: 'app-new-intro-page',
  templateUrl: './new-intro-page.component.html',
  styleUrls: ['./new-intro-page.component.scss'],
})
export class NewIntroPageComponent implements OnInit, OnDestroy, AfterViewInit {


  @ViewChild('cardsContainer') cardsContainer!: ElementRef;
  jsonLd: any;
  private destroy$ = new Subject<void>();
  // Subscribe to user
  public readonly user$ = this.authService.user$;
  allResults: Reviews = []; // Full unfiltered results
  public readonly latestReviews$: Observable<Reviews>;

  private readonly fetchLatestTrigger$ = new Subject<void>();

  // Define card title
  public readonly title =
    'A database of annotations for published papers describing machine learning methods in biology.';

    // Compute the total number of entries
  public readonly count$: Observable<number> = this.reviewService
    .countElements()
    .pipe(shareReplay(1));

 // Compute the total number of private entries
    public readonly countPr$: Observable<number> = this.reviewService
    .countPrivElements()
    .pipe(shareReplay(1));
  // Compute the total number of users
  public readonly countUsers$: Observable<number> = this.userService
    .getTotalNumber()
    .pipe(shareReplay(1));

  public readonly countCounter$ = this.count$.pipe(
    switchMap((count: number) => {
      return interval(1).pipe(
        map((counter) => counter),
        take(count)
      );
    })
  );
  public readonly countPreson = this.countUsers$.pipe(
    switchMap((count: number) => {
      return interval(1).pipe(
        map((counter) => counter),
        take(count)
      );
    })
  );

  public readonly countProgres$ = this.countPr$.pipe(
    switchMap((count: number) => {
      return interval(1).pipe(
        map((counter) => counter),
        take(count)
      );
    })
  );


  handleHorizontalScroll = (event: WheelEvent): void => {
    // Prevent the default vertical scroll
    event.preventDefault();

    // Get the cards container element
    const cardsElement = this.cardsContainer.nativeElement;

    // Determine scroll amount based on the wheel delta and multiply by 3 for faster scrolling
    const scrollAmount = (event.deltaY || event.deltaX)*2;

    // Scroll horizontally with auto behavior for faster response
    cardsElement.scrollBy({
      left: scrollAmount,
      behavior: 'smooth',
    });
  }

  // Dependency injection
  constructor(
    private authService: AuthService,
    private reviewService: ReviewService,
    private userService: UserService,
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document: Document
  ) {

    this.latestReviews$ = this.reviewService.getTenLatestReviews().pipe(
      tap(() => this.allResults = []),
      tap((results) => {
        this.allResults = [...results]; // Store all results
      })
    );
console.log(this.latestReviews$);
}


  ngOnInit(): void {
    //add jsonLD to the page
    this.reviewService
      .GetHomePageMarkup()
      .pipe(
        tap((response) => {
          this.jsonLd = this._renderer2.createElement('script');
          this.jsonLd.type = `application/ld+json`;
          this.jsonLd.text = JSON.stringify(response);
          this._renderer2.appendChild(this._document.body, this.jsonLd);
        }),
        takeUntil(this.destroy$.asObservable())
      )
      .subscribe();
    this.destroy$
      .asObservable()
      .pipe(
        tap(() => {
          //  Delete markup
          this._renderer2.removeChild(this._document.body, this.jsonLd);
        }),
        take(1)
      )
      .subscribe();
  }



  ngAfterViewInit(): void {
    // Set up horizontal scroll for cards container
    if (this.cardsContainer && this.cardsContainer.nativeElement) {
      this.cardsContainer.nativeElement.addEventListener('wheel', this.handleHorizontalScroll);
    }
  }

  ngOnDestroy(): void {
    // Clean up the wheel event listener
    if (this.cardsContainer && this.cardsContainer.nativeElement) {
      this.cardsContainer.nativeElement.removeEventListener('wheel', this.handleHorizontalScroll);
    }

    this.destroy$.next();
  }
}
