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
import {FormControl} from '@angular/forms';
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
  takeUntil, filter,
} from 'rxjs';
import {
  Field,
  Offset,
  Query,
  Review,
  ReviewService,
  Sort,
} from '../review.service';
import {AuthService} from '../auth.service';
import {NgbPaginationModule} from '@ng-bootstrap/ng-bootstrap';
import {DOCUMENT} from '@angular/common';
import {take} from 'rxjs';

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
  // Search behavior subjects
  public readonly text$ = new BehaviorSubject<string>(''); // Search text input
  public readonly filterCategory$ = new BehaviorSubject<string>('all'); // Default to 'all'
  public readonly public$ = new BehaviorSubject<'true' | 'false'>('true'); // Public filter
  public readonly sort$ = new BehaviorSubject<Sort>({ // Sorting criteria
    by: 'publication.year',
    asc: 'false',
  });

  public readonly score$: Observable<Map<string, Score>>;
  // Data streams
  public readonly query$: Observable<Query>; // Combined query parameters
  public readonly results$: Observable<Reviews>; // Paginated results
  private allResults: Reviews = []; // Full unfiltered results
  private destroy$ = new Subject<void>(); // Component cleanup subject

  // Auth helper
  public get auth() {
    return !!this.authService.user?.auth;
  }

  // Pagination controls
  public currentPage = 1;
  public itemsPerPage = 10;
  public totalItems = 0;
  private readonly page$ = new BehaviorSubject<{ page: number, pageSize: number }>({
    page: 1,
    pageSize: 10
  });


  constructor(
    // Dependency injection

    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document: Document,
    private reviewService: ReviewService,
    private authService: AuthService
  ) {
    // Text input pipeline with debounce and cleanup
    const text$ = this.text$.pipe(
      map((text) => text.replace(/[ \t]+/, ' ').trim()), // Normalize whitespace
      debounceTime(400), // Wait for typing to settle
      distinctUntilChanged() // Only emit when value changes
    );

    const [public$, sort$] = [this.public$, this.sort$];

// Combine all query parameters into single observable
    this.query$ = combineLatest([text$, this.public$, this.sort$, this.filterCategory$]).pipe(
      map(([text, _public, sort, category]) => ({
        text,
        public: _public,
        filterCategory: category,
        ...sort,
        skip: 0,
        limit: 100,
      })),
      tap(() => {
        // Reset to first page whenever query changes
        this.currentPage = 1;
        this.page$.next({ page: 1, pageSize: this.itemsPerPage });
      })
    );

    // Main results pipeline
    this.results$ = this.query$.pipe(
      tap(() => this.allResults = []), // Clear results on new query
      switchMap((query) => this.reviewService.searchReviews(query)),
      tap((results) => {
        this.totalItems = results.length;
        this.allResults = [...results]; // Store all results
      }),
      // Combine with pagination changes
      switchMap(() => this.page$.pipe(
        map(({page, pageSize}) => {
          this.currentPage = page;
          this.itemsPerPage = pageSize;
          return this.paginateResults(this.allResults);
        })
      ))
    );
  }

  // Pagination helper - slices results for current page
  private paginateResults(results: Reviews): Reviews {
    if (!results || results.length === 0) return [];
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return results.slice(startIndex, endIndex);
  }

  // Navigation to specific page
  public goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.page$.next({ page, pageSize: this.itemsPerPage });
  }


  // Calculate total pages for pagination controls
  public get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.itemsPerPage));
  }

  // Generate visible page numbers for pagination controls
  public get visiblePages(): number[] {
    const pages: number[] = [1]; // Always show first page
    const maxVisible = 5; // Current page + 2 on each side

    let start = Math.max(2, this.currentPage - 2);
    let end = Math.min(this.totalPages - 1, this.currentPage + 2);

    // Adjust ranges near boundaries
    if (this.currentPage <= 3) end = Math.min(5, this.totalPages - 1);
    else if (this.currentPage >= this.totalPages - 2) start = Math.max(this.totalPages - 4, 2);

    // Add ellipsis if needed before middle pages
    if (start > 2) pages.push(-1);

    // Add middle pages
    for (let i = start; i <= end; i++) pages.push(i);

    // Add ellipsis if needed after middle pages
    if (end < this.totalPages - 1) pages.push(-1);

    // Add last page if there are multiple pages
    if (this.totalPages > 1) pages.push(this.totalPages);

    return pages;
  }

  public onTextChange(event: KeyboardEvent) {
    console.log((event.target as HTMLInputElement).value);
    this.text$.next((event.target as HTMLInputElement).value);

    // Visual feedback for active filter
    this.updateFilterUI();
  }

  private updateFilterUI() {
    const activeCategory = this.filterCategory$.value;
    const dropdownItems = document.querySelectorAll('.dropdown-item');

    dropdownItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('data-value') === activeCategory) {
        item.classList.add('active');
      }
    });
  }

  public onPublicChange(event: boolean) {
    this.public$.next(event ? 'true' : 'false');
  }

  updateFilter(category: string) {
    this.filterCategory$.next(category);

    // Update the button text
    const labelMap = {
      'all': 'All Categories',
      'title': 'Title',
      'authors': 'Authors',
      'publication': 'Publication',
      'tags': 'Tags'
    };

    document.querySelector('.filter-label').textContent = labelMap[category] || 'All Categories';

    // Trigger search if there's existing text
    if (this.text$.value) {
      // Create a proper KeyboardEvent-like object
      const mockEvent = {
        target: {
          value: this.text$.value
        }
      } as unknown as KeyboardEvent; // Type assertion

      this.onTextChange(mockEvent);
    }
  }

  public onSortChange(by: Field) {
    // Get current sorting parameters
    let current = this.sort$.value;
    // Case selected field is equal to current field
    if (current.by === by) {
      // Then, just invert sorting order
      this.sort$.next({by, asc: current.asc === 'true' ? 'false' : 'true'});
    }
    // Otherwise
    else {
      // Set new sorting parameter
      this.sort$.next({by, asc: 'false'});
    }
  }


  public OnClickdownloadJSonfile($event: MouseEvent) {
    const json = JSON.stringify(this.allResults, null, 1);
    const blob = new Blob([json], {type: 'application/json'});
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

    // this.destroy$
    //   .asObservable()
    //   .pipe(
    //     tap(() => {
    //       // retirer markup
    //       this._renderer2.removeChild(this._document.body, this.jsonLD);
    //     }),
    //     take(1)
    //   )
    //   .subscribe();
  }
  ngOnDestroy(): void {
    // Cleanup
    this.destroy$.next();
    this.destroy$.complete();
    if (this.jsonLD) {
      this._renderer2.removeChild(this._document.body, this.jsonLD);
    }
  }
}
