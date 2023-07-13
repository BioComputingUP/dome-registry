import {Directive, EventEmitter, HostListener, Output} from '@angular/core';


@Directive({
  selector: '[scroll-end]'
})
export class ScrollEndDirective {

  @Output() end$ = new EventEmitter<void>();

  // https://stackoverflow.com/questions/40664766/how-to-detect-scroll-to-bottom-of-html-element
  constructor() { }

  @HostListener('scroll', ['$event'])
  onScroll(event: Event) {
    // Define target as scroll-enabled HTML element
    let target = event.target as HTMLElement;
    // Compute scroll limit
    let limit = target.scrollHeight - target.clientHeight;
    // Case top scroll exceeds limit
    if (target.scrollTop >= limit) {
      // Then, emit event
      this.end$.emit(void 0);
    }
  }

}
