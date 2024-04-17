import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn } from "@angular/forms";
import { expand, map, merge, Observable, of, share, shareReplay, startWith, Subject, switchMap, takeUntil, tap, } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { Location } from "@angular/common";

import { ReviewService } from "../review.service";
import { Review, computeDomeScore, isValidField } from "dome-registry-core";
import { AuthService } from "../auth.service";




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
  selector: 'app-page-edit',
  templateUrl: './page-dashboard.component.html',
  styleUrls: ['./page-dashboard.component.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageDashboardComponent implements OnDestroy {

  private readonly initial: Partial<Review>;

  public readonly updates = this.formBuilder.group({
    shortid: ['',],
    uuid: ['',],
    created: ['',],
    updated: ['',],
    publication: this.formBuilder.group({
      pmid: ['', [notDefinedValidator(),]],
      doi: ['', [notDefinedValidator(),]],
      title: ['', [notDefinedValidator(),]],
      authors: ['', [notDefinedValidator(),]],
      journal: ['', [notDefinedValidator(),]],
      year: ['', [notDefinedValidator(),]],
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

  public readonly review$: Observable<Review>;

  public readonly score$: Observable<Map<string, Score>>;

  private readonly fetch$: Observable<string>;

  public readonly fetched$: Observable<Review | undefined>;

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
        // TODO Remove this
        console.log('Current route', route);
        // // Change current URL
        // this.location.go(route.toString());
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
      // // Subscribe to form change
      // expand(() => this.updates.valueChanges),
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
  ngOnDestroy(): void {
    this.destroy$.next(true)
  }


  // Handle save click
  public onSaveClick($event: MouseEvent) {
    // Just trigger save action

    this.update$.emit();

  }

  // Handle delete click
  public onDeleteClick($event: MouseEvent) {
    console.log( this.delete$);
    // Just trigger delete action
    this.delete$.emit();
  }

  //Make the annotation public 

  public onPublishClick($event: MouseEvent) {
    try {
      console.log('we are here heheheh');
      console.log(this.review?.uuid);
      this.reviewService.publishAnnotation(this.review?.uuid).pipe(
        takeUntil(this.destroy$),
        map(() => {
          console.log('Post Update Message !!!');
        })
      ).subscribe(() => { })
    } catch (error) {
      console.log(error);
    }
  }

  // Avoid sorting map
  public doNotSort(a: any, b: any): number {
    return 0;
  }

}
