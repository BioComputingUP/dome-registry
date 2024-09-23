import { Component, OnDestroy, OnInit } from '@angular/core';
import {AuthService} from "../auth.service";
import { PageSearchComponent } from '../page-search/page-search.component';
import { ReviewService } from '../review.service'; 
import { HttpClient } from '@angular/common/http';
import { result } from 'lodash';
import { Observable, Subject, Subscription, interval, map, share, shareReplay, switchMap, take, takeUntil } from 'rxjs';
import { UserService } from '../user.service';
@Component({
  selector: 'app-page-intro',
  templateUrl: './page-intro.component.html',
  styleUrls: ['./page-intro.component.scss'],
  
})
export class PageIntroComponent implements OnInit, OnDestroy {
  
  private destroy$ = new Subject<boolean>();
  // Subscribe to user
  public  readonly user$ = this.authService.user$;

  // Define card title
  public  readonly title = 'A database of annotations for published papers describing machine learning methods in biology.'
  // Compute the total number of entries
  public  readonly count$: Observable<number> = this.reviewService.countElements().pipe(shareReplay(1)) ;
  public readonly countPr$ : Observable<number> = this.reviewService.countPrivElements().pipe(shareReplay(1));
  public readonly countUsers$ : Observable<number> = this.userService.getTotalNumber().pipe(shareReplay(1));

  public readonly countCounter$ = this.count$.pipe(
    switchMap((count: number) => {
      return interval(1).pipe(
        map((counter) => counter),
        take(count)
      )
    })
  )
  public readonly countPreson = this.countUsers$.pipe(
    switchMap((count:number) => {
      return interval(1).pipe(
        map((counter) => counter),take(count)
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
  constructor(private authService: AuthService, private reviewService:ReviewService, private userService :UserService) {
 

  }
  ngOnDestroy(): void {
    this.destroy$.next(true);
  }
  // Try to print the number of the entries 

  ngOnInit(): void {
    console.log("test on init");
    var bioschemas_name = "DOME Registry";
    var bioschemas_version = "3.0.0";
  }

}
