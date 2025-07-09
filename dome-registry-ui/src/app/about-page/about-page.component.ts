import {Component, AfterViewInit} from '@angular/core';

@Component({
  selector: 'app-about-page',
  templateUrl: './about-page.component.html',
  styleUrls: ['./about-page.component.scss']
})
export class AboutPageComponent implements AfterViewInit {
  private progressBar: HTMLElement | null = null;
  private activeStep: number = 0;

  constructor() {
    // Plugin registration is done at the top level, so it's not strictly needed here again.
  }

  ngAfterViewInit(): void {
    this.progressBar = document.getElementById('scroll-progress');
    this.initializeStepperItems();
  }

  private initializeStepperItems(): void {
    if (!this.progressBar) return;

    const contentItems = document.querySelectorAll('.dome-recommendations-content p');

    // Set initial progress bar width and active class
    this.updateProgressBar(0);
    this.setActiveItem(contentItems, 0);
    this.showActiveContent(0); // Show initial content

    // Add click event listeners to each content item
    contentItems.forEach((item, index) => {
      item.addEventListener('click', () => {
        this.activeStep = index;
        this.updateProgressBar(index);
        this.setActiveItem(contentItems, index);
        this.showActiveContent(index); // Show content for the clicked item
      });
    });
  }

  private setActiveItem(items: NodeListOf<Element>, activeIndex: number): void {
    // Remove active class from all items
    items.forEach(item => {
      item.classList.remove('active');
    });

    // Add active class to the selected item
    items[activeIndex].classList.add('active');
  }

  private updateProgressBar(stepIndex: number): void {
    if (!this.progressBar) return;

    // Use fixed percentages for each step
    const fixedPercentages = [10, 37, 65, 100]; // Fixed percentages for each step
    const percentage = fixedPercentages[stepIndex];

    this.progressBar.style.width = `${percentage}%`;
  }

  private showActiveContent(activeIndex: number): void {
    // Get all content blocks
    const contentBlocks = document.querySelectorAll('.recom-content');

    // Remove active class from all content blocks
    contentBlocks.forEach((block) => {
      block.classList.remove('active');
    });

    // Immediately add active class to the selected content block
    // This creates a cross-fade effect with the CSS transition
    contentBlocks[activeIndex].classList.add('active');
  }
}
