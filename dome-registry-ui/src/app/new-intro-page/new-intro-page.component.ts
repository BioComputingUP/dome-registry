import {
  Component,
  OnDestroy,
  OnInit,
  Inject,
  Renderer2,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { AuthService } from '../auth.service';
import { PageSearchComponent } from '../page-search/page-search.component';
import { ReviewService } from '../review.service';
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

@Component({
  selector: 'app-new-intro-page',
  templateUrl: './new-intro-page.component.html',
  styleUrls: ['./new-intro-page.component.scss'],
})
export class NewIntroPageComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  jsonLd: any;
  private destroy$ = new Subject<void>();
  // Subscribe to user
  public readonly user$ = this.authService.user$;
  // Define card title
  public readonly title =
    'A database of annotations for published papers describing machine learning methods in biology.';
  // Compute the total number of entries
  public readonly count$: Observable<number> = this.reviewService
    .countElements()
    .pipe(shareReplay(1));
  public readonly countPr$: Observable<number> = this.reviewService
    .countPrivElements()
    .pipe(shareReplay(1));
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

  cards = [
    {
      title: 'Card 1',
      text: 'Content for card 1',
      button: 'Action 1',
    },
    {
      title: 'Card 2',
      text: 'Content for card 2',
      button: 'Action 2',
    },
    {
      title: 'Card 2',
      text: 'Content for card 2',
      button: 'Action 2',
    },
    {
      title: 'Card 2',
      text: 'Content for card 2',
      button: 'Action 2',
    },
    {
      title: 'Card 2',
      text: 'Content for card 2',
      button: 'Action 2',
    },
    {
      title: 'Card 2',
      text: 'Content for card 2',
      button: 'Action 2',
    },
    {
      title: 'Card 2',
      text: 'Content for card 2',
      button: 'Action 2',
    },
    {
      title: 'Card 2',
      text: 'Content for card 2',
      button: 'Action 2',
    },
    {
      title: 'Card 2',
      text: 'Content for card 2',
      button: 'Action 2',
    },
    {
      title: 'Card 2',
      text: 'Content for card 2',
      button: 'Action 2',
    },
    // Add more cards as needed
  ];

  scroll(direction: number): void {
    const element = this.scrollContainer.nativeElement;
    element.scrollBy({ top: direction * 100, behavior: 'smooth' });
  }

  // Dependency injection
  constructor(
    private authService: AuthService,
    private reviewService: ReviewService,
    private userService: UserService,
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document: Document
  ) {}

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

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
