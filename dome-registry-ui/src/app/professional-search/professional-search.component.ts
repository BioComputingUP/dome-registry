import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  Renderer2,
  Inject,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import {
  Observable,
  BehaviorSubject,
  switchMap,
  combineLatest,
  distinctUntilChanged,
  debounceTime,
  map,
  tap,
  Subject,
  takeUntil,
} from 'rxjs';
import {
  Field, Query,
  Review,
  ReviewService,
  Sort,
} from '../review.service';
import {AuthService} from '../auth.service';
import {CommonModule, DOCUMENT} from '@angular/common';
import {RouterLink} from '@angular/router';
import {AsArrayPipe} from '../shared/as-array.pipe';

type Reviews = Array<Review>;

interface Score {
  // Score factors
  done: number;
  skip: number;
  // This must be computed
  percentage?: number;
}

@Component({
  selector: 'app-professional-search',
  standalone: true,
  imports: [
    // Angular common directives and pipes (*ngIf, *ngFor, async, date, etc.)
    CommonModule,
    // RouterLink directive used in template
    RouterLink,
    // Custom pipes
    AsArrayPipe,
  ],
  templateUrl: './professional-search.component.html',
  styleUrls: ['./professional-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfessionalSearchComponent implements OnInit, OnDestroy {
  @ViewChild('input') input: ElementRef<HTMLInputElement>;
  jsonLD: any;

  // Citation modal state
  public isCiteModalOpen = false;
  public currentPageUrl: string = '';
  public bibTexCitation: string = '';
  public citeTargetReview: Review | null = null;

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

  // UI state
  public isFilterDropdownOpen = false;
  public isSortDropdownOpen = false;
  public activeFilter = 'All Categories';

  constructor(
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
        this.page$.next({page: 1, pageSize: this.itemsPerPage});
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
    this.page$.next({page, pageSize: this.itemsPerPage});
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

  public getScorePercent(score: number): number {
    if (score == null || Number.isNaN(score)) return 0;
    const percent = score * 100;
    return Math.max(0, Math.min(100, percent));
  }

  public onTextChange(event: KeyboardEvent) {
    this.text$.next((event.target as HTMLInputElement).value);
  }

  public toggleFilterDropdown(): void {
    this.isFilterDropdownOpen = !this.isFilterDropdownOpen;

    // Close sort dropdown if it's open
    if (this.isFilterDropdownOpen && this.isSortDropdownOpen) {
      this.isSortDropdownOpen = false;
    }

    // Let CSS handle the positioning naturally
    // No need to set explicit coordinates
  }

  public toggleSortDropdown(): void {
    this.isSortDropdownOpen = !this.isSortDropdownOpen;

    // Close filter dropdown if it's open
    if (this.isSortDropdownOpen && this.isFilterDropdownOpen) {
      this.isFilterDropdownOpen = false;
    }
  }

  public closeFilterDropdown(): void {
    this.isFilterDropdownOpen = false;
    // No need to reset styles - let CSS handle it
  }

  public getActiveSortLabel(sortBy: string): string {
    const sortLabels = {
      'publication.title': 'Title',
      'publication.authors': 'Authors',
      'publication.year': 'Year',
      'score': 'Score'
    };

    return sortLabels[sortBy] || 'Year';
  }

  public onPublicChange(event: boolean) {
    this.public$.next(event ? 'true' : 'false');
  }

  public updateFilter(category: string) {
    this.filterCategory$.next(category);
    this.isFilterDropdownOpen = false;

    // No need to reset styles - let CSS handle it

    // Update the button text
    const labelMap = {
      'all': 'All Categories',
      'title': 'Title',
      'authors': 'Authors',
      'publication': 'Publication',
      'tags': 'Tags'
    };

    this.activeFilter = labelMap[category] || 'All Categories';

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

    // Add click outside listener for dropdown
    document.addEventListener('click', this.handleOutsideClick.bind(this));
  }

  private handleOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Close filter dropdown if click is outside the dropdown
    if (this.isFilterDropdownOpen) {
      const filterDropdown = document.querySelector('.filter-dropdown');
      const filterButton = document.querySelector('.filter-button');

      if (filterDropdown && filterButton && !filterDropdown.contains(target) && !filterButton.contains(target)) {
        this.isFilterDropdownOpen = false;
      }
    }

    // Close sort dropdown if click is outside the dropdown
    if (this.isSortDropdownOpen) {
      const sortDropdown = document.querySelector('.sort-dropdown');
      const sortButton = document.querySelector('.sort-dropdown-button');

      if (sortDropdown && sortButton && !sortDropdown.contains(target) && !sortButton.contains(target)) {
        this.isSortDropdownOpen = false;
      }
    }
  }

  // Open citation modal for a given review
  public openCiteModal(review: Review): void {
    this.citeTargetReview = review;
    this.currentPageUrl = `${window.location.origin}/review/${review.shortid}`;

    const authors = review.publication.authors || 'Unknown Authors';
    const title = review.publication.title || 'Untitled';
    const year = review.publication.year || new Date().getFullYear();
    const journal = review.publication.journal || 'DOME Registry';
    const doi = review.publication.doi || '';

    this.bibTexCitation = `@article{${review.shortid || 'dome'},
  author = {${authors}},
  title = {${title}},
  journal = {${journal}},
  year = {${year}},
  doi = {${doi}},
  url = {${this.currentPageUrl}}
}`;

    this.isCiteModalOpen = true;

    setTimeout(() => {
      const modalElement = document.querySelector('.cite-modal') as HTMLElement | null;
      if (modalElement) {
        const firstInput = modalElement.querySelector('input') as HTMLInputElement | null;
        if (firstInput) firstInput.focus();
      }
    }, 100);
  }

  // Close citation modal
  public closeCiteModal(): void {
    this.isCiteModalOpen = false;
  }

  // Handle escape key press to close modal
  @HostListener('document:keydown.escape')
  public handleEscapeKey(): void {
    if (this.isCiteModalOpen) {
      this.closeCiteModal();
    }
  }

  // Handle click outside modal to close it
  public onModalOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeCiteModal();
    }
  }

  // Copy text to clipboard
  public copyToClipboard(element: HTMLInputElement | HTMLTextAreaElement): void {
    element.select();
    this._document.execCommand('copy');
  }

  ngOnDestroy(): void {
    // Cleanup
    this.destroy$.next();
    this.destroy$.complete();
    if (this.jsonLD) {
      this._renderer2.removeChild(this._document.body, this.jsonLD);
    }

    // Remove click outside listener
    document.removeEventListener('click', this.handleOutsideClick.bind(this));
  }
}
