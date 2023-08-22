import { Component, OnInit } from '@angular/core';
import {AuthService} from "../auth.service";
import { PageSearchComponent } from '../page-search/page-search.component';
import { ReviewService } from '../review.service'; 
@Component({
  selector: 'app-page-intro',
  templateUrl: './page-intro.component.html',
  styleUrls: ['./page-intro.component.scss']
})
export class PageIntroComponent implements OnInit {
  
  // Subscribe to user
  public readonly user$ = this.authService.user$;

  // Define card title
  public readonly title = 'A database of annotations for published papers describing machine learning methods in biology.'

  // Dependency injection
  constructor(private authService: AuthService,private reviewService:ReviewService) { }
  // Try to print the number of the entries 

  ngOnInit(): void {
 // let pa = new PageSearchComponent(this.authService,this.reviewService);

  }

}
