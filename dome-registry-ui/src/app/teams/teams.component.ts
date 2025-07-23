import { Component, AfterViewInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss']
})
export class TeamsComponent implements AfterViewInit {
  private sections: HTMLElement[] = [];
  private navLinks: HTMLElement[] = [];
  private currentActive: number = 0;
  private scrolling: boolean = false;
  private scrollTimeout: any;

  constructor() {}

  ngAfterViewInit(): void {
    // Get all sections and navigation links
    this.sections = Array.from(document.querySelectorAll('.teams-container section'));
    this.navLinks = Array.from(document.querySelectorAll('.teams-nav .nav-link'));

    // Add click event listeners to navigation links
    this.navLinks.forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const targetId = link.getAttribute('href')?.substring(1);
        if (targetId) {
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            this.scrolling = true;
            targetElement.scrollIntoView({ behavior: 'smooth' });

            // Clear any existing timeout
            if (this.scrollTimeout) {
              clearTimeout(this.scrollTimeout);
            }

            // Set a timeout to reset scrolling flag
            this.scrollTimeout = setTimeout(() => {
              this.scrolling = false;
            }, 500);

            // Update active link
            this.setActiveLink(link);
          }
        }
      });
    });

    // Set initial active link based on scroll position
    this.checkActiveSection();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    // Don't update active section if we're scrolling programmatically
    if (!this.scrolling) {
      this.checkActiveSection();
    }
  }

  private checkActiveSection(): void {
    // Find the section that is currently in view
    const scrollPosition = window.scrollY + 100; // Add offset to account for sticky header

    for (let i = this.sections.length - 1; i >= 0; i--) {
      const section = this.sections[i];
      if (section.offsetTop <= scrollPosition) {
        // Found the current section
        if (this.currentActive !== i) {
          this.currentActive = i;
          const sectionId = section.getAttribute('id');
          const activeLink = this.navLinks.find(link =>
            link.getAttribute('href') === `#${sectionId}`
          );

          if (activeLink) {
            this.setActiveLink(activeLink);
          }
        }
        break;
      }
    }
  }

  private setActiveLink(activeLink: HTMLElement): void {
    // Remove active class from all links
    this.navLinks.forEach(link => {
      link.classList.remove('active');
    });

    // Add active class to the current link
    activeLink.classList.add('active');
  }
}
