import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, OnDestroy, OnInit, Inject, Renderer2 } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn } from "@angular/forms";
import { expand, map, merge, Observable, of, share, shareReplay, startWith, Subject, switchMap, takeUntil, tap, } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { Location } from "@angular/common";

import { ReviewService } from "../review.service";
import { Review, computeDomeScore, isValidField } from "dome-registry-core";
import { AuthService } from "../auth.service";
import { DOCUMENT } from '@angular/common';
import { take } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {ToastrService} from 'ngx-toastr';


// Define score entry
interface Score {
  // Score factors
  done: number;
  skip: number;
  // This must be computed
  percentage?: number;
}


// Define validator for ND values
export function notDefinedValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    // Check field validity
    return isValidField('', control.value + '') ? null : { notDefined: true };
  };
}


@Component({
  selector: 'app-page-edit-modern',
  templateUrl: './page-edit-modern.component.html',
  styleUrls: ['./page-edit-modern.component.scss'],
})
export class PageEditModernComponent implements OnInit, OnDestroy {

  private readonly initial: Partial<Review>;

  public readonly updates = this.formBuilder.group({
    shortid: ['',],
    uuid: ['',],
    publication: this.formBuilder.group({
      pmid: ['', [notDefinedValidator(),]],
      created: ['',],
      updated: ['',],
      doi: ['', [notDefinedValidator(),]],
      title: ['', [notDefinedValidator(),]],
      authors: ['', [notDefinedValidator(),]],
      journal: ['', [notDefinedValidator(),]],
      year: ['', [notDefinedValidator(),]],
      tags : ['',[notDefinedValidator(),]],
    }),
    dataset: this.formBuilder.group({
      provenance: ['', [notDefinedValidator(),]],
      splits: ['', [notDefinedValidator(),]],
      redundancy: ['', [notDefinedValidator(),]],
      availability: ['', [notDefinedValidator(),]],
    }),
    optimization: this.formBuilder.group({
      algorithm: ['', [notDefinedValidator(),]],
      meta: ['', [notDefinedValidator(),]],
      encoding: ['', [notDefinedValidator(),]],
      parameters: ['', [notDefinedValidator(),]],
      features: ['', [notDefinedValidator(),]],
      fitting: ['', [notDefinedValidator(),]],
      regularization: ['', [notDefinedValidator(),]],
      config: ['', [notDefinedValidator(),]],
    }),
    model: this.formBuilder.group({
      interpretability: ['', [notDefinedValidator(),]],
      output: ['', [notDefinedValidator(),]],
      duration: ['', [notDefinedValidator(),]],
      availability: ['', [notDefinedValidator(),]],
    }),
    evaluation: this.formBuilder.group({
      method: ['', [notDefinedValidator(),]],
      measure: ['', [notDefinedValidator(),]],
      comparison: ['', [notDefinedValidator(),]],
      confidence: ['', [notDefinedValidator(),]],
      availability: ['', [notDefinedValidator(),]],
    }),
  });

  public readonly actions = this.formBuilder.group({
    // Define title control
    title: ['',],
  });

  public review?: Review;
  public show = false;
  public autohide = true;
  jsonLd: any;
  public readonly review$: Observable<Review>;

  public readonly score$: Observable<Map<string, Score>>;

  private readonly fetch$: Observable<string>;
  fetch$2: Observable<string>;

  public readonly fetched$: Observable<Review | undefined>;
  fetched2$: any;

  // Active section for tabbed navigation
  public activeSection: string = 'publication';

  // Citation modal state
  public isCiteModalOpen: boolean = false;
  public currentPageUrl: string = '';
  public bibTexCitation: string = '';

  private readonly update$ = new EventEmitter<void>();

  public readonly updated$: Observable<Review>;

  private readonly delete$ = new EventEmitter<void>();

  public readonly deleted$: Observable<undefined>;
  private destroy$ = new Subject();

  // Retrieve root element
  public get element() {
    return this.elementRef.nativeElement;
  }

  // Retrieve current user
  public get user() {
    return this.authService.user;
  }

  // Define login url
  public readonly login = this.authService.url;

  constructor(
    private reviewService: ReviewService,
    private authService: AuthService,
    private activeRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private elementRef: ElementRef,
    private location: Location,
    private router: Router,
    private _renderer2: Renderer2,
    private toastr: ToastrService,
    @Inject(DOCUMENT) private _document: Document
  ) {
    // Define initial form value
    this.initial = this.updates.value;

    // Define uuid retrieval pipeline
    this.fetch$ = this.activeRoute.paramMap.pipe(
      // Extract UUID
      map((params) => params.get('shortid') || ''),
    );

    // Define review fetch pipeline
    this.fetched$ = this.fetch$.pipe(
      // Try retrieving review
      switchMap((shortid) => shortid ? this.reviewService.getReview(shortid) : of(undefined)),
      // Cache review
      shareReplay(1),
    );

    // Define update pipeline
    this.updated$ = this.update$.pipe(
      // Define current review
      map(() => ({ ...this.updates.value, shortid: this.review?.shortid } as Review)),
      // Update current review
      switchMap((review) => this.reviewService.upsertReview(review)),
    );

    // Define delete pipeline
    this.deleted$ = this.delete$.pipe(
      // Delete current review
      switchMap((review) => this.reviewService.deleteReview(this.review!.uuid)),
      // Define empty review
      map(() => undefined),
    );

    // Define review retrieval pipeline
    this.review$ = merge(this.fetched$, this.updated$, this.deleted$).pipe(
      // Set review
      tap((review?: Review) => this.review = review),
      // Set current UUID
      tap((review?: Review) => {
        // Define review UUID
        const shortid = review?.shortid ? review.shortid : '';

        // Define updated URL according to retrieved identifier
        const route = this.router.createUrlTree(['./', shortid], { relativeTo: this.activeRoute });
      }),
      // Update form
      tap((review?: Review) => this.updates.patchValue({ ...this.initial, ...review })),
      // Mark fields as touched
      tap((review?: Review) => review?.shortid ? this.updates.markAllAsTouched() : this.updates.markAsUntouched()),
      // Eventually, return default review
      map((review) => review ? review : { public: false } as Review),
      // Cache result
      shareReplay(1),
    );

    // Define DOME score computation pipeline
    this.score$ = merge(this.fetched$, this.updates.valueChanges).pipe(
      // Compute absolute DOME score
      map((review) => computeDomeScore(this.updates.value)),
      // Compute relative DOME score
      map((scores) => new Map([...scores.entries()]
        .map(([key, [done, skip]]) => [key, {
          done: done,
          skip: skip,
          percentage: done / (done + skip) * 100
        }])
      )),
      // Cache result
      shareReplay(1),
    );
  }

  ngOnInit(): void {
    this.activeRoute.paramMap

    this.fetch$2 = this.activeRoute.paramMap.pipe(
      // Extract UUID
      map((params) => params.get('shortid') || ''));

    this.fetched2$ = this.fetch$2.pipe(
      switchMap((shortid) => shortid ? this.reviewService.GetReviewMarkup(shortid) : of(undefined))
    )

    let full = this.router.url;
    let updatedString = full.replace("/review/", "");

    this.reviewService.GetReviewMarkup(updatedString).pipe(
      tap((response)=> {
        this.jsonLd = this._renderer2.createElement('script');
        this.jsonLd.type = `application/ld+json`;
        this.jsonLd.text = JSON.stringify(response);
        this._renderer2.appendChild(this._document.body,this.jsonLd);
      }),
      takeUntil(this.destroy$.asObservable()),
    ).subscribe();

    this.destroy$
    .asObservable()
    .pipe(
      tap(() => {
        // Delete markup
        this._renderer2.removeChild(this._document.body, this.jsonLd);
      }),
      take(1)
    )
    .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true)
  }

  // Set active section
  setActiveSection(section: string): void {
    this.activeSection = section;
  }

  // Handle save click
  public onSaveClick($event: MouseEvent) {
    // Just trigger save action
    try {
      this.update$.emit();
      this.toastr.success('Your changes have been saved.', 'Saved Successfully');
    } catch (error) {
      this.toastr.error('Failed to save changes. Please try again.', 'Error');
      console.error('Save error:', error);
    }
  }

  // Handle delete click
  public onDeleteClick($event: MouseEvent) {
    try {
      this.delete$.emit();
      this.toastr.success('The item was deleted successfully.', 'Deleted');
      this.router.navigate(['/search']);
    } catch (error) {
      this.toastr.error('Failed to delete the item. Please try again.', 'Error');
      console.error('Delete error:', error);
    }
  }

  // Make the annotation public
  public onPublishClick($event: MouseEvent) {
    try {
      this.reviewService.publishAnnotation(this.review?.uuid).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.toastr.success('The annotation is now public!', 'Published');
        },
        error: (err) => {
          this.toastr.error('Failed to publish. Please try again.', 'Error');
          console.error('Publish error:', err);
        }
      });
    } catch (error) {
      this.toastr.error('An unexpected error occurred.', 'Error');
      console.error('Publish error:', error);
    }
  }

  public OnClickdownloadJSonfile($event: MouseEvent) {
    const json = JSON.stringify(this.review, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = this._document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = this.review?.publication.title +'.json';
    this._document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);
  }

  // Avoid sorting map
  public doNotSort(a: any, b: any): number {
    return 0;
  }

  // Open citation modal
  public openCiteModal(): void {
    // Generate current page URL
    this.currentPageUrl = window.location.href;

    // Generate BibTeX citation
    if (this.review) {
      const authors = this.review.publication.authors || 'Unknown Authors';
      const title = this.review.publication.title || 'Untitled';
      const year = this.review.publication.year || new Date().getFullYear();
      const journal = this.review.publication.journal || 'DOME Registry';
      const doi = this.review.publication.doi || '';

      this.bibTexCitation = `@article{${this.review.shortid || 'dome'},
  author = {${authors}},
  title = {${title}},
  journal = {${journal}},
  year = {${year}},
  doi = {${doi}},
  url = {${this.currentPageUrl}}
}`;
    }

    // Open modal
    this.isCiteModalOpen = true;

    // Focus management for accessibility
    setTimeout(() => {
      const modalElement = document.querySelector('.cite-modal');
      if (modalElement) {
        const firstInput = modalElement.querySelector('input');
        if (firstInput) {
          firstInput.focus();
        }
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
}
