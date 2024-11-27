import { Component, OnDestroy, OnInit,Inject, Renderer2 } from '@angular/core';
import { AuthService } from "../auth.service";
import { PageSearchComponent } from '../page-search/page-search.component';
import { ReviewService } from '../review.service';
import { HttpClient } from '@angular/common/http';
import { result } from 'lodash';
import { Observable, Subject, Subscription, interval, map, share, shareReplay, switchMap, take, takeUntil, tap } from 'rxjs';
import { UserService } from '../user.service';
import { DOCUMENT } from '@angular/common';
@Component({
  selector: 'app-page-intro',
  templateUrl: './page-intro.component.html',
  styleUrls: ['./page-intro.component.scss'],

})
export class PageIntroComponent implements OnInit, OnDestroy {
 
  jsonLd: any;
  private destroy$ = new Subject<void>();
  // Subscribe to user
  public readonly user$ = this.authService.user$;
   // Define card title
  public readonly title = 'A database of annotations for published papers describing machine learning methods in biology.'
  // Compute the total number of entries
  public readonly count$: Observable<number> = this.reviewService.countElements().pipe(shareReplay(1));
  public readonly countPr$: Observable<number> = this.reviewService.countPrivElements().pipe(shareReplay(1));
  public readonly countUsers$: Observable<number> = this.userService.getTotalNumber().pipe(shareReplay(1));

  public readonly countCounter$ = this.count$.pipe(
    switchMap((count: number) => {
      return interval(1).pipe(
        map((counter) => counter),
        take(count)
      )
    })
  )
  public readonly countPreson = this.countUsers$.pipe(
    switchMap((count: number) => {
      return interval(1).pipe(
        map((counter) => counter), take(count)
      )
    })
  )

  public readonly countProgres$ = this.countPr$.pipe(
    switchMap((count: number) => {
      return interval(1).pipe(
        map((counter) => counter), take(count)
      )
    })
  )


  // Dependency injection
  constructor(
    private authService: AuthService, private reviewService: ReviewService, private userService: UserService,
    private _renderer2: Renderer2, 
    @Inject(DOCUMENT) private _document: Document
  ) {


  }
  ngOnDestroy(): void {
    this.destroy$.next();
  }
  // Try to print the number of the entries 

  ngOnInit() {
    //let script = this._renderer2.createElement('script');
    // script.type = `application/ld+json`;
    // let markup;
    
  
    // this.reviewService.GetHomePageMarkup().subscribe(response => {
    //   script.text = JSON.stringify(response)
    // });
    
    
    this.reviewService.GetHomePageMarkup().pipe(
      tap((response)=> {
        this.jsonLd = this._renderer2.createElement('script');
        this.jsonLd.type = `application/ld+json`;
        this.jsonLd.text = JSON.stringify(response);
        this._renderer2.appendChild(this._document.body,this.jsonLd); 
      }),
      takeUntil(this.destroy$.asObservable()),
    ).subscribe();
    
    
    
    
    this.destroy$.asObservable().pipe(
      tap(() => {
        // retirer markup
        this._renderer2.removeChild(this._document.body, this.jsonLd);
      }),
      take(1)
    ).subscribe();
 

    // this.reviewService.GetHomePageMarkup().pipe(
    //   tap((response) => {
    //     let script = this._renderer2.createElement('script');
    //     script.type = `application/ld+json`;
    //   }),
    //   takeUntil(this.destroy$)
    // ).subscribe()

  }




}
