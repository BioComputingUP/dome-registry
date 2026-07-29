import { Component, ElementRef, EventEmitter, HostListener, OnDestroy, OnInit, Inject, Renderer2 } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, ValidatorFn } from "@angular/forms";
import { map, merge, Observable, of, shareReplay, Subject, switchMap, takeUntil, tap, } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { Location, CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";

import { ReviewService } from "../review.service";
import { ReviewNew, computeDomeScorerNew, isValidField2 } from "dome-registry-core"
import { AuthService } from "../auth.service";
import { DOCUMENT } from '@angular/common';
import { take } from 'rxjs';
import {ToastrService} from 'ngx-toastr';
import { AsArrayPipe } from '../shared/as-array.pipe';
import { ScrollSpyDirective } from '../scroll-spy.directive';
import { ReviewNewService } from '../review-new.service';


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
    return isValidField2('', control.value + '') ? null : { notDefined: true };
  };
}


@Component({
  selector: 'app-page-edit-new',
  templateUrl: './page-edit-new.component.html',
  styleUrls: ['./page-edit-new.scss'],
  standalone: true,
  imports: [
    // Angular common directives and pipes (ngIf, ngFor, date, uppercase, etc.)
    CommonModule,
    // Reactive forms directives ([formGroup], formControlName, etc.)
    ReactiveFormsModule,
    // Custom pipes
    AsArrayPipe,
    // Custom directives
    ScrollSpyDirective,
  ],
})
export class PageEditNewComponent implements OnInit, OnDestroy {

  private readonly initial: Partial<ReviewNew>;

  public readonly updates = this.formBuilder.group({
    shortid: ['',],
    uuid: ['',],
    isAiGenerated: [false],
    public: [false],
    publication: this.formBuilder.group({
      pmid: ['', [notDefinedValidator(),]],
      doi: ['', [notDefinedValidator(),]],
      title: ['', [notDefinedValidator(),]],
      authors: ['', [notDefinedValidator(),]],
      journal: ['', [notDefinedValidator(),]],
      year: ['', [notDefinedValidator(),]],
      pmcid: ['', [notDefinedValidator(),]],
      tags: ['', [notDefinedValidator(),]],
    }),
    data: this.formBuilder.group({
      availability: this.formBuilder.group({
        isPublic: [false],
        licence: ['', [notDefinedValidator(),]],
      }),
      provenance: this.formBuilder.group({
        source: ['', [notDefinedValidator(),]],
        numDataPoints: ['', [notDefinedValidator(),]],
        isPrevUse: [false],
      }),
      redundancy: this.formBuilder.group({
        splitMethod: ['', [notDefinedValidator(),]],
        isIndependent: [false],
        enforceMethod: ['', [notDefinedValidator(),]],
        distributionComp: ['', [notDefinedValidator(),]],
      }),
      splits: this.formBuilder.group({
        numSplits: ['', [notDefinedValidator(),]],
        dataPointsPerSplit: ['', [notDefinedValidator(),]],
        otherSplits: ['', [notDefinedValidator(),]],
        splitDist: ['', [notDefinedValidator(),]],
      }),
    }),
    optimization: this.formBuilder.group({
      algorithm: this.formBuilder.group({
        algName: ['', [notDefinedValidator(),]],
        isNewAlg: [false],
        algPrevPublished: ['', [notDefinedValidator(),]],
      }),
      config: this.formBuilder.group({
        isAvailable: [false],
        licence: ['', [notDefinedValidator(),]],
      }),
      encoding: this.formBuilder.group({
        encMethod: ['', [notDefinedValidator(),]],
      }),
      features: this.formBuilder.group({
        numFeatures: ['', [notDefinedValidator(),]],
        featSelection: [false],
        trainingOnlySelection: [false],
      }),
      fitting: this.formBuilder.group({
        isParamsLarger: [false],
        noOverFit: ['', [notDefinedValidator(),]],
        noUnderFit: ['', [notDefinedValidator(),]],
      }),
      meta: this.formBuilder.group({
        isMeta: [false],
        metaMethods: ['', [notDefinedValidator(),]],
        metaIndep: [false],
      }),
      parameters: this.formBuilder.group({
        numParams: ['', [notDefinedValidator(),]],
        pSelMeth: ['', [notDefinedValidator(),]],
      }),
      regularisation: this.formBuilder.group({
        hasReg: [false],
        regTechs: ['', [notDefinedValidator(),]],
      }),
    }),
    model: this.formBuilder.group({
      availability: this.formBuilder.group({
        isCodeAvail: [false],
        isExecAvailable: [false],
        licence: ['', [notDefinedValidator(),]],
      }),
      duration: this.formBuilder.group({
        runTime: ['', [notDefinedValidator(),]],
      }),
      interpretability: this.formBuilder.group({
        interpType: ['', [notDefinedValidator(),]],
        transpExp: ['', [notDefinedValidator(),]],
      }),
      output: this.formBuilder.group({
        outType: ['', [notDefinedValidator(),]],
      }),
    }),
    evaluation: this.formBuilder.group({
      method: this.formBuilder.group({
        evalMethod: ['', [notDefinedValidator(),]],
      }),
      availability: this.formBuilder.group({
        isRawAvail: [false],
        licence: ['', [notDefinedValidator(),]],
      }),
      comparison: this.formBuilder.group({
        hasPublicComparison: [false],
        hasBaseComparison: [false],
      }),
      confidance: this.formBuilder.group({
        confidenceInterval: [false],
        statSignificant: [false],
      }),
      measure: this.formBuilder.group({
        metrics: ['', [notDefinedValidator(),]],
        isRepresentative: [false],
      }),
    }),
  });

  public readonly actions = this.formBuilder.group({
    // Define title control
    title: ['',],
  });

  public review?: ReviewNew;
  public show = false;
  public autohide = true;
  jsonLd: any;
  public readonly review$: Observable<ReviewNew>;

  public readonly score$: Observable<Map<string, Score>>;

  private readonly fetch$: Observable<string>;
  fetch$2: Observable<string>;

  public readonly fetched$: Observable<ReviewNew | undefined>;
  fetched2$: any;

  // Active section for tabbed navigation
  public activeSection: string = 'publication';

  // Citation modal state
  public isCiteModalOpen: boolean = false;
  public currentPageUrl: string = '';
  public bibTexCitation: string = '';

  private readonly update$ = new EventEmitter<void>();

  public readonly updated$: Observable<ReviewNew>;

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
    private reviewService: ReviewNewService,
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
    this.initial = this.updates.value as unknown as Partial<ReviewNew>;

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
      // Prepare partial review payload from form values with normalization
      map(() => {
        const value: any = { ...this.updates.value };
        // Normalize publication.tags from comma-separated string to string[] for API
        if (value.publication && typeof value.publication.tags === 'string') {
          value.publication = value.publication || {};
          value.publication.tags = (value.publication.tags as string)
            .split(',')
            .map((t: string) => t.trim())
            .filter((t: string) => t.length > 0);
        }
        // Attach current shortid (required by API)
        value.shortid = this.review?.shortid;
        return value as unknown as Partial<ReviewNew>;
      }),
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
      tap((review?: ReviewNew) => this.review = review),
      // Set current UUID
      tap((review?: ReviewNew) => {
        // Define review UUID
        const shortid = review?.shortid ? review.shortid : '';

        // Define updated URL according to retrieved identifier
        const route = this.router.createUrlTree(['./', shortid], { relativeTo: this.activeRoute });
      }),
      // Update form
      tap((review?: ReviewNew) => {
        const value: any = { ...this.initial, ...review };
        // Normalize publication.tags from string[] (in ReviewNew) to comma-separated string for the form control
        if (review && review.publication && Array.isArray(review.publication.tags)) {
          value.publication = value.publication || {};
          value.publication.tags = (review.publication.tags as string[]).join(', ');
        }
        this.updates.patchValue(value);
      }),
      // Mark fields as touched
      tap((review?: ReviewNew) => review?.shortid ? this.updates.markAllAsTouched() : this.updates.markAsUntouched()),
      // Eventually, return default review
      map((review) => review ? review : { public: false } as ReviewNew),
      // Cache result
      shareReplay(1),
    );

    // Define DOME score computation pipeline
    this.score$ = merge(this.fetched$, this.updates.valueChanges).pipe(
      // Compute absolute DOME score – cast form value to ReviewNew for typing purposes
      map(() => computeDomeScorerNew(this.updates.value as unknown as ReviewNew)),
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

   

    let full = this.router.url;
    let updatedString = full.replace("/review/-review/", "");

  

   
  }

  ngOnDestroy(): void {
    this.destroy$.next(true)
  }

  // Set active section
  setActiveSection(section: string): void {
    this.activeSection = section;
  }

  // Get form control from nested groups
  getControl(group: string, subgroup: string, control: string): AbstractControl | null {
    const groupControl = this.updates.get(group);
    if (groupControl && typeof groupControl === 'object' && 'get' in groupControl) {
      const subgroupControl = groupControl.get(subgroup);
      if (subgroupControl && typeof subgroupControl === 'object' && 'get' in subgroupControl) {
        const fieldControl = subgroupControl.get(control);
        if (fieldControl) {
          return fieldControl;
        }
      }
    }
    return null;
  }

  // Handle save click
  public onSaveClick($event: MouseEvent) {
    // Trigger save action and show toast based on API response
    try {
      this.updated$.pipe(take(1)).subscribe({
        next: () => this.toastr.success('Your changes have been saved.', 'Saved Successfully'),
        error: (err) => {
          this.toastr.error('Failed to save changes. Please try again.', 'Error');
          console.error('Save error:', err);
        }
      });
      this.update$.emit();
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
