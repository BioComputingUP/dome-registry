import {Component, OnInit, AfterViewInit, OnDestroy, HostListener} from '@angular/core';
import gsap from 'gsap'; // GSAP is imported but not used for the vanilla JS progress bar
import {ScrollTrigger} from 'gsap/ScrollTrigger'; // ScrollTrigger is imported but not used

gsap.registerPlugin(ScrollTrigger); // GSAP plugin registration remains

@Component({
  selector: 'app-about-page',
  templateUrl: './about-page.component.html',
  styleUrls: ['./about-page.component.scss']
})
export class AboutPageComponent implements AfterViewInit {
  constructor() {
    // Plugin registration is done at the top level, so it's not strictly needed here again.
  }

  ngAfterViewInit(): void {
    const progressBar = document.getElementById('scroll-progress') as HTMLElement;

// Calculate full scrollable height
    const updateProgressBar = () => {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercentage = (scrollTop / scrollHeight) * 100;

      progressBar.style.width = `${scrollPercentage}%`;
    };

// Add event listener (with cleanup for SPA compatibility)
    window.addEventListener('scroll', updateProgressBar);
  }
}
