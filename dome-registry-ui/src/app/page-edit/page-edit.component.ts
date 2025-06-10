import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Inject,
  Renderer2
} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn} from "@angular/forms";
import {
  expand,
  map,
  merge,
  Observable,
  of,
  share,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {Location} from "@angular/common";

import {ReviewService} from "../review.service";
import {Review, computeDomeScore, isValidField} from "dome-registry-core";
import {AuthService} from "../auth.service";
import {DOCUMENT} from '@angular/common';
import {take} from 'rxjs';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
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
    return isValidField('', control.value + '') ? null : {notDefined: true};
  };
}


@Component({
  selector: 'app-page-edit',
  templateUrl: './page-edit.component.html',
  styleUrls: ['./page-edit.component.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageEditComponent implements OnInit, OnDestroy {

  private readonly initial: Partial<Review>;

  private readonly DEFAULT_USER = {
    name: '',
    email: '',
    orcid: '',
    organisation: '',
    roles: ''
  };

  private mapFormToPartialReview(form: any): Partial<Review> {
    return {
      ...form,
      created: form.publication.created ? +form.publication.created : undefined,
      updated: form.publication.updated ? +form.publication.updated : undefined,
    };
  }

  private mapFormToReview(form: any, base?: Partial<Review>): Review {
    return {
      shortid: form.shortid,
      uuid: form.uuid,
      created: +form.publication.created,
      updated: +form.publication.updated,
      publication: {
        ...form.publication,
        tags: form.publication.tags?.split(',').map((t: string) => t.trim()) ?? [],
        done: 0,
        skip: 0,
      },
      dataset: form.dataset,
      optimization: form.optimization,
      model: form.model,
      evaluation: form.evaluation,
      user: base?.user ?? this.DEFAULT_USER,
      public: base?.public ?? false,
    };
  }

  private mapReviewToForm(review?: Review): any {
    if (!review) return {};
    return {
      shortid: review.shortid,
      uuid: review.uuid,
      publication: {
        ...review.publication,
        created: review.created.toString(),
        updated: review.updated.toString(),
        tags: Array.isArray(review.publication.tags)
          ? review.publication.tags.join(', ')
          : review.publication.tags
      },
      dataset: review.dataset,
      optimization: review.optimization,
      model: review.model,
      evaluation: review.evaluation,
    };
  }

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
      tags: ['', [notDefinedValidator(),]],
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

  //private notificationService: Notificatio
  //public readonly Sharedscore$: Observable<string>;

  // = this.fetch$.pipe(
  //   // Get UUID out of parameters, if any
  //   map((params) => params.get('uuid')),
  //   // Try retrieving review
  //   switchMap((uuid) => {
  //     // Case UUID is set
  //     if (uuid) {
  //       // Then, retrieve review
  //       return this.reviewService.getReview(uuid)
  //     }
  //     // Otherwise, throw error
  //     throw new Error('UUID not defined');
  //   }),
  //   // Case not valid review has been retrieved
  //   catchError((error) => of(undefined)),
  //   // Always return same review
  //   shareReplay(1),
  // );

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
    this.initial = this.mapFormToPartialReview(this.updates.value);

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
      map(() => this.mapFormToReview(this.updates.value, this.review)),
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
        const route = this.router.createUrlTree(['./', shortid], {relativeTo: this.activeRoute});
        // TODO Remove this
        console.log('Current route', route);
        // // Change current URL
        // this.location.go(route.toString());
      }),

      // Update form
      tap((review?: Review) => this.updates.patchValue({
        ...this.mapReviewToForm(review),
        ...this.initial
      })),

      // Mark fields as touched
      tap((review?: Review) => review?.shortid ? this.updates.markAllAsTouched() : this.updates.markAsUntouched()),
      // Eventually, return default review
      map((review) => review ? review : {public: false} as Review),
      // Cache result
      shareReplay(1),
    );

    // Define DOME score computation pipeline
    this.score$ = merge(this.fetched$, this.updates.valueChanges).pipe(
      // // Subscribe to form change
      // expand(() => this.updates.valueChanges),
      // Compute absolute DOME score
      map(() => computeDomeScore(this.mapFormToReview(this.updates.value, this.review))),

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

    console.log(this.router.url);
    let full = this.router.url;
    let updatedString = full.replace("/review/", "");


    const a = "flds";
    const b = "rfjek";
    const c = "dfkl";
    this.reviewService.GetReviewMarkup(updatedString).pipe(
      tap((response) => {
        this.jsonLd = this._renderer2.createElement('script');
        this.jsonLd.type = `application/ld+json`;
        this.jsonLd.text = JSON.stringify(response);
        this._renderer2.appendChild(this._document.body, this.jsonLd);
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

  //Make the annotation public

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
    const blob = new Blob([json], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = this._document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = this.review?.publication.title + '.json';
    this._document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);
  }

  // Avoid sorting map
  public doNotSort(a: any, b: any): number {
    return 0;
  }

  showSaveSuccess() {
    this.toastr.success('Your changes have been saved successfully.', 'Saved!');
  }

  // 2. Delete Success
  showDeleteSuccess() {
    this.toastr.success('The item was permanently deleted.', 'Deleted!');
  }

  // 3. Publish Success
  showPublishSuccess() {
    this.toastr.success('The annotation is now visible to the public.', 'Published!');
  }

  // 4. Simulated Error
  showError() {
    this.toastr.error('Failed to complete the action. Please try again later.', 'Oops!');
  }

}
