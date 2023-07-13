import { Component, OnInit } from '@angular/core';
import {AuthService} from "../auth.service";

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
  constructor(private authService: AuthService) { }

  ngOnInit(): void {
  }

}
