import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-submission-page',
  templateUrl: './submission-page.component.html',
  styleUrls: ['./submission-page.component.scss']
})
export class SubmissionPageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  // Method to handle smooth scrolling to sections
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
